import NextAuth from 'next-auth';
import { authOptions } from './authOptions';

const handler = NextAuth(authOptions);

// Add debugging
if (process.env.NODE_ENV === 'development') {
  console.log('NextAuth route handler loaded');
}

export { handler as GET, handler as POST }; 