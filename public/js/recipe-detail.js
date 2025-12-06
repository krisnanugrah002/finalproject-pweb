document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    if (!recipeId) {
        alert('Resep tidak ditemukan!');
        window.location.href = 'recipes.html';
        return;
    }

    const container = document.getElementById('recipeContent');
    const loading = document.getElementById('loading');

    try {

        const res = await fetch(`/api/recipes/${recipeId}`);
        
        if (!res.ok) throw new Error('Gagal mengambil data');

        const recipe = await res.json();


        document.getElementById('r_title').textContent = recipe.title;
        document.getElementById('r_cat').textContent = recipe.category;
        document.getElementById('r_author').textContent = recipe.creator_name || 'Anonim';
        document.getElementById('r_cal').textContent = recipe.calories;
        
        // Handle Gambar
        const imgElem = document.getElementById('r_img');
        if (recipe.image_url) {
            imgElem.src = recipe.image_url;
        } else {
            imgElem.style.display = 'none'; 
        }

        // Handle Text Area (Bahan & Instruksi)
        document.getElementById('r_ingredients').textContent = recipe.ingredients;
        document.getElementById('r_instructions').textContent = recipe.instructions;

        loading.style.display = 'none';
        container.style.display = 'block';
        document.title = `${recipe.title} - FitMate`;

    } catch (err) {
        console.error(err);
        loading.textContent = 'Gagal memuat resep. Mungkin resep sudah dihapus.';
    }
});