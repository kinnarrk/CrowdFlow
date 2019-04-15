'use strict';
// ================================================================
// get all the tools we need
// ================================================================

const express = require('express');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
// const cors = require('cors');

const mongoose = require('./config/database.js');



app.use(bodyParser.json());



// Passport Config
require('./config/passport')(passport);
require('./config/facebook')(passport);
require('./config/google')(passport);

// ================================================================
// setup our express application
// ================================================================
// app.use('/webapp', express.static(process.cwd() + '/'));

//EJS
app.use('/view',express.static(__dirname + '/view'));
app.set('view engine', 'ejs');

//Bodyparser
app.use(express.urlencoded({
    extended: true
}));

<<<<<<< HEAD
//Setup Routes
app.use('/', require('./controller/appController'));
app.use('/users', require('./controller/userController'));
app.use('/category', require('./controller/categoryController'));
app.use('/editFundraiser', require('./controller/editFundraiserController'));

=======
//Express session
app.use(
    session({
        secret: 'sosecret',
        resave: false,
        saveUninitialized: false
    })
);
>>>>>>> a9f06f7d32fc6e597124e2065352a6131eb1f995

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user;
    next();
});



//Setup Routes
app.use('/', require('./controller/appController'));
app.use('/users', require('./controller/userController'));
app.use('/fundraiser', require('./controller/fundraiser_controller'));
+app.use('/category', require('./controller/categoryController'));
+app.use('/editFundraiser', require('./controller/editFundraiserController'));
// start our server
const port = process.env.PORT || 3000;
app.listen(port, function() {
 console.log('Server listening on port ' + port + '...');
});