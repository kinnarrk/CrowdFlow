const express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const model = require('../model/commonModel');
const fundraiser = model.Fundraiser;
const Cause = model.Cause;
var categories;
var causes;
const Category = model.Category;
const Donation = model.Donation;
const objectID = require('mongodb').ObjectID;
var logger = require('../config/log');

router.use(function (req, res, next) {
    Cause.find({}, (err, arr) => {
        if(err) {
            logger.error('Error in retrieving causes: ' + JSON.stringify(err, undefined, 2));
            res.redirect('/404');
        }
        causes = arr;
    });
    Category.find({isDeleted: false}, (err, arr) => {
        if(err) {
            logger.error('Error in retrieving categories: ' + JSON.stringify(err, undefined, 2));
            res.redirect('/404');
        }
        categories = arr;
    });
    next();
  });

router.get('/:categoryId?', (req, res) => {
    // console.log("param category:" + req.params.categoryId + ":");
    // logger.log('info', 'test message %s', 'my string');
    // logger.info('Test logger message');
    // logger.error('Test error message');
    if(req.params.categoryId == undefined){

        fundraiser.aggregate([
            { '$lookup': { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category'} }, 
            { '$unwind': '$category' },
            { '$lookup': { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy'} },
            { '$unwind': '$createdBy' },
            { "$unwind": {
                "path": "$donations",
                "preserveNullAndEmptyArrays": true  //This is needed when we want fundraisers which have empty or null donations to be included
            }},
            { $group : {
                // "_id": "$_id",
                "_id": {id:"$_id", categoryId:"$categoryId", createdDate: "$createdDate" },
                "doc":{"$first":"$$ROOT"},
                "donations": { "$push": "$donations" },               
                "totalDoantions": { "$sum": "$donations.amount" }
                },
            },
            { $sort:{"_id.createdDate": -1} }
        ]).exec(function (err, docs){
            if(err){
                // console.log('Error in retrieving fundraisers: ' + JSON.stringify(err, undefined, 2));
                logger.error('Error in retrieving fundraisers: ' + JSON.stringify(err, undefined, 2));
                res.redirect('/404');
            }
            // console.log("fundraisers: " + JSON.stringify(docs));                
            res.render('../view/browse_fundraiser', {fundraisers: docs, categories: categories, causes: causes});
        });
    } else {

        if(objectID.isValid(req.params.categoryId)){
            // below line is for reference: if just join, condition and sort is needed then use below. But using aggregate is a better approach.
            // fundraiser.find({categoryId: req.params.categoryId}, null, {sort:{createdDate: -1}}).populate('categoryId').exec(function (err, docs) {
            
            fundraiser.aggregate([

                //Typecast is needed for ObjectId when using within aggregate - known issue
                //For more info on this issue: https://github.com/Automattic/mongoose/issues/1399
                { $match: {categoryId: mongoose.Types.ObjectId(req.params.categoryId)}},
                
                { '$lookup': { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category'} }, 
                { '$unwind': '$category' }, //We may need category info like name and description so pushing it to the resule
                { '$lookup': { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy'} },
                { '$unwind': '$createdBy' },
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
                    logger.error('Error in retrieving fundraisers: ' + JSON.stringify(err, undefined, 2));
                    res.redirect('/404');
                }
                // var frs = JSON.stringify(docs);
                // console.log("fundraisers with category id: " + JSON.stringify(docs));            
                res.render('../view/browse_fundraiser', {fundraisers: docs, categories: categories, causes: causes});
            });
        } else {
            res.redirect('/404');
        }
    }
});

//just a test funciton to add donations.
router.get('/add_donation/:fundraiserId', (req, res) => {
    // console.log("fundraiserId:"+ req.params.fundraiserId +":");
    fundraiser.findOne({ _id: req.params.fundraiserId }, function(err, fr) {
        // console.log('fundraiser: ' + fr);
        var donation = new Donation({
            userId: "5cb4c825f1cd812f9c316c4a",
            amount: 5000,
            createdDate: Date.now,
            transactionId: "12345667879",
            paymentMode: "Card",
            bank: "BofA",
            invoiceId: "INV0000001",
            taxName: "Sales Tax",
            taxRate: "8",
            taxAmount: "90"
        });
        fr.donations.push(donation);
        fr.save((err, doc) => {
            if(!err) {
                // console.log('Donation added');
                res.send("Success");
            }
            else {           
                logger.error('Error in adding Donation: ' + JSON.stringify(err, undefined, 2));
                res.send("Fail");
            }
        });
    });
});

module.exports = router;
