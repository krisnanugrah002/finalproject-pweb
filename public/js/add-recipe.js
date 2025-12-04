document.addEventListener('DOMContentLoaded', () => {
    // 1. Cek Login (Halaman ini butuh auth)
    const token = localStorage.getItem('fitmate_token');
    if (!token) {
        alert('Silakan login terlebih dahulu untuk menambah resep.');
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('addRecipeForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 2. Ambil data dari form HTML
        const title = document.getElementById('r_title').value;
        const calories = document.getElementById('r_calories').value;
        const category = document.getElementById('r_category').value;
        const ingredients = document.getElementById('r_ingredients').value;
        const instructions = document.getElementById('r_instructions').value;
        const image_url = document.getElementById('r_image').value;

        // 3. Kirim ke API
        try {
            const res = await fetch('/api/recipes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title, calories, category, ingredients, instructions, image_url
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert('Resep berhasil diterbitkan!');
                window.location.href = 'recipes.html';
            } else {
                alert('Gagal: ' + data.message);
            }

        } catch (err) {
            console.error('Error posting recipe:', err);
            alert('Terjadi kesalahan koneksi.');
        }
    });
});