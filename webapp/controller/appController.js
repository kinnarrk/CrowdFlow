const express = require('express');
var router = express.Router();

// var {User} = require('../model/user.js');
var model = require('../model/commonModel');

router.get('/' ,(req, res) =>{
    console.log("logotu="+req.session.returnTo);
    
    res.render('../view/index');
});

router.get('/404' ,(req, res) =>{
    
    res.render('../view/404');
});

module.exports = router;