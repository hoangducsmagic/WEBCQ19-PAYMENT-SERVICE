const express = require('express')
const router = express.Router();
const accountController=require('../controllers/accountController')
const authController = require('../controllers/authController')

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/changePassword', authController.changePassword);
router.get('/info', accountController.getAccountInfo);

module.exports = router;