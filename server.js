require('dotenv').config();
const express = require('express');
const GitHubStrategy = require('passport-github').Strategy;
const passport = require('passport');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Set to true in production
            sameSite: 'Lax', // Ensures proper cookie handling
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
});

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: 'https://projectdeployment-steel.vercel.app/auth/github/callback',
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                const response = await axios.get(`https://api.github.com/user/following/bytemait`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                profile.following = response.status === 204;
            } catch (error) {
                profile.following = false;
            }

            cb(null, profile);
        }
    )
);

// Middleware to check if the user is authenticated
const isAuth = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.get('/', isAuth, (req, res) => {
    if (req.user.following) {
        res.sendFile(path.join(__dirname, 'dashboard.html'));
    } else {
        res.sendFile(path.join(__dirname, 'follow.html'));
    }
});

app.get('/login', (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.redirect('/login');
        });
    });
});

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});

app.listen(3000, () => console.log('Server is running on port 3000'));
