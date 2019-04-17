const LocalStrategy = require('passport-local').Strategy,
bcrypt = require('bcryptjs'); 

// Load User model
const User = require('../model/commonModel').User;

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({
            usernameField: 'email'
        }, (email, password, done) => {
            // Match user
            User.findOne({
                email: email
            }).then(user => {
                if (!user) {
                    return done(null, false, {
                        message: 'That email is not registered'
                    });
                }

                if(user.password == undefined) {
                    return done(null, false, {
                        message: 'Email or Password incorrect'
                    });
                }

                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, {
                            message: 'Password incorrect'
                        });
                    }
                });
            });
        })
    );

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};