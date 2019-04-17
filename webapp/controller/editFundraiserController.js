const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');
const User = model.Fundraiser;


edit = [];

router.get('/edit',(req,res) =>
{
    // console.log("Showing all frs");
 User.find({
    
 }).then(sample=> {
    edit = sample;
    // console.log(sample1.categoryImage);
    //res.send(sample);
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
        res.redirect('/editFundraiser/edit');
    }
    )

})



module.exports = router;