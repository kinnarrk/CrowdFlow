const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');
const Withdrawal = model.Withdrawal;
var moment= require('moment');

const {
    ensureAuthenticated
} = require('../config/auth');
const fundraiser = model.Fundraiser;

router.get('/withdrawHistory/:fundraiserId',ensureAuthenticated, (req, res) => {
    fundraiser.findOne({
        _id: req.params.fundraiserId
    }).then(fund => {
        Withdrawal.find({
            "fundraiserId": req.params.fundraiserId
        }).sort({
            createdDate: -1
          }).then((wd)=>{
            console.log(wd);
            res.render('../view/manage_fundraiser/withdrawalHistory', { fundraiser: fund , withdrawal:wd,moment:moment});
        });
      
    }).catch((err) => {
        res.redirect('/404');
    });
 
});
 
module.exports = router;
