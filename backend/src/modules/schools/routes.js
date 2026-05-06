const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate, rbac } = require('../../middleware/auth');

router.get('/', authenticate, controller.listSchools);
router.get('/:id', authenticate, controller.getSchoolById);
router.post('/', authenticate, rbac(['admin']), controller.createSchool);

module.exports = router;
