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


router.get('/share/:fundraiserId',ensureAuthenticated, (req, res) => {
    fundraiser.findOne({
        _id: req.params.fundraiserId
    }).then(fund => {
        res.render('../view/manage_fundraiser/shareFundraiser', { fundraiser: fund });
    }).catch((err) => {
        res.redirect('/404');
    });
 });
 module.exports = router;
