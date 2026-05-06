const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate, rbac } = require('../../middleware/auth');
const { auditLogger } = require('../../middleware/audit');

router.get('/', authenticate, controller.listSections);
router.post('/', authenticate, rbac(['head_teacher', 'admin']), auditLogger('section.create', 'sections'), controller.createSection);
router.delete('/:id', authenticate, rbac(['head_teacher', 'admin']), auditLogger('section.delete', 'sections'), controller.deleteSection);

module.exports = router;
