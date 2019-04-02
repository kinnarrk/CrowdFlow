'use strict';
// ================================================================
// get all the tools we need
// ================================================================

var express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');

const {mongoose} = require('./config/db.js');

var port = process.env.PORT || 3000;
var app = express();
app.use(bodyParser.json());

//Bodyparser
app.use(express.urlencoded({
    extended: true
}));

// ================================================================
// setup our express application
// ================================================================
// app.use('/webapp', express.static(process.cwd() + '/'));

app.use('/view',express.static(__dirname + '/view'));
app.set('view engine', 'ejs');

// ================================================================

// setup routes
// ================================================================
app.use('/', require('./controller/appController'));
app.use('/users', require('./controller/userController'));


// routes(app);
// ================================================================
// start our server
// ================================================================

app.listen(port, function() {
 console.log('Server listening on port ' + port + '...');
});