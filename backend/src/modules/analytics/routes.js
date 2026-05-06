const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate } = require('../../middleware/auth');

router.get('/student/:id', authenticate, controller.getStudentPerformance);
router.get('/class/:id', authenticate, controller.getClassSummary);
router.get('/school/:schoolId/at-risk', authenticate, controller.getAtRiskStudents);
router.get('/attendance/class/:id', authenticate, controller.getAttendanceTrend);

module.exports = router;
