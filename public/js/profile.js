document.addEventListener('DOMContentLoaded', async () => {
    // 1. CEK LOGIN
    const token = localStorage.getItem('fitmate_token');
    if (!token) {
        alert('Silakan login terlebih dahulu.');
        window.location.href = 'login.html';
        return;
    }

    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    
    // 2. FUNGSI UNTUK MENGAMBIL DATA DARI DB DAN MENAMPILKANNYA
    async function loadProfile() {
        try {
            const res = await fetch('/api/auth/me', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                }
            });

            // Handle Token Expired
            if (res.status === 401 || res.status === 403) {
                alert('Sesi anda telah berakhir. Silakan login kembali.');
                localStorage.removeItem('fitmate_token');
                window.location.href = 'login.html';
                return;
            }

            if (!res.ok) throw new Error('Gagal mengambil data profil');

            const user = await res.json();
            console.log("Data User dari API:", user);

            // --- TAMPILKAN DATA (VIEW MODE) ---
            document.getElementById('view_fullname').textContent = user.name || '-';
            document.getElementById('view_email').textContent = user.email || '-';
            document.getElementById('view_height').textContent = user.height || '0';
            document.getElementById('view_weight').textContent = user.weight || '0';

            // --- ISI DATA KE FORM (EDIT MODE) ---
            document.getElementById('edit_fullname').value = user.name || '';
            document.getElementById('edit_email').value = user.email || '';
            document.getElementById('edit_height').value = user.height || '';
            document.getElementById('edit_weight').value = user.weight || '';

            const heightInput = document.getElementById('edit_height');
            if (heightInput) {
                heightInput.disabled = false; 
                heightInput.style.backgroundColor = '';
                heightInput.style.cursor = 'text';
                const helperText = heightInput.parentElement.querySelector('small');
                if (helperText) helperText.style.display = 'none';
            }

        } catch (err) {
            console.error(err);
            if (!token) return;
            alert('Gagal memuat profil. Pastikan server berjalan dan database terhubung.');
        }
    }
    loadProfile();

    // 3. LOGIKA TOMBOL EDIT & BATAL
    const btnEdit = document.getElementById('btnEditProfile');
    const btnCancel = document.getElementById('btnCancelEdit');

    if (btnEdit) {
        btnEdit.addEventListener('click', () => {
            viewMode.style.display = 'none';
            editMode.style.display = 'block';
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            editMode.style.display = 'none';
            viewMode.style.display = 'block';
            loadProfile();
        });
    }

    // 4. LOGIKA SIMPAN PERUBAHAN (UPDATE KE DB)
    if (editMode) {
        editMode.addEventListener('submit', async (e) => {
            e.preventDefault();

            const full_name = document.getElementById('edit_fullname').value;
            const weight = document.getElementById('edit_weight').value;
            const height = document.getElementById('edit_height').value;

            try {
                const res = await fetch('/api/auth/me', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ full_name, weight, height }) 
                });

                if (res.ok) {
                    alert('Profil berhasil diperbarui!');
                    editMode.style.display = 'none';
                    viewMode.style.display = 'block';
                    loadProfile();
                } else {
                    const data = await res.json();
                    alert('Gagal update: ' + (data.message || 'Terjadi kesalahan'));
                }
            } catch (err) {
                console.error(err);
                alert('Terjadi kesalahan koneksi saat update.');
            }
        });
    }

    // 5. LOGIKA HAPUS AKUN
    const btnDelete = document.getElementById('btnDeleteAccount');
    if (btnDelete) {
        btnDelete.addEventListener('click', async () => {
            if (!confirm('Yakin ingin menghapus akun? Data hilang permanen!')) return;

            try {
                const res = await fetch('/api/auth/me', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    alert('Akun dihapus.');
                    localStorage.removeItem('fitmate_token');
                    window.location.href = 'index.html';
                } else {
                    alert('Gagal menghapus akun.');
                }
            } catch (err) { console.error(err); }
        });
    }
});