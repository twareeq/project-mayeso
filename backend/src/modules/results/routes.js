const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate, rbac } = require('../../middleware/auth');

router.get('/student/:studentId', authenticate, controller.getStudentResult);
router.get('/class/:classId', authenticate, controller.getClassResults);
router.patch('/:resultId/remarks', authenticate, rbac(['teacher', 'head_teacher', 'admin']), controller.updateRemarks);

module.exports = router;
