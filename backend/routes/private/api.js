const db = require('/Users/mokaa/Desktop/Software_Momo/backend/config/db');
const authMiddleware = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');


function getUser(req) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Unauthorized: No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        return decoded; // Returns { user_id, role }
    } catch (error) {
        console.error('getUser Error:', error.message);
        return null; // Return null if token is invalid or missing
    }
}

function handlePrivateBackendApi(app) {
    
    // Route: GET /api/v1/users/view
    app.get('/api/v1/users/view', async (req, res) => {
        try {
            // Check if the user has 'admin' role
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden: Admins only' });
            }
    
            // Fetch all users from the database
            const users = await db('Project.Users')
                .select('user_id', 'username', 'email', 'role', 'created_at') // Ensure 'user_id' is selected
                .orderBy('created_at', 'desc');
    
            res.status(200).json({
                message: 'List of all users',
                users: users
            });
        } catch (error) {
            console.error('Error fetching users:', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    
    

        // Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const imagesPath = path.join(__dirname, '../../../frontend/images');
        cb(null, imagesPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

    // Route: POST /api/v1/equipment/new
    app.post('/api/v1/equipment/new', upload.single('equipment_img'), async (req, res) => {
        try {
            // Check if the user is an admin
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden: Only admins can add equipment.' });
            }
    
            // Extract equipment details from the request body
            const {
                equipment_name,
                rating,
                model_number,
                purchase_date,
                quantity,
                status,
                location,
                category_name,
                supplier_name,
            } = req.body;
    
            // Validate required fields
            if (!equipment_name || !quantity || !status || !category_name || !supplier_name) {
                return res.status(400).json({
                    error: 'Missing required fields: equipment_name, quantity, status, category_name, supplier_name',
                });
            }
    
            // Get the file path if an image was uploaded
            const equipment_img = req.file ? `/images/${req.file.filename}` : null;
    
            // Check if category_name exists in the database
            let [category] = await db('Project.Categories')
                .select('category_id')
                .where('category_name', category_name);
    
            // If category does not exist, insert it and retrieve the new category_id
            if (!category) {
                [category] = await db('Project.Categories')
                    .insert({ category_name })
                    .returning('category_id');
            }
    
            const category_id = category.category_id;
    
            // Check if supplier_name exists in the database
            let [supplier] = await db('Project.Suppliers')
                .select('supplier_id')
                .where('supplier_name', supplier_name);
    
            // If supplier does not exist, insert it and retrieve the new supplier_id
            if (!supplier) {
                [supplier] = await db('Project.Suppliers')
                    .insert({ supplier_name })
                    .returning('supplier_id');
            }
    
            const supplier_id = supplier.supplier_id;
    
            // Insert new equipment into the database
            const [newEquipment] = await db('Project.Equipments')
                .insert({
                    equipment_name,
                    equipment_img,
                    rating: rating || 5, // Default value of 5 if not provided
                    model_number,
                    purchase_date,
                    quantity,
                    status,
                    location,
                    category_id, // Auto-generated ID
                    supplier_id, // Auto-generated ID
                })
                .returning('*');
    
            // Respond with the newly created equipment
            res.status(201).json({
                message: 'Equipment created successfully.',
                equipment: newEquipment,
            });
        } catch (error) {
            console.error('Error creating equipment:', error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });
    

    // Route: PUT /api/v1/equipment/:id
    app.put('/api/v1/equipment/:id', async (req, res) => {
        try {
            const equipmentId = req.params.id;
    
            // Check if the equipment exists
            const equipment = await db('Project.Equipments')
                .where('equipment_id', equipmentId)
                .first();
    
            if (!equipment) {
                return res.status(404).json({ error: 'Equipment not found.' });
            }
    
            // Build the update object dynamically
            const { equipment_name, model_number, quantity, status } = req.body;
            const updateFields = {};
    
            if (equipment_name) updateFields.equipment_name = equipment_name;
            if (model_number) updateFields.model_number = model_number;
            if (quantity) updateFields.quantity = quantity;
            if (status) updateFields.status = status;
    
            // Update the equipment in the database
            await db('Project.Equipments')
                .where('equipment_id', equipmentId)
                .update(updateFields);
    
            // Fetch the updated equipment
            const updatedEquipment = await db('Project.Equipments')
                .where('equipment_id', equipmentId)
                .first();
    
            res.status(200).json({
                message: 'Equipment updated successfully.',
                equipment: updatedEquipment,
            });
        } catch (error) {
            console.error('Error updating equipment:', error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });
    
    
    
    app.get('/api/v1/equipment/:id', async (req, res) => {
        try {
            const equipmentId = req.params.id;
    
            // Fetch the equipment details
            const equipment = await db('Project.Equipments')
                .where('equipment_id', equipmentId)
                .first();
    
            if (!equipment) {
                return res.status(404).json({ error: 'Equipment not found.' });
            }
    
            res.status(200).json(equipment);
        } catch (error) {
            console.error('Error fetching equipment:', error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });
    

    // Route: DELETE /api/v1/equipment/:id
    app.delete('/api/v1/equipment/:id', async (req, res) => {
        try {
            // Check if the user is an admin
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden: Only admins can delete equipment.' });
            }

            const equipmentId = req.params.id;

            // Check if the equipment exists
            const equipment = await db('Project.Equipments')
                .where('equipment_id', equipmentId)
                .first();

            if (!equipment) {
                return res.status(404).json({ error: 'Equipment not found.' });
            }

            // Delete the equipment
            await db('Project.Equipments')
                .where('equipment_id', equipmentId)
                .del();

            res.status(200).json({
                message: `Equipment with ID ${equipmentId} deleted successfully.`,
            });
        } catch (error) {
            console.error('Error deleting equipment:', error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });


    // Route: POST /api/v1/cart/new
    app.post('/api/v1/cart/new', async (req, res) => {
        try {
            const currentUser = getUser(req);
    
            if (!currentUser) {
                return res.status(401).json({ error: 'Unauthorized: Invalid or missing token.' });
            }
    
            const { user_id } = currentUser; // Get user_id from the token
            const { equipment_id, quantity } = req.body;
    
            // Validate inputs
            if (!equipment_id || !quantity || quantity <= 0) {
                return res.status(400).json({
                    error: 'Invalid input: equipment_id and positive quantity are required.',
                });
            }
    
            // Check if the equipment exists
            const equipment = await db('Project.Equipments')
                .where('equipment_id', equipment_id)
                .first();
    
            if (!equipment) {
                return res.status(404).json({ error: 'Equipment not found.' });
            }
    
            // Ensure the quantity is sufficient
            if (equipment.quantity < quantity) {
                return res.status(400).json({
                    error: `Not enough stock. Available quantity: ${equipment.quantity}.`,
                });
            }
    
            // Check if the item already exists in the cart
            const cartItem = await db('Project.Cart')
                .where({ user_id: user_id, equipment_id: equipment_id })
                .first();
    
            if (cartItem) {
                // Update the cart quantity
                await db('Project.Cart')
                    .where({ user_id: user_id, equipment_id: equipment_id })
                    .update({
                        quantity: cartItem.quantity + quantity,
                    });
            } else {
                // Add new item to the cart
                await db('Project.Cart').insert({
                    user_id: user_id,
                    equipment_id: equipment_id,
                    quantity: quantity,
                });
            }
    
            // Update the equipment quantity and status
            const newQuantity = equipment.quantity - quantity;
            const newStatus = newQuantity === 0 ? 'In Use' : 'Available';
    
            await db('Project.Equipments')
                .where('equipment_id', equipment_id)
                .update({
                    quantity: newQuantity,
                    status: newStatus,
                });
    
            res.status(201).json({ message: 'Item added to cart successfully.' });
        } catch (error) {
            console.error('Error adding to cart:', error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });
    
    
    


    // Example: Add Rating Route using getUser
    app.post('/api/v1/rating/new', async (req, res) => {
        try {
            const currentUser = getUser(req);

            if (!currentUser) {
                return res.status(401).json({ error: 'Unauthorized: Invalid or missing token.' });
            }

            const { user_id } = currentUser;
            const { equipment_id, comment, score } = req.body;

            if (!equipment_id || !score) {
                return res.status(400).json({ error: 'Missing required fields: equipment_id, score.' });
            }

            if (score < 1 || score > 5) {
                return res.status(400).json({ error: 'Score must be between 1 and 5.' });
            }

            const equipment = await db('Project.Equipments')
                .where('equipment_id', equipment_id)
                .first();

            if (!equipment) {
                return res.status(404).json({ error: 'Equipment not found.' });
            }

            await db('Project.Rating').insert({
                user_id: user_id,
                equipment_id,
                comment: comment || null,
                score: score,
            });

            res.status(201).json({ message: 'Successfully added rating.' });
        } catch (error) {
            console.error('Error adding rating:', error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });

    app.get('/api/v1/orders/view', async (req, res) => {
        try {
            const currentUser = getUser(req);
    
            if (!currentUser) {
                return res.status(401).json({ error: 'Unauthorized: Invalid or missing token.' });
            }
    
            const { user_id } = currentUser;
    
            // Fetch all orders for the user
            const orders = await db('Project.Orders')
                .where('user_id', user_id)
                .select('order_id', 'date');
    
            // For each order, fetch the items and their rating state
            const ordersWithItems = await Promise.all(
                orders.map(async (order) => {
                    const items = await db('Project.EquipmentOrder as eo')
                        .join('Project.Equipments as e', 'eo.equipment_id', 'e.equipment_id')
                        .leftJoin('Project.Rating as r', function () {
                            this.on('r.equipment_id', 'e.equipment_id')
                                .andOn('r.user_id', '=', user_id); // Check if the user has rated this item
                        })
                        .where('eo.order_id', order.order_id)
                        .select(
                            'e.equipment_id',
                            'e.equipment_name',
                            'eo.quantity',
                            'r.score as user_rating' // Null if not rated
                        );
    
                    return { ...order, items };
                })
            );
    
            res.status(200).json({ orders: ordersWithItems });
        } catch (error) {
            console.error('Error fetching orders:', error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });
    
    
    // Route: DELETE /api/v1/cart/delete/:cartId
    app.delete('/api/v1/cart/delete/:cartId', async (req, res) => {
        try {
            // Step 1: Authenticate user and extract user_id
            const currentUser = getUser(req);

            if (!currentUser) {
                return res.status(401).json({ error: 'Unauthorized: Invalid or missing token.' });
            }

            const { user_id } = currentUser; // Extract user_id from the token
            const { cartId } = req.params; // Extract cartId from URL params

            // Step 2: Check if the cart item exists and belongs to the user
            const cartItem = await db('Project.Cart')
                .where({ cart_id: cartId, user_id: user_id })
                .first();

            if (!cartItem) {
                return res.status(404).json({
                    error: 'Cart item not found or you do not have permission to delete it.',
                });
            }

            // Step 3: Delete the cart item
            await db('Project.Cart')
                .where({ cart_id: cartId, user_id: user_id })
                .del();

            res.status(200).json({ message: 'Cart item deleted successfully.' });
        } catch (error) {
            console.error('Error deleting cart item:', error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });

    // Route: POST /api/v1/order/new
    app.post('/api/v1/order/new', async (req, res) => {
        try {
            const currentUser = getUser(req);
    
            if (!currentUser) {
                return res.status(401).json({ error: 'Unauthorized: Invalid or missing token.' });
            }
    
            const { user_id } = currentUser;
    
            // Step 1: Fetch all cart items for the user
            const cartItems = await db('Project.Cart')
                .where('user_id', user_id)
                .select('equipment_id', 'quantity');
    
            if (!cartItems || cartItems.length === 0) {
                return res.status(400).json({ error: 'Your cart is empty. Add items to your cart before placing an order.' });
            }
    
            // Step 2: Group cart items by equipment_id to avoid duplicates
            const groupedItems = cartItems.reduce((acc, item) => {
                if (acc[item.equipment_id]) {
                    acc[item.equipment_id] += item.quantity;
                } else {
                    acc[item.equipment_id] = item.quantity;
                }
                return acc;
            }, {});
    
            // Step 3: Create a new order
            const [newOrder] = await db('Project.Orders')
                .insert({
                    user_id: user_id,
                    date: new Date(),
                })
                .returning('order_id'); // Get the newly created order ID
    
            // Step 4: Prepare data for insertion into EquipmentOrder
            const equipmentOrderData = Object.entries(groupedItems).map(([equipment_id, quantity]) => ({
                order_id: newOrder.order_id,
                equipment_id: parseInt(equipment_id, 10),
                quantity,
            }));
    
            // Step 5: Insert grouped items into EquipmentOrder
            for (const record of equipmentOrderData) {
                await db('Project.EquipmentOrder')
                    .insert(record)
                    .onConflict(['order_id', 'equipment_id']) // Handle duplicates gracefully
                    .merge(); // Updates existing rows if they exist
            }
    
            // Step 6: Clear the user's cart
            await db('Project.Cart').where('user_id', user_id).del();
    
            res.status(201).json({
                message: 'Order placed successfully.',
                order_id: newOrder.order_id,
            });
        } catch (error) {
            console.error('Error creating order:', error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });
    
    


    // Route: GET /api/v1/cart/view
app.get('/api/v1/cart/view', async (req, res) => {
    try {
        // Step 1: Authenticate user and extract user_id
        const currentUser = getUser(req);

        if (!currentUser) {
            return res.status(401).json({ error: 'Unauthorized: Invalid or missing token.' });
        }

        const { user_id } = currentUser; // Extract user_id from the token

        // Step 2: Fetch all cart items for the current user
        const cartItems = await db('Project.Cart as c')
            .select(
                'c.cart_id',
                'e.equipment_name',
                'e.model_number',
                'c.quantity',
                'e.category_id',
                'e.status',
                'e.rating',
                's.supplier_name'
            )
            .leftJoin('Project.Equipments as e', 'c.equipment_id', 'e.equipment_id')
            .leftJoin('Project.Suppliers as s', 'e.supplier_id', 's.supplier_id')
            .where('c.user_id', user_id);

        // Step 3: Check if cart is empty
        if (!cartItems || cartItems.length === 0) {
            return res.status(200).json({ message: 'Your cart is empty.', cart: [] });
        }

        // Step 4: Return cart items
        res.status(200).json({
            message: 'Cart retrieved successfully.',
            cart: cartItems,
        });
    } catch (error) {
        console.error('Error fetching cart items:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


app.post('/api/v1/cart/remove-item', async (req, res) => {
    try {
        const { model_number } = req.body;

        if (!model_number) {
            return res.status(400).json({ error: 'Invalid input: model_number is required.' });
        }

        // Find the cart item based on the model_number
        const cartItem = await db('Project.Cart as c')
            .leftJoin('Project.Equipments as e', 'c.equipment_id', 'e.equipment_id')
            .select('c.cart_id', 'c.quantity', 'e.equipment_id', 'e.quantity as equipment_quantity')
            .where('e.model_number', model_number)
            .first();

        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found.' });
        }

        const { cart_id, equipment_id, equipment_quantity, quantity } = cartItem;

        if (quantity > 1) {
            // Decrement the quantity in the cart
            await db('Project.Cart')
                .where({ cart_id })
                .update({ quantity: quantity - 1 });

            // Increment the quantity in the equipment inventory
            await db('Project.Equipments')
                .where({ equipment_id })
                .update({
                    quantity: equipment_quantity + 1,
                    status: equipment_quantity + 1 > 0 ? 'Available' : 'Out of Stock',
                });

            res.status(200).json({ message: 'Item quantity reduced by 1.' });
        } else {
            // Remove the item from the cart if quantity is 1
            await db('Project.Cart').where({ cart_id }).del();

            // Increment the quantity in the equipment inventory
            await db('Project.Equipments')
                .where({ equipment_id })
                .update({
                    quantity: equipment_quantity + 1,
                    status: equipment_quantity + 1 > 0 ? 'Available' : 'Out of Stock',
                });

            res.status(200).json({ message: 'Item removed from cart.' });
        }
    } catch (error) {
        console.error('Error removing item from cart:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get('/api/v1/equipment', async (req, res) => {
    try {
        // Validate the user and their role (optional)
        const currentUser = getUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: 'Unauthorized: Invalid or missing token.' });
        }

        // Fetch all equipment from the database
        const equipment = await db('Project.Equipments')
            .select(
                'equipment_id',
                'equipment_name',
                'equipment_img',
                'model_number',
                'quantity',
                'status',
                'location',
                'category_name',
                'supplier_name',
                'rating'
            )
            .orderBy('equipment_id', 'asc'); // Sort by equipment ID or any other preferred column

        if (!equipment || equipment.length === 0) {
            return res.status(404).json({ error: 'No equipment found.' });
        }

        res.status(200).json({
            message: 'List of all equipment',
            equipment,
        });
    } catch (error) {
        console.error('Error fetching equipment:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});



// Update User (PUT)
app.put('/api/v1/users/:id', async (req, res) => {
    try {
        // Validate and retrieve the current user
        const currentUser = getUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: 'Unauthorized: Invalid or missing token.' });
        }

        const userId = parseInt(req.params.id, 10); // Ensure user_id is an integer
        const { username, role } = req.body;

        // Validate userId
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID.' });
        }

        // Validate request body
        if (!username && !role) {
            return res.status(400).json({ error: 'At least one field (username or role) must be provided.' });
        }

        // Check if the user exists
        const user = await db('Project.Users')
            .where('user_id', userId)
            .first();

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Update user details
        const updatedFields = {};
        if (username) updatedFields.username = username;
        if (role) updatedFields.role = role;

        await db('Project.Users')
            .where('user_id', userId)
            .update(updatedFields);

        // Fetch the updated user
        const updatedUser = await db('Project.Users')
            .where('user_id', userId)
            .select('user_id', 'username', 'email', 'role', 'created_at')
            .first();

        res.status(200).json({
            message: 'User updated successfully.',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Delete User (DELETE)
app.delete('/api/v1/users/:id', async (req, res) => {
    try {
        // Validate and retrieve the current user
        const currentUser = getUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: 'Unauthorized: Invalid or missing token.' });
        }

        const userId = parseInt(req.params.id, 10); // Ensure user_id is an integer

        // Check if user exists
        const user = await db('Project.Users')
            .where('user_id', userId)
            .first();

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Delete user
        await db('Project.Users')
            .where('user_id', userId)
            .del();

        res.status(200).json({ message: `User with ID ${userId} deleted successfully.` });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});




app.get('/api/v1/ratings/view', async (req, res) => {
    try {
        // Check if the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admins only' });
        }

        // Fetch all ratings from the database
        const ratings = await db('Project.Rating')
    .join('Project.Users', 'Project.Rating.user_id', 'Project.Users.user_id')
    .join('Project.Equipments', 'Project.Rating.equipment_id', 'Project.Equipments.equipment_id')
    .select(
        'Project.Rating.rating_id',
        'Project.Users.username',
        'Project.Equipments.equipment_name',
        'Project.Rating.score',
        'Project.Rating.comment'
    )
    .orderBy('Project.Rating.rating_id', 'desc'); // Or any other column you'd like to use for ordering


        res.status(200).json({
            message: 'List of all ratings',
            ratings: ratings,
        });
    } catch (error) {
        console.error('Error fetching ratings:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});





}

module.exports = {handlePrivateBackendApi};