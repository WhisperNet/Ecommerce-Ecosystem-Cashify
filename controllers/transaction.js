const User = require('../models/user.js');
const Transaction = require('../models/transaction.js');


module.exports.initiateDummyTransaction = async (req, res) => {
    const user = await User.findById(req.user._id);
    user.balance += 100
    await user.save();
    res.redirect('/dashboard');
}

module.exports.showTransactions = async (req, res) => {
    const user = await User.findById(req.user._id).populate('transactions');
    res.render
        ('transactions', { user });
}

module.exports.initiateTransaction = async (req, res) => {
    const amount = Number(req.body.amount);
    const transaction = new Transaction(req.body);
    const sender = await User.findOne({ username: req.body.sender })
    const reciever = await User.findOne({ username: req.body.reciever })
    console.log(req.body)
    if (!sender || !reciever) {
        return res.status(400).json({ response: 'Invalid sender or reciever' });
    }
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
}