const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate, rbac } = require('../../middleware/auth');

router.get('/', authenticate, controller.listExams);
router.post('/', authenticate, rbac(['teacher', 'head_teacher', 'admin']), controller.createExam);
router.patch('/:id/lock', authenticate, rbac(['head_teacher', 'admin']), controller.toggleExamLock);

module.exports = router;
