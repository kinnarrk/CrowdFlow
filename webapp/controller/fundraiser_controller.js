const express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const model = require('../model/commonModel');
const fundraiser = model.Fundraiser;
const Cause = model.Cause;
const {ensureAuthenticated } = require('../config/auth');

// following lines added by Vivek on 15 april
const Comment = model.Comment;
var commentList = [];
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

router.get('/start/:id', (req, res) => {
    res.render('../view/start_fundraiser');
});

// following code edited by Vivek on 15th april

router.get('/:id', (req, res) => {
    fundraiser.findById({ "_id": req.params.id }, (err, event) => {
        console.log(event);
        image1 = "../view/images/fundraiser_1.jpg";// event.image.replace(/\\/g, "/");
        console.log(image1);
        if (err) {
            res.render({ 'messages': err });

        }
        else {

            Comment.find({ fundraiserId: req.params.id }, (err, comments) => {
                //console.log(comments);
                if (err) {
                    res.render({ 'messages': err });
                }
                else {
                   
                            commentList = comments;

                            console.log(commentList);
                            console.log(image1);
                            //console.log(userList);
                            res.render('../view/view_fundraiser', { event: event, image1 : image1,commentList: commentList});
                        }
                    })
               
              // console.log(userList);

           
                    //console.log(comments);
                    // commentList = comments;

                    // console.log(commentList);
                    // console.log(image1);
                    // console.log(userList);
                   // res.render('../view/view_fundraiser', { event: event, image1, commentList,userList,DonorList });
                }



            });



    });
//

// following code edited by Vivek on 15th april
router.post('/fundraiser_comment/:id/comment', (req, res) => {
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

        res.redirect('/fundraiser/' + req.params.id);

    })
        .catch(err => console.log(err));



});




module.exports = router;