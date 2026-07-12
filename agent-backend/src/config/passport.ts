// src/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './db';

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_REDIRECT_URI!,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('No email found on profile'));

      const user = await prisma.user.upsert({
        where: { googleId: profile.id },
        update: { name: profile.displayName },
        create: {
          googleId: profile.id,
          email,
          name: profile.displayName,
        },
      });

      await prisma.oAuthToken.upsert({
        where: { userId: user.id },
        update: {
          accessToken,
          refreshToken: refreshToken || undefined,
          expiryDate: BigInt(Date.now() + 3600 * 1000),
        },
        create: {
          userId: user.id,
          accessToken,
          refreshToken: refreshToken || '',
          expiryDate: BigInt(Date.now() + 3600 * 1000),
          scope: (profile._json as { scope?: string }).scope || '',
        },
      });

      return done(null, user);
    } catch (err) {
      return done(err as Error);
    }
  }
));

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

export default passport;