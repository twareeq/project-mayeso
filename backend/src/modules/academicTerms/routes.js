const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authenticate, rbac } = require('../../middleware/auth');

router.get('/', authenticate, controller.listTerms);
router.post('/', authenticate, rbac(['admin']), controller.createTerm);

module.exports = router;
