const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate, rbac } = require('../../middleware/auth');
const { auditLogger } = require('../../middleware/audit');

router.get('/', authenticate, controller.listAssignments);
router.post('/', authenticate, rbac(['head_teacher', 'admin']), auditLogger('teacher_assignment.create', 'teacher_assignments'), controller.assignTeacher);
router.delete('/:id', authenticate, rbac(['head_teacher', 'admin']), auditLogger('teacher_assignment.delete', 'teacher_assignments'), controller.removeAssignment);

module.exports = router;
