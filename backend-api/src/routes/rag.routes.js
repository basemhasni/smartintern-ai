const express = require('express');

const ragController = require('../controllers/rag.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect, authorizeRoles('ADMIN'));

router.get('/documents', ragController.getDocuments);
router.get('/documents/:id', ragController.getDocumentById);

module.exports = router;
