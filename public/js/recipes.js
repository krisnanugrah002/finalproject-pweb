document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('recipeListContainer');

    async function fetchRecipes() {
        try {
            const res = await fetch('/api/recipes');
            const recipes = await res.json();
            renderRecipes(recipes);
        } catch (err) {
            console.error("Error fetching recipes:", err);
            container.innerHTML = '<p style="text-align:center;">Gagal memuat resep.</p>';
        }
    }

    function renderRecipes(recipes) {
        container.innerHTML = '';

        if (recipes.length === 0) {
            container.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Belum ada resep. Jadilah yang pertama!</p>';
            return;
        }

        recipes.forEach(recipe => {
            const bgImage = recipe.image_url 
                ? `background-image: url('${recipe.image_url}');` 
                : `background-color: #ddd;`; 

            const card = document.createElement('div');
            card.className = 'card recipe-card';
            card.style.cursor = 'pointer';
            
            card.onclick = () => {
                if (recipe.id) {
                    window.location.href = `recipe-detail.html?id=${recipe.id}`;
                } else {
                    console.error("Recipe ID is missing");
                    alert("Terjadi kesalahan pada data resep ini.");
                }
            };

            const creatorName = recipe.creator_name || 'User';

            const shortIngredients = recipe.ingredients.length > 60 
                ? recipe.ingredients.substring(0, 60) + '...' 
                : recipe.ingredients;

            card.innerHTML = `
                <div class="recipe-img" style="${bgImage} background-size: cover; background-position: center;"></div>
                <div class="recipe-content">
                    <span class="tag">${recipe.category}</span>
                    <h3>${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span>🔥 ${recipe.calories} kkal</span>
                        <span>👤 ${creatorName}</span>
                    </div>
                    <div style="margin-top:10px; font-size:0.85rem; color:#666;">
                        <strong>Bahan:</strong><br>
                        ${shortIngredients}
                    </div>
                    <div style="margin-top:15px; text-align:right;">
                        <span style="color:var(--primary-color); font-size:0.85rem; font-weight:600;">Lihat Detail &rarr;</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    fetchRecipes();
});