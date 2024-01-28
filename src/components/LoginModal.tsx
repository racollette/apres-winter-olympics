import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";
import {
  Button,
  type CustomFlowbiteTheme,
  Modal,
  Spinner,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import bs58 from "bs58";
import { getCsrfToken, signIn, useSession, signOut } from "next-auth/react";
import { SigninMessage } from "~/utils/SigninMessage";
import { buildAuthTx, validateAuthTx } from "~/utils/authTx";
import { connection } from "~/server/rpc";
import ProfileButton from "./ProfileButton";
import { shortAccount, truncateAccount } from "~/utils/addresses";
import { useUser } from "~/hooks/useUser";
import { extractProfileFromUser } from "~/utils/wallet";

const customTheme: CustomFlowbiteTheme["modal"] = {
  content: {
    inner: "bg-neutral-900 rounded-lg",
    base: "relative w-full p-4 h-auto",
  },
};

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function LoginModal({
  loginMessage = "Sign In",
}: {
  loginMessage?: string;
}) {
  const router = useRouter();
  const { publicKey, signMessage, disconnect, connected, signTransaction } =
    useWallet();
  const [host, setHost] = useState<string>();
  const [openModal, setOpenModal] = useState<string | undefined>();
  const [useLedger, setUseLedger] = useState<boolean>(false);
  const walletModal = useWalletModal();

  const { data: session, status } = useSession();

  console.log("session", session);

  const signedIn = status === "authenticated";

  const { user, isLoading } = useUser();
  const { username, userPFP } = extractProfileFromUser(user);

  console.log("user", user);

  useEffect(() => {
    setUseLedger(false);
    setHost(window.location.host);
  }, []);

  const handleSignIn = async (useLedger: boolean) => {
    try {
      if (!connected) {
        walletModal.setVisible(true);
      }

      const csrf = await getCsrfToken();
      if (!publicKey || !csrf || !signMessage || !signTransaction) return;

      let validSignature;

      if (useLedger) {
        // Create tx
        const tx = buildAuthTx("test-nonce");
        tx.feePayer = publicKey; // not sure if needed but set this properly
        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        // Encode and send tx to signer, decode and sign
        const signedTx = await signTransaction(tx);

        // Encode, send back, decode and verify signedTx signature
        validSignature = validateAuthTx(signedTx, "test-nonce");
        const inx = signedTx.instructions[2];
        const programId = inx?.programId.toString();
        const nonce = inx?.data.toString() || "";
        const verifySignatures = !tx.verifySignatures();

        signIn("sendMemo", {
          programId: programId,
          verifySignatures: verifySignatures,
          nonce: nonce,
          valid: validSignature,
          address: publicKey.toString(),
          redirect: false,
        });
      } else {
        const message = new SigninMessage({
          domain: host || "",
          publicKey: publicKey?.toBase58(),
          statement: `Rawr!\n \n Sign this message to log in to the app.\n`,
          nonce: csrf,
        });
        const data = new TextEncoder().encode(message.prepare());
        const signature = await signMessage(data);
        const serializedSignature = bs58.encode(signature);

        signIn("signMessage", {
          message: JSON.stringify(message),
          signature: serializedSignature,
          redirect: false,
        });
      }

      router.push(
        `/profile/${
          user?.discord?.username ??
          user?.twitter?.username ??
          (user?.telegram?.username && user?.telegram.isActive)
            ? user?.telegram?.username
            : user?.defaultAddress ?? session?.user.name ?? publicKey.toString()
        }`
      );

      setOpenModal(undefined);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignOut = async () => {
    router.push("/");
    await signOut({ redirect: false });
    walletModal.setVisible(false);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // useEffect(() => {
  //   if (connected && status === "unauthenticated") {
  //     handleSignIn();
  //   }
  // }, [connected]);

  return (
    <>
      {!signedIn ? (
        <Button
          size="sm"
          onClick={() => {
            handleDisconnect();
            setOpenModal("dismissible");
          }}
        >
          {isLoading ? (
            <div className="flex flex-row gap-2 align-middle">
              <Spinner size="sm" />
              <div>Signing In</div>
            </div>
          ) : (
            <div>{loginMessage}</div>
          )}
        </Button>
      ) : (
        <>
          {!isLoading && user ? (
            <ProfileButton
              imageURL={
                userPFP ??
                `https://ui-avatars.com/api/?name=${
                  user?.defaultAddress ??
                  session?.user.name ??
                  publicKey?.toString()
                }&background=random`
              }
              username={
                username ??
                shortAccount(user?.defaultAddress) ??
                session?.user.name ??
                publicKey?.toString()
              }
              handleSignout={handleSignOut}
              sessionKey={
                username ??
                user?.defaultAddress ??
                session?.user.name ??
                publicKey?.toString()
              }
            />
          ) : (
            <div className="flex flex-row gap-6">
              {/* {!isLoading && (
                <DefaultToast
                  message={"Account not found. Please create one first."}
                  type={"error"}
                />
              )} */}
              <Button
                onClick={() => {
                  handleDisconnect();
                  setOpenModal("dismissible");
                }}
              >
                Sign In
              </Button>
            </div>
          )}
        </>
      )}
      <Modal
        theme={customTheme}
        dismissible
        position={"center"}
        show={openModal === "dismissible"}
        onClose={() => setOpenModal(undefined)}
      >
        {/* <Modal.Header>Create Account or Log In</Modal.Header> */}
        {connected ? (
          <Modal.Body className="rounded-lg bg-neutral-900">
            <div className="flex flex-col space-y-4 text-white">
              <div className="flex flex-col">
                <div className="text-lg font-extrabold">Verify Wallet</div>
                {useLedger ? (
                  <div className="text-zinc-500">
                    Send a transaction to yourself to prove ownership of wallet
                  </div>
                ) : (
                  <div className="text-zinc-500">
                    Sign a message to prove ownership of wallet
                  </div>
                )}
              </div>
              <div className="flex flex-row gap-8">
                <label className="relative mb-5 inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={useLedger}
                    className="peer sr-only"
                    onChange={() => setUseLedger(!useLedger)}
                  />
                  <div className="peer h-5 w-9 rounded-full bg-neutral-800 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-pink-800 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-500 dark:border-gray-600 dark:bg-neutral-700 dark:peer-focus:ring-pink-800"></div>
                  <span className="ml-3 text-sm font-extrabold text-zinc-400 dark:text-gray-300">
                    Using Ledger?
                  </span>
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  className="rounded-lg bg-violet-900 px-4 py-3 font-medium"
                  onClick={() => handleDisconnect()}
                >
                  Change Wallet
                </button>
                {useLedger ? (
                  <button
                    className="rounded-lg bg-pink-800 px-4 py-3 font-medium"
                    onClick={() => handleSignIn(true)}
                  >
                    Sign Transaction
                  </button>
                ) : (
                  <button
                    className="rounded-lg bg-sky-800 px-4 py-3 font-medium"
                    onClick={() => handleSignIn(false)}
                  >
                    Sign Message
                  </button>
                )}
              </div>
              <div>
                <span className="text-sm font-bold">Current Wallet: </span>
                <span className="ml-2 text-sm text-zinc-500">
                  {connected
                    ? truncateAccount(publicKey?.toString() || "")
                    : "Not Connected"}
                </span>
              </div>
            </div>
          </Modal.Body>
        ) : (
          <Modal.Body>
            <div className="bg-neutral-900 text-white">
              <div className="flex flex-col gap-4">
                <div className="text-lg font-extrabold ">
                  Log in with your Clayno.club Account
                </div>

                <div className="grid grid-cols-2 justify-start gap-4 md:flex md:flex-row">
                  <div>
                    <WalletMultiButtonDynamic
                      style={{
                        backgroundColor: "#0369a1",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                  <button
                    className="rounded-lg bg-neutral-800 px-4 py-3 text-white"
                    onClick={() => signIn("discord")}
                  >
                    <div className="flex flex-row justify-center gap-2">
                      <Image
                        src="/icons/discord.svg"
                        alt="Discord"
                        width={24}
                        height={24}
                      />
                      <div className="flex flex-row font-medium">Discord</div>
                    </div>
                  </button>
                  <button
                    className="rounded-lg bg-neutral-800 px-4 py-3 text-white"
                    onClick={() => signIn("twitter")}
                  >
                    <div className="flex flex-row justify-center gap-2">
                      <Image
                        src="/icons/twitter.svg"
                        alt="Twitter"
                        width={24}
                        height={24}
                      />
                      <div className="flex flex-row font-medium">Twitter</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </Modal.Body>
        )}

        {/* <Modal.Footer>
          <Button onClick={() => props.setOpenModal(undefined)}>
            I accept
          </Button>
          <Button color="gray" onClick={() => props.setOpenModal(undefined)}>
            Decline
          </Button>
        </Modal.Footer> */}
      </Modal>
    </>
  );
}
