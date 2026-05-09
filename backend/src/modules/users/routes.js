const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate, rbac } = require('../../middleware/auth');
const { auditLogger } = require('../../middleware/audit');

router.get('/', authenticate, rbac(['admin', 'head_teacher']), controller.listUsers);
router.post('/', authenticate, rbac(['admin']), auditLogger('user.create', 'profiles'), controller.createUser);

module.exports = router;
