const express = require('express');

const ragController = require('../controllers/rag.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.post('/search', protect, authorizeRoles('STUDENT', 'COMPANY', 'ADMIN'), ragController.searchDocuments);
router.post('/ask', protect, authorizeRoles('STUDENT', 'COMPANY', 'ADMIN'), ragController.askQuestion);

router.use(protect, authorizeRoles('ADMIN'));

router.get('/documents', ragController.getDocuments);
router.get('/documents/:id', ragController.getDocumentById);

module.exports = router;
