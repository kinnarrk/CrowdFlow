const express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcrypt');
var validator = require('validator');
var passwordValidator = require('password-validator');
var {ensureAuthenticated } = require('../config/auth');

// var {User} = require('../model/user.js');
var model = require('../model/commonModel');

router.get('/' ,(req, res) =>{
    console.log("logotu="+req.session.returnTo);
    res.render('../view/index');
});

module.exports = router;