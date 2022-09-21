const { query } = require('../configs/db.config');
const BadRequestError = require('../errors/bad-request-error');

const createCategory = async (req, res) => {
  const { name, isActive, image } = req.body;

  // Check if category with same name exists
  const cleanName = name.trim();

  const categories = await query('SELECT * FROM categories WHERE name = ?', [
    cleanName,
  ]);

  if (categories.length > 0) {
    throw new BadRequestError('Category already exists!');
  }

  try {
    const newCategory = await query(
      'INSERT INTO categories (name, isActive, image) VALUES (?, ?, ?)',
      [cleanName, isActive ? isActive : true, image]
    );

    console.log('Category created successfully...');

    res.status(201).send({ message: 'Category created successfully' });
  } catch (err) {
    console.log('Error while create category: ', err);
    throw new BadRequestError('Something went wrong');
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories');

    console.log(`Found categories: ${categories.length}`);
    res.status(200).send({ categories });
  } catch (err) {
    console.log('Error while get categories: ', err);
    throw new BadRequestError('Something went wrong');
  }
};

const getCategory = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('Category not found!');
  }

  try {
    const category = await query('SELECT * FROM categories WHERE id = ?', [id]);

    if (category.length === 0) {
      throw new BadRequestError(`Category doesn't exist`);
    }

    console.log(`Category found: ${category[0].name}`);
    res.status(200).send({ category: category[0] });
  } catch (err) {
    console.log('Error while get category: ', err);
    throw new BadRequestError('Something went wrong');
  }
};

const updateCategory = async (req, res) => {
  const { id, name, isActive, image } = req.body;

  const category = await query('SELECT * FROM categories WHERE id = ?', [id]);

  if (category.length === 0) {
    throw new BadRequestError(`Category doesn't exist`);
  }

  try {
    const result = await query('UPDATE categories SET ? WHERE id = ?', [
      { name, isActive, image },
      id,
    ]);

    console.log(`Category updated successfully... ${result}`);
    res.status(200).send({ message: 'Category updated successfully' });
  } catch (err) {
    console.log('Error while update category: ', err);
    throw new BadRequestError('Something went wrong');
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.body;

  // Check if category exists
  const category = await query('SELECT * FROM categories WHERE id = ?', [id]);

  if (category.length === 0) {
    throw new BadRequestError(`Category doesn't exist`);
  }

  const products = await query('SELECT * FROM products WHERE category_id = ?', [
    id,
  ]);

  if (products.length > 0) {
    throw new BadRequestError(
      `Cannot delete category while ${products.length} products are still in this category.`
    );
  }

  try {
    const result = await query('DELETE FROM categories WHERE id =? ', [id]);

    console.log('Category deleted...');

    res.status(200).send({ message: 'Category deleted successfully' });
  } catch (err) {
    console.log('Error while deleting category: ', err);
    throw new BadRequestError('Something went wrong');
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
