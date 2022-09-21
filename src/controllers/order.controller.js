const { query } = require('../configs/db.config');

const createOrder = async (req, res) => {
  // Get the cart items for the current user
  const cartItems = await query(
    'SELECT cart_items.quantity, products.price, products.name FROM `cart_items` INNER JOIN `products` ON cart_items.product_id = products.id WHERE customer_id = ?',
    [req.currentUser.id]
  );

  const total = cartItems.reduce((acc, item) => {
    return acc + item.quantity * item.price;
  }, 0);

  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Create a new order
  const order = await query(
    'INSERT INTO orders (total, orderDate, status, customer_id) VALUES (?, ?, ?, ?)',
    [total, date, 'SUCCESS', req.currentUser.id]
  );

  // Create order items
  const orderItems = await query(
    'INSERT INTO order_items (quantity, name, price, order_id) VALUES ?',
    [
      cartItems.map((item) => [
        item.quantity,
        item.name,
        item.price,
        order.insertId,
      ]),
    ]
  );

  // Delete cart items
  await query('DELETE FROM cart_items WHERE customer_id = ?', [
    req.currentUser.id,
  ]);

  res.status(201).send({
    message: 'Order created successfully',
  });
};

const getOrders = async (req, res) => {
  try {
    let orders;
    if (req.currentUser.isAdmin) {
      orders = await query('SELECT * FROM orders');
    } else {
      orders = await query('SELECT * FROM orders WHERE customer_id = ?', [
        req.currentUser.id,
      ]);
    }

    console.log(`Found orders: ${orders.length}`);
    res.status(200).send({ orders });
  } catch (err) {
    console.log('Error while get orders: ', err);
    throw new BadRequestError('Something went wrong');
  }
};

const getOrder = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('Order not found!');
  }

  try {
    const result = await query(
      'SELECT * FROM `orders` INNER JOIN `order_items` ON order_items.order_id = orders.id WHERE order_id = ?',
      [id]
    );

    if (result.length === 0) {
      throw new BadRequestError(`Order doesn't exist`);
    }

    const order = {
      id: result[0].order_id,
      total: result[0].total,
      orderDate: result[0].orderDate,
      status: result[0].status,
      orderItems: result.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
      })),
    };

    res.status(200).send({ order });
  } catch (err) {
    console.log('Error while get order: ', err);
    throw new BadRequestError('Something went wrong');
  }
};

const cancelOrder = async (req, res) => {
  const { id } = req.body;

  try {
    const result = await query('UPDATE orders SET status = ? WHERE id = ?', [
      'CANCELLED',
      id,
    ]);

    if (result.affectedRows === 0) {
      throw new BadRequestError(`Order doesn't exist`);
    }

    res.status(200).send({ message: 'Order cancelled successfully' });
  } catch (err) {
    console.log('Error while cancel order: ', err);
    throw new BadRequestError('Something went wrong');
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
};
