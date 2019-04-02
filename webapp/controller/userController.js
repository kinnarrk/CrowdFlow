const express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const model = require('../model/commonModel');
const User = model.User;

router.get('/login', (req, res) => {
    res.render('../view/login');
});

router.get('/register', (req, res) => {
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

    if (!fullName || !email || !password || !phone) {
        errors.push({
            msg: 'Please enter all fields'
        });
    }

    if (password.length < 6) {
        errors.push({
            msg: 'Password must be at least 6 characters'
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

                const newUser = new User({
                    roleId: "5ca27d4f2de1350846b32b7e",
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
                                // req.flash(
                                //     'success_msg',
                                //     'You are now registered and can log in'
                                // );
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

module.exports = router;