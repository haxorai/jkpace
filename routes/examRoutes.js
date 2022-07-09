const express = require('express');

const https = require('https');

const examController = require('../controllers/examController');

const { requireAuth } = require('../middleware/authMiddleware');


const router = express.Router();


/* GET home page. */
router.get('/', examController.index);
router.get('/about', examController.about);
router.get('/contact', examController.contact);
router.post('/contact-post', examController.contact_post);
router.get('/starter/:exam_name/:day/:month/:year/:exam_time', requireAuth, examController.starter_get);
router.get('/questions/:exam_name',requireAuth, examController.questions_get);
router.post('/question-post', examController.question_post);
router.post('/response-post', examController.response_post);
router.get('/user-responses/:exam_name/:user_id', requireAuth, examController.user_responses_get);
router.get('/response-sheet/:user_id/:exam_name/:day/:month/:year/:exam_time', requireAuth, examController.response_sheet_get);

module.exports = router;
