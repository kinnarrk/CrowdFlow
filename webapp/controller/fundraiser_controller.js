const express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const model = require('../model/commonModel');
const fundraiser = model.Fundraiser;
const category = model.Category;
const Donation = model.Donation;

// var {User} = require('../model/user.js');
router.get('/cause', (req, res) => {
    res.render('../view/chooseCauseFundraiser');
});

router.get('/view_fundraiser/:id',(req, res) =>{
    fundraiser.findById({"_id":req.params.id},(err,event)=>{
        console.log(event);
        if(err){
            res.render({'messages':err});
        }
        else{
            res.render('../view/view_fundraiser',{event:event});
        }
    })
    
});
router.post('/:id/comment',(req, res) =>{
    fundraiser.findById({"_id":req.params.id},(err,event)=>{
        console.log(event);
        if(err){
            res.render({'messages':err});
        }
        else{

            const newComment = new Comment({
                comment:req.body.comment
            });
            console.log(req.body.comment);


            newComment.save();
            
            res.render('../view/view_fundraiser',{event:event});
        }
    })
    
});

router.get('/browse_fundraiser/:categoryId?', (req, res) => {
    console.log("param category:" + req.params.categoryId + ":");
    if(req.params.categoryId == undefined){
        
        
        // donation.aggregate([{
        //         $match: {},
        //     },
        //     {sort:{createdDate: -1}},
        //     { $group : {
        //         _id : null,
        //         total : {
        //             $sum : "$amount"
        //         }
        //     }}
        // ]).populate('fundraiserId').populate('categoryId').exec(function (err, docs){
        // });

        // var pipeline = [
        //     { "$unwind": "$donations" },
        //     {
        //         "$group": {
        //             // "_id": "$_id",
        //             // "products": { "$push": "$products" },
        //             // "userPurchased": { "$first": "$userPurchased" },
        //             "totalDoantions": { "$sum": "$donations.amount" }
        //         }
        //     }
        // ]

        fundraiser.aggregate([
            { '$lookup': { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category'} }, 
            { '$unwind': '$category' },
            { "$unwind": "$donations" },
            // {$match: {},},
            
            // { $project: { donations: { $objectToArray: "$donations" } } }
            
            { $sort:{createdDate: -1} },
            { $group : {
                "_id": "$_id",
                // "title": "$title",
                "doc":{"$first":"$$ROOT"},
                "donations": { "$push": "$donations" },                
                "totalDoantions": { "$sum": "$donations.amount" }
            }}
            // { "$project": {
            //     "_id": "$categoryId",
            //     "total": 1,
            //     "lineItems": 1
            //   }}
        ]).exec(function (err, docs){
            // console.log("fundraisers w/o populate: " + JSON.stringify(docs));
            // fundraiser.populate(docs, {path: "categoryId"}, function (err, result){
                if(err){
                    console.log('Error in retrieving fundraisers: ' + JSON.stringify(err, undefined, 2));
                }
                console.log("fundraisers: " + JSON.stringify(docs));                
                res.render('../view/browse_fundraiser', {fundraisers: docs});
            // });
            
        });
        // fundraiser.find({}, null, {sort:{createdDate: -1}}).populate('categoryId').exec(function (err, docs){
        //     if(err){
        //         console.log('Error in retrieving fundraisers: ' + JSON.stringify(err, undefined, 2));
        //     }
        //     console.log("fundraisers: " + docs);
        //     res.render('../view/browse_fundraiser', {fundraisers: docs});
        // });
    } else {
        fundraiser.find({categoryId: req.params.categoryId}, null, {sort:{createdDate: -1}}).populate('categoryId').exec(function (err, docs) {
            if(err){
                console.log('Error in retrieving fundraisers: ' + JSON.stringify(err, undefined, 2));
            }
            console.log("fundraisers with id: " + docs);
            res.render('../view/browse_fundraiser', {fundraisers: docs});
        });
    }
});

router.get('/add_donation/:fundraiserId', (req, res) => {
    // console.log("fundraiserId:"+ req.params.fundraiserId +":");
    fundraiser.findOne({ _id: req.params.fundraiserId }, function(err, fr) {
        // console.log('fundraiser: ' + fr);
        var donation = new Donation({
            userId: "5cb4c825f1cd812f9c316c4a",
            amount: 4000,
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
                console.log('Donation added');
                res.send("Success");
            }
            else {           
                console.log('Error in adding Donation: ' + JSON.stringify(err, undefined, 2));
                res.send("Fail");
            }
        });
    });
});
module.exports = router;