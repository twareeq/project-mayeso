const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate, rbac } = require('../../middleware/auth');
const { auditLogger } = require('../../middleware/audit');

router.get('/', authenticate, controller.listLessonPlans);
router.get('/:id', authenticate, controller.getLessonPlanById);
router.post('/', authenticate, rbac(['teacher']), auditLogger('lesson_plan.create', 'lesson_plans'), controller.createLessonPlan);
router.post('/:id/submit', authenticate, rbac(['teacher']), auditLogger('lesson_plan.submit', 'lesson_plans'), controller.submitLessonPlan);
router.post('/:id/review', authenticate, rbac(['section_head', 'head_teacher', 'admin']), auditLogger('lesson_plan.review', 'lesson_plans'), controller.reviewLessonPlan);

module.exports = router;
