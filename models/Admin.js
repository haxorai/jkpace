const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt  = require('bcrypt');
const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: [true, 'Please enter an email.'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email.']
    },
    phone: {
        type: String,
        required: true,
        minlength: [10, 'The number of digits in your phone number is less than 10.'],
        maxlength: [10, 'The number of digits in your phone number is more than 10.']
    },
    password: {
        type: String,
        required: true,
    }
});

// fire a function before document saved to database
adminSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// static method to login user
adminSchema.statics.login = async function(email, password){
    const admin = await this.findOne({ email });
    if(admin){
        const auth = await bcrypt.compare(password, admin.password);
        if(auth){
            return admin;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
};

const Admin = mongoose.model('admin',adminSchema);
module.exports = Admin;