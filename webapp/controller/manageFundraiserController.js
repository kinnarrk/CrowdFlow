const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');
const passport = require('passport');
const {ensureAuthenticated } = require('../config/auth');
const User = model.User;
const Role = model.Role;
const Fundraiser = model.Fundraiser;
const Category = model.Category;
const Cause = model.Cause;

router.use(function (req, res, next) {
    Cause.find({}, (err, arr) => {
        if(err) {
            console.log('Error in retrieving causes: ' + JSON.stringify(err, undefined, 2));
        }
        causes = arr;
    });
    Category.find({isDeleted: false}, (err, arr) => {
        if(err) {
            console.log('Error in retrieving categories: ' + JSON.stringify(err, undefined, 2));
        }
        categories = arr;
    });
    next();
  });

router.get('/:id', ensureAuthenticated, (req, res) =>{
    console.log("Going to manage fundraiser dashboard");
    res.render('../view/manage_fundraiser/dashboard');
});

module.exports = router;