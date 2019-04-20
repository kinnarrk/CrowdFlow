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
const Fundraiser = model.Fundraiser;
const Comment = model.Comment;
const {
    ensureAuthenticated
} = require('../config/auth');
var mongoose = require('mongoose');
const objectID = require('mongodb').ObjectID;

router.get('/login', (req, res) => {
    errors = [];
    res.render('../view/login');
});

router.get('/register', (req, res) => {
    if (req.user) {
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
                    if (role) {
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
    console.log("return path=" + req.session.returnTo);
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

router.get('/profile/:tab', ensureAuthenticated, (req, res) => {

    User.aggregate([{
            $match: {
                _id: mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            '$lookup': {
                from: 'fundraisers',
                localField: '_id',
                foreignField: 'createdBy',
                as: 'fundraisers'
            }
        }
    ]).exec((err, arr) => {
        console.log("ARR user=" + JSON.stringify(arr));

        Fundraiser.aggregate([{
                '$unwind': '$donations'
            },
            {
                $match: {
                    'donations.userId': req.user._id
                }
            }
        ]).exec((error, array) => {
            console.log("DONATIONS="+JSON.stringify(array));
            Comment.find({
                createdBy: req.user._id
            })
            .populate('fundraiserId')
            .exec(function (errComment, comment) {
                res.render('../view/profile', {
                    profile: arr,
                    donations: array,
                    comments: comment,
                    tab: req.params.tab
                });
            });
        });


    });

});

router.post('/update/:id', (req, res) => {
    errors = [];

    const validEmail = emailValidator.validate(req.body.email);

    if (!validEmail) {
        errors.push({
            msg: 'Email address format is invalid'
        });
    }

    if (errors.length > 0) {
        res.redirect('/users/profile/info', {
            errors
        });
    } else {
        User.updateOne({
            _id: req.params.id
        }, req.body, (err, arr) => {
            console.log("arr=" + JSON.stringify(arr));

            if (!arr.n && !arr.ok && !arr.nModified) {
                req.flash(
                    'error_msg',
                    'Email address has already been taken'
                );
                res.redirect('/users/profile/info');
                return;
            }
            req.flash(
                'success_msg',
                'Profile updated successfully'
            );
            res.redirect('/users/profile/info');
        });
    }

});

router.post('/update-profile-pic/:id', (req, res) => {
    let profileImage = req.files.profile;
    success = [];
    User.updateOne({
        _id: req.params.id
    }, {
        image: req.params.id + '.png'
    }, (err, arr) => {
        profileImage.mv("./view/images/users/" + req.params.id + '.png', function (err1) {
            if (err1) {
                res.redirect('/404');
            }

            req.flash(
                'success_msg',
                'Profile picture updated successfully'
            );
            res.redirect('/users/profile/info');
        });
    });
});

router.post('/update-password/:id', (req, res) => {
    success = [];
    passwordPattern.is().min(8)
        .is().max(100)
        .has().uppercase()
        .has().lowercase()
        .has().digits()
        .has().not().spaces();

    const validPassword = passwordPattern.validate(req.body.password);

    errors = [];
    if (!validPassword) {
        errors.push({
            msg: 'Password must contains at least 8 characters, 1 uppercase, 1 lowercase, 1 digit'
        });
    }

    if (errors.length > 0) {
        res.render('../view/profile', {
            errors
        });
    } else {
        User.updateOne({
            _id: req.params.id
        }, {
            password: req.body.password
        }, (err, arr) => {
            req.flash(
                'success_msg',
                'Password updated successfully'
            );
            res.redirect('/users/profile/info');
        });

    }
});

//Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;