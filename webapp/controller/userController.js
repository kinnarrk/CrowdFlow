const express = require('express');
var router = express.Router();
const emailValidator = require("email-validator");
const passwordValidator = require('password-validator');
const passwordPattern = new passwordValidator();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const model = require('../model/commonModel');
const User = model.User;
const Role = model.Role;

router.get('/login', (req, res) => {
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
                            phone: phone,
                            image: 'user.png'
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
        successRedirect: req.session.returnTo || '/',
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
        successRedirect: req.session.returnTo || '/',
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
        successRedirect: req.session.returnTo || '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/profile', (req, res) => {
    res.render('../view/profile');
});

router.post('/update/:id', (req, res) => {
    User.updateOne({ _id: req.params.id }, req.body, (err, arr) => {
        res.redirect('/users/profile');
    });
});

router.post('/update-profile-pic/:id', (req, res) => {
    let profileImage = req.files.profile-image;
    console.log(JSON.stringify(profileImage));

    let fileParts = fundraiserImage.name.split('.');

    User.updateOne({ _id: req.params.id }, 
        { image: req.params.id + '.png' }, (err, arr) => {
            profileImage.mv("./view/images/users/" + req.params.id + fileParts[1], function (err1) {
                if (err1) {
                    return res.status(500).send(err1);
                }
                res.redirect('/users/profile');
            });
    });
});

//Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;