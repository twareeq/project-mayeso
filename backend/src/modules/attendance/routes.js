const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate, rbac } = require('../../middleware/auth');
const { auditLogger } = require('../../middleware/audit');

router.get('/', authenticate, controller.getAttendance);
router.post('/bulk', authenticate, rbac(['teacher', 'admin']), auditLogger('attendance.bulk_mark', 'attendance'), controller.markBulkAttendance);

module.exports = router;
