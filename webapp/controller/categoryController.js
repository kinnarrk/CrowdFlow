const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');
const User = model.Category;

// var {User} = require('../model/user.js');
//var User = require('../model/commonModel');

router.get('/sample',(req,res) =>
{
 User.find({
     
 }).then(sample=> {
    sample1 = [];
    sample1 = sample;
    console.log(sample1);
    
 });
 //console.log(require('path').resolve(__dirname, '..'));

 res.render('../view/category');

 


});

module.exports = router;