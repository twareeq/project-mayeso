const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate, rbac } = require('../../middleware/auth');
const { auditLogger } = require('../../middleware/audit');

router.get('/', authenticate, controller.getMarks);
router.post('/bulk', authenticate, rbac(['teacher', 'admin']), auditLogger('marks.bulk_enter', 'marks'), controller.enterBulkMarks);

module.exports = router;
