'use strict';
// ================================================================
// get all the tools we need
// ================================================================

const express = require('express');
const passport = require('passport');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const app = express();
 const cors = require('cors');

const mongoose = require('./config/database.js');

app.use(bodyParser.json());

// Passport Config
require('./config/passport')(passport);

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

//Setup Routes
app.use('/', require('./controller/appController'));
app.use('/users', require('./controller/userController'));
app.use('/fundraiser', require('./controller/fundraiser_controller'));
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
    next();
});

// start our server
const port = process.env.PORT || 3000;
app.listen(port, function() {
 console.log('Server listening on port ' + port + '...');
});