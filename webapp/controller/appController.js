const express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcrypt');
var validator = require('validator');
var passwordValidator = require('password-validator');

// var {User} = require('../model/user.js');
var User = require('../model/commonModel');

router.get('/',(req, res) =>{
    res.render('../view/index');
});

router.get('/users/login', (req, res) => {
    res.render('../view/login');
});

router.get('/users/register', (req, res) => {
    res.render('../view/register');
});
module.exports = router;