const express = require('express');
var router = express.Router();
const model = require('../model/commonModel');
const fundraiser = model.Fundraiser;
const category = model.Category;
var moment= require('moment');
const passport = require('passport');
const {ensureAuthenticated } = require('../config/auth');

edit = [];

router.get('/edit/:id', ensureAuthenticated, (req,res) =>
{
    // console.log("Showing all frs");
 fundraiser.find({_id:req.params.id
    
 }).then(sample=> {
    edit = sample;
    category.find({
     
    }).then(categories=> {
      //  console.log(sample1);
      console.log("Edit json before sending: " + edit);
      res.render('../view/manage_fundraiser/editFundraiser',{edit : edit, categories : categories, moment:moment});
    }).catch((err) => {
        res.redirect('/404');
    });
    
    // console.log(sample1.categoryImage);
    //res.send(sample);
    
    
 });
 //console.log(require('path').resolve(__dirname, '..'));
  


});


router.post('/edit/:id', ensureAuthenticated, (req,res) =>
{


    let fundraiserImage = req.files.image;

    let fileParts = fundraiserImage.name.split('.');
    //let fund = new fundraiser(req.body);
    // fund.save().then((data) => {
    //     fundraiserImage.mv("./view/images/fundraisers/" + data._id + '.' + fileParts[1], function (err) {
    //         if (err) {
    //             return res.status(500).send(err);
    //         }
    //         data.image = data._id + '.' + fileParts[1];
    //         data.save();
    //         res.render('../view/fundraiser_success');
    //     });
    // }).catch({

    // });


    fundraiser.findOneAndUpdate({_id: req.params.id},{$set: req.body}).then((data)=>{

        fundraiserImage.mv("./view/images/fundraisers/" + data._id + '.' + fileParts[1], function (err) {
            if (err) {
                return res.status(500).send(err);
            }
            data.image = data._id + '.' + fileParts[1];
            data.save();
            res.redirect('/editFundraiser/edit/'+req.params.id);
        });

    })
    

            // function(err,User)
            // {
            //     if(err)
            //     return next(err);
            //    // res.send('Fundraiser Updated');
            //     res.redirect('/editFundraiser/edit/'+req.params.id);
            // }
            // )








    
//     //console.log("id to be updated: "+ req.params.id);
//  User.findOneAndUpdate({_id: req.params.id},{$set: req.body},

//     function(err,User)
//     {
//         if(err)
//         return next(err);
//        // res.send('Fundraiser Updated');
//         res.redirect('/editFundraiser/edit/'+req.params.id);
//     }
//     )

})

// router.get('/edit/:id',(req,res) =>
// {
//     User.findById(req.params.id, function (err, User)
//     {
//         if (err) return next(err);
//         res.redirect('/editFundraiser/edit/'+req.params.id);
//     })
// })

// category.find({
     
// }).then(sample=> {
//    sample1 = [];
//    sample1 = sample;
//   //  console.log(sample1);
   
// });

module.exports = router;