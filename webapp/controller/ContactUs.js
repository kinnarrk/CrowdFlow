const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');

router.get('/ContactUs',(req,res) =>
{

    res.render('../view/ContactUs');

});

module.exports = router;