const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responseSchema = new Schema({
    user_id: {
        type: String,
        required: true,
    },
    question_number: {
        type: Number,
        required: true,
    },
    user_answer: {
        type: String,
        required: true
    }
}); 

const Response = mongoose.model('response', responseSchema);

module.exports = Response;