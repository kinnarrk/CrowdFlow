const express = require('express');
var router = express.Router();
const emailValidator = require("email-validator");
const passwordValidator = require('password-validator');
const passwordPattern = new passwordValidator();
const bcrypt = require('bcrypt');
const passport = require('passport');
const model = require('../model/commonModel');
const User = model.User;
const Role = model.Role;

router.get('/login', (req, res) => {
    if(req.user) {
        res.redirect('/');
        return;
    }
    res.render('../view/login');
});

router.get('/register', (req, res) => {
    if(req.user) {
        res.redirect('/');
        return;
    }
    res.render('../view/register');
});

//Register Handle
router.post('/register', (req, res) => {
    const {
        fullName,
        email,
        password,
        phone
    } = req.body;
    errors = [];

    const validEmail = emailValidator.validate(req.body.email);

    passwordPattern.is().min(8)
        .is().max(100)
        .has().uppercase()
        .has().lowercase()
        .has().digits()
        .has().not().spaces();

    const validPassword = passwordPattern.validate(req.body.password);

    if (!fullName || !email || !password || !phone) {
        errors.push({
            msg: 'Please enter all fields'
        });
    }

    if (!validEmail) {
        errors.push({
            msg: 'Please enter valid E-mail'
        });
    }

    if (!validPassword) {
        errors.push({
            msg: 'Password must contains at least 8 characters, 1 uppercase, 1 lowercase, 1 digit'
        });
    }

    if (errors.length > 0) {
        res.render('../view/register', {
            errors,
            fullName,
            email,
            password,
            phone
        });
    } else {
        User.findOne({
            email: email
        }).then(user => {

            if (user) {
                errors.push({
                    msg: 'Email already exists'
                });
                res.render('../view/register', {
                    errors,
                    fullName,
                    email,
                    password,
                    phone
                });
            } else {
                Role.findOne({
                    role: 'User'
                }).then(role => {
                    if(role) {
                        const newUser = new User({
                            roleId: role._id,
                            fullName: fullName,
                            email: email,
                            password: password,
                            phone: phone
                        });
    
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                                if (err) throw err;
                                newUser.password = hash;
                                newUser.save()
                                    .then(user => {
                                        req.flash(
                                            'success_msg',
                                            'You are now registered and can log in'
                                        );
                                        errors = [];
                                        res.redirect('/users/login');
                                    })
                                    .catch(err => console.log(err));
                            });
                        });
                    }
                });
            }
        });
    }
});

//Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//Facebook
router.get('/facebook',
    passport.authenticate('facebook', {
        scope: ['email']
    }));

router.get('/facebook/callback', (req, res, next) => {
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//Google
router.get('/google',
    passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/plus.login',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }));

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;