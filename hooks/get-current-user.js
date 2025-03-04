"use client";

import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
  const { data: session, status } = useSession();

  // Return user object if authenticated, null if not
  return status === "authenticated" ? session?.user : null;
};