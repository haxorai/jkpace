const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    number: {
        type: Number,
        required: true,
        unique: true
    },
    question_top: {
        type: String,
        required: true
    },
    option1: {
        type: String,
        required: true
    },
    option2: {
        type: String,
        required: true
    },
    option3: {
        type: String,
        required: true
    },
    option4: {
        type: String,
        required: true
    },
    question_bottom: {
        type: String
    },
    answer1: {
        type: String,
        required: true
    },
    answer2: {
        type: String,
        required: true
    },
    answer3: {
        type: String,
        required: true
    },
    answer4: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
}); 

const Question = mongoose.model('question', questionSchema);

module.exports = Question;