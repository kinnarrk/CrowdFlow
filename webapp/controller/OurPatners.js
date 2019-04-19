const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');

router.get('/OurPatners',(req,res) =>
{

    res.render('../view/OurPatners');

});

module.exports = router;