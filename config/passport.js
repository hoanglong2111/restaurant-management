const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy - Only initialize if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        // User exists, return user
                        return done(null, user);
                    }

                    // Check if user exists with same email
                    user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        // Link Google account to existing user
                        user.googleId = profile.id;
                        user.avatar = profile.photos[0]?.value;
                        user.emailVerified = profile.emails[0]?.verified || false;
                        await user.save();
                        return done(null, user);
                    }

                    // Create new user
                    user = await User.create({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        provider: 'google',
                        avatar: profile.photos[0]?.value,
                        emailVerified: profile.emails[0]?.verified || false,
                    });

                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
    console.log('✅ Google OAuth strategy initialized');
} else {
    console.log('⚠️  Google OAuth disabled - credentials not found in .env');
}

// Facebook OAuth Strategy - Only initialize if credentials are provided
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
                profileFields: ['id', 'displayName', 'emails', 'photos'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists
                    let user = await User.findOne({ facebookId: profile.id });

                    if (user) {
                        return done(null, user);
                    }

                    // Check if user exists with same email
                    if (profile.emails && profile.emails[0]) {
                        user = await User.findOne({ email: profile.emails[0].value });

                        if (user) {
                            // Link Facebook account to existing user
                            user.facebookId = profile.id;
                            user.avatar = profile.photos[0]?.value;
                            await user.save();
                            return done(null, user);
                        }
                    }

                    // Create new user
                    user = await User.create({
                        facebookId: profile.id,
                        name: profile.displayName,
                        email: profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`,
                        provider: 'facebook',
                        avatar: profile.photos[0]?.value,
                    });

                    done(null, user);
                } catch (error) {
                    done(error, null);
                }
            }
        )
    );
    console.log('✅ Facebook OAuth strategy initialized');
} else {
    console.log('⚠️  Facebook OAuth disabled - credentials not found in .env');
}

module.exports = passport;
