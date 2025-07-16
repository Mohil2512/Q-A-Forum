import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email, Username, or Phone Number', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        await dbConnect();

        // Try to find user by email, username, or phone number
        const identifier = credentials.identifier.trim();
        let user = await User.findOne({ email: identifier });
        if (!user) {
          user = await User.findOne({ username: identifier });
        }
        if (!user && /^\d{10}$/.test(identifier)) {
          user = await User.findOne({ phoneNumber: identifier });
        }

        if (!user || user.isBanned) {
          return null;
        }

        // Check if user is suspended
        if (user.suspendedUntil && new Date() < user.suspendedUntil) {
          return null;
        }

        const isValidPassword = await user.comparePassword(credentials.password);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          role: user.role,
          reputation: user.reputation,
          phoneCountry: user.phoneCountry,
          phoneNumber: user.phoneNumber,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      await dbConnect();
      if (account?.provider === 'google' || account?.provider === 'github') {
        const profileId = (profile as any)?.id || (profile as any)?.sub;
        const profileEmail = (profile as any)?.email;
        
        if (!profileId || !profileEmail) {
          return false;
        }
        
        let dbUser = await User.findOne({
          provider: account.provider,
          providerId: profileId,
        });
        if (!dbUser) {
          dbUser = await User.create({
            email: profileEmail,
            provider: account.provider,
            providerId: profileId,
          });
        }
        user.id = dbUser._id.toString();
        user.username = dbUser.username;
        user.role = dbUser.role;
        user.reputation = dbUser.reputation;
        user.phoneCountry = dbUser.phoneCountry;
        user.phoneNumber = dbUser.phoneNumber;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.reputation = user.reputation;
        token.phoneCountry = (user as any).phoneCountry ?? undefined;
        token.phoneNumber = (user as any).phoneNumber ?? undefined;
        // If OAuth, check for missing fields
        if ((account?.provider === 'google' || account?.provider === 'github') && (!user.username || !(user as any).phoneCountry || !(user as any).phoneNumber)) {
          token.needsProfileCompletion = true;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.reputation = token.reputation as number;
        session.user.phoneCountry = token.phoneCountry as string | undefined;
        session.user.phoneNumber = token.phoneNumber as string | undefined;
        session.user.needsProfileCompletion = token.needsProfileCompletion;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 