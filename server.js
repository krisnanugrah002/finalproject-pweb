const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Untuk parsing body request JSON
app.use(express.urlencoded({ extended: true })); // Untuk parsing form data

// Static Files Serving (PENTING: Ini yang membuat folder public bisa diakses browser)
// Logic: Jika browser minta 'style.css', cari di folder public.
app.use(express.static(path.join(__dirname, 'public')));

// Basic Route for Testing
// Karena kita pakai express.static, route '/' otomatis mencari index.html di public.
// Tapi kita bisa buat route eksplisit jika nanti butuh.
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server FitMate berjalan dengan baik!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`Server FitMate berjalan di: http://localhost:${PORT}`);
    console.log(`Serving Static files dari folder: /public`);
    console.log(`==================================================\n`);
});