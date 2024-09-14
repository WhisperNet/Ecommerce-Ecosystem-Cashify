const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        required: true,
        default: 100
    },
    transactions: [{
        type: Schema.Types.ObjectId,
        ref: 'Transaction'
    }],
    otp: {
        type: Number,
        default: Math.floor(Math.random() * 1000) + 1000
    }
})

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema);