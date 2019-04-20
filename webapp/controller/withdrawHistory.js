const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');
const Withdrawal = model.Withdrawal;
const {
    ensureAuthenticated
} = require('../config/auth');
const fundraiser = model.Fundraiser;

router.get('/withdrawHistory/:fundraiserId',ensureAuthenticated, (req, res) => {
    
    Withdrawal.find({
        "fundraiserId": req.params.fundraiserId
    }).then((sample)=>{
        console.log(sample);
        res.send("Success");
    });

});
 
module.exports = router;
