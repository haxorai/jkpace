const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userExamSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    exam: {
        type: String,
        required: true
    },
    fee_paid: {
        type: String
    },
    marks: {
        type: Number
    }
});
const UserExam = mongoose.model('userexam', userExamSchema);

module.exports = UserExam;