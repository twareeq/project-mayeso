const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate, rbac } = require('../../middleware/auth');
const { auditLogger } = require('../../middleware/audit');

router.get('/', authenticate, controller.listClasses);
router.post('/', authenticate, rbac(['head_teacher', 'admin']), auditLogger('class.create', 'classes'), controller.createClass);
router.delete('/:id', authenticate, rbac(['head_teacher', 'admin']), auditLogger('class.delete', 'classes'), controller.deleteClass);

module.exports = router;
