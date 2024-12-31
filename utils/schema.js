const Joi = require('joi');

module.exports.transactionSchema = Joi.object({
    amount: Joi.number().required().min(0),
    sender: Joi.string().required(),
    reciever: Joi.string().required(),
    otp: Joi.number().min(1000).max(9999),
    adminAuth: Joi.string()
})

module.exports.userSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().required()
})