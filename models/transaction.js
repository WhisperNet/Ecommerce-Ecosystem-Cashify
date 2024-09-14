const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    amount: {
        type: Number,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    reciever: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Transaction', transactionSchema);