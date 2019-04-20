const express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
// const bcrypt = require('bcrypt');
const passport = require('passport');
const model = require('../model/commonModel');
const fundraiser = model.Fundraiser;
const Beneficiary = model.Beneficiary;
const User = model.User;
const {ensureAuthenticated } = require('../config/auth');


// router.post('/beneficiary',(req,res) =>
// {
//     let beneficiary = new Beneficiary(
//         {
//               bank : req.body.bank,
//               branch : req.body.branch 
//         }
//     );

//     beneficiary.save(function (err)
//     {
//         if(err)
//         {
//             res.send(err);
//         }
//         res.send('beneficiary created');
//         // res.render('../partials/beneficiary');
//     })
// });

ben = [];

router.post('/beneficiary/:fundraiserId',ensureAuthenticated, (req, res) => {
    // fundraiser.findById({"_id":req.params.id},(err,event)=>{
    //     console.log(event);
    //     if(err){
    //         res.render({'messages':err});
    //     }
    //     else{

    

    // console.log(sample1.categoryImage);
    //res.send(sample);
    const beneficiary = new Beneficiary({
        fundraiserId: req.params.fundraiserId,
        userId: req.user._id,
        bank: req.body.bank,
        branch: req.body.branch,
        accountNo: req.body.accountNo,
        accountName: req.body.accountName,
        routingCode: req.body.routingCode,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address
    });
    console.log(req.body.bank);
    beneficiary.save().then(user => {
        console.log(user);
        req.flash(
            'success_msg',
            'Beneficiary added Successfully'
        ); 
        res.redirect('/beneficiary/beneficiary/'+req.params.fundraiserId);
    
    })
    
        .catch(err => console.log(err));
});



router.get('/beneficiary/:fundraiserId',ensureAuthenticated, (req, res) => {
    fundraiser.findOne({
        _id: req.params.fundraiserId

    }).then(sample => {

        res.render('../view/manage_fundraiser/beneficiary', { fundraiser: sample });

    }).catch((err) => {
        res.redirect('/404');
    });
});

fundraiser.find({

}).then(sample => {
    sample1 = [];
    sample1 = sample;

});

module.exports = router;