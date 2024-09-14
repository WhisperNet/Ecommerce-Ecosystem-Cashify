const express = require('express');
const { isLoggedIn } = require('./utils/middleware');
const router = express.Router();
const catchAsync = require('./utils/catchAsync');
const { isValidTransaction } = require('./utils/middleware.js');
const transaction = require('./models/transaction');
const { initiateTransaction, initiateDummyTransaction, transaction } = require('./controllers/transaction');

app.get('/transactions', isLoggedIn, catchAsync(showTransactions))
app.post('/transactions', isLoggedIn, isValidTransaction, catchAsync(initiateTransaction))
app.post('/dummyaddtransaction', catchAsync(initiateDummyTransaction))