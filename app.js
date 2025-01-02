require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const {handlePrivateBackendApi} = require('./backend/routes/private/api.js');
const {handlePublicBackendApi} = require('./backend/routes/public/api.js');
const db = require('./Backend/config/db');
const {authMiddleware} = require('./backend/middleware/auth.js')
const path = require('path'); // Import the path module

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('Frontend'));
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));


// Use Routes
handlePublicBackendApi(app);


//middleware
app.use('/api/v1',authMiddleware);

handlePrivateBackendApi(app);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

db.raw('SELECT 1')
  .then(() => console.log('Database connected successfully!'))
  .catch((err) => console.error('Database connection failed:', err.message));
