const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Response = require('../models/Response');

const PDFDocument = require('pdfkit');

// handle errors function 
const handleErrors = (err) => {
    let errors = { number: '' };


    // duplicate question
    if (err.code === 11000) {
        errors.number = 'This question number already exists in the database.'
        return errors;
    }
    // validation errors 
    if (err.message.includes('question validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}

const index = async (req, res) => {
    try {
        const exams = await Exam.find().sort({date: 1});
        if (exams) {
            res.render('index', { title: 'Homepage | StudyAndShine', exams });
        }
    }
    catch (err) {
        console.log(err);
    }
}

const about = (req, res) => {
    res.render('about', { title: 'About Us | StudyAndShine' });
}

const contact = (req, res) => {
    res.render('contact', { title: 'Conact Us | StudyAndShine' });
}

const starter_get  = (req, res) => {
    try{
        const exam_name = req.params.exam_name;
        let day = req.params.day;
        let month = req.params.month;
        let year = req.params.year;
        let exam_date = day+"/"+month+"/"+year;
        let exam_time = (req.params.exam_time).toLowerCase();
        exam_date = exam_date.trim().split('/').reverse().join('/');
        let time1 = exam_time.trim();
        if(time1.includes('pm')){
            let time2 = time1.slice(0,time1.length-2);
            let hours_minutes = time2.split(':');
            let hours = (parseInt(hours_minutes[0].trim())+12).toString();
            let minutes = hours_minutes[1].trim();
            exam_time = hours+':'+minutes+":"+"00"   
        }
        else{
            let time2 = time1.slice(0,time1.length-2);
            let hours_minutes = time2.split(':');
            let hours = hours_minutes[0].trim();
            let minutes = hours_minutes[1].trim();
            exam_time = hours+':'+minutes+":"+"00"  
        }
        const date_time = exam_date + " " + exam_time;
        res.render('starter',{exam_name, date_time});
    }
    catch(err){
        console.log(err);
    }
}

const questions_get =  async (req,res) => {
    const exam_name = req.params.exam_name;
    try{
        const questions = await Question.find();
        const count = questions.length;
        res.render('questions',{exam_name, questions, count});
    }
    catch (err){
        console.log(err);
    }
}

const question_post = async (req, res) => {
    const { number, question_top, option1, option2, option3, option4, question_bottom, answer1, answer2, answer3, answer4, answer } = req.body;
    try {
        const question = await Question.create({
            number,
            question_top,
            option1,
            option2,
            option3,
            option4,
            question_bottom,
            answer1,
            answer2,
            answer3,
            answer4,
            answer
        });
        res.status(201).json({ question: question._id });
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}
const response_post = async (req, res) => {
    try {
        const responses = req.body;
        const response = await Response.create(responses);
        res.status(201).json(response[0]._id);
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}
const user_responses_get = async (req, res) => {
    /*
    const user_id = req.params.user_id;
    const responses = await Response.find({user_id});
    const results = await Question.aggregate([{
                            $lookup: {
                            from: 'responses',
                            localField: 'number',
                            foreignField: 'question_number',
                            as: 'user_response'
                        }}]);
    console.log(results[0].user_response[0].user_answer);
    */
    const user_id = req.params.user_id;
    const exam_name = req.params.exam_name;
    try {
        const questions = await Question.find();
        const responses = await Response.find({ user_id });
        let questions_answers = [];
        questions.forEach((question) => {
            responses.forEach((response) => {
                if (question.number == response.question_number) {
                    questions_answers.push({
                        'number': question.number,
                        'question_top': question.question_top,
                        'option1': question.option1,
                        'option2': question.option2,
                        'option3': question.option3,
                        'option4': question.option4,
                        'question_bottom': question.question_bottom,
                        'answer1': question.answer1,
                        'answer2': question.answer2,
                        'answer3': question.answer3,
                        'answer4': question.answer4,
                        'answer': question.answer,
                        'user_answer': response.user_answer
                    });
                }
            })
        })
        res.render('responses', { title: 'Responses', exam_name, questions_answers });
    }
    catch (err) {
        console.log(err);
    }
}

const response_sheet_get = async (req,res) => {
    const user_id = req.params.user_id;
    const exam_name = (req.params.exam_name).toUpperCase();
    let day = req.params.day;
    let month = req.params.month;
    let year = req.params.year;
    const exam_date = day+"/"+month+"/"+year;
    const exam_time = (req.params.exam_time).toUpperCase();
    try {
        const questions = await Question.find();
        const responses = await Response.find({ user_id });
        let questions_answers = [];
        questions.forEach((question) => {
            responses.forEach((response) => {
                if (question.number == response.question_number) {
                    questions_answers.push({
                        'number': question.number,
                        'question_top': question.question_top,
                        'option1': question.option1,
                        'option2': question.option2,
                        'option3': question.option3,
                        'option4': question.option4,
                        'question_bottom': question.question_bottom,
                        'answer1': question.answer1,
                        'answer2': question.answer2,
                        'answer3': question.answer3,
                        'answer4': question.answer4,
                        'answer': question.answer,
                        'user_answer': response.user_answer
                    });
                }
            })
        })

        function addHorizontalRule(doc, spaceFromEdge = 0, linesAboveAndBelow = 0.5) {
            doc.moveTo(0 + spaceFromEdge, doc.y)
              .lineTo(doc.page.width - spaceFromEdge, doc.y)
              .stroke();
            doc.moveDown(linesAboveAndBelow);
            return doc
          }
        let correct_responses = 0;
        let wrong_responses = 0;
        let score = 0;
        const doc = new PDFDocument();
        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-disposition': `attachment;filename=${exam_name}.pdf`,
        });
        doc.on('data', (chunk) => stream.write(chunk));
        doc.on('end', () => stream.end());
        
        doc.text(`Exam: ${exam_name}`);
        doc.lineGap(5);
        doc.text(`Date: ${exam_date}            Time: ${exam_time}`);
        questions_answers.forEach((qa) => {
            addHorizontalRule(doc,72);
            doc.fillColor('black').text(`QUESTION ${qa.number}`);
            addHorizontalRule(doc,72);
            doc.fillColor('black').text(qa.question_top, { align: 'justify'});
            doc.moveDown();
            doc.fillColor('black').list([qa.option1, qa.option2, qa.option3, qa.option4],{
                listType: 'numbered',
                align: 'justify'
            });
            doc.moveDown();
            doc.fillColor('black').text(qa.question_bottom, {align: 'justify'});

            if(qa.answer === qa.answer1 && qa.user_answer === qa.answer1){
                correct_responses++;
                doc.fillColor('green').text(`${qa.answer1} [Correct Answer][Selected Answer]`);
            }
            else if(qa.answer === qa.answer1){
                doc.fillColor('green').text(`${qa.answer1} [Correct Answer]`);
            }
            else if(qa.user_answer === qa.answer1){
                wrong_responses++;
                doc.fillColor('red').text(`${qa.answer1} [Selected Answer]`);
            }
            else{
                doc.fillColor('black').text(qa.answer1);
            }

            if(qa.answer === qa.answer2 && qa.user_answer === qa.answer2){
                correct_responses++;
                doc.fillColor('green').text(`${qa.answer2} [Correct Answer][Selected Answer]`);
            }
            else if(qa.answer === qa.answer2){
                doc.fillColor('green').text(`${qa.answer2} [Correct Answer]`);
            }
            else if(qa.user_answer === qa.answer2){
                wrong_responses++;
                doc.fillColor('red').text(`${qa.answer2} [Selected Answer]`);
            }
            else{
                doc.fillColor('black').text(qa.answer2);
            }

            if(qa.answer === qa.answer3 && qa.user_answer === qa.answer3){
                correct_responses++;
                doc.fillColor('green').text(`${qa.answer3} [Correct Answer][Selected Answer]`);
            }
            else if(qa.answer === qa.answer3){
                doc.fillColor('green').text(`${qa.answer3} [Correct Answer]`);
            }
            else if(qa.user_answer === qa.answer3){
                wrong_responses++;
                doc.fillColor('red').text(`${qa.answer3} [Selected Answer]`);
            }
            else{
                doc.fillColor('black').text(qa.answer3);
            }

            if(qa.answer === qa.answer4 && qa.user_answer === qa.answer4){
                correct_responses++;
                doc.fillColor('green').text(`${qa.answer4} [Correct Answer][Selected Answer]`);
            }
            else if(qa.answer === qa.answer4){
                doc.fillColor('green').text(`${qa.answer4} [Correct Answer]`);
            }
            else if(qa.user_answer === qa.answer4){
                wrong_responses++;
                doc.fillColor('red').text(`${qa.answer4} [Selected Answer]`);
            }
            else{
                doc.fillColor('black').text(qa.answer4);
            }

            addHorizontalRule(doc,72);
            doc.moveDown();
        })
        doc.fillColor('black').text('CANDIDATE TEST ANALYSIS', {align: 'center'});
        addHorizontalRule(doc,72);
        doc.fillColor('green').text(`CORRECT RESPONSES: ${correct_responses}`);
        doc.fillColor('red').text(`WRONG RESPONSES: ${wrong_responses}`);
        score = correct_responses - (wrong_responses*0.25);
        addHorizontalRule(doc,72);
        doc.fillColor('black').text(`FINAL MARKS: ${score}`);
        addHorizontalRule(doc,72);
        doc.end();
    }
    catch (err) {
        console.log(err);
    }


}
module.exports = {
    index,
    about,
    contact,
    starter_get,
    questions_get,
    question_post,
    response_post,
    user_responses_get,
    response_sheet_get
}