/**
 * APP.JS - Global Logic
 * File ini harus dipanggil di SETIAP halaman HTML.
 * Bertugas mengatur UI Navbar (Login vs Logout state).
 */

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
});

function checkAuthState() {
    // 1. Cek apakah ada token login
    const token = localStorage.getItem('fitmate_token');
    
    // 2. Ambil elemen container tombol di Navbar
    const authButtonsContainer = document.querySelector('.auth-buttons');

    if (!authButtonsContainer) return; 

    if (token) {
        // --- KONDISI: SUDAH LOGIN ---
        authButtonsContainer.innerHTML = `
            <a href="dashboard.html" class="btn btn-outline" style="border:none; margin-right: 5px;">Dashboard</a>
            <a href="profile.html" class="btn btn-outline" style="border:none; margin-right: 5px;" title="Profil Saya">Profil</a>
            <button id="globalLogoutBtn" class="btn btn-primary">Keluar</button>
        `;

        // Tambahkan event listener untuk tombol Logout
        document.getElementById('globalLogoutBtn').addEventListener('click', handleLogout);
        
        // Opsional: Jika di halaman dashboard/profile, kita bisa highlight tombolnya
        const currentPath = window.location.pathname;
        if (currentPath.includes('profile.html')) {
            const profileBtn = authButtonsContainer.querySelector('a[href="profile.html"]');
            if(profileBtn) profileBtn.style.fontWeight = 'bold';
        }

    } else {
        // --- KONDISI: BELUM LOGIN (GUEST) ---
        const currentPath = window.location.pathname;
        
        // Cek agar tidak error loop di halaman login/register
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
    localStorage.removeItem('fitmate_user'); 

    // 2. Alert & Redirect
    alert('Anda telah keluar.');
    window.location.href = 'index.html';
}