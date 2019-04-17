const express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const model = require('../model/commonModel');
const fundraiser = model.Fundraiser;
const Beneficiary=model.Beneficiary;
const User=model.User;



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













router.post('/beneficiary',(req, res) =>{
    // fundraiser.findById({"_id":req.params.id},(err,event)=>{
    //     console.log(event);
    //     if(err){
    //         res.render({'messages':err});
    //     }
    //     else{

            const beneficiary = new Beneficiary({
                fundraiserId : req.body.fundraiserId,
                userId : "5ca2a2e1d485057a7cbaa0a1",
                bank:req.body.bank,
                branch : req.body.branch,
                accountNo : req.body.accountNo,
                accountName : req.body.accountName,
                routingCode : req.body.routingCode,
                email : req.body.email,
                phone : req.body.phone,
                address : req.body.address
            });
            console.log(req.body.bank);


            beneficiary.save().then(user =>{
                console.log(user);
                res.redirect('/beneficiary/beneficiary');
                
            })
            
            .catch(err => console.log(err));
           
              
            
        });

        router.get('/beneficiary',(req,res) =>
        {
         
            res.render('../partials/beneficiary'); 
         });

         fundraiser.find({
     
        }).then(sample=> {
           sample1 = [];
           sample1 = sample;
           
        });

        module.exports = router;