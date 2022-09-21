const { body } = require('express-validator');
const requireAuth = require('../middlewares/require-auth');
const validateRequest = require('../middlewares/validate-request');

const categoryController = require('../controllers/category.controller');

const router = require('express').Router();

// Create Category
router.post(
  '/',
  requireAuth,
  [body('name').trim().notEmpty().withMessage('Name is required')],
  validateRequest,
  categoryController.createCategory
);

// Get Categories
router.get('/', categoryController.getCategories);

// Get Category
router.get('/:id', categoryController.getCategory);

// Update Category
router.put(
  '/',
  requireAuth,
  [
    body('id').notEmpty().withMessage('ID is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  validateRequest,
  categoryController.updateCategory
);

// Delete Category
router.delete(
  '/',
  requireAuth,
  [body('id').notEmpty().withMessage('ID is required')],
  validateRequest,
  categoryController.deleteCategory
);

module.exports = router;
