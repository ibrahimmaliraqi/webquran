document.addEventListener('DOMContentLoaded', function() {
    const addBasmaBtn = document.getElementById('add-basma-btn');
    const formContainer = document.getElementById('basma-form-container');
    const basmaForm = document.getElementById('basma-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const basamatContainer = document.getElementById('basamat-container');

    const API_URL = 'https://basmaapi.pythonanywhere.com';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    // إضافة زر تسجيل دخول الأدمن وتسجيل الخروج
    if (isAdmin) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'logout-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> تسجيل خروج';
        logoutBtn.onclick = () => {
            localStorage.removeItem('isAdmin');
            window.location.reload();
        };
        addBasmaBtn.parentNode.insertBefore(logoutBtn, addBasmaBtn);
    } else {
        const adminLoginBtn = document.createElement('button');
        // adminLoginBtn.className = 'add-basma-btn';
        // adminLoginBtn.style.backgroundColor = '#1976d2';
        // adminLoginBtn.innerHTML = '<i class="fas fa-user-shield"></i> تسجيل دخول الأدمن';
        // adminLoginBtn.onclick = () => window.location.href = 'admin.html';
        addBasmaBtn.parentNode.insertBefore(adminLoginBtn, addBasmaBtn);
    }

    // Toggle form visibility
    addBasmaBtn.addEventListener('click', () => {
        formContainer.classList.toggle('active');
    });

    // Hide form on cancel
    cancelBtn.addEventListener('click', () => {
        formContainer.classList.remove('active');
        basmaForm.reset();
    });

    // Handle form submission
    basmaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const effect = document.getElementById('impact').value.trim();

        if (!name || !effect) {
            alert('يرجى ملء جميع الحقول');
            return;
        }

        const now = new Date();
        const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }).format(now);

        const data = {
            name: name,
            effect: effect,
            gregorian_date: now.toLocaleDateString('ar-SA'),
            hijri_date: hijriDate,
            time: now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
        };

        try {
            const response = await fetch(`${API_URL}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save data');
            }

            const result = await response.json();
            
            if (result.message === "Data saved successfully") {
                alert('تم إضافة أثرك بنجاح');
                formContainer.classList.remove('active');
                basmaForm.reset();
                await loadBasamat();
            } else {
                throw new Error('Failed to save data');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ في حفظ البيانات: ' + error.message);
        }
    });

    // دالة حذف البصمة للأدمن
    async function deleteBasma(basmaId) {
        if (!confirm('هل أنت متأكد من حذف هذه البصمة؟')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/delete/${basmaId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Basic ' + btoa('almgroad:07708335744.iA')
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete basma');
            }

            await loadBasamat();
            alert('تم حذف البصمة بنجاح');
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ في حذف البصمة');
        }
    }

    // عرض البصمات
    function displayBasamat(basamat) {
        basamatContainer.innerHTML = '';

        if (!basamat || basamat.length === 0) {
            basamatContainer.innerHTML = `
                <div class="no-basamat">
                    لا يوجد شي بعد. كن أول من يترك أثراً!
                </div>
            `;
            return;
        }

        // عرض البصمات من الأحدث إلى الأقدم
        basamat.reverse().forEach(basma => {
            const basmaElement = document.createElement('div');
            basmaElement.className = 'basma-card';
            basmaElement.innerHTML = `
                <div class="basma-header">
                    <div class="basma-author">${basma.name}</div>
                    <div class="basma-date-time">
                        <span class="basma-date">${basma.hijri_date}</span>
                        <span class="basma-time">${basma.time}</span>
                    </div>
                </div>
                <div class="basma-impact">${basma.effect}</div>
                ${isAdmin ? `
                    <button class="delete-btn" onclick="deleteBasma(${basma.id})">
                        <i class="fas fa-trash"></i>
                        حذف البصمة
                    </button>
                ` : ''}
            `;
            basamatContainer.appendChild(basmaElement);
        });
    }

    // تحميل البصمات من API
    async function loadBasamat() {
        try {
            const response = await fetch(`${API_URL}/get_data`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    displayBasamat([]);
                    return;
                }
                throw new Error('Failed to fetch data');
            }

            const result = await response.json();
            
            if (result.data) {
                displayBasamat(result.data);
            } else {
                displayBasamat([]);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            displayBasamat([]);
        }
    }

    // جعل دالة الحذف متاحة عالمياً
    window.deleteBasma = deleteBasma;

    // تحميل البيانات عند بدء التطبيق
    loadBasamat();
});
