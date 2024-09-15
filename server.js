const express = require('express');
const GitHubStrategy = require('passport-github').Strategy;
const passport = require('passport');
const session = require('express-session');
const axios = require('axios'); // Import axios to make API requests to GitHub
const path = require('path');
const app = express();

app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());

// Passport serialization and deserialization - save the full user profile, not just the ID
passport.serializeUser(function (user, cb) {
    console.log('Serializing user:', user);
    cb(null, user); // Save the whole user object, including the "following" field
});

passport.deserializeUser(function (user, cb) {
    console.log('Deserializing user:', user);
    cb(null, user); // Deserialize the whole user object
});

passport.use(
    new GitHubStrategy(
        {
            clientID: 'Ov23lidheFid8KjRVhFJ',
            clientSecret: 'e16f128e7b7fbf2f18a3c25375461df496ad35a5',
            callbackURL: 'https://projectdeployment-nu.vercel.app/auth/github/callback',
        },
        async function (accessToken, refreshToken, profile, cb) {
            try {
                // Check if the user is following the 'bytemait' account
                const response = await axios.get(`https://api.github.com/user/following/bytemait`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, // Use the user's access token to authenticate
                    },
                });

                // If the status code is 204, the user is following the account
                profile.following = response.status === 204 ? true : false;

            } catch (error) {
                profile.following = false; // Assume not following if there's an error
            }

            // Continue with the profile and access token
            cb(null, profile); // Pass the profile (including follow status) to Passport
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

// Route for dashboard - Check follow status and serve the appropriate page
app.get('/', isAuth, (req, res) => {
    console.log('Checking follow status:', req.user);

    if (req.user.following) {
        res.sendFile(path.join(__dirname, 'dashboard.html')); // Serve dashboard if the user is following
    } else {
        res.sendFile(path.join(__dirname, 'follow.html')); // Serve follow.html if not following
    }
});

// Route for login page
app.get('/login', (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for logout
app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.log('Error logging out:', err);
            return next(err); // Pass the error to the next middleware
        }
        res.redirect('/login');
    });
});

// GitHub authentication route
app.get('/auth/github', passport.authenticate('github'));

// GitHub authentication callback route
app.get(
    '/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect home
        res.redirect('/');
    }
);

// Start the server
app.listen(3000, () => console.log('Server is running on port 3000'));
