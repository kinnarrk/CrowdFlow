const express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const model = require('../model/commonModel');
const fundraiser = model.Fundraiser;
const Cause = model.Cause;
const {
    ensureAuthenticated
} = require('../config/auth');
var categories;
var causes;
const Category = model.Category;
const Donation = model.Donation;


router.use(function (req, res, next) {
    Cause.find({}, (err, arr) => {
        if (err) {
            console.log('Error in retrieving causes: ' + JSON.stringify(err, undefined, 2));
        }
        causes = arr;
    });
    Category.find({
        isDeleted: false
    }, (err, arr) => {
        if (err) {
            console.log('Error in retrieving categories: ' + JSON.stringify(err, undefined, 2));
        }
        categories = arr;
    });
    next();
});

// following lines added by Vivek on 15 april
const Comment = model.Comment;
var commentList = [];
// following lines added by Vivek on 16 april
const User = model.User;
//var userList = []; vivek
//var count = 1;  vivek

//

//
// var {User} = require('../model/user.js');
router.get('/cause', (req, res) => {
    Cause.find({}, (err, arr) => {
        if (err) {
            res.redirect('/cause');
            return;
        }
        res.render('../view/fundraiser_cause', {
            cause: arr
        });
    });
});

router.get('/start/:causeId', ensureAuthenticated, (req, res) => {
    Category.find({}, (err, result) => {
        if (err) {
            res.render({
                'message': 'ERROR'
            });
            return;
        }
        const categories = result;
        res.render('../view/start_fundraiser', {
            categories: categories,
            causeId: req.params.causeId,
            createdBy: req.user._id
        });
    })

});

router.post('/submit-for-approval', (req, res) => {
    let fundraiserImage = req.files.image;

    let fileParts = fundraiserImage.name.split('.');
    let fund = new fundraiser(req.body);
    fund.save().then((data) => {
        fundraiserImage.mv("./view/images/fundraisers/" + data._id + '.' + fileParts[1], function (err) {
            if (err) {
                return res.status(500).send(err);
            }
            data.image = data._id + '.' + fileParts[1];
            data.save();
            res.render('../view/fundraiser_success');
        });
    }).catch({

    });
});

// router.get('/:id', (req, res) => {
//     fundraiser.findById({
//         "_id": req.params.id
//     }, (err, event) => {
//         console.log(event);
//         if (err) {
//             res.render({
//                 'messages': err
//             });
//         } else {
//             res.render('../view/view_fundraiser', {
//                 event: event
//             });
//         }
//     })

// });

router.get('/comment/:id/delete', (req, res) => {
    Comment.remove({_id: req.params.id}, (err, arr) => {
        console.log("arr==="+JSON.stringify(arr));
        res.redirect('/users/profile/comment');
    });
});

router.post('/:id/comment', (req, res) => {
    fundraiser.findById({
        "_id": req.params.id
    }, (err, event) => {
        console.log(event);
        if (err) {
            res.render({
                'messages': err
            });
        } else {

            const newComment = new Comment({
                comment: req.body.comment
            });
            console.log(req.body.comment);


            newComment.save();

            res.render('../view/view_fundraiser', {
                event: event
            });
        }
    })

});

// following code edited by Vivek on 15th april
// keep view_fundraiser in front of id otherwise it will create problem for other routers - Kinnar (15 Apr)
router.get('/view_fundraiser/:id', (req, res) => {

    //var msg = req.query.donation;

    //console.log(req.query.donation);
    
    req.session.returnTo = req.originalUrl;
    console.log("curl="+req.session.returnTo);

    fundraiser.findById({"_id":req.params.id}).populate('createdBy').populate('donations[]',{sort:{createdDate: -1}}).populate('donations.userId').exec(function(err,event){
        if(err){res.redirect('/404');}

        //updating the visit count
        var visits = 0;
        if(event.visits != undefined && event.visits != null){
            visits = parseInt(event.visits) + 1;
        }
        var fr = {visits: visits};
        fundraiser.findByIdAndUpdate(req.params.id,{$set: fr}, (err,doc)=>{
            if(err){
                console.log('Error in updating fr: ' + JSON.stringify(err, undefined, 2));
            }
        });

        //image = "../view/images/"+event.image;// event.image.replace(/\\/g, "/");
            // console.log("-----------------------");
            // console.log(event);
            // console.log("-----------------------");
           // console.log(event.donations[0].userId.fullName);
            var currentamount = 0;
            var progress = 0;

            if(event.donations.length > 0){
                for(var i=0;i<event.donations.length;i++){
                    currentamount += event.donations[i].amount ;
                    
    
                }

            }

           
            progress = (currentamount/event.amount)*100;

            Comment.find({fundraiserId: req.params.id}, null, {sort:{createdDate: -1}}).populate('createdBy').limit(30).exec(function (err, comments_list) {
                             console.log(comments_list);
                             console.log("------------------------");
    //console.log(count);
   // count += 1;
                // if(msg != null){
                //     req.flash(
                //         'success_msg',
                //         'Profile updated successfully'
                //     ); 

                // }
                          
            
               
                res.render('../view/view_fundraiser', { event: event,comments_list:comments_list,currentamount,progress});
                                
                })
                
           
               
        
       

    })
    
  

    });




           


