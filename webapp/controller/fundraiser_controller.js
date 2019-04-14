const express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const model = require('../model/commonModel');
const fundraiser = model.Fundraiser;
const Cause = model.Cause;
const {ensureAuthenticated } = require('../config/auth');

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