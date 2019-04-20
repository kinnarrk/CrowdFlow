var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'),
    SALT_WORK_FACTOR = 10;

//Role schema
var roleSchema = new Schema({
    role : {type: String, required: true},
    isDeleted : {type: Boolean, default: false}
 });
 var Role = mongoose.model('Role', roleSchema);
//  module.exports = Role;

//User schema
var userSchema = new Schema({
    roleId : {type: Schema.Types.ObjectId, ref: 'Role', required: true},
    fullName : {type: String, required: true},
    email : {type: String, required: true, index: {unique: true }},
    password : {type: String},
    image : {type: String},
    country : {type: String},
    city : {type: String},
    phone : {type: String},
    dob : {type: Date},
    ssn : {type: Number},
    facebook : {type: String},
    twitter : {type: String},
    linkedin : {type: String},
    isGuest : {type: Boolean, default: false},
    isDeleted : {type: Boolean, default: false}
 });
 //For comparing hashed passwords
 userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
 };
 var User = mongoose.model('User', userSchema);
//  module.exports = User;

 

//Category schema
var categorySchema = new Schema({
    categoryName : {type: String, required: true, index: {unique: true }},
    categoryImage : {type: String, required: true},
    categoryDescription : {type: String},
    createdBy : {type: Schema.Types.ObjectId, ref: 'User', required: true},
    createdDate : {type: Date, required: true, default: Date.now},
    updatedBy : {type: Schema.Types.ObjectId, ref: 'User'},
    updatedDate : {type: Date},
    isDeleted : {type: Boolean, default: false}
 });
 var Category = mongoose.model('Category', categorySchema);
//  module.exports = Category;

//Cause Schema
var causeSchema = new Schema({
    name : {type: String, required: true},
    description : {type: String},
    image : {type: String}
});
var Cause = mongoose.model('Cause', causeSchema);

//Donation schema
var donationSchema = new Schema({
    userId : {type: Schema.Types.ObjectId, ref: 'User', required: true},
    // fundraiserId : {type: Schema.Types.ObjectId, ref: 'Fundraiser', required: true},
    // transactionId : {type: Schema.Types.ObjectId, ref: 'Transaction'},   //since transaction fields added to this schema, the field is not required anymore
    amount : {type: Number, required: true},
    createdDate : {type: Date, required: true, default: Date.now},
    isRefund : {type: Boolean, default: false},
    refundBy : {type: Schema.Types.ObjectId, ref: 'User'},
    refundDate : {type: Date},
    isDeleted : {type: Boolean, default: false},
    //Transaction details (earlier- transactionSchema)
    transactionId : {type: String, required: true}, //transaction id received from payment gateway 
    paymentMode : {type: String, required: true},
    bank : {type: String, required: true},
    invoiceId : {type: String, required: true},
    taxName : {type: String, required: true},
    taxRate : {type: Number, required: true},
    taxAmount : {type: Number, required: true}
 });
 var Donation = mongoose.model('Donation', donationSchema);
//  module.exports = Donation;

//Fundraiser schema
var fundraiserSchema = new Schema({
    categoryId : {type: Schema.Types.ObjectId, ref: 'Category', required: true},
    title : {type: String, required: true},
    amount : {type: Number, required: true},
    image : {type: String},
    video : {type: String},
    description : {type: String},
    ngoName : {type: String},
    createdBy : {type: Schema.Types.ObjectId, ref: 'User', required: true},
    createdDate : {type: Date, required: true, default: Date.now},
    updatedBy : {type: Schema.Types.ObjectId, ref: 'User'},
    updatedDate : {type: Date},
    targetDate : {type: Date, required: true},
    isActive : {type: Boolean, default: true},
    isDeleted : {type: Boolean, default: false},
    phone : {type: String, required: true},
    city : {type: String},
    story : {type: String},
    visits: {type: Number},
    donations : [donationSchema]   //added on 15/4 for easier retrieval
 });
 var Fundraiser = mongoose.model('Fundraiser', fundraiserSchema);
//  module.exports = Fundraiser;

//Comment schema
var commentSchema = new Schema({
    fundraiserId : {type: Schema.Types.ObjectId, ref: 'Fundraiser', required: true},
    comment : {type: String, required: true},
    createdBy : {type: Schema.Types.ObjectId, ref: 'User', required: true},
    createdDate : {type: Date, required: true, default: Date.now},
    updatedBy : {type: Schema.Types.ObjectId, ref: 'User'},
    updatedDate : {type: Date},
    isDeleted : {type: Boolean, default: false}
 });
 var Comment = mongoose.model('Comment', commentSchema);
//  module.exports = Comment;

//Beneficiary schema
var beneficiarySchema = new Schema({
    userId : {type: Schema.Types.ObjectId, ref: 'User', required: true},
    fundraiserId : {type: Schema.Types.ObjectId, ref: 'Fundraiser', required: true},
    bank : {type: String, required: true},
    branch : {type: String},
    accountNo : {type: String, required: true},
    accountName : {type: String, required: true},
    routingCode : {type: String, required: true},
    email : {type: String, required: true},
    phone : {type: String, required: true}, 
    address : {type: String},
    updatedBy : {type: Schema.Types.ObjectId, ref: 'User'},
    updatedDate : {type: Date},
    isDeleted : {type: Boolean, default: false}
 });
 var Beneficiary = mongoose.model('Beneficiary', beneficiarySchema);
//  module.exports = Beneficiary;

//Transaction schema
var transactionSchema = new Schema({
    paymentMode : {type: String, required: true},
    bank : {type: String, required: true},
    amount : {type: Number, required: true},
    invoiceId : {type: String, required: true},
    taxName : {type: String, required: true},
    taxRate : {type: Number, required: true},
    taxAmount : {type: Number, required: true},
    createdBy : {type: Schema.Types.ObjectId, ref: 'User', required: true},
    transactionDate : {type: Date, required: true, default: Date.now}
 });
 var Transaction = mongoose.model('Transaction', transactionSchema);
//  module.exports = Transaction;

//Withdrawal schema
var withdrawalSchema = new Schema({
    userId : {type: Schema.Types.ObjectId, ref: 'User', required: true},
    fundraiserId : {type: Schema.Types.ObjectId, ref: 'Fundraiser', required: true},
    beneficiaryId : {type: Schema.Types.ObjectId, ref: 'Beneficiary', required: true},
    amount : {type: Number, required: true},
    createdBy : {type: Schema.Types.ObjectId, ref: 'User', required: true},
    createdDate : {type: Date, required: true, default: Date.now},
    status : {type: Boolean, default: true},
    isDeleted : {type: Boolean, default: false}
 });
 var Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
//  module.exports = Withdrawal;


 module.exports = {
    Role: Role,
    User: User,
    Category: Category,
    Cause :  Cause,
    Fundraiser: Fundraiser,
    Comment: Comment,
    Beneficiary: Beneficiary,
    Transaction: Transaction,
    Donation: Donation,
    Withdrawal: Withdrawal
};