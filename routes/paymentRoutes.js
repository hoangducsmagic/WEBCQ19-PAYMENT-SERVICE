const express = require('express')
const router = express.Router();
const paymentController=require('../controllers/paymentController')


router.post('/pay', paymentController.pay);
router.post('/charge', paymentController.charge);
router.get('/history', paymentController.getPaymentHistory);

module.exports = router;