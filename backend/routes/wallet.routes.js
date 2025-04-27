const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All wallet routes require authentication
router.use(authenticate);

router.post('/add-funds', walletController.addFunds);
router.post('/pay-order', walletController.payForOrder);
router.get('/transactions', walletController.getTransactions);
router.get('/balance', walletController.getBalance);

module.exports = router;