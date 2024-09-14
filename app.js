if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const ejsmate = require('ejs-mate');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const MongoStore = require('connect-mongo');
const { isLoggedIn } = require('./utils/middleware');
const { renderLogin, renderRegister, login, register, logout } = require('./controllers/user.js')
const catchAsync = require('./utils/catchAsync.js');
const { isValidUser } = require('./utils/middleware.js');
const { isValidTransaction } = require('./utils/middleware.js');
const { initiateTransaction, initiateDummyTransaction, showTransactions } = require('./controllers/transaction');
const mongooseSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

app.engine('ejs', ejsmate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongooseSanitize());
app.use(helmet({
    contentSecurityPolicy: false,
}));

const mongoUrl = process.env.mongoUrl || 'mongodb://localhost:27017/cashify';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Database connected');
    })
    .catch(err => {
        console.log('Database connection error');
        console.log(err);
    })

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoUrl,
        collectionName: 'sessions'
    }),
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/dashboard', isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id);
    console.log(req.user);
    res.render('dashboard', { user });
})

app.get('/register', renderRegister);
app.post('/register', isValidUser, catchAsync(register));
app.get('/login', renderLogin);
app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), login);
app.get('/logout', logout);

app.get('/transactions', isLoggedIn, catchAsync(showTransactions))
app.post('/transactions', isValidTransaction, catchAsync(initiateTransaction))
app.post('/dummyaddtransaction', catchAsync(initiateDummyTransaction))

app.all('*', (req, res) => {
    throw new ExpressError(404, 'Page not found');
})

app.use((err, req, res, next) => {
    const { stack = "unknown error at app.js", statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).render('error', { stack, message });
})

app.listen(3001, () => {
    console.log('Server is running on port 3000');
})