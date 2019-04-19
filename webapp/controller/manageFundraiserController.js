const express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const model = require('../model/commonModel');
const passport = require('passport');
const {ensureAuthenticated } = require('../config/auth');
const User = model.User;
const Role = model.Role;
const Fundraiser = model.Fundraiser;
const Category = model.Category;
const Cause = model.Cause;
const Comment = model.Comment;
const Beneficiary = model.Beneficiary;
const objectID = require('mongodb').ObjectID;

// const objectID = require('mongodb').ObjectID;

router.use(function (req, res, next) {
    Cause.find({}, (err, arr) => {
        if(err) {
            console.log('Error in retrieving causes: ' + JSON.stringify(err, undefined, 2));
            res.redirect('/404');
        }
        causes = arr;
    });
    Category.find({isDeleted: false}, (err, arr) => {
        if(err) {
            console.log('Error in retrieving categories: ' + JSON.stringify(err, undefined, 2));
            res.redirect('/404');
        }
        categories = arr;
    });
    next();
  });

router.get('/:id', ensureAuthenticated, (req, res) =>{

    if(objectID.isValid(req.params.id)){
        Fundraiser.aggregate([

            //Typecast is needed for ObjectId when using within aggregate - known issue
            //For more info on this issue: https://github.com/Automattic/mongoose/issues/1399
            { $match: {_id: mongoose.Types.ObjectId(req.params.id)}},
            
            { '$lookup': { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category'} }, 
            { '$unwind': '$category' }, //We may need category info like name and description so pushing it to the resule
            { '$lookup': { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy'} },
            { '$unwind': '$createdBy' },
            { '$lookup': { from: 'beneficiaries', localField: '_id', foreignField: 'fundraiserId', as: 'beneficiaries'} },
            // { '$unwind': '$beneficiaries' },
            { "$unwind": {
                "path": "$beneficiaries",
                "preserveNullAndEmptyArrays": true  //This is needed when we want fundraisers which have empty or null donations to be included
            }},
            { '$lookup': { from: 'comments', localField: '_id', foreignField: 'fundraiserId', as: 'comments'} },
            // { '$unwind': '$comments' },
            { "$unwind": {
                "path": "$comments",
                "preserveNullAndEmptyArrays": true  //This is needed when we want fundraisers which have empty or null donations to be included
            }},
            { "$unwind": {
                "path": "$donations",
                "preserveNullAndEmptyArrays": true  //This is needed when we want fundraisers which have empty or null donations to be included
            }},
            { $group : {
                // "_id": "$_id", //rather use below
                "_id": {id:"$_id", categoryId:"$categoryId", createdDate: "$createdDate" }, //rather than only id we may need other fields for sort
                "doc":{"$first":"$$ROOT"},  //pushing the entire document so that we can use all the fields
                "donations": { "$push": "$donations" },     //pushing the donations array if donations info is needed              
                "totalDoantions": { "$sum": "$donations.amount" }   //the main reason why this grouping was used: sum of the donations for each fundraisers
            }},            
            { $sort:{"_id.createdDate": -1} }   //sorting the result in descending order with respect to createdDate. _id.createdDate because in group we have pushed created date in group result in id field
        ]).exec(function (err, docs){    
            if(err){
                console.log('Error in retrieving fundraisers: ' + JSON.stringify(err, undefined, 2));
                res.redirect('/404');
            }
            if(docs.length > 0){
                // var frs = JSON.stringify(docs);
                console.log("fundraisers for manage with fr id: " + JSON.stringify(docs));            
                res.render('../view/manage_fundraiser/dashboard', {fundraiser: docs});
            } else {
                res.redirect('/404');
            }
        });
    } else {
        res.redirect('/404');
    }
});

module.exports = router;