const User = require('../models/User');
const UserExam = require('../models/UserExam');
const jwt = require('jsonwebtoken');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Admin = require('../models/Admin');
const Response = require('../models/Response');
const SuperUser = require('../models/SuperUser');

const PDFDocument = require('pdfkit');


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
    if (err.message.includes('admin validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}

const handleExamErrors = (err) => {
    let errors = {date:''};

    // validation errors 
    if (err.message.includes('exam validation failed')) {
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


const haxorai_get = async (req,res) => {
    try{
        const admins = await Admin.find();
        res.render('admin/admins',{admins});
    }
    catch (err){
        console.log(err);
    }
}


const question_paper_get = async (req,res) => {
    try{
        const questions = await Question.find({});
        const count = questions.length;
        let question_numbers = [];
        if(questions.length){
            questions.forEach(question => {
                question_numbers.push(question.number);
            })
        }
        res.render('admin/question_paper',{count, question_numbers});
    }
    catch (err){
        console.log(err);
    }
}

const signup_admin_post  = async (req,res) => {
    const {name, email, phone, password} = req.body;
    try{
        const admin = await Admin.create({name, email, phone, password});
        res.status(201).json({ admin: admin._id });
    }
    catch (err){
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

const delete_admin_post = async (req,res) => {
    const id = req.body.id;
    try{
        const result = await Admin.deleteOne({_id: id});
        res.status(201).json({deletedCount: result.deletedCount});
    }
    catch(err){
        console.log(err);
    }
}

const admin_get = async (req, res) => {
    try{
        const exams = await Exam.find().sort({date: 1});
        res.render('admin/examinations',{title: 'Examinations | Admin', exams });
    }
    catch (err){
        console.log(err);
    }
}

const delete_exam_post = async (req,res) => {
    const id = req.body.id;
    try{
        const result = await Exam.deleteOne({_id: id});
        res.status(201).json({deletedCount: result.deletedCount});
    }
    catch(err){
        console.log(err);
    }
}

const create_exam_post  = async (req,res) => {
    const {name, date, time, price, topper_prize, body} = req.body;
    try{
        const exam = await Exam.create({
            name,
            date,
            time,
            price,
            topper_prize,
            body
        });
        res.status(201).json({ exam: exam._id });
    }
    catch (err){
        let errors = handleExamErrors(err);
        res.status(400).json({ errors });
    }
}

const user_examinations_get = async (req, res) => {
    try{
        const exam = await Exam.find();
        let exam_names = [];
        exam.forEach((exam) => {
            exam_names.push(exam.name);
        })
        res.render('admin/user_examinations',{ title: 'Examinations | Admin', exam_names});
    }
    catch (err){
        console.log(err);
    }
}

const search_exams_post = async (req,res) => {
    const email = req.body.email;
    try{
        const results = await UserExam.find({email});
        if(results.length !== 0){
            console.log(results);
            res.status(201).json({results});
        }
        else{
            res.status(201).json({error: 'This email is not associated with any exams'})
        }
        
    }
    catch(err){
        console.log(err);
    }
}

const delete_details_post = async (req, res) => {
    const exam_name = req.body.exam_name;
    try{
        const result = await UserExam.deleteMany({exam: exam_name});
        res.status(201).json({deletedCount: result.deletedCount});
    }
    catch (err){
        console.log(err);
    }
}

const user_responses_get = async (req,res) => {
    try{
        res.render('admin/user_responses',{title: 'User Responses | Admin'});
    }
    catch(err){
        console.log(err);
    }
}

const search_responses_post = async (req,res) => {
    const email = req.body.email;
    try{
        const user = await User.findOne({email});
        if(user){
            const user_id = user.id;
            const responses = await Response.find({user_id}).sort({question_number: 1});
            if(responses.length !== 0){
                res.status(201).json({results: responses});
            }
            else{
                res.status(400).json({error: 'No responses founded for this candidate'})
            }
        }
        else{
            res.status(400).json({error: 'No responses founded for this candidate'})
        }

    }
    catch(err){
        console.log(err);
    }
}

const delete_every_response = async (req,res) => {
    try{
        const result = await Response.deleteMany();
        if(result.deletedCount){
            res.status(201).json({deletedCount: result.deletedCount});
        }
        else{
            res.status(400).json({error: 'There is nothing in the responses collection'});
        }
        
    }
    catch(err){
        console.log(err);
    }
}

const registered_users_get = async (req,res) => {
    try{
        res.render('admin/registered_users', {title: 'Registered Users | Admin'});
    }
    catch(err){
        console.log(err);
    }
}

const search_user_post = async (req,res) => {
    const email = req.body.email;
    try{
        const user_details = await User.findOne({email});
        if(user_details){
            res.status(201).json({results: user_details});
        }
        else{
            res.status(400).json({error: 'No user exists with this email'})
        }

    }
    catch(err){
        console.log(err);
    }
}

const delete_every_user = async (req,res) => {
    try{
        const result = await Response.deleteMany();
        if(result.deletedCount){
            res.status(201).json({deletedCount: result.deletedCount});
        }
        else{
            res.status(400).json({error: 'There is nothing in the responses collection'});
        }
        
    }
    catch(err){
        console.log(err);
    }
}

const search_question_post = async (req,res) => {
    const question_number = req.body.question_number;
    try{
        const question_details = await Question.findOne({number: question_number});
        if(question_details){
            res.status(201).json({results: question_details});
        }
        else{
            res.status(400).json({error: 'No question exists with this number'})
        }

    }
    catch(err){
        console.log(err);
    }
}

const update_question_put = async (req,res) => {
    const question_number = req.body.question_number;
    const updated_answer = req.body.updated_answer;
    try{
        const result = await Question.findOneAndUpdate(
            {number: question_number}, 
            {answer: updated_answer}, 
            {new : true}
            );
        if(result){
            res.status(201).json({success: 'Answer sucessfully updated'})
        }
        else{
            res.status(400).json({error: "Error updating answer"});
        }
    }
    catch(err){
        console.log(err);
    }
}

const delete_question = async (req,res) => {
    const {question_number} = req.body;
    try{
        const result = await Question.deleteOne({number: question_number});
        if(result.deletedCount){
            res.status(201).json({deleted_count: result.deletedCount});
        }
        else {
            res.status(400).json({error: 'This question number does not exist in the database'});
        }
        
    }
    catch(err){
        console.log(err);
    }
}

const analysis_get = async (req, res) => {
    try{
        const exams = await Exam.find();
        let exam_names = [];
        exams.forEach((exam) => {
            exam_names.push(exam.name);
        })
        res.render('admin/analysis',{ title: 'Analysis | Admin', exam_names});
    }
    catch (err){
        console.log(err);
    }
}

const search_exam_details_post = async (req, res) => {
    const {exam_name} = req.body;
    let marks_updated = false;
    try{
        const user_details = await UserExam.find({exam: exam_name});
        for( let user_detail of user_details) {
            var correct_responses = 0;
            var wrong_responses = 0;
            var not_attempted = 0;
            var final_marks = 0;
            const user = await User.findOne({email: user_detail.email});
            const responses = await Response.find({user_id: user.id}).sort({question_number: 1});
            for( let response of responses) {
                const question_info = await Question.findOne({number: response.question_number});
                if(response.user_answer === question_info.answer){
                   correct_responses++;
                }
                else if(response.user_answer === 'not attempted'){
                    not_attempted++;
                }
                else{
                    wrong_responses++;
                }
            }
            final_marks = correct_responses - (wrong_responses*0.25);
            const result = await UserExam.findOneAndUpdate(
                {
                    username: user_detail.username,
                    email: user_detail.email,
                    exam: user_detail.exam

                }, 
                {marks: final_marks}, 
                {new : true}
            );   
            if(result){
                marks_updated = true;
            }
            else{
                marks_updated = false;
            }
        }
        if(marks_updated){
            res.status(201).json({success: 'Marks sucessfully updated'});
        }
        else{
            res.status(400).json({error: "Error updating marks"});
        }
    }
    catch(err){
        console.log(err);
    }
}

const download_analysis_sheet_get = async (req,res) => {
    const exam_name = req.params.exam_name;
    try{
        const exam_details = await Exam.findOne({name: exam_name});
        const examdate = parseInt(exam_details.date)
        let date = new Date(examdate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate(); 
        var exam_date = day.toString()+"/"+month.toString()+"/"+year.toString()
        var exam_time = (exam_details.time).toUpperCase();
        
        const user_details = await UserExam.find({exam: exam_name}).sort({marks: -1});

        function addHorizontalRule(doc, spaceFromEdge = 0, linesAboveAndBelow = 0.5) {
            doc.moveTo(0 + spaceFromEdge, doc.y)
              .lineTo(doc.page.width - spaceFromEdge, doc.y)
              .stroke();
            doc.moveDown(linesAboveAndBelow);
            return doc
          }
        const doc = new PDFDocument();
        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-disposition': `attachment;filename=${exam_name}.pdf`,
        });
        doc.on('data', (chunk) => stream.write(chunk));
        doc.on('end', () => stream.end());
        let examination = exam_name.toUpperCase();
        doc.fillColor('green').text(`EXAMINATION: ${examination}`,{align: 'center'});
        doc.moveDown(0.5);
        doc.fillColor('blue').text(`DATE: ${exam_date}`, 73, 90)
           .text(`TIME: ${exam_time}`,270, 90)
           .text(`TOTAL MARKS: 100`, 410, 90);
        addHorizontalRule(doc,72);
        doc.fillColor('black').text(`S.NO`, 73, 115)
               .text(`NAME`, 150, 115)
               .text(`EMAIL`, 320, 115)
               .text(`MARKS`, 470, 115);
        let vertical_gap=0;
        let count = 1;
        for(let user_detail of user_details){
            addHorizontalRule(doc,72);
            doc.text(count, 73, 140+vertical_gap)
               .text(user_detail.username.toUpperCase(), 130, 140+vertical_gap)
               .text(user_detail.email, 280, 140+vertical_gap)
               .text(user_detail.marks, 490, 140+vertical_gap);
            vertical_gap = vertical_gap+25;
            count++;
        }
        addHorizontalRule(doc,72);
        doc.end();

    }
    catch(err){
        console.log(err);
    }
}
module.exports = {
    haxorai_get,
    question_paper_get,
    signup_admin_post,
    delete_admin_post,
    admin_get,
    delete_exam_post,
    create_exam_post,
    user_examinations_get,
    search_exams_post,
    delete_details_post,
    user_responses_get,
    search_responses_post,
    delete_every_response,
    registered_users_get,
    search_user_post,
    delete_every_user,
    search_question_post,
    update_question_put,
    delete_question,
    analysis_get,
    search_exam_details_post,
    download_analysis_sheet_get
}