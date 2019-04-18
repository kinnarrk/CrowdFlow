const express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const model = require('../model/commonModel');
const fundraiser = model.Fundraiser;
const Cause = model.Cause;
const {ensureAuthenticated } = require('../config/auth');
var categories;
var causes;
const Category = model.Category;
const Donation = model.Donation;


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

// following lines added by Vivek on 15 april
const Comment = model.Comment;
var commentList = [];
// following lines added by Vivek on 16 april
const User = model.User;
var userList = [];
var count = 1;

//

//
// var {User} = require('../model/user.js');
router.get('/cause', (req, res) => {
    Cause.find({}, (err, arr) => {
        if(err) {
            res.redirect('/cause');
            return;
        }
        res.render('../view/fundraiser_cause', {cause : arr});
    });
});

router.get('/start/:causeId', ensureAuthenticated, (req, res) => {
    Category.find({}, (err, result) => {
        if(err) {
            res.render({'message' : 'ERROR'});
            return;
        }
        const categories = result;
        res.render('../view/start_fundraiser', {categories: categories, causeId : req.params.causeId, createdBy: req.user._id});
    })
    
});

router.post('/submit-for-approval', (req, res) => {
    let fundraiserImage = req.files.image;

    let fileParts = fundraiserImage.name.split('.');
    let fund = new fundraiser(req.body);
    fund.save().then((data) => {
        fundraiserImage.mv("./view/images/fundraisers/" + data._id + '.' + fileParts[1], function(err) {
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

router.get('/:id',(req, res) =>{
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

// following code edited by Vivek on 15th april
// keep view_fundraiser in front of id otherwise it will create problem for other routers - Kinnar (15 Apr)
router.get('/view_fundraiser/:id', (req, res) => {
    // fundraiser.findById({ "_id": req.params.id }, (err, event) => {
    //     console.log(event);
    //     image1 = "../view/images/fundraiser_1.jpg";// event.image.replace(/\\/g, "/");
    //     console.log(image1);
    //     if (err) {
    //         res.render({ 'messages': err });

    

    fundraiser.findById({"_id":req.params.id}).populate('createdBy').populate('donations[]').populate('donations.userId').exec(function(err,event){
        if(err){res.send(err)}
        //image = "../view/images/"+event.image;// event.image.replace(/\\/g, "/");
            console.log("-----------------------");
            console.log(event);
            console.log("-----------------------");
           // console.log(event.donations[0].userId.fullName);
            var currentamount = 0;
            var progress = 0;

            if(event.donations.length > 0){
                for(var i=0;i<event.donations.length;i++){
                    currentamount += event.donations[i].amount ;
                    
    
                }

            }

           
            progress = (currentamount/event.amount)*100;

            Comment.find({fundraiserId: req.params.id}, null, {sort:{createdDate: -1}}).populate('createdBy').limit(count).exec(function (err, comments_list) {
                             console.log(comments_list);
                             console.log("------------------------");
    console.log(count);
    count += 1;
    
                            
            
                //             // fundraiser.find({fundraiserId: req.params.id}).populate('donations.userId')
                //             // User.find({},(err,users)=>{
                               
                //             //         userList = users;
                //             //         console.log(userList);
                res.render('../view/view_fundraiser', { event: event,comments_list:comments_list,currentamount,progress});
                                
                })
                
           
               
        
       

    })
    
   // res.render('../view/view_fundraiser', { events: events, image1 : image1});

    // fundraiser.findById({ "_id": req.params.id }, (err, event) => {
    //     console.log(event);
    //     image1 = "../view/images/fundraiser_1.jpg";// event.image.replace(/\\/g, "/");
    //     console.log(image1);
    //     if (err) {
    //         res.render({ 'messages': err });

    //     }
    //     else {

            
    //         //console.log("fr id:" + req.params.id);
    //         Comment.find({fundraiserId: req.params.id}, null, {sort:{createdDate: -1}}).populate('createdBy').exec(function (err, docs) {
    //             console.log(docs);

    //             // fundraiser.find({fundraiserId: req.params.id}).populate('donations.userId')
    //             // User.find({},(err,users)=>{
                   
    //             //         userList = users;
    //             //         console.log(userList);
                    
    //             // })
    
    //             res.render('../view/view_fundraiser', { event: event, image1 : image1,docs:docs,userList});
    //         });
    //         // Comment.aggregate([
    //         //     {'$match':{'fundraiserId':req.params.id}},
    //         //     { '$lookup': { from: 'users', localField: 'createdBy', foreignField: '_id', as: 'user_comments'} }, 
    //         //     { '$unwind': '$user_comments' }
    //         // ]).exec(function(err,docs){
    //         //     if(err){
    //         //         console.log("Error:" + err);
    //         //     }
    //         //     //.log("heelo");
    //         //     console.log(docs);
    //         // })
                


    //     }
    // });
    
   
});
//

// router.get('/fundraiser_comment/:id/comment',(req,res)=>{
    
//     Comment.find({fundraiserId: req.params.id}, null, {sort:{createdDate: -1}}).populate('createdBy').limit(count).exec(function (err, docs) {
//         console.log(docs);

// //             // fundraiser.find({fundraiserId: req.params.id}).populate('donations.userId')
// //             // User.find({},(err,users)=>{
          
// //             //         userList = users;
// //             //         console.log(userList);
// res.render('../view/view_fundraiser', { event: event,docs:docs,image:image,currentamount,progress});
// count +=2;
           
// })

// })

// following code edited by Vivek on 15th april
router.post('/fundraiser_comment/:id/comment', (req, res) => {

    console.log(req.params.id);
    const newComment = new Comment({
        comment: req.body.comment,
        fundraiserId: req.params.id,
        createdBy: "5ca2fbd72d28de361ef43b76"
    })
    console.log(newComment);

    newComment.save().then(user => {
        // req.flash(
        //     'success_msg',
        //     'You are now registered and can log in'
        // );
        errors = [];

        res.redirect('/fundraiser/fundraiserPage/' + req.params.id);
    })
        .catch(err => console.log(err));
});

module.exports = router;
