const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy(
        {
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            callbackURL: '/auth/google/callback',
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            const existingUser = await User.findOne({ googleId: profile.id });

            if (existingUser) {
                // We already have a record with the given profile ID
                done(null, existingUser);
            } else {
                // User with matching profile ID d.n.e. in DB
                const user = await new User({ googleId: profile.id }).save();
                done(null, user);
            }
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: keys.githubClientID,
            clientSecret: keys.githubClientSecret,
            callbackURL: '/auth/github/callback',
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            const existingUser = await User.findOne({ githubId: profile.id });
            if (existingUser) {
                // We already have a record with the given profile ID
                done(null, existingUser);
            } else {
                // User with matching profile ID d.n.e. in DB
                const user = await User({ githubId: profile.id }).save();
                done(null, user);
            }
        }
    )
);
