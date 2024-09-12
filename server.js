const express = require('express');
const GitHubStrategy = require('passport-github').Strategy;
const passport = require('passport');
const session = require('express-session');
const app = express();

app.use(
    session({
     secret: 'keyboard cat',
     resave: false,
     saveUninitialized: false,
     cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
    },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  cb(null, id);
});

passport.use(
    new GitHubStrategy(
      {
        clientID: 'Ov23lidheFid8KjRVhFJ' ,
        clientSecret: 'e16f128e7b7fbf2f18a3c25375461df496ad35a5' ,
        callbackURL: 'http://localhost:3000/auth/github/callback',
      },
      function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        cb(null, profile);
      }
    )
  );

const isAuth = (req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.redirect('/login');
    }
};
 

app.get('/', (req, res) => {
    console.log(req.user);
    res.sendFile(__dirname + '/dashboard.html');
});
  
app.get('/login', (req, res) => {
    if (req.user) {
      return res.redirect('/');
    }
    res.sendFile(__dirname + '/index.html');
  });


app.get('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) {
        console.log('Error logging out:', err);
        return next(err); // Pass the error to the next middleware
      }
      res.redirect('/login');
    });
});


app.get('/auth/github', passport.authenticate('github'));

app.get(
    '/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    }
  );

app.listen(3000, () => console.log('server is running on port 3000'));