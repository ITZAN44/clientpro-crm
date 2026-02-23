import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: string;
    } & DefaultSession["user"];
    accessToken: string;
  }

  interface User {
    id: string;
    rol: string;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: string;
    accessToken: string;
  }
}
