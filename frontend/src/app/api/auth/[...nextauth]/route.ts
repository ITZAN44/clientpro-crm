import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        try {
          // Use API_URL for server-side calls (Docker internal) or fallback to NEXT_PUBLIC_API_URL
          const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
          const response = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Credenciales inválidas");
          }

          const data = await response.json();

          return {
            id: data.usuario.id,
            email: data.usuario.email,
            name: data.usuario.nombre,
            rol: data.usuario.rol,
            accessToken: data.access_token,
          };
        } catch (error) {
          console.error("Error de autenticación:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 7 * 24 * 60 * 60, // 7 días
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
