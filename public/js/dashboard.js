document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('fitmate_token');
    if (!token) { window.location.href = 'login.html'; return; }

    // 1. SET TANGGAL HARI INI DI INPUT
    document.getElementById('weightDate').valueAsDate = new Date();

    // 2. LOAD DATA DASHBOARD (User Profile)
    try {
        const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const user = await res.json();
        document.getElementById('userNameDisplay').textContent = `Halo, ${user.full_name}!`;
        
        // Setelah load user, LOAD HISTORY BERAT BADAN
        loadWeightHistory();
        loadFoodLog();
        loadActivityLog();

    } catch (err) {
        console.error(err);
        // localStorage.removeItem('fitmate_token'); // Uncomment jika mau strict
    }

    // 3. FUNGSI LOAD HISTORY & GAMBAR CHART
    async function loadWeightHistory() {
        try {
            const res = await fetch('/api/weights', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const logs = await res.json();

            // A. Render List di Tab
            const listContainer = document.getElementById('weightHistoryList');
            listContainer.innerHTML = '';
            
            // Siapkan data untuk Chart
            const chartLabels = [];
            const chartData = [];

            logs.forEach(log => {
                // Format tanggal agar cantik (DD MMM)
                const dateObj = new Date(log.date);
                const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                
                // Masukkan ke Array Chart
                chartLabels.push(dateStr);
                chartData.push(log.weight);

                // Buat Item List HTML
                const item = document.createElement('div');
                item.className = 'log-item';
                item.innerHTML = `
                    <div style="flex:1;">
                        <span style="font-weight:bold;">${log.weight} kg</span>
                        <span style="font-size:0.8rem; color:#888; margin-left:10px;">${dateStr}</span>
                    </div>
                    <button onclick="deleteWeight(${log.id})" style="color:red; background:none; border:none; cursor:pointer;">Hapus</button>
                `;
                listContainer.appendChild(item);
            });

            // B. Render Chart (Chart.js)
            renderChart(chartLabels, chartData);

        } catch (err) {
            console.error('Gagal load history', err);
        }
    }

    // 4. LOGIC TAMBAH BERAT (Form Submit)
    document.getElementById('weightForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('weightDate').value;
        const weight = document.getElementById('weightValue').value;

        try {
            const res = await fetch('/api/weights', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ date, weight })
            });

            if (res.ok) {
                alert('Data tersimpan!');
                loadWeightHistory(); // Refresh list & chart tanpa reload page
            }
        } catch (err) { console.error(err); }
    });

    // 5. HELPER: FUNGSI DELETE (Harus nempel di window agar bisa dipanggil onclick HTML)
    window.deleteWeight = async (id) => {
        if(!confirm('Hapus data ini?')) return;
        try {
            await fetch(`/api/weights/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadWeightHistory(); // Refresh
        } catch (err) { console.error(err); }
    };

    // 6. HELPER: RENDER CHART
    let weightChartInstance = null;
    function renderChart(labels, data) {
        const ctx = document.getElementById('weightChart').getContext('2d');
        
        // Hapus chart lama jika ada (biar ga numpuk saat refresh)
        if (weightChartInstance) weightChartInstance.destroy();

        weightChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Progres Berat (kg)',
                    data: data,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    //LOAD MAKANAN

    window.loadFoodLog = async () => {
        const dateInput = document.getElementById('foodDate');
        const dateVal = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

        try {
            const res = await fetch(`/api/foods?date=${dateVal}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();

            // 1. Update List HTML
            const listContainer = document.getElementById('foodList');
            if (listContainer) {
                listContainer.innerHTML = '';
                if (result.data.length === 0) {
                    listContainer.innerHTML = '<p style="text-align:center; color:#999;">Belum ada catatan makanan.</p>';
                } else {
                    result.data.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'log-item';
                        div.innerHTML = `
                            <span>${item.food_name}</span>
                            <div style="display:flex; align-items:center; gap:15px;">
                                <span style="font-weight:bold; color:var(--primary-color);">+${item.calories} kkal</span>
                                <button onclick="deleteFood(${item.id})" style="color:#ef4444; border:none; background:none; cursor:pointer;">&times;</button>
                            </div>
                        `;
                        listContainer.appendChild(div);
                    });
                }
            }

            // 2. Update Kartu Total Kalori di Atas Dashboard
            const totalFoodElem = document.getElementById('totalFood');
            if (totalFoodElem) totalFoodElem.textContent = result.total;

            // 3. Update Net Kalori (Total Makan - Total Bakar)
            const totalBurned = parseInt(document.getElementById('totalBurned').textContent) || 0;
            document.getElementById('netCalories').textContent = result.total - totalBurned;

        } catch (err) {
            console.error("Gagal load food:", err);
        }
    };

        // Set Tanggal Default untuk Food
        const foodDateInput = document.getElementById('foodDate');
        if(foodDateInput) {
            foodDateInput.valueAsDate = new Date();
        foodDateInput.addEventListener('change', () => window.loadFoodLog());
        }

        // Submit Makanan
        const foodForm = document.getElementById('foodForm');
            if (foodForm) {
                foodForm.addEventListener('submit', async (e) => {
                e.preventDefault();

        const date = document.getElementById('foodDate').value;
        const food_name = document.getElementById('foodName').value;
        const calories = document.getElementById('foodCal').value;

        try {
            const res = await fetch('/api/foods', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ date, food_name, calories })
            });

            if (res.ok) {
                document.getElementById('foodName').value = '';
                document.getElementById('foodCal').value = '';
                window.loadFoodLog(); // Refresh list & total
            }
        } catch (err) { console.error(err); }
    });
}

        // Helper Delete Food
        window.deleteFood = async (id) => {
            if(!confirm('Hapus makanan ini?')) return;
    
        try {
            await fetch(`/api/foods/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        window.loadFoodLog();

        } catch (err) { console.error(err); }

};

    // LOAD ACTIVITY LOG
    window.loadActivityLog = async () => {
        const dateInput = document.getElementById('activityDate');
        const dateVal = dateInput && dateInput.value ? dateInput.value : new Date().toISOString().split('T')[0];

        try {
            const res = await fetch(`/api/activities?date=${dateVal}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(!res.ok) throw new Error('Gagal activity');
            const result = await res.json();

            // 1. Render List
            const listContainer = document.getElementById('activityList');
            const totalLabel = document.getElementById('dailyBurnTotal');

            if (listContainer) {
                listContainer.innerHTML = '';
                if (result.data.length === 0) {
                    listContainer.innerHTML = `<p style="text-align:center; padding:20px; color:#999;">Belum ada aktivitas.</p>`;
                } else {
                    result.data.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'log-item';
                        div.innerHTML = `
                            <span>${item.activity_name}</span>
                            <div style="display:flex; align-items:center; gap:15px;">
                                <span style="font-weight:bold; color:#f97316;">-${item.calories_burned} kkal</span>
                                <button onclick="deleteActivity(${item.id})" style="color:#ef4444; border:none; background:none; cursor:pointer; font-size:1.2rem;">&times;</button>
                            </div>
                        `;
                        listContainer.appendChild(div);
                    });
                }
            }

            // 2. Update Total di Tab & Dashboard
            if (totalLabel) totalLabel.textContent = `Total: ${result.total} kkal`;
            
            const dashboardBurn = document.getElementById('totalBurned');
            if (dashboardBurn) dashboardBurn.textContent = result.total;

            // 3. HITUNG NET KALORI (Food - Activity)
            const foodVal = parseInt(document.getElementById('totalFood')?.textContent || 0);
            const netElem = document.getElementById('netCalories');
            if(netElem) netElem.textContent = foodVal - result.total;

        } catch (err) { console.error(err); }
    };

    // --- ACTIVITY LOGIC ---
    
    // Set Default Date Activity
    const activityDateInput = document.getElementById('activityDate');
    if(activityDateInput) {
        if(!activityDateInput.value) activityDateInput.valueAsDate = new Date();
        activityDateInput.addEventListener('change', () => window.loadActivityLog());
    }

    // Submit Activity
    const activityForm = document.getElementById('activityForm');
    if (activityForm) {
        activityForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const date = document.getElementById('activityDate').value;
            const activity_name = document.getElementById('activityName').value;
            const calories_burned = document.getElementById('activityCal').value;

            try {
                const res = await fetch('/api/activities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ date, activity_name, calories_burned })
                });

                if (res.ok) {
                    document.getElementById('activityName').value = '';
                    document.getElementById('activityCal').value = '';
                    window.loadActivityLog(); // Refresh
                }
            } catch (err) { console.error(err); }
        });
    }

    // Delete Activity
    window.deleteActivity = async (id) => {
        if(!confirm('Hapus aktivitas ini?')) return;
        try {
            await fetch(`/api/activities/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            window.loadActivityLog();
        } catch (err) { console.error(err); }
    };

    // --- LOGOUT & TAB SWITCHER ---
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('fitmate_token');
        window.location.href = 'index.html';
    });
    
    window.switchTab = function(tabName) {
        document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).style.display = 'block';
    }
});