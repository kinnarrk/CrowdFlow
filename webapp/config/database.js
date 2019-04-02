const mongoose = require('mongoose');

// mongodb+srv://admin:Pandavas12345@cluster0-3rsdu.mongodb.net/test?retryWrites=true

mongoose.connect('mongodb+srv://admin:Pandavas12345@cluster0-3rsdu.mongodb.net/CrowdFlow?retryWrites=true',
    {useNewUrlParser: true}, 
    (err)=>{
        if(!err)
            console.log('MongoDB connection successful...');
        else
            console.log('Error in db connection: ' + JSON.stringify(err, undefined, 2));
});
    
module.exports = mongoose;