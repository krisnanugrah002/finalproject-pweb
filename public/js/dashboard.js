document.addEventListener('DOMContentLoaded', () => {
    // 1. Set Tanggal Hari Ini
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('id-ID', dateOptions);

    // 2. Inisialisasi Chart.js (Dummy Data Dulu)
    const ctx = document.getElementById('weightChart').getContext('2d');
    const weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
            datasets: [{
                label: 'Berat Badan (kg)',
                data: [70.5, 70.2, 70.0, 69.8, 69.9, 69.5, 69.2], // Nanti ini diambil dari API
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false } // Agar grafik fokus di range berat badan
            }
        }
    });

    // 3. Logic Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        // Nanti hapus token JWT disini
        // localStorage.removeItem('token');
        alert('Anda telah keluar.');
        window.location.href = 'index.html';
    });

    // --- MOCK LOGIC UNTUK FRONTEND TESTING ---
    // Karena backend belum ada, form submit hanya alert saja dulu.
    
    document.getElementById('foodForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = e.target.querySelectorAll('input');
        const name = input[0].value;
        const cal = input[1].value;
        
        // Simulasi nambah ke list HTML
        const list = document.getElementById('foodList');
        if (list.querySelector('div').textContent.includes('Belum ada')) list.innerHTML = '';
        
        const item = document.createElement('div');
        item.className = 'log-item';
        item.innerHTML = `
            <span>${name}</span>
            <span style="font-weight:bold; color:var(--primary-color);">+${cal} kkal</span>
        `;
        list.appendChild(item);
        
        // Reset form
        e.target.reset();
        
        // Update Ringkasan (Simple math simulation)
        const total = document.getElementById('totalFood');
        total.textContent = parseInt(total.textContent) + parseInt(cal);
        updateNet();
    });

    document.getElementById('activityForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = e.target.querySelectorAll('input');
        const name = input[0].value;
        const cal = input[1].value;

        const list = document.getElementById('activityList');
        if (list.querySelector('div').textContent.includes('Belum ada')) list.innerHTML = '';

        const item = document.createElement('div');
        item.className = 'log-item';
        item.innerHTML = `
            <span>${name}</span>
            <span style="font-weight:bold; color:#f97316;">-${cal} kkal</span>
        `;
        list.appendChild(item);

        e.target.reset();

        const total = document.getElementById('totalBurned');
        total.textContent = parseInt(total.textContent) + parseInt(cal);
        updateNet();
    });

    function updateNet() {
        const food = parseInt(document.getElementById('totalFood').textContent);
        const burn = parseInt(document.getElementById('totalBurned').textContent);
        document.getElementById('netCalories').textContent = food - burn;
    }
});