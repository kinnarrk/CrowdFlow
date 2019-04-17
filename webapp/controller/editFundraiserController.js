const express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const model = require('../model/commonModel');
const User = model.Fundraiser;
const category = model.Category;

edit = [];

router.get('/edit/:id',(req,res) =>
{
    // console.log("Showing all frs");
 User.find({_id:req.params.id
    
 }).then(sample=> {
    edit = sample;
    // console.log(sample1.categoryImage);
    //res.send(sample);
    console.log("Edit json before sending: " + edit);
    res.render('../partials/editFundraiser',{edit : edit});
 });
 //console.log(require('path').resolve(__dirname, '..'));
  


});


router.post('/edit/:id',(req,res) =>
{
    
    //console.log("id to be updated: "+ req.params.id);
 User.findOneAndUpdate({_id: req.params.id},{$set: req.body},

    function(err,User)
    {
        if(err)
        return next(err);
        
       // res.send('Fundraiser Updated');
        res.redirect('/editFundraiser/edit/'+req.params.id);
    }
    )

})

router.get('/edit/:id',(req,res) =>
{
    User.findById(req.params.id, function (err, User)
    {
        if (err) return next(err);
        res.redirect('/editFundraiser/edit/'+req.params.id);
    })
})

category.find({
     
}).then(sample=> {
   sample1 = [];
   sample1 = sample;
  //  console.log(sample1);
   
});

module.exports = router;