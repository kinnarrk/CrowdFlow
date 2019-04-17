const express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const model = require('../model/commonModel');
const category = model.Category;
const User = model.User;


router.get('/sample', (req, res) => {
  category.find({

  }).then(sample => {
    sample1 = [];
    sample1 = sample;
  });

  res.render('../view/category');
});

module.exports = router;