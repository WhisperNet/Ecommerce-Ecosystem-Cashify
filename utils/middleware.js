const { transactionSchema, userSchema } = require('./schema.js');
const ExpressError = require('./error.js');
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}

module.exports.isValidTransaction = (req, res, next) => {
    const { error } = transactionSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(400, msg);
    }
    else {
        next();
    }
}

module.exports.isValidUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(400, msg);
    }
    else {
        next();
    }
}