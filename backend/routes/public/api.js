const db = require('/Users/mokaa/Desktop/Software_Momo/backend/config/db');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken');


function handlePublicBackendApi(app) {

// Route: POST /api/v1/users/new
// Route: POST /api/v1/users/new
app.post('/api/v1/users/new', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Input validation
        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Check if user already exists
        const userCheck = await db('Project.Users')
            .select('*')
            .where('email', email)
            .orWhere('username', username)
            .first();

        if (userCheck) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user into the database and get the user_id
        const [newUser] = await db('Project.Users')
            .insert({
                username,
                email,
                password: hashedPassword,
                role,
            })
            .returning('*'); // This ensures we get the full user record back

        // Generate a JWT token with the correct payload (user_id and role)
        const token = jwt.sign(
            { user_id: newUser.user_id, role: newUser.role }, // Include user_id and role
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Respond with the generated token
        res.status(201).json({
            message: 'User created successfully.',
            token: token,
            user: {
                user_id: newUser.user_id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                created_at: newUser.created_at,
            },
        });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.put('/api/v1/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, role } = req.body;

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
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get('/api/v1/equipment/view', async (req, res) => {
    try {
        // SQL JOIN query to fetch equipment data with category and supplier names
        const equipmentData = await db('Project.Equipments as e')
            .select(
                'e.equipment_id',
                'e.equipment_name',
                'e.equipment_img',
                'e.rating',
                'e.model_number',
                'e.purchase_date',
                'e.quantity',
                'e.status',
                'e.location',
                'c.category_name',
                's.supplier_name'
            )
            .leftJoin('Project.Categories as c', 'e.category_id', 'c.category_id')
            .leftJoin('Project.Suppliers as s', 'e.supplier_id', 's.supplier_id')
            .orderBy('e.equipment_id', 'asc');

        res.status(200).json({
            message: 'List of all equipment',
            equipment: equipmentData,
        });
    } catch (error) {
        console.error('Error fetching equipment:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Route: GET /api/v1/rating/:id
app.get('/api/v1/rating/:id', async (req, res) => {
    try {
        const equipmentId = req.params.id;

        // Log the equipment ID for debugging
        console.log('Requested Equipment ID:', equipmentId);

        // Validate the equipment ID
        if (!equipmentId) {
            return res.status(400).json({ error: 'Equipment ID is required.' });
        }

        // Query ratings without JOIN for debugging
        const ratings = await db('Project.Rating')
            .select('rating_id', 'comment', 'score', 'user_id', 'equipment_id')
            .where('equipment_id', equipmentId);

        // Log the fetched ratings
        console.log('Ratings:', ratings);

        if (ratings.length === 0) {
            return res.status(404).json({ error: 'No ratings found for this equipment.' });
        }

        res.status(200).json({
            message: `Ratings for equipment ID ${equipmentId}`,
            ratings: ratings,
        });
    } catch (error) {
        console.error('Error fetching ratings:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


app.post('/api/v1/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Check if user exists
        const user = await db('Project.Users')
            .where('email', email)
            .first();

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Check user role and set the redirection page
        const redirectPage = user.role === 'admin' ? '/public/admin.html' : '/public/dashboard.html';

        // Respond with the token, user info, and redirection page
        res.status(200).json({
            message: 'Login successful.',
            token: token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            redirect: redirectPage, // Include the redirection page in the response
        });
    } catch (error) {
        console.error('Error logging in:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});



}




module.exports = {handlePublicBackendApi};