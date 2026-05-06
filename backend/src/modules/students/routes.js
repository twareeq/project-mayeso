const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate, rbac } = require('../../middleware/auth');
const { auditLogger } = require('../../middleware/audit');

router.get('/', authenticate, controller.listStudents);
router.get('/:id', authenticate, controller.getStudentById);
router.post('/', authenticate, rbac(['teacher', 'head_teacher', 'admin']), auditLogger('student.register', 'students'), controller.registerStudent);

module.exports = router;
