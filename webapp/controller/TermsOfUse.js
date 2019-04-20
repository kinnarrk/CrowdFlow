const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');

router.get('/TermsOfUse',(req,res) =>
{

    res.render('../view/TermsOfUse');

});

module.exports = router;