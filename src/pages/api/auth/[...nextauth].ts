import { query } from 'faunadb';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { fauna } from '../../../services/fauna';

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user',
    }),
  ],
  callbacks: {
    async signIn({ email }) {
      const userMatch = query.Match(
        query.Index('user_by_email'),
        query.Casefold(email)
      );

      try {
        await fauna.query(
          query.If(
            query.Not(query.Exists(userMatch)),
            query.Create(query.Collection('users'), { data: { email } }),
            query.Get(userMatch)
          )
        );
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    },
  },
});
