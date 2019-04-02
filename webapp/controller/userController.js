const express = require('express');
var router = express.Router();
const passport = require('passport');
require('../model/commonModel');

router.get('/login', (req, res) => {
    res.render('../view/login');
});

router.get('/register', (req, res) => {
    res.render('../view/register');
});

//Register Handle
router.post('/register', (req, res) => {
    const {
        name,
        email,
        password,
        mobile
    } = req.body;
    errors = [];

    if (!name || !email || !password || !mobile) {
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
            name,
            email,
            password,
            mobile
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
                    name,
                    email,
                    password,
                    mobile
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password,
                    mobile
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

module.exports = router;