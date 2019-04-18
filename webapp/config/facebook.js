const FacebookStrategy = require('passport-facebook').Strategy;
const model = require('../model/commonModel');
const User = model.User;
const Role = model.Role;
const download = require('image-downloader');

module.exports = function (passport) {
    passport.use(new FacebookStrategy({
            clientID: "341289839927085",
            clientSecret: "e9ba4b59847dd7869b0fad6ba39f6db5",
            callbackURL: "/users/facebook/callback",
            profileFields: ['id', 'emails', 'name', 'picture.type(large)']
        },
        function (accessToken, refreshToken, profile, done) {
            console.log("PROFILE=" + JSON.stringify(profile));
            const fullName = profile.name.givenName + " " + profile.name.familyName;
            const email = profile.emails[0].value;
            const image = profile.photos[0].value;
            User.findOne({
                email: email
            }).then(user => {
                if (!user) {
                    Role.findOne({
                        role: 'User'
                    }).then(role => {
                        const newUser = new User({
                            roleId: role._id,
                            fullName: fullName,
                            email: email
                        });
                        newUser.save().then(nUser => {
                                const options = {
                                    url: image,
                                    dest: './view/images/users/' + nUser._id + '.png'
                                }

                                download.image(options)
                                    .then(({
                                        filename,
                                        image
                                    }) => {
                                        console.log('File saved to', filename)
                                        nUser.image = nUser._id + '.png';
                                        nUser.save();
                                        return done(null, nUser);
                                    })
                                    .catch((err) => {
                                        console.error(err)
                                    });
                            })
                            .catch(err => console.log(err));
                    });
                    return;
                }
                return done(null, user)
            }).catch(err => console.log(err));
        }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
}