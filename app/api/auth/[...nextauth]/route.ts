import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn() {
      return true
    },
    async jwt({ token, account }: any) {
      if (account) token.accessToken = account.access_token
      return token
    },
    async session({ session }: any) {
      return session
    },
    async redirect({ baseUrl }: any) {
      return baseUrl
    }
  },
})

export { handler as GET, handler as POST }
