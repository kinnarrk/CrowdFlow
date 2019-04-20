const express = require('express');
var router = express.Router();
// var {User} = require('../model/user.js');
var model = require('../model/commonModel');
const category = model.Category;
const fundraiserdb = model.Fundraiser;
const User = model.User;
donationArray = []; // donationArray to compute all the required fields like days left, number of donatiosn
router.get('/' ,(req, res) =>{
   categories = [];

    console.log("logotu="+req.session.returnTo);
   
    mysort = [
        {
        $unwind :  
        {
                "path": "$donations",
                "preserveNullAndEmptyArrays": false  //This is needed.. to only show the donated 
        } 
        },
        { '$lookup': { 
            from: 'categories', 
            localField: 'categoryId', 
            foreignField: '_id', 
            as: 'category'} }, 
        { '$unwind': '$category' },
        {  '$lookup': { 
            from: 'users', 
            localField: 'createdBy', 
            foreignField: '_id',
             as: 'user'} },
        {'$unwind': '$createdBy'},
        {
        $group : {
                _id: "$_id",
                count: { $sum: 1 },
                "doc":{"$first":"$$ROOT"},
     
        },
        }, 
        {
        $sort : {
            count : -1   // change -1 to 1 , if u want in descending order.
        }
        }];
     // -------- Sorting method 4 --------------
       
       var limitcount = 4;
           
    // mysort is the variable based on which we have sorted
    fundraiserdb.aggregate(mysort).limit(limitcount)
        .then(function(sample){
           // console.log(sample);
            trendingFundRaisers = [];
           // console.log(sample);
            category1 = [];
            users = [];
            let total; 
                for(var i =0 ; i < sample.length; i++) {
                 //   console.log("------"+sample[i]);
                 trendingFundRaisers.push(sample[i].doc);
                    //donation._id = sample1[i]._id;  
            }
           
        }).catch(err => {
            console.log(err);
        });
    
        // aggregating all the users. 
        fundraiserdb.aggregate([
          // matching wrt to fund_id
          //  { $match: {categoryId: mongoose.Types.ObjectId(req.params.categoryId)}},
         {$unwind: {
            "path": "$donations", 
                      "preserveNullAndEmptyArrays": false  // to consider only the donated 
          },
        },
          {
                $group : {
                    _id: "$_id",
                            count: { $sum: "$donations.amount" },
                            "doc":{"$first":"$$ROOT"},
                            totalDonations : {$sum :1} // get the number of Donations
                             /// considering the root
                }
            }
        ]).then(d=> {
            for(var i =0; i < d.length; i++) {
                let total = d[i].count;
                let numberofDaysLeft = getDaysLeft(d[i].doc.targetDate);               
                     donationObject = {
                        totalDonations : total , // finding the total sum of donations for specific fundraiser
                        fid : d[i].doc._id,  // finding the fundraiser id 
                       numberofDonations : d[i].totalDonations, // finding the number of donations
                        daysLeft : numberofDaysLeft // finding the number of days left;
                    }
                donationArray.push(donationObject);                      
        }
            
        category.find({
            }).then(sample => {
                setTimeout(() => {
                    res.render('../view/index', {categories:sample});
                }, 500);
                    
    });
});

});

router.get('/404' ,(req, res) =>{
    
    res.render('../view/404');
});

module.exports = router;

function getDaysLeft(target) {
    let date1 = new Date();
    let date2 = new Date(target);
    let diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24));
    return diffDays;
}