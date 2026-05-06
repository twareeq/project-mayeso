const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate } = require('../../middleware/auth');

router.post('/login', controller.login);
router.get('/me', authenticate, controller.getMe);

module.exports = router;