// following code edited by Vivek on 15th april
router.post('/fundraiser_comment/:id/comment',ensureAuthenticated, (req, res) => {

    console.log(req.params.id);
    const newComment = new Comment({
        comment: req.body.comment,
        fundraiserId: req.params.id,
        createdBy: req.user._id
    })
    console.log(newComment);

    newComment.save().then(user => {
            // req.flash(
            //     'success_msg',
            //     'You are now registered and can log in'
            // );
            errors = [];

            res.redirect('/fundraiser/view_fundraiser/' + req.params.id); // edited by vivek on 18th april
        })
        .catch(err => console.log(err));
});

router.get('/browse_fundraiser/:categoryId?', (req, res) => {
    console.log("param category:" + req.params.categoryId + ":");

    if (req.params.categoryId == undefined) {

        fundraiser.aggregate([{
                '$lookup': {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                '$unwind': '$category'
            },
            {
                "$unwind": {
                    "path": "$donations",
                    "preserveNullAndEmptyArrays": true //This is needed when we want fundraisers which have empty or null donations to be included
                }
            },
            {
                $group: {
                    // "_id": "$_id",
                    "_id": {
                        id: "$_id",
                        categoryId: "$categoryId",
                        createdDate: "$createdDate"
                    },
                    "doc": {
                        "$first": "$$ROOT"
                    },
                    "donations": {
                        "$push": "$donations"
                    },
                    "totalDoantions": {
                        "$sum": "$donations.amount"
                    }
                },
            },
            {
                $sort: {
                    "_id.createdDate": -1
                }
            }
        ]).exec(function (err, docs) {
            if (err) {
                console.log('Error in retrieving fundraisers: ' + JSON.stringify(err, undefined, 2));
            }
            // console.log("fundraisers: " + JSON.stringify(docs));                
            res.render('../view/browse_fundraiser', {
                fundraisers: docs,
                categories: categories,
                causes: causes
            });
        });
    } else {
        // below line is for reference: if just join, condition and sort is needed then use below. But using aggregate is a better approach.
        // fundraiser.find({categoryId: req.params.categoryId}, null, {sort:{createdDate: -1}}).populate('categoryId').exec(function (err, docs) {

        fundraiser.aggregate([

            //Typecast is needed for ObjectId when using within aggregate - known issue
            //For more info on this issue: https://github.com/Automattic/mongoose/issues/1399
            {
                $match: {
                    categoryId: mongoose.Types.ObjectId(req.params.categoryId)
                }
            },

            {
                '$lookup': {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                '$unwind': '$category'
            }, //We may need category info like name and description so pushing it to the resule
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
                console.log('Error in retrieving fundraisers: ' + JSON.stringify(err, undefined, 2));
            }
            // var frs = JSON.stringify(docs);
            // console.log("fundraisers with category id: " + JSON.stringify(docs));            
            res.render('../view/browse_fundraiser', {
                fundraisers: docs,
                categories: categories,
                causes: causes
            });
        });
    }
});


//just a test funciton to add donations.
router.get('/add_donation/:fundraiserId', (req, res) => {
    // console.log("fundraiserId:"+ req.params.fundraiserId +":");
    fundraiser.findOne({
        _id: req.params.fundraiserId
    }, function (err, fr) {
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
            if (!err) {
                console.log('Donation added');
                res.send("Success");
            } else {
                console.log('Error in adding Donation: ' + JSON.stringify(err, undefined, 2));
                res.send("Fail");
            }
        });
    });
});




module.exports = router;
