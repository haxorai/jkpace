const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const examSchema = new Schema({
    name: {
        type: String,
        reqquired: true
    },
    date: {
        type: String,
        required: [true, "The date should be in dd/mm/yyyy format"],
        trim: true
    },
    time: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: String,
        required: true,
        trim: true
    },
    topper_prize: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
        trim: true
    }
}); 

const Exam = mongoose.model('exam', examSchema);

module.exports = Exam;