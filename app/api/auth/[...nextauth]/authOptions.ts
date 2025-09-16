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
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
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
      try {
        console.log('OAuth signIn callback triggered:', { 
          provider: account?.provider, 
          email: (profile as any)?.email 
        });
        
        await dbConnect();
        
        if (account?.provider === 'google' || account?.provider === 'github') {
          const profileId = (profile as any)?.id || (profile as any)?.sub;
          const profileEmail = (profile as any)?.email;
          const profileName = (profile as any)?.name || (profile as any)?.login;
          
          console.log('OAuth profile data:', { profileId, profileEmail, profileName });
          
          if (!profileId || !profileEmail) {
            console.error('OAuth profile missing required fields:', { profileId, profileEmail });
            return false;
          }
          
          let dbUser = await User.findOne({
            $or: [
              { provider: account.provider, providerId: profileId },
              { email: profileEmail }
            ]
          });
          
          if (!dbUser) {
            // Generate a unique username from email or profile name
            let username = profileName?.replace(/\s+/g, '_').toLowerCase() || 
                          profileEmail.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase();
            
            // Ensure username is unique
            let counter = 1;
            let originalUsername = username;
            while (await User.findOne({ username })) {
              username = `${originalUsername}_${counter}`;
              counter++;
            }
            
            console.log('Creating new OAuth user with username:', username);
            
            try {
              dbUser = await User.create({
                email: profileEmail,
                username: username,
                displayName: profileName || profileEmail.split('@')[0],
                provider: account.provider,
                providerId: profileId,
                role: 'user',
                reputation: 0,
                // Don't set password for OAuth users
              });
              console.log('Successfully created OAuth user:', dbUser.email);
            } catch (error) {
              console.error('Error creating OAuth user:', error);
              return false;
            }
          } else {
            console.log('Found existing OAuth user:', dbUser.email);
          }
          
          user.id = dbUser._id.toString();
          user.username = dbUser.username;
          user.role = dbUser.role;
          user.reputation = dbUser.reputation;
          user.phoneCountry = dbUser.phoneCountry;
          user.phoneNumber = dbUser.phoneNumber;
        }
        
        console.log('OAuth signIn callback successful');
        return true;
      } catch (error) {
        console.error('OAuth signIn callback error:', error);
        return false;
      }
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.reputation = user.reputation;
        token.phoneCountry = (user as any).phoneCountry ?? undefined;
        token.phoneNumber = (user as any).phoneNumber ?? undefined;
        token.displayName = (user as any).displayName ?? undefined;
        token.bio = (user as any).bio ?? undefined;
        token.github = (user as any).github ?? undefined;
        token.linkedin = (user as any).linkedin ?? undefined;
        token.twitter = (user as any).twitter ?? undefined;
        token.location = (user as any).location ?? undefined;
        token.website = (user as any).website ?? undefined;
        token.isPrivate = (user as any).isPrivate ?? false;
        token.avatar = (user as any).avatar ?? undefined;
        // If OAuth, check for missing fields
        if ((account?.provider === 'google' || account?.provider === 'github') && (!user.username || !(user as any).phoneCountry || !(user as any).phoneNumber)) {
          token.needsProfileCompletion = true;
        } else {
          token.needsProfileCompletion = false;
        }
      }
      
      // Handle session updates (when updateSession is called)
      if (trigger === 'update' && session) {
        // Update token with new session data
        if (session.user) {
          token.username = session.user.username;
          token.phoneCountry = session.user.phoneCountry;
          token.phoneNumber = session.user.phoneNumber;
          token.needsProfileCompletion = session.user.needsProfileCompletion;
          token.displayName = session.user.displayName;
          token.bio = session.user.bio;
          token.github = session.user.github;
          token.linkedin = session.user.linkedin;
          token.twitter = session.user.twitter;
          token.location = session.user.location;
          token.website = session.user.website;
          token.isPrivate = session.user.isPrivate;
          token.avatar = session.user.avatar;
        }
      }
      
      // Re-check profile completion status by checking token values
      if (token.phoneCountry && token.phoneNumber && token.username) {
        token.needsProfileCompletion = false;
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
        session.user.displayName = token.displayName as string | undefined;
        session.user.bio = token.bio as string | undefined;
        session.user.github = token.github as string | undefined;
        session.user.linkedin = token.linkedin as string | undefined;
        session.user.twitter = token.twitter as string | undefined;
        session.user.location = token.location as string | undefined;
        session.user.website = token.website as string | undefined;
        session.user.isPrivate = token.isPrivate as boolean | undefined;
        session.user.avatar = token.avatar as string | undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback:', { url, baseUrl });
      
      // If the URL is relative, allow it
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // If the URL is from our domain, allow it
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // For OAuth callbacks and successful sign-ins, redirect to questions page
      return `${baseUrl}/questions`;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin', // Redirect errors to signin page
    newUser: '/auth/complete-profile', // Redirect new OAuth users to complete profile
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('NextAuth signIn event:', { 
        provider: account?.provider, 
        userEmail: user.email, 
        isNewUser 
      });
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 