const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');
const Withdrawal = model.Withdrawal;
const beneficiary = model.Beneficiary;
var moment = require('moment');

const {
    ensureAuthenticated
} = require('../config/auth');
const fundraiser = model.Fundraiser;

router.get('/withdraw/:fundraiserId', ensureAuthenticated, (req, res) => {
    fundraiser.findOne({
        _id: req.params.fundraiserId
    }).then(sample => {

        res.render('../view/manage_fundraiser/requestWithdrawal', { fundraiser: sample, moment: moment });
    }).catch((err) => {
        res.redirect('/404');
    });

});

router.post('/withdraw/:fundraiserId', ensureAuthenticated, (req, res) => {

    beneficiary.find(
        {
            "fundraiserId": req.params.fundraiserId
        }
    ).then((x) => {
        
            const requestWithdrawal = new Withdrawal({
                userId: req.user._id,
                fundraiserId: req.params.fundraiserId,
                beneficiaryId: x[0]._id,
                amount: req.body.amount[0],
                createdBy: req.user._id,
                createdDate: new Date()
            });

            requestWithdrawal.save().then(user => {
                bid = 1;
                console.log(user);
                fundraiser.findOne({
                    _id: req.params.fundraiserId
                }).then(sample => {
                    if (sample.amount > req.body.amount[0]) {
                        res.render('../view/manage_fundraiser/requestWithdrawal_success', { fundraiser: sample, moment: moment });
                    } else {
                        res.render('../view/manage_fundraiser/requestWithdrawal_failure', { fundraiser: sample, moment: moment,bid:x });
                    }

                }).catch((err) => {
                    res.redirect('/404');
                });
            }).catch(err => res.render('../view/404'));

        
    }).catch(err=>{
        console.log(err);
        fundraiser.findOne({
            _id: req.params.fundraiserId
        }).then(sample => {
            let x = null;
            res.render('../view/manage_fundraiser/requestWithdrawal_failure', { fundraiser: sample, bid:x});
    });
 });
});


module.exports = router;

