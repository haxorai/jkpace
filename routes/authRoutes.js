const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');


const router = express.Router();

router.get('/signup', authController.signup_get);
router.post('/signupforaccount', authController.signupforaccount_post)
router.get('/account/:id', requireAuth, authController.account_get);
router.get('/login', authController.login_get);
router.post('/loginforaccount', authController.loginforaccount_post)
router.post('/search-phone', authController.search_phone_post);
router.put('/update-password', authController.update_password_put);
router.get('/signupandpay/:exam/:price', authController.signupandpay_get);
router.post('/signup', authController.signup_post);
router.get('/loginandpay/:exam/:price', authController.loginandpay_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);
router.put('/update-user-profile', authController.update_user_profile_put);
router.get('/admin-login', authController.admin_login_get);
router.post('/admin-login-post', authController.admin_login_post);
router.post('/search-admin-phone', authController.search_admin_phone_post);
router.put('/update-admin-password', authController.update_admin_password_put);
router.get('/admin-logout', authController.admin_logout_get);
router.get('/haxorai', authController.superuser_get);
router.post('/superuser-login-post', authController.superuser_login_post);
router.post('/search-superuser-phone', authController.search_superuser_phone_post);
router.put('/update-superuser-password', authController.update_superuser_password_put);
router.get('/superuser-logout', authController.superuser_logout_get);

module.exports = router;
