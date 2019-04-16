const express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const model = require('../model/commonModel');
const fundraiser = model.Fundraiser;
const Cause = model.Cause;
const Category = model.Category;
const { ensureAuthenticated } = require('../config/auth');

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

    console.log("catid="+req.body.categoryId);
    let fund = new fundraiser(req.body);
    console.log("fund="+fund);
    fund.save().then((data) => {
        console.log("data="+data);
        fundraiserImage.mv("./view/images/fundraisers/"+data._id+".png", function(err) {
            if (err)
              return res.status(500).send(err);
            res.send({'message': req.body, 'mes': 'File uploaded!'});
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



module.exports = router;