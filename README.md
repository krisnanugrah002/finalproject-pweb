# FitMate - Project Context & Documentation

File ini bertujuan untuk memberikan konteks kepada AI dan Developer mengenai arsitektur, status pengerjaan, dan kontrak API proyek **FitMate**.

---

## 1. Project Overview

**FitMate** adalah aplikasi web kesehatan (Health Tracker) yang dikembangkan untuk Final Project Pemrograman Web.

- **Tujuan**: Membantu user menghitung BMI, TDEE, serta mencatat berat badan, makanan, dan aktivitas.  
- **Arsitektur**: Client-Server Decoupled (Monorepo).  
- **Backend**: Node.js, Express, MySQL.  
- **Frontend**: HTML5 Statis, CSS3, Vanilla JS (Fetch API).  

⚠️ **Hard Rule**: DILARANG menggunakan Template Engine (EJS/HBS/Pug).  
Frontend murni file statis (`.html`) yang dilayani oleh **Express Static**.

---

## 2. Directory Structure Strategy

- **public/** (Frontend Area - Krisna)  
  Berisi semua UI (`.html`), Styling (`.css`), dan Client Logic (`.js`).  
  File di sini **tidak boleh** mengakses database langsung.  

- **src/** (Backend Area - Valentino)  
  Berisi API Routes, Controllers, Database Config, dan Middleware.  
  Output dari sini hanya berupa **JSON (API Response)**.  

---

## 3. Current Status (Updated: Dec 2025)

### ✅ Project Initialization
- [x] npm init, express server setup  

### 🎨 Frontend Development 
- [x] Landing Page (`index.html`)  
- [ ] Login/Register UI (`login.html`, `register.html`)  
- [ ] Dashboard Utama (`dashboard.html`)  
- [ ] Kalkulator BMI (`calculator.html`)  
- [ ] Galeri Resep (`recipes.html`)  

### ⚙️ Backend Development
- [x] Database Schema Design  
- [ ] Auth API (Login/Register/JWT)  
- [ ] CRUD API (Weight, Food, Activity)  

---

## 4. API CONTRACT (PENTING)

Frontend dan Backend sepakat menggunakan spesifikasi endpoints berikut agar integrasi berjalan mulus.

### A. Authentication

**POST** `/api/auth/register`  
- **Request**:  
  ```json
  { "email": "...", "password": "...", "full_name": "...", "height": 170, "weight": 65 }