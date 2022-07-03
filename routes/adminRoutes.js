const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAdminAuth, requireSuperuserAuth, checkSuperuser} = require('../middleware/authMiddleware');


const router = express.Router();

router.get('/superuser/home', requireSuperuserAuth, adminController.haxorai_get);
router.get('/admin', requireAdminAuth, adminController.admin_get);
router.get('/admin/question-paper', requireAdminAuth, adminController.question_paper_get);
router.post('/signup-admin', adminController.signup_admin_post);
router.post('/delete-admin', adminController.delete_admin_post);
router.post('/delete-exam', adminController.delete_exam_post);
router.post('/create-exam', adminController.create_exam_post);
router.get('/admin/user-examinations', requireAdminAuth, adminController.user_examinations_get);
router.post('/search-exams', adminController.search_exams_post);
router.post('/delete-details', adminController.delete_details_post);
router.get('/admin/user-responses', requireAdminAuth, adminController.user_responses_get);
router.post('/search-responses', adminController.search_responses_post);
router.delete('/delete-every-response', adminController.delete_every_response);
router.get('/admin/registered-users', requireAdminAuth, adminController.registered_users_get);
router.post('/search-user', adminController.search_user_post);
router.delete('/delete-every-user', adminController.delete_every_user);
router.post('/search-question', adminController.search_question_post);
router.put('/update-question', adminController.update_question_put);
router.delete('/delete-question', adminController.delete_question);
router.get('/admin/analysis', requireAdminAuth, adminController.analysis_get);
router.post('/search-exam-details', adminController.search_exam_details_post);
router.get('/download-analysis-sheet/:exam_name', requireAdminAuth, adminController.download_analysis_sheet_get);
module.exports = router;

