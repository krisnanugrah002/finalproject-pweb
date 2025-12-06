const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

const weightRoutes = require('./src/routes/weightRoutes');
app.use('/api/weights', weightRoutes);

const foodRoutes = require('./src/routes/foodRoutes');
app.use('/api/foods', foodRoutes);

const activityRoutes = require('./src/routes/activityRoutes');
app.use('/api/activities', activityRoutes);

const recipeRoutes = require('./src/routes/recipeRoutes');
app.use('/api/recipes', recipeRoutes);


// Test Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server FitMate berjalan!' });
});

app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`Server FitMate berjalan di: http://localhost:${PORT}`);
    console.log(`Serving Static files dari folder: /public`);
    console.log(`==================================================\n`);
});