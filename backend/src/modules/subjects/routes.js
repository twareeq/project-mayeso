const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate, rbac } = require('../../middleware/auth');
const { auditLogger } = require('../../middleware/audit');

router.get('/', authenticate, controller.listSubjects);
router.post('/', authenticate, rbac(['head_teacher', 'admin']), auditLogger('subject.create', 'subjects'), controller.createSubject);
router.delete('/:id', authenticate, rbac(['head_teacher', 'admin']), auditLogger('subject.delete', 'subjects'), controller.deleteSubject);

module.exports = router;
