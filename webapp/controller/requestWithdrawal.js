const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');
const Withdrawal = model.Withdrawal;
const beneficiary = model.Beneficiary;
const {
    ensureAuthenticated
} = require('../config/auth');
const fundraiser = model.Fundraiser;

router.get('/:fundraiserId',ensureAuthenticated, (req, res) => {
    fundraiser.findOne({
        _id: req.params.fundraiserId
    }).then(sample => {
        res.render('../view/manage_fundraiser/requestWithdrawal', { fundraiser: sample });
    }).catch((err) => {
        res.redirect('/404');
    });

 });
 
 router.post('/:fundraiserId', ensureAuthenticated, (req, res)=> {
    
    beneficiary.findOne({
        _id: req.params.fundraiserId
    }).then(bene => {
        const requestWithdrawal = new Withdrawal({
            userId : req.user._id,
            fundraiserId : req.params.fundraiserId,
            beneficiaryId : bene._id,
            amount : req.body.amount,
            createdBy : req.user._id,
            createdDate : new Date()
         });
        
         requestWithdrawal.save().then(withdraw=>{
            res.redirect('../view/fundraiser_success');
        }); 
       
    }).catch((err) => {
        res.redirect('/404');
    });
 
 });
module.exports = router;
