import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (_, __, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                if (!email) return done(new Error("Google account has no email"));

                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        name: profile.displayName,
                        email,
                        password: "google-oauth", // dummy, never used
                        provider: "google",
                    });
                }

                return done(null, user);
            } catch (err) {
                return done(err as any);
            }
        }
    )
);

export default passport;
