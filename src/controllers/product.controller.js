const { query } = require('../configs/db.config');
const BadRequestError = require('../errors/bad-request-error');

const createProduct = async (req, res) => {
  const { name, description, isActive, image, isFeatured, price, category_id } =
    req.body;

  // Check if product with same name exists
  const cleanName = name.trim();

  const products = await query('SELECT * FROM products WHERE name = ?', [
    cleanName,
  ]);

  if (products.length > 0) {
    throw new BadRequestError('Product already exists!');
  }

  // Check if category exists
  const category = await query('SELECT * FROM categories WHERE id = ?', [
    category_id,
  ]);

  if (category.length === 0) {
    throw new BadRequestError('Category does not exist');
  }

  try {
    const newProduct = await query(
      'INSERT INTO products (name, description, isActive, image, isFeatured, price, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        cleanName,
        description,
        isActive ? isActive : true,
        image,
        isFeatured ? isFeatured : false,
        price,
        category_id,
      ]
    );

    console.log(`Product created successfully...`);

    res.status(201).send({ message: 'Product created successfully' });
  } catch (err) {
    console.log('Error while create product: ', err);
    throw new BadRequestError('Something went wrong');
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await query('SELECT * FROM products');

    console.log(`Found products: ${products.length}`);
    res.status(200).send({ products });
  } catch (err) {
    console.log('Error while get products: ', err);
    throw new BadRequestError('Something went wrong');
  }
};

const getProduct = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('Product not found!');
  }

  try {
    const product = await query('SELECT * FROM products WHERE id = ?', [id]);

    if (product.length === 0) {
      throw new BadRequestError(`Product doesn't exist`);
    }

    console.log(`Product found: ${product[0].name}`);
    res.status(200).send({ product: product[0] });
  } catch (err) {
    console.log('Error while get product: ', err);
    throw new BadRequestError('Something went wrong');
  }
};

const updateProduct = async (req, res) => {
  const {
    id,
    name,
    description,
    isActive,
    image,
    isFeatured,
    price,
    category_id,
  } = req.body;

  const product = await query('SELECT * FROM products WHERE id = ?', [id]);

  if (product.length === 0) {
    throw new BadRequestError(`Product doesn't exist`);
  }

  // Check if category exists
  const category = await query('SELECT * FROM categories WHERE id = ?', [
    category_id,
  ]);

  if (category.length === 0) {
    throw new BadRequestError('Category does not exist');
  }

  try {
    const result = await query('UPDATE products SET ? WHERE id = ?', [
      {
        name,
        description,
        isActive: isActive ? isActive : true,
        image,
        isFeatured: isFeatured ? isFeatured : false,
        price,
        category_id,
      },
      id,
    ]);

    console.log(`Product updated successfully... ${result}`);
    res.status(200).send({ message: 'Product updated successfully' });
  } catch (err) {
    console.log('Error while update product: ', err);
    throw new BadRequestError('Something went wrong');
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.body;

  // Check if product exists
  const product = await query('SELECT * FROM products WHERE id = ?', [id]);

  if (product.length === 0) {
    throw new BadRequestError(`Product doesn't exist`);
  }

  try {
    const result = await query('DELETE FROM products WHERE id =? ', [id]);

    console.log('Product deleted...');

    res.status(200).send({ message: 'Product deleted successfully' });
  } catch (err) {
    console.log('Error while deleting product: ', err);
    throw new BadRequestError('Something went wrong');
  }
};

// --------------- ITEMS ---------------------

const addItem = async (req, res) => {
  const { product_id } = req.body;

  // Check if product exists
  const product = await query('SELECT * FROM products WHERE id = ?', [
    product_id,
  ]);

  if (product.length === 0) {
    throw new BadRequestError(`Product doesn't exist`);
  }

  // Check if the item is already added to cart
  const items = await query(
    'SELECT * FROM cart_items WHERE product_id = ? AND customer_id = ?',
    [product_id, req.currentUser.id]
  );

  if (items.length > 0) {
    const result = await query(
      'UPDATE cart_items SET quantity = quantity + 1 WHERE product_id = ? AND customer_id = ?',
      [product_id, req.currentUser.id]
    );
  } else {
    const result = await query(
      'INSERT INTO cart_items (quantity, product_id, customer_id) VALUES (?, ?, ?)',
      [1, product_id, req.currentUser.id]
    );
  }

  res.status(200).send({ message: 'Cart item added/updated' });
};

const removeItem = async (req, res) => {
  const { product_id } = req.body;

  // Check if product exists
  const product = await query('SELECT * FROM products WHERE id = ?', [
    product_id,
  ]);

  if (product.length === 0) {
    throw new BadRequestError(`Product doesn't exist`);
  }

  // Check if the item is already added to cart
  const items = await query(
    'SELECT * FROM cart_items WHERE product_id = ? AND customer_id = ?',
    [product_id, req.currentUser.id]
  );

  if (items.length === 0) {
    throw new BadRequestError('Item not found');
  }

  if (items[0].quantity > 1) {
    const result = await query(
      'UPDATE cart_items SET quantity = quantity - 1 WHERE product_id = ? AND customer_id = ?',
      [product_id, req.currentUser.id]
    );
  } else {
    const result = await query(
      'DELETE FROM cart_items WHERE product_id = ? AND customer_id = ?',
      [product_id, req.currentUser.id]
    );
  }

  res.status(200).send({ message: 'Cart item removed' });
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  addItem,
  removeItem,
};
