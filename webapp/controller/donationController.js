const express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const model = require('../model/commonModel');
const Fundraiser = model.Fundraiser;
const Cause = model.Cause;
const User = model.User;
var categories;
var causes;
const Category = model.Category;
const Donation = model.Donation;
const objectID = require('mongodb').ObjectID;
var paypal = require('paypal-rest-sdk');
var path = require('path');
const {ensureAuthenticated } = require('../config/auth');
var logger = require('../config/log');
// var logger = require('../config/log');

// var bodyParser = require('body-parser');
// var app = express();
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())
// app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AepP1Io24LVvIJpkLkavTxpxL0Jgr-J5ROoimRkn1Dhqmk26R6yPvO3u4JVdGBqjtL7H0yBDpYIT4Lnl',
    'client_secret': 'EMgCSTlrUG5fF-GrGATKGy-9i15tgMYoCoiDwaMl39o93XuoIhUpAazvZ9UiPmO_ngw7nnBUKX6PVY59'
  });

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

// start payment process 
router.post('/donatePaypal/:fundraiserId', ensureAuthenticated, ( req , res ) => {
    // console.log("Inside donate through paypal");
    // console.log("Body:::: " + JSON.stringify(req.body));
    var invoiceId = 'INV000000001';
    var tax = 0.08;

    if(req.body.amount != undefined || req.query.amount != undefined){
        if(req.body.fullName != undefined && req.body.phone != undefined && req.body.city != undefined){
            var user = {
                fullName: req.body.fullName,
                phone: req.body.phone,
                city: req.body.city
            }
            User.findByIdAndUpdate(req.user._id,{$set: user}, (err,doc)=>{
                if(err){
                    logger.error('Error in updating user: ' + JSON.stringify(err, undefined, 2));
                    // res.redirect('/404');
                    // return;
                }
            });
        }
        var amount = (req.body.amount != undefined)?(parseFloat(req.body.amount)).toFixed(2):(parseFloat(req.query.amount)).toFixed(2);
        if(req.params.fundraiserId != undefined){
            Fundraiser.aggregate([
                { "$unwind": '$donations' },
                { $group : {
                    // "_id": "$_id",
                    "_id": null,              
                    "maxInvoiceId": { "$max": "$donations.invoiceId" }
                    },
                }
            ]).exec(function (err, docs){
                // console.log("donations:" + JSON.stringify(docs));
                if(err){
                    logger.error('Error in retrieving fundraisers: ' + JSON.stringify(err, undefined, 2));
                    res.redirect('/404');
                }
                if(docs.length > 0){
                    var maxId = docs[0].maxInvoiceId;
                    maxId = maxId.substr(3);
                    var max = Number(maxId);
                    max++;
                    invoiceId = 'INV' + String("000000000" + max).slice(-9);
                }
                console.log("finalId:" + invoiceId);
                Fundraiser.findOne({_id: req.params.fundraiserId}).exec(function (err2, docs2) {
                    if(err2){
                        logger.error('Error in retrieving fundraisers: ' + JSON.stringify(err2, undefined, 2));
                        res.redirect('/404');
                    }
                    // console.log("docs2: " + JSON.stringify(docs2));
                    // create payment object (JSON)
                    var payment = {
                        "intent": "authorize",
                        "payer": {
                            "payment_method": "paypal"
                        },
                        "redirect_urls": {
                            "return_url": "http://localhost:3000/donate/success",
                            "cancel_url": "http://localhost:3000/donate/err"
                        },
                        "transactions": [{
                            "invoice_number": invoiceId,
                            
                            "item_list": {
                                "items": [{
                                    "name": docs2.title,
                                    "description": docs2._id,
                                    "sku": "1",
                                    "price": (parseFloat(amount)).toFixed(2),                               
                                    "currency": "USD",
                                    "quantity": "1",
                                    "tax": 0
                                }]
                            },                        
                            "amount": {
                                "total": (parseFloat(amount)).toFixed(2), //req.body.amount,
                                "currency": "USD",
                                "details": {
                                    "subtotal": (parseFloat(amount)).toFixed(2),
                                    "tax": 0
                                }
                            },
                            "description": "Donation for fundraiserId: " + docs2._id                                              
                        }]
                    };
        
                    // console.log("payment json: " + JSON.stringify(payment));
                    // call the create Pay method 
                    createPay( payment )
                        .then( ( transaction ) => {
                            var id = transaction.id; 
                            var links = transaction.links;
                            var counter = links.length; 
                            while( counter -- ) {
                                if ( links[counter].method == 'REDIRECT') {
                                    // redirect to paypal where user approves the transaction 
                                    return res.redirect( links[counter].href )
                                }
                            }
                        })
                        .catch( ( err ) => { 
                            logger.error('Error in payment' + JSON.stringify(err) ); 
                            res.redirect('/donate/err');
                        });
                });
            });

            
        } else {
            logger.warn("Fundraiser id is not defined");
            res.redirect('/404');
        }
    
    } else {
        logger.warn("Amount is not passed in parameter");
        res.redirect('/404');
    }
});

