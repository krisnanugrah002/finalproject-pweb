document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. CEK TOKEN ---
    const token = localStorage.getItem('fitmate_token');
    if (!token) {
        alert('Anda belum login!');
        window.location.href = 'login.html';
        return;
    }

    // --- 2. SETUP TANGGAL & ELEMENT ---
    function getLocalDateISO() {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now - offset).toISOString().slice(0, 10);
        return localISOTime;
    }

    const todayStr = getLocalDateISO();

    const elements = {
        weight: document.getElementById('weightDate'),
        food: document.getElementById('foodDate'),
        activity: document.getElementById('activityDate'),
        userName: document.getElementById('userNameDisplay'),
        foodList: document.getElementById('foodList'),
        activityList: document.getElementById('activityList'),
        weightList: document.getElementById('weightHistoryList')
    };

    // Set Default Date Values
    if (elements.weight) elements.weight.value = todayStr;
    if (elements.food) {
        elements.food.value = todayStr;
        elements.food.addEventListener('change', () => loadFoodLog());
    }
    if (elements.activity) {
        elements.activity.value = todayStr;
        elements.activity.addEventListener('change', () => loadActivityLog());
    }

    // --- 3. DEFINISI FUNGSI-FUNGSI LOGIC ---

    // A. LOGIC MAKANAN
    window.loadFoodLog = async (dateOverride = null) => {
        const dateVal = dateOverride || (elements.food ? elements.food.value : todayStr);
        if (!dateVal) return;

        try {
            const timestamp = new Date().getTime();
            const res = await fetch(`/api/foods?date=${dateVal}&_t=${timestamp}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
            });

            if (!res.ok) return;

            const result = await res.json();
            if (elements.foodList) {
                elements.foodList.innerHTML = ''; 

                if (!result.data || result.data.length === 0) {
                    elements.foodList.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">Belum ada catatan makanan.</p>';
                } else {
                    result.data.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'log-item';
                        div.id = `food-item-${item.id}`;
                        
                        div.innerHTML = `
                            <div class="display-mode" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                <span>${item.food_name}</span>
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span style="font-weight:bold; color:var(--primary-color); margin-right: 10px;">+${item.calories} kkal</span>
                                    <button onclick="toggleEditMode('food', ${item.id})" style="background: #fbbf24; border:none; padding: 6px 8px; border-radius: 4px; cursor:pointer; color: black;" title="Edit">✎</button>
                                    <button onclick="deleteFood(${item.id})" style="background: #ef4444; border:none; padding: 6px 10px; border-radius: 4px; cursor:pointer; color: white; font-weight: bold;" title="Hapus">&times;</button>
                                </div>
                            </div>
                            
                            <div class="edit-mode" style="display: none; width: 100%; gap: 10px; align-items: center;">
                                <input type="text" id="edit-food-name-${item.id}" value="${item.food_name}" class="form-input" style="flex: 2; padding: 5px;">
                                <input type="number" id="edit-food-cal-${item.id}" value="${item.calories}" class="form-input" style="flex: 1; padding: 5px;">
                                <button onclick="saveFoodEdit(${item.id})" style="background: #10B981; border:none; padding: 6px 10px; border-radius: 4px; cursor:pointer; color: white; font-weight: bold;" title="Simpan">✓</button>
                                <button onclick="cancelEditMode('food', ${item.id})" style="background: #9CA3AF; border:none; padding: 6px 10px; border-radius: 4px; cursor:pointer; color: white; font-weight: bold;" title="Batal">&times;</button>
                            </div>
                        `;
                        elements.foodList.appendChild(div);
                    });
                }
            }
            updateNetCalories(result.total || 0, null);
        } catch (err) { console.error("Gagal load food:", err); }
    };

    window.saveFoodEdit = async (id) => {
        const newName = document.getElementById(`edit-food-name-${id}`).value;
        const newCal = document.getElementById(`edit-food-cal-${id}`).value;

        if (!newName || !newCal) { alert("Nama dan kalori tidak boleh kosong!"); return; }

        try {
            const res = await fetch(`/api/foods/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ food_name: newName, calories: newCal })
            });
            if (res.ok) loadFoodLog(); 
            else alert("Gagal update makanan.");
        } catch (err) { console.error(err); }
    };

    window.deleteFood = async (id) => {
        if (!confirm('Hapus makanan ini?')) return;
        try {
            await fetch(`/api/foods/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadFoodLog();
        } catch (err) { console.error(err); }
    };

    // === B. LOGIC AKTIVITAS ===
    window.loadActivityLog = async (dateOverride = null) => {
        const dateVal = dateOverride || (elements.activity ? elements.activity.value : todayStr);
        if (!dateVal) return;

        try {
            const timestamp = new Date().getTime();
            const res = await fetch(`/api/activities?date=${dateVal}&_t=${timestamp}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
            });

            if (!res.ok) return;

            const result = await res.json();
            if (elements.activityList) {
                elements.activityList.innerHTML = '';

                if (!result.data || result.data.length === 0) {
                    elements.activityList.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">Belum ada aktivitas.</p>';
                } else {
                    result.data.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'log-item';
                        div.id = `activity-item-${item.id}`;

                        div.innerHTML = `
                            <div class="display-mode" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                <span>${item.activity_name}</span>
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span style="font-weight:bold; color:#f97316; margin-right: 10px;">-${item.calories_burned} kkal</span>
                                    <button onclick="toggleEditMode('activity', ${item.id})" style="background: #fbbf24; border:none; padding: 6px 8px; border-radius: 4px; cursor:pointer; color: black;" title="Edit">✎</button>
                                    <button onclick="deleteActivity(${item.id})" style="background: #ef4444; border:none; padding: 6px 10px; border-radius: 4px; cursor:pointer; color: white; font-weight: bold;" title="Hapus">&times;</button>
                                </div>
                            </div>

                            <div class="edit-mode" style="display: none; width: 100%; gap: 10px; align-items: center;">
                                <input type="text" id="edit-act-name-${item.id}" value="${item.activity_name}" class="form-input" style="flex: 2; padding: 5px;">
                                <input type="number" id="edit-act-cal-${item.id}" value="${item.calories_burned}" class="form-input" style="flex: 1; padding: 5px;">
                                <button onclick="saveActivityEdit(${item.id})" style="background: #10B981; border:none; padding: 6px 10px; border-radius: 4px; cursor:pointer; color: white; font-weight: bold;" title="Simpan">✓</button>
                                <button onclick="cancelEditMode('activity', ${item.id})" style="background: #9CA3AF; border:none; padding: 6px 10px; border-radius: 4px; cursor:pointer; color: white; font-weight: bold;" title="Batal">&times;</button>
                            </div>
                        `;
                        elements.activityList.appendChild(div);
                    });
                }
            }
            updateNetCalories(null, result.total || 0);
        } catch (err) { console.error("Gagal load activity:", err); }
    };

    window.saveActivityEdit = async (id) => {
        const newName = document.getElementById(`edit-act-name-${id}`).value;
        const newCal = document.getElementById(`edit-act-cal-${id}`).value;

        if (!newName || !newCal) { alert("Nama dan kalori tidak boleh kosong!"); return; }

        try {
            const res = await fetch(`/api/activities/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ activity_name: newName, calories_burned: newCal })
            });
            if (res.ok) loadActivityLog(); 
            else alert("Gagal update aktivitas.");
        } catch (err) { console.error(err); }
    };

    window.deleteActivity = async (id) => {
        if (!confirm('Hapus aktivitas ini?')) return;
        try {
            await fetch(`/api/activities/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadActivityLog();
        } catch (err) { console.error(err); }
    };

    // === C. LOGIC BERAT BADAN ===
    window.loadWeightHistory = async () => {
        try {
            const timestamp = new Date().getTime();
            const res = await fetch(`/api/weights?_t=${timestamp}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
            });

            if (!res.ok) return;

            const logs = await res.json();
            if (elements.weightList) {
                elements.weightList.innerHTML = '';
                const chartLabels = [];
                const chartData = [];

                logs.forEach(log => {
                    const dateObj = new Date(log.date);
                    const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                    
                    chartLabels.push(dateStr);
                    chartData.push(log.weight);

                    const item = document.createElement('div');
                    item.className = 'log-item';
                    item.id = `weight-item-${log.id}`;

                    item.innerHTML = `
                        <div class="display-mode" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                            <div style="flex:1;">
                                <span style="font-weight:bold;">${log.weight} kg</span>
                                <span style="font-size:0.8rem; color:#888; margin-left:10px;">${dateStr}</span>
                            </div>
                            <div style="display:flex; gap:10px;">
                                <button onclick="toggleEditMode('weight', ${log.id})" style="background: #fbbf24; border:none; padding: 6px 8px; border-radius: 4px; cursor:pointer; color: black;" title="Edit">✎</button>
                                <button onclick="deleteWeight(${log.id})" style="background: #ef4444; border:none; padding: 6px 10px; border-radius: 4px; cursor:pointer; color: white;" title="Hapus">&times;</button>
                            </div>
                        </div>

                        <div class="edit-mode" style="display: none; width: 100%; gap: 10px; align-items: center;">
                            <input type="number" id="edit-weight-${log.id}" value="${log.weight}" step="0.1" class="form-input" style="flex: 1; padding: 5px;">
                            <button onclick="saveWeightEdit(${log.id})" style="background: #10B981; border:none; padding: 6px 10px; border-radius: 4px; cursor:pointer; color: white; font-weight: bold;" title="Simpan">✓</button>
                            <button onclick="cancelEditMode('weight', ${log.id})" style="background: #9CA3AF; border:none; padding: 6px 10px; border-radius: 4px; cursor:pointer; color: white; font-weight: bold;" title="Batal">&times;</button>
                        </div>
                    `;
                    elements.weightList.appendChild(item);
                });

                renderChart(chartLabels, chartData);
            }
        } catch (err) { console.error('Gagal load weight history', err); }
    };

    window.saveWeightEdit = async (id) => {
        const newWeight = document.getElementById(`edit-weight-${id}`).value;
        if (!newWeight) { alert("Berat tidak boleh kosong!"); return; }

        try {
            const res = await fetch(`/api/weights/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ weight: newWeight })
            });
            if (res.ok) loadWeightHistory();
            else alert("Gagal update berat.");
        } catch (err) { console.error(err); }
    };

    window.deleteWeight = async (id) => {
        if (!confirm('Hapus data ini?')) return;
        try {
            await fetch(`/api/weights/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadWeightHistory();
        } catch (err) { console.error(err); }
    };

    // === D. FUNGSI HELPER EDIT GLOBAL ===
    window.toggleEditMode = (type, id) => {
        const itemId = `${type}-item-${id}`;
        const itemRow = document.getElementById(itemId);
        if (!itemRow) return;
        itemRow.querySelector('.display-mode').style.display = 'none';
        itemRow.querySelector('.edit-mode').style.display = 'flex';
    };

    window.cancelEditMode = (type, id) => {
        const itemId = `${type}-item-${id}`;
        const itemRow = document.getElementById(itemId);
        if (!itemRow) return;
        itemRow.querySelector('.display-mode').style.display = 'flex';
        itemRow.querySelector('.edit-mode').style.display = 'none';
    };

    // === E. UTILS & CHART ===
    let weightChartInstance = null;
    function renderChart(labels, data) {
        const ctx = document.getElementById('weightChart').getContext('2d');
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

    function updateNetCalories(newFoodTotal = null, newBurnedTotal = null) {
        const totalFoodElem = document.getElementById('totalFood');
        const totalBurnedElem = document.getElementById('totalBurned');
        const netElem = document.getElementById('netCalories');

        if (newFoodTotal !== null && totalFoodElem) totalFoodElem.textContent = newFoodTotal;
        if (newBurnedTotal !== null && totalBurnedElem) totalBurnedElem.textContent = newBurnedTotal;

        const food = parseInt(totalFoodElem ? totalFoodElem.textContent : 0) || 0;
        const burned = parseInt(totalBurnedElem ? totalBurnedElem.textContent : 0) || 0;
        
        if (netElem) netElem.textContent = food - burned;
        
        const currentDateElem = document.getElementById('currentDate');
        if (currentDateElem && elements.food) {
            const displayedDate = elements.food.value;
            const dateObj = new Date(displayedDate);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            currentDateElem.textContent = dateObj.toLocaleDateString('id-ID', options);
        }
    }

    window.switchTab = function(tabName) {
        document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).style.display = 'block';
        
        const btns = document.querySelectorAll('.tab-btn');
        if(btns.length > 0) {
           if(tabName === 'food') btns[0].classList.add('active');
           if(tabName === 'activity') btns[1].classList.add('active');
           if(tabName === 'weight') btns[2].classList.add('active');
        }
    }

    // === F. EVENT LISTENERS (FORM SUBMIT) ===

    const foodForm = document.getElementById('foodForm');
    if (foodForm) {
        foodForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const date = document.getElementById('foodDate').value || todayStr;
            const food_name = document.getElementById('foodName').value;
            const calories = document.getElementById('foodCal').value;

            try {
                const res = await fetch('/api/foods', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ date, food_name, calories })
                });

                if (res.ok) {
                    document.getElementById('foodName').value = '';
                    document.getElementById('foodCal').value = '';
                    loadFoodLog(); 
                } else {
                    alert("Gagal menambah makanan.");
                }
            } catch (err) { console.error(err); }
        });
    }

    const activityForm = document.getElementById('activityForm');
    if (activityForm) {
        activityForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const date = document.getElementById('activityDate').value || todayStr;
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
                    loadActivityLog();
                } else {
                    alert("Gagal menambah aktivitas.");
                }
            } catch (err) { console.error(err); }
        });
    }

    const weightForm = document.getElementById('weightForm');
    if (weightForm) {
        weightForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const date = document.getElementById('weightDate').value || todayStr;
            const weight = document.getElementById('weightValue').value;

            try {
                const res = await fetch('/api/weights', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ date, weight })
                });

                if (res.ok) {
                    alert('Data berat badan tersimpan!');
                    loadWeightHistory();
                } else {
                    alert("Gagal simpan berat.");
                }
            } catch (err) { console.error(err); }
        });
    }

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('fitmate_token');
            window.location.href = 'index.html';
        });
    }

    // --- G. EKSEKUSI LOAD DATA AWAL ---
    
    // 1. Load Data Jurnal (Langsung, tanpa menunggu profile)
    // Delay 50ms untuk memastikan input date HTML sudah benar-benar terisi valuenya oleh step 2
    setTimeout(() => {
        loadWeightHistory();
        loadFoodLog(todayStr); 
        loadActivityLog(todayStr);
    }, 50);

    // 2. Load Profil User (Terpisah)
    fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
    })
    .then(res => {
        if (!res.ok) throw new Error('Gagal mengambil profil');
        return res.json();
    })
    .then(user => {
        if(elements.userName) elements.userName.textContent = `Halo, ${user.full_name || user.name}!`;
    })
    .catch(err => {
        console.error("Error init user:", err);
    });
});