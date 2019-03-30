'use strict';
// ================================================================
// get all the tools we need
// ================================================================
var express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');

var routes = require('./controller/appController');
var port = process.env.PORT || 3000;
var app = express();
// ================================================================
// setup our express application
// ================================================================
app.use('/webapp', express.static(process.cwd() + '/'));
app.use('/view',express.static(__dirname + '/view'));
app.set('view engine', 'ejs');

// ================================================================
// setup routes
// ================================================================
routes(app);
// ================================================================
// start our server
// ================================================================
app.listen(port, function() {
 console.log('Server listening on port ' + port + '…');
});