// success page 
router.get('/success' , (req ,res ) => {
    // console.log("Query:::: " + JSON.stringify(req.query));
    // console.log("Query:::: " + req.query);
    // console.log("Body:::: " + JSON.stringify(req.body));


    paypal.payment.get(req.query.paymentId, function (error, payment) {
        if (error) {
            logger.error('Error in getting payment details: '+error);
            res.redirect('/404');
        } else {
            // console.log("Get Payment Response");
            // console.log(JSON.stringify(payment));

            Fundraiser.findOne({ _id: payment.transactions[0].item_list.items[0].description }, function(err, fr) {
                // console.log('fundraiser: ' + fr);
                var donation = new Donation({
                    userId: req.user._id,
                    amount: payment.transactions[0].amount.total,
                    createdDate: Date.now,
                    transactionId: payment.id,
                    paymentMode: "Paypal",
                    bank: "-",
                    invoiceId: payment.transactions[0].invoice_number,
                    taxName: "Sales Tax",
                    taxRate: payment.transactions[0].item_list.items[0].tax,
                    taxAmount: payment.transactions[0].amount.details.tax
                });
                fr.donations.push(donation);
                fr.save((err, doc) => {
                    if(!err) {
                        logger.info('Donation added');
                        // res.send("Success");    
                        
                            req.flash(
                                'success_msg',
                                'Payment Successfully. Thanks for your contribution'
                            ); 
        
                        
                        res.redirect('/fundraiser/view_fundraiser/'+payment.transactions[0].item_list.items[0].description+'?donation=success');                    
                    }
                    else {           
                        logger.error('Error in adding Donation: ' + JSON.stringify(err, undefined, 2));
                        res.redirect('/404');
                    }
                });
            });
        }
    
    });
    // console.log(JSON.stringify(req));
});

// error page 
router.get('/err' , (req , res) => {
    logger.error('Errors in payment: '+ req.query); 
    res.redirect('../view/paypal/err.html');
});

// helper functions 
var createPay = ( payment ) => {
    return new Promise( ( resolve , reject ) => {
        paypal.payment.create( payment , function( err , payment ) {
         if ( err ) {
             reject(err); 
         }
        else {
            resolve(payment); 
        }
        }); 
    });
};

//just a test funciton to add donations.
router.get('/add_donation/:fundraiserId', (req, res) => {
    // console.log("fundraiserId:"+ req.params.fundraiserId +":");
    Fundraiser.findOne({ _id: req.params.fundraiserId }, function(err, fr) {
        // console.log('fundraiser: ' + fr);
        var donation = new Donation({
            userId: "5cb811380d16fa1ca01e345d",
            amount: 1200,
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
                logger.info('Donation added');
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
