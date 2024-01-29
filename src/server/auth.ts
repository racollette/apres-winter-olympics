import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import { prisma } from "~/server/db";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SigninMessage } from "../utils/SigninMessage";
import DiscordProvider from "next-auth/providers/discord";
import TwitterProvider from "next-auth/providers/twitter";
import { objectToAuthDataMap, AuthDataValidator } from "@telegram-auth/server";
import { env } from "~/env.mjs";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      type: string;
      id: string;
      profile: Profile;
    } & DefaultSession["user"] &
      Profile;
  }

  interface Profile {
    id: string;
    username: string;
    global_name: string;
    image_url: string;
    profile_id?: string;
    data: {
      id: string;
      name: string;
      profile_image_url: string;
      username: string;
    };
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error unknown type
        session.user.profile = token.profile;
        // @ts-expect-error unknown type
        if (token?.profile?.data) {
          session.user.type = "twitter";
          // @ts-expect-error unknown type
          session.user.name = token.profile.data.username;
          // @ts-expect-error unknown type
        } else if (token?.profile?.id) {
          session.user.type = "discord";
          // @ts-expect-error unknown type
          session.user.name = token?.profile?.username;
          // @ts-expect-error unknown type
          session.user.profile.profile_id = token?.profile?.id;
        }
      }
      // @ts-expect-error unknown type
      if (token.account.type === "credentials") {
        session.user.type = "wallet";
        session.user.name = token.sub;
        session.user.image = `https://ui-avatars.com/api/?name=${token.sub}&background=random`;
      }

      // @ts-expect-error unknown type
      if (token.account.provider === "telegram") {
        // @ts-expect-error unknown type
        session.user = token.user;
        session.user.type = "telegram";
      }

      console.log("user session", session);

      return Promise.resolve(session);
    },
    async jwt({ user, token, account, profile }) {
      if (account) {
        token.account = account;
      }
      if (profile) {
        token.profile = profile;
      }
      if (user) {
        token.user = user;
      }
      return Promise.resolve(token);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify",
    }),
    TwitterProvider({
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
      version: "2.0",
    }),
    CredentialsProvider({
      id: "signMessage",
      name: "Solana",
      credentials: {
        message: {
          label: "Message",
          type: "text",
        },
        signature: {
          label: "Signature",
          type: "text",
        },
      },
      async authorize(credentials, req) {
        try {
          const signinMessage = new SigninMessage(
            JSON.parse(credentials?.message || "{}")
          );

          // const nextAuthUrl = new URL(env.NEXTAUTH_URL);
          // console.log(signinMessage.domain);
          // if (
          //   signinMessage.domain !== ("localhost:3000" || "www.dinoherd.cc")
          // ) {
          //   return null;
          // }

          const csrfToken = await getCsrfToken({ req: { ...req, body: null } });
          if (signinMessage.nonce !== csrfToken) {
            return null;
          }

          const validationResult = signinMessage.validate(
            credentials?.signature || ""
          );

          if (!validationResult)
            throw new Error("Could not validate the signed message");

          // Check if user exists
          // const user = await prisma.user.findFirst({
          //   where: {
          //     wallets: {
          //       some: {
          //         address: signinMessage.publicKey,
          //       },
          //     },
          //   },
          // });

          return {
            id: signinMessage.publicKey,
          };
        } catch (e) {
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "sendMemo",
      name: "Solana Ledger",
      credentials: {
        programId: {
          label: "Program",
          type: "text",
        },
        verifySignatures: {
          label: "Verified Signatures",
          type: "text",
        },
        nonce: {
          label: "Nonce",
          type: "text",
        },
        valid: {
          label: "Valid Signature",
          type: "text",
        },
        address: {
          label: "Public Key",
          type: "text",
        },
      },
      async authorize(credentials) {
        try {
          if (
            !credentials?.valid ||
            credentials?.programId !==
              "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr" ||
            credentials?.nonce != "test-nonce" ||
            !credentials?.verifySignatures
          )
            throw new Error("Could not validate the signed message");

          // Check if user exists
          // const user = await prisma.user.findFirst({
          //   where: {
          //     wallets: {
          //       some: {
          //         address: credentials?.address,
          //       },
          //     },
          //   },
          // });

          return {
            id: credentials?.address,
          };
        } catch (e) {
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "telegram",
      name: "Telegram",
      credentials: {},
      async authorize(credentials, req) {
        const validator = new AuthDataValidator({
          botToken: `${process.env.TELEGRAM_BOT_TOKEN}`,
        });

        const data = objectToAuthDataMap(req.query || {});
        const user = await validator.validate(data);

        if (user.id && user.first_name) {
          const returned = {
            id: user.id.toString(),
            global_name: [user.first_name, user.last_name || ""].join(" "),
            username: user.username,
            image_url: user.photo_url,
          };

          // try {
          //   await createUserOrUpdate(user);
          // } catch {
          //   console.log("Something went wrong while creating the user.");
          // }

          return returned;
        }
        return null;
      },
    }),
  ],
  /**
   * ...add more providers here.
   *
   * Most other providers require a bit more work than the Discord provider. For example, the
   * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
   * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
   *
   * @see https://next-auth.js.org/providers/github
   */
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
