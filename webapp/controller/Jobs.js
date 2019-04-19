const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');

router.get('/Jobs',(req,res) =>
{

    res.render('../view/Jobs');

});

module.exports = router;