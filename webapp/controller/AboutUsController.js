const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');

router.get('/AboutUs',(req,res) =>
{

    res.render('../view/AboutUs');

});

module.exports = router;