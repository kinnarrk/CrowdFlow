const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');

router.get('/FundraiserTips',(req,res) =>
{

    res.render('../view/FundraiserTips');

});

module.exports = router;