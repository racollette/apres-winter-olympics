import type { Session } from "next-auth/core/types";

export const getSessionDetails = (session: Session | null) => {
  const id =
    session?.user.type === "twitter"
      ? session?.user.profile.data.username
      : session?.user.type === "discord"
      ? session?.user.profile.username
      : session?.user.type === "telegram"
      ? session?.user.username
      : session?.user.name;

  return { id, sessionType: session?.user.type };
};
