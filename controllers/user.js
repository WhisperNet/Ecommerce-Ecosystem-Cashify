const User = require('../models/user');

module.exports.renderLogin = (req, res) => {
    res.render('user/login');
}
module.exports.renderRegister = (req, res) => {
    res.render('user/register');
}
module.exports.login = (req, res) => {
    res.redirect('/dashboard');
}
module.exports.register = async (req, res, next) => {
    try {
        const user = new User({ username: req.body.username, email: req.body.email });
        const registeredUser = await User.register(user, req.body.password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            res.redirect('/dashboard');
        })
    } catch (error) {
        next(error);
    }
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    })
}