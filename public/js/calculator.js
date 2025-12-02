document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calcForm');
    const resultArea = document.getElementById('resultArea');
    const bmiValue = document.getElementById('bmiValue');
    const bmiCategory = document.getElementById('bmiCategory');
    const tdeeValue = document.getElementById('tdeeValue');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Ambil Nilai
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const age = parseFloat(document.getElementById('age').value);
        const height = parseFloat(document.getElementById('height').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const activity = parseFloat(document.getElementById('activity').value);

        if (!age || !height || !weight) return;

        // 2. Hitung BMI (Berat / (Tinggi/100)^2)
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);

        // 3. Tentukan Kategori BMI
        let category = '';
        let color = '';

        if (bmi < 18.5) {
            category = 'Underweight (Kurus)';
            color = '#f59e0b'; // Kuning
        } else if (bmi >= 18.5 && bmi < 24.9) {
            category = 'Ideal (Normal)';
            color = '#10B981'; // Hijau
        } else if (bmi >= 25 && bmi < 29.9) {
            category = 'Overweight (Gemuk)';
            color = '#f97316'; // Oranye
        } else {
            category = 'Obesity (Obesitas)';
            color = '#ef4444'; // Merah
        }

        // 4. Hitung BMR (Mifflin-St Jeor Equation)
        let bmr = 0;
        if (gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        // 5. Hitung TDEE
        const tdee = Math.round(bmr * activity);

        // 6. Tampilkan Hasil
        bmiValue.textContent = bmi.toFixed(1);
        bmiCategory.textContent = category;
        bmiCategory.style.color = color;
        tdeeValue.textContent = `${tdee.toLocaleString()} kkal / hari`;

        // Animasi Fade In sederhana
        resultArea.style.display = 'flex';
        resultArea.scrollIntoView({ behavior: 'smooth' });
    });
});