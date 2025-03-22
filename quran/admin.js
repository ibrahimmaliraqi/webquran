document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const API_URL = 'https://basmaapi.pythonanywhere.com';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // حفظ حالة تسجيل الدخول
                localStorage.setItem('isAdmin', 'true');
                // التوجيه إلى صفحة البصمات
                window.location.href = 'basamat.html';
            } else {
                alert('خطأ في تسجيل الدخول: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ في الاتصال بالخادم');
        }
    });
});