const express = require('express');
var router = express.Router();

// var {User} = require('../model/user.js');
var model = require('../model/commonModel');
const category = model.Category;

router.get('/' ,(req, res) =>{
    console.log("logotu="+req.session.returnTo);
    category.find({
    }).then(sample => {
        console.log("categories in index:" + sample);
        res.render('../view/index', {categories: sample});
    });
    
});

module.exports = router;