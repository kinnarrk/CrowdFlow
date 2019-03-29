'use strict';
// ================================================================
// get all the tools we need
// ================================================================
var express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');

const {mongoose} = require('./db.js');
var routes = require('./controller/appController');
var port = process.env.PORT || 3000;
var app = express();
app.use(bodyParser.json());
// ================================================================
// setup our express application
// ================================================================
// app.use('/webapp', express.static(process.cwd() + '/'));
app.use('/', routes);
app.set('view engine', 'ejs');
// ================================================================
// setup routes
// ================================================================
// routes(app);
// ================================================================
// start our server
// ================================================================
app.listen(port, function() {
 console.log('Server listening on port ' + port + '...');
});