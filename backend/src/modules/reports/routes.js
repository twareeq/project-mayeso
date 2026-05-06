const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate } = require('../../middleware/auth');

router.post('/student', authenticate, controller.getStudentReport);

module.exports = router;
