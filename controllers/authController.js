const User = require('../models/User');
const UserExam = require('../models/UserExam');
const jwt = require('jsonwebtoken');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Admin = require('../models/Admin');
const SuperUser = require('../models/SuperUser');

const fast2sms = require('fast-two-sms');

const bcrypt = require('bcrypt');

// handle errors function 
const handleErrors = (err) => {
    let errors = { email: '', phone: '', password: '' };

    // incorrec email
    if (err.message === 'incorrect email') {
        errors.email = 'The email is not registered.';
    }

    // incorrect password 
    if (err.message === 'incorrect password') {
        errors.password = 'The password is incorrect.';
    }

    // duplicate email
    if (err.code === 11000) {
        errors.email = 'The email is already registered.'
        return errors;
    }
    // validation errors 
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'haxorai', {
        expiresIn: maxAge
    });
};

// controller actions
const signup_get = (req, res) => {
    res.render('signup');
}
const signupforaccount_post = async (req,res) => {
    const {name, email, phone, password} = req.body;
    try{
        const user = await User.create({name, email, phone, password});
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    }
    catch (err){
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

const account_get = async (req,res) => {
    const user_id = req.params.id;
    try{
        const user = await User.findById(user_id);
        const user_exams = await UserExam.find({email: user.email, fee_paid: 'yes'});
        const exam_details = await Exam.find();
        res.render('account', {user, user_exams, exam_details});
    }
    catch (err){
        console.log(err);
    }
    
}

const login_get = (req, res) => {
    res.render('login');
}
const loginforaccount_post = async (req,res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

const search_phone_post = async (req, res) => {
    const { phone } = req.body;
    try{
        const user = await User.findOne({phone});
        if(user){
            const otp = Math.floor(100000 + Math.random() * 900000);
            const result = await fast2sms.sendMessage({
                authorization: process.env.FAST2SMS_KEY,
                message: otp,
                numbers: [phone]
            });
            res.status(201).json({user_id: user.id, otp});
        }
        else{
            res.status(400).json({error: 'This phone number is not registered.'});
        } 
    }
    catch (err){
        console.log(err);
    }
}

const update_password_put = async (req, res) => {
    let {phone, password} = req.body;
    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(password, salt);
    try{
        const result = await User.findOneAndUpdate(
            {phone: phone}, 
            {password: password}, 
            {new : true}
            );
        if(result){
            res.status(201).json({success: 'Password sucessfully updated'})
        }
        else{
            res.status(400).json({error: "Error updating password"});
        }
    }
    catch(err){
        console.log(err);
    }
}

const update_user_profile_put = async (req,res) => {
    const  {name, email, phone} = req.body;
    console.log(name, email, phone);
    try{
        const result = await User.findOneAndUpdate(
            {email: email}, 
            {name: name, phone: phone}, 
            {new : true}
            );
        if(result){
            res.status(201).json({success: 'Profile sucessfully updated'})
        }
        else{
            res.status(400).json({error: "Error updating profile"});
        }
    }
    catch(err){
        console.log(err);
    }
}

const search_admin_phone_post = async (req, res) => {
    const { phone } = req.body;
    try{
        const admin = await Admin.findOne({phone});
        if(admin){
            const otp = Math.floor(100000 + Math.random() * 900000);
            const result = await fast2sms.sendMessage({
                authorization: process.env.FAST2SMS_KEY,
                message: otp,
                numbers: [phone]
            });
            res.status(201).json({admin_id: admin.id, otp});
        }
        else{
            res.status(400).json({error: 'This phone number is not registered.'});
        } 
    }
    catch (err){
        console.log(err);
    }
}

const update_admin_password_put = async (req, res) => {
    let {phone, password} = req.body;
    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(password, salt);
    try{
        const result = await Admin.findOneAndUpdate(
            {phone: phone}, 
            {password: password}, 
            {new : true}
            );
        if(result){
            res.status(201).json({success: 'Password sucessfully updated'})
        }
        else{
            res.status(400).json({error: "Error updating password"});
        }
    }
    catch(err){
        console.log(err);
    }
}

const search_superuser_phone_post = async (req, res) => {
    const { phone } = req.body;
    try{
        const superuser = await SuperUser.findOne({phone});
        if(superuser){
            const otp = Math.floor(100000 + Math.random() * 900000);
            const result = await fast2sms.sendMessage({
                authorization: process.env.FAST2SMS_KEY,
                message: otp,
                numbers: [phone]
            });
            res.status(201).json({superuser_id: superuser.id, otp});
        }
        else{
            res.status(400).json({error: 'This phone number is not registered.'});
        } 
    }
    catch (err){
        console.log(err);
    }
}

const update_superuser_password_put = async (req, res) => {
    let {phone, password} = req.body;
    const salt = await bcrypt.genSalt();
    password = await bcrypt.hash(password, salt);
    try{
        const result = await SuperUser.findOneAndUpdate(
            {phone: phone}, 
            {password: password}, 
            {new : true}
            );
        if(result){
            res.status(201).json({success: 'Password sucessfully updated'})
        }
        else{
            res.status(400).json({error: "Error updating password"});
        }
    }
    catch(err){
        console.log(err);
    }
}

const signupandpay_get = (req, res) => {
    const exam = req.params.exam;
    const price = req.params.price;
    res.render('signupandpay',{ title: 'Registration | StudyAndShine', exam, price });
}

const loginandpay_get = (req, res) => {
    const exam = req.params.exam;
    const price = req.params.price;
    console.log(exam, price);
    res.render('loginandpay', { title: 'Login | StudyAndShine', exam, price });
}
const signup_post = async (req, res) => {
    const { exam, name, email, phone, password} = req.body;
    if(phone === null && password === null){
        try{
            const userexam = await UserExam.create({
                username: name,
                email: email,
                exam: exam,
                marks: 0,
                fee_paid: 'no'
            });
            res.status(201).json({user_id: userexam._id})
        }
        catch (err){
            const errors = handleErrors(err);
            res.status(400).json({ errors });
        }
        
    }
    else{
        try {
            const user = await User.create({
                name, 
                email, 
                phone, 
                password
            });
            if(user){
                const userexam = await UserExam.create({
                    username: name,
                    email: email,
                    exam: exam,
                    marks: 0,
                    fee_paid: 'no'
                });
                if(userexam){
                    const token = createToken(user._id);
                    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                    res.status(201).json({ user: user._id });
                }
            }
        }
        catch (err) {
            const errors = handleErrors(err);
            res.status(400).json({ errors });
        }
    }   
}

const login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        if(user){
            const userexam = await UserExam.create({
                username: user.name,
                email: email,
                exam: req.body.exam,
                marks: 0,
                fee_paid: 'no'
            });
            if(userexam){
                const token = createToken(user._id);
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                res.status(200).json({ user: user._id });
            }
        }
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

const logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}

const admin_login_get = async (req,res) => {
    try{
        res.render('admin_login');
    }
    catch(err){
        console.log(err);
    }
}

const admin_login_post = async (req,res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.login(email, password);
        const token = createToken(admin._id);
        res.cookie('jwtAdmin', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ admin: admin._id });
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

const admin_logout_get = (req, res) => {
    res.cookie('jwtAdmin', '', { maxAge: 1 });
    res.redirect('/admin-login');
}

const superuser_get = async (req,res) => {
    try{
        res.render('superuser_login');
    }
    catch(err){
        console.log(err);
    }
}

const superuser_login_post = async (req,res) => {
    const { email, password } = req.body;
    try {
        const superuser = await SuperUser.login(email, password);
        const token = createToken(superuser._id);
        res.cookie('jwtSuperuser', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ superuser: superuser._id });
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

const superuser_logout_get = (req, res) => {
    res.cookie('jwtSuperuser', '', { maxAge: 1 });
    res.redirect('/haxorai');
}
module.exports = {
    signup_get,
    signupforaccount_post,
    account_get,
    login_get,
    loginforaccount_post,
    search_phone_post,
    update_password_put,
    update_user_profile_put,
    signupandpay_get,
    loginandpay_get,
    signup_post,
    login_post,
    logout_get,
    admin_login_get,
    admin_login_post,
    search_admin_phone_post,
    update_admin_password_put,
    admin_logout_get,
    superuser_get,
    superuser_login_post,
    search_superuser_phone_post,
    update_superuser_password_put,
    superuser_logout_get
}