const express = require('express');
const passport = require('passport');
const { renderLogin, renderRegister, login, register, logout } = require('./controllers/user.js')
const catchAsync = require('../utils/catchAsync');
const { isValidUser } = require('../utils/middleware.js');

app.get('/register', renderRegister);
app.post('/register', isValidUser, catchAsync(register));
app.get('/login', renderLogin);
app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), login);
app.get('/logout', logout);