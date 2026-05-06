const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate, rbac } = require('../../middleware/auth');
const { auditLogger } = require('../../middleware/audit');

// Open to all authenticated users for reading configs like current term
router.get('/', authenticate, controller.getConfig);

// Only admins can update the system config
router.post('/', authenticate, rbac(['admin']), auditLogger('config.update', 'system_config'), controller.updateConfig);

module.exports = router;
