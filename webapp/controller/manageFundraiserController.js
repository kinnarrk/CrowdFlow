const express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const model = require('../model/commonModel');
const passport = require('passport');
const {
    ensureAuthenticated
} = require('../config/auth');
const User = model.User;
const Role = model.Role;
const Fundraiser = model.Fundraiser;
const Category = model.Category;
const Cause = model.Cause;
const Comment = model.Comment;
const Beneficiary = model.Beneficiary;
const objectID = require('mongodb').ObjectID;
const moment = require('moment');
var logger = require('../config/log');

const today = moment().startOf('day')

// const objectID = require('mongodb').ObjectID;

router.use(function (req, res, next) {
    Cause.find({}, (err, arr) => {
        if (err) {
            logger.error('Error in retrieving causes: ' + JSON.stringify(err, undefined, 2));
            res.redirect('/404');
        }
        causes = arr;
    });
    Category.find({
        isDeleted: false
    }, (err, arr) => {
        if (err) {
            logger.error('Error in retrieving categories: ' + JSON.stringify(err, undefined, 2));
            res.redirect('/404');
        }
        categories = arr;
    });
    next();
});

router.get('/:id', ensureAuthenticated, (req, res) => {

    if (objectID.isValid(req.params.id)) {
        Fundraiser.aggregate([

            //Typecast is needed for ObjectId when using within aggregate - known issue
            //For more info on this issue: https://github.com/Automattic/mongoose/issues/1399
            { $match: {_id: mongoose.Types.ObjectId(req.params.id), createdBy: mongoose.Types.ObjectId(req.user._id) } },
            
            { '$lookup': { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category'} }, 
            { '$unwind': '$category' }, //We may need category info like name and description so pushing it to the resule
            { '$lookup': { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'createdBy'} },
            { '$unwind': '$createdBy' },
            { '$lookup': { from: 'beneficiaries', localField: '_id', foreignField: 'fundraiserId', as: 'beneficiaries'} },
            // { '$unwind': '$beneficiaries' },
            {
                "$unwind": {
                    "path": "$beneficiaries",
                    "preserveNullAndEmptyArrays": true //This is needed when we want fundraisers which have empty or null donations to be included
                }
            },
            {
                '$lookup': {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'fundraiserId',
                    as: 'comments'
                }
            },
            // { '$unwind': '$comments' },
            {
                "$unwind": {
                    "path": "$comments",
                    "preserveNullAndEmptyArrays": true //This is needed when we want fundraisers which have empty or null donations to be included
                }
            },
            {
                "$unwind": {
                    "path": "$donations",
                    "preserveNullAndEmptyArrays": true //This is needed when we want fundraisers which have empty or null donations to be included
                }
            },
            {
                $group: {
                    // "_id": "$_id", //rather use below
                    "_id": {
                        id: "$_id",
                        categoryId: "$categoryId",
                        createdDate: "$createdDate"
                    }, //rather than only id we may need other fields for sort
                    "doc": {
                        "$first": "$$ROOT"
                    }, //pushing the entire document so that we can use all the fields
                    "donations": {
                        "$push": "$donations"
                    }, //pushing the donations array if donations info is needed              
                    "totalDoantions": {
                        "$sum": "$donations.amount"
                    } //the main reason why this grouping was used: sum of the donations for each fundraisers
                }
            },
            {
                $sort: {
                    "_id.createdDate": -1
                }
            } //sorting the result in descending order with respect to createdDate. _id.createdDate because in group we have pushed created date in group result in id field
        ]).exec(function (err, docs) {
            if (err) {
                logger.error('Error in retrieving fundraisers: ' + JSON.stringify(err, undefined, 2));
                res.redirect('/404');
            }
            if (docs.length > 0) {
                // var frs = JSON.stringify(docs);
                // console.log("fundraisers for manage with fr id: " + JSON.stringify(docs));            
                
                Fundraiser.aggregate([                    
                    { $match: {createdBy: mongoose.Types.ObjectId(req.user._id) }},
                    { $group : {
                        // "_id": "$_id", //rather use below
                        "_id": null, //rather than only id we may need other fields for sort
                        // "doc":{"$first":"$$ROOT"},  //pushing the entire document so that we can use all the fields                        
                        "totalVisits": { "$sum": "$visits" }   //the main reason why this grouping was used: sum of the donations for each fundraisers
                    }}
                ]).exec(function (err2, docs2){    
                    if(err2){
                        logger.error('Error in retrieving fundraisers: ' + JSON.stringify(err2, undefined, 2));
                        res.redirect('/404');
                    }
                    console.log("Log 2: "+ JSON.stringify(docs2));

                    Fundraiser.aggregate([
                        { "$unwind": {
                            "path": "$donations",
                            "preserveNullAndEmptyArrays": true  //This is needed when we want fundraisers which have empty or null donations to be included
                        }},
                        // { "$unwind": '$donations' },
                        { $match: {"donations.createdDate": {
                            $gte: today.toDate(),
                            $lte: moment(today).endOf('day').toDate()
                        }, createdBy: mongoose.Types.ObjectId(req.user._id) }},
                        { $group : {
                            // "_id": "$_id",
                            "_id": null,              
                            "todaysDonations": { "$sum": "$donations.amount" }
                            },
                        }            
                        
                    ]).exec(function (err3, docs3){
                        // console.log("donations:" + JSON.stringify(docs3));
                        if(err3){
                            logger.error('Error in retrieving fundraisers: ' + JSON.stringify(err3, undefined, 2));
                            res.redirect('/404');
                        } else {
                            if(docs3 != undefined && docs3 != null && docs3.length>0){
                                logger.info("Log 3: "+ JSON.stringify(docs3));
                            } else {
                                logger.info("Log 3: 0");
                            }
                            Fundraiser.aggregate([
                                { "$unwind": {
                                    "path": "$donations",
                                    "preserveNullAndEmptyArrays": true  //This is needed when we want fundraisers which have empty or null donations to be included
                                }},
                                // { "$unwind": '$donations' },
                                { $match: { createdBy: mongoose.Types.ObjectId(req.user._id) }},
                                { $group : {
                                    // "_id": "$_id",
                                    "_id": null,              
                                    "totalDoantions": { "$sum": "$donations.amount" }
                                    },
                                }            
                                
                            ]).exec(function (err4, docs4){
                                // console.log("donations:" + JSON.stringify(docs4));
                                if(err4){
                                    logger.error('Error in retrieving fundraisers: ' + JSON.stringify(err4, undefined, 2));
                                    res.redirect('/404');
                                } else {
                                    logger.info("Log 4: "+ JSON.stringify(docs4));
                                    Fundraiser.aggregate([
                                        // { "$unwind": {
                                        //     "path": "$donations",
                                        //     "preserveNullAndEmptyArrays": true  //This is needed when we want fundraisers which have empty or null donations to be included
                                        // }},
                                        // { "$unwind": '$donations' },
                                        { $match: { createdBy: mongoose.Types.ObjectId(req.user._id) }},
                                        { $group : {
                                            // "_id": "$_id",
                                            "_id": null,              
                                            // "totalDoantions": { "$sum": "$donations.amount" },
                                            "totalAmount": { "$sum": "$amount" }
                                            },
                                        }            
                                        
                                    ]).exec(function (err5, docs5){
                                        // console.log("donations:" + JSON.stringify(docs4));
                                        if(err5){
                                            logger.error('Error in retrieving fundraisers: ' + JSON.stringify(err5, undefined, 2));
                                            res.redirect('/404');
                                        } else {
                                            logger.info("Log 5: "+ JSON.stringify(docs5));

                                            Fundraiser.aggregate([
                                                { "$unwind": {
                                                    "path": "$donations",
                                                    "preserveNullAndEmptyArrays": true  //This is needed when we want fundraisers which have empty or null donations to be included
                                                }},
                                                // { "$unwind": '$donations' },
                                                { $match: { createdBy: mongoose.Types.ObjectId(req.user._id) }},
                                                {$project : { 
                                                    month : {$month : "$donations.createdDate"}, 
                                                    year : {$year :  "$donations.createdDate"},
                                                    "donations.amount" : 1
                                                }}, 
                                                { $group : {
                                                    // "_id": "$_id",
                                                    _id : {month : "$month" ,year : "$year" },             
                                                    // "totalDoantions": { "$sum": "$donations.amount" },
                                                    "monthlyAmount": { "$sum": "$donations.amount" }
                                                    },
                                                }            
                                                
                                            ]).exec(function (err6, docs6){
                                                // console.log("donations:" + JSON.stringify(docs4));
                                                if(err6){
                                                    logger.error('Error in retrieving fundraisers: ' + JSON.stringify(err6, undefined, 2));
                                                    res.redirect('/404');
                                                } else {
                                                    logger.info("Log 6: "+ JSON.stringify(docs6));
                                                    
                                                    Fundraiser.aggregate([
                                                        { $match: { createdBy: mongoose.Types.ObjectId(req.user._id) }},
                                                        { "$unwind": {
                                                            "path": "$donations",
                                                            "preserveNullAndEmptyArrays": true  //This is needed when we want fundraisers which have empty or null donations to be included
                                                        }},
                                                        {$project : { 
                                                            title : "$title",
                                                            amount : "$amount", 
                                                            donation : "$donations.amount",
                                                            "donations.amount" : 1
                                                        }},                                                        
                                                        { $group : {
                                                            // "_id": "$_id",
                                                            _id : {_id: "$_id", amount : "$amount", donation : "$donation" },
                                                            "doc":{"$first":"$$ROOT"},
                                                            "totalDoantions": { "$sum": "$donations.amount" },
                                                            "totalAmount": { "$sum": "$amount" }
                                                            },
                                                        }                                                        
                                                    ]).exec(function (err7, docs7){
                                                        // console.log("donations:" + JSON.stringify(docs4));
                                                        if(err7){
                                                            logger.error('Error in retrieving fundraisers: ' + JSON.stringify(err7, undefined, 2));
                                                            res.redirect('/404');
                                                        } else {
                                                            logger.info("Log 7: "+ JSON.stringify(docs7));
                                                            // console.log("Log 4: "+ JSON.stringify(docs4));
                                                            res.render('../view/manage_fundraiser/dashboard', {
                                                                fundraiser: docs, 
                                                                totalVisits: docs2,//[0].totalVisits, 
                                                                todaysDonations: docs3,//[0].todaysDonations,
                                                                totalDonations: docs4,//[0].totalDonations,
                                                                target: docs5,//[0].totalAmount,
                                                                monthlyAmount: docs6,//[0],
                                                                donations: docs7
                                                            });
                                                        }
                                                    });
                                                }
                                            });                                            
                                        }
                                    });
                                    
                                }
                            });
                            
                        }
                    });
                    
                });
                
            } else {
                res.redirect('/404');
            }
        });
    } else {
        res.redirect('/404');
    }
});

router.get('/comment/:id', ensureAuthenticated, (req, res) => {
    if (objectID.isValid(req.params.id)) {
        Comment.find({fundraiserId : req.params.id}).populate('createdBy').populate('fundraiserId').exec((err, arr) => {
            res.render('../view/manage_fundraiser/commentFundraiser', {
                fundraiser : arr
            });
        });
    } else {
        res.redirect('/404');
    }
});

router.get('/donation/:id', ensureAuthenticated, (req, res) => {
    if (objectID.isValid(req.params.id)) {
        
        Fundraiser.findById(req.params.id).populate('donations.userId').exec((error, array)=> {
            logger.info("ARRRaa="+JSON.stringify(array));
            res.render('../view/manage_fundraiser/donationFundraiser', {
                fundraiser : array
            });
        });
    } else {
        res.redirect('/404');
    }
});

module.exports = router;