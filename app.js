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
const Transaction = require('./models/transaction');
const { isLoggedIn } = require('./utils/middleware');

app.engine('ejs', ejsmate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost:27017/cashify', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Database connected');
    })
    .catch(err => {
        console.log('Database connection error');
        console.log(err);
    })

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(session({
//     secret: 'tmpsecret',
//     resave: false,
//     saveUninitialized: false
// }));

app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/cashify',
        collectionName: 'sessions'
    })
}));


// Step 4: Initialize Passport and configure it to use sessions
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})
// Step 5: Set up Passport-Local-Mongoose for user authentication

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



app.post('/balance', async (req, res) => {
    const user = await User.findById(req.user._id);
    user.balance += 100
    await user.save();
    res.redirect('/dashboard');
})

app.get('/transactions', isLoggedIn, async (req, res) => {
    const user = await User.findById(req.user._id).populate('transactions');
    res.render
        ('transactions', { user });
})
app.post('/transactions', async (req, res) => {
    const amount = Number(req.body.amount);
    const transaction = new Transaction(req.body);
    const sender = await User.findOne({ username: req.body.sender })
    const reciever = await User.findOne({ username: req.body.reciever })
    if (sender.otp !== Number(req.body.otp)) {
        res.status(400).json({ response: 'Invalid OTP' });
        sender.otp = Math.floor(Math.random() * 1000) + 1000;
        await sender.save();
    }
    else if (sender.balance < amount) {
        res.status(400).json({ response: 'Insufficient balance' });
    }
    else {
        sender.balance -= amount;
        sender.transactions.push(transaction);
        sender.otp = Math.floor(Math.random() * 1000) + 1000;
        reciever.balance += amount;
        reciever.transactions.push(transaction);
        await transaction.save();
        await sender.save();
        await reciever.save();
        res.status(200).json({ response: 'Transaction successful' });
    }
})
app.get('/login', (req, res) => {
    res.render('user/login');
})
app.get('/register', (req, res) => {
    res.render('user/register');
})
app.post('/login', passport.authenticate('local'), (req, res) => {
    res.redirect('/dashboard');
});

app.post('/register', async (req, res) => {
    try {
        const user = new User({ username: req.body.username, email: req.body.email });
        const registeredUser = await User.register(user, req.body.password);
        req.login(registeredUser, err => {
            if (err) console.log(err);
            res.redirect('/dashboard');
        })
    } catch (error) {
        console.log(error);
    }
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.redirect('/');
    })
});

app.all('*', (req, res) => {
    throw new ExpressError(404, 'Page not found');
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.render('error', { statusCode, message });
})

app.listen(3001, () => {
    console.log('Server is running on port 3000');
})