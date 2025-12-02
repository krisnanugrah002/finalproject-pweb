/**
 * APP.JS - Global Logic
 * File ini harus dipanggil di SETIAP halaman HTML.
 * Bertugas mengatur UI Navbar (Login vs Logout state).
 */

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
});

function checkAuthState() {
    // 1. Cek apakah ada token login (Simulasi JWT) di LocalStorage
    // Nanti token ini didapat saat login sukses
    const token = localStorage.getItem('fitmate_token');
    
    // 2. Ambil elemen container tombol di Navbar
    const authButtonsContainer = document.querySelector('.auth-buttons');

    if (!authButtonsContainer) return; // Stop jika tidak ada navbar (misal di halaman error)

    if (token) {
        // --- KONDISI: SUDAH LOGIN ---
        // Ganti tombol Login/Register menjadi Logout/Profile
        authButtonsContainer.innerHTML = `
            <a href="dashboard.html" class="btn btn-outline" style="border:none;">Dashboard</a>
            <button id="globalLogoutBtn" class="btn btn-primary">Keluar</button>
        `;

        // Tambahkan event listener untuk tombol Logout yang baru dibuat
        document.getElementById('globalLogoutBtn').addEventListener('click', handleLogout);
    } else {
        // --- KONDISI: BELUM LOGIN (GUEST) ---
        // Pastikan tombolnya Login & Register (Default HTML sebenarnya sudah ini, tapi jaga-jaga)
        const currentPath = window.location.pathname;
        
        // Cek agar tidak error di halaman login/register itu sendiri
        if (!currentPath.includes('login.html') && !currentPath.includes('register.html')) {
            authButtonsContainer.innerHTML = `
                <a href="login.html" class="btn btn-outline">Masuk</a>
                <a href="register.html" class="btn btn-primary">Daftar Sekarang</a>
            `;
        }
    }
}

function handleLogout() {
    // 1. Hapus token
    localStorage.removeItem('fitmate_token');
    localStorage.removeItem('fitmate_user'); // Jika ada data user tersimpan

    // 2. Alert & Redirect
    alert('Anda telah keluar.');
    window.location.href = 'index.html';
}