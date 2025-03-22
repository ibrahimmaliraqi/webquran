let adhkarData = null;
let currentCategory = '';

async function loadAdhkar() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/ibrahimmaliraqi/adhkar_raw/refs/heads/main/azkar.json');
        const text = await response.text();
        adhkarData = JSON.parse(text);
        populateCategorySelect();
    } catch (error) {
        console.error('حدث خطأ أثناء تحميل الأذكار:', error);
        document.getElementById('adhkar-container').innerHTML = 
            '<div class="error-message">حدث خطأ أثناء تحميل الأذكار. الرجاء المحاولة مرة أخرى لاحقاً.</div>';
    }
}

function populateCategorySelect() {
    const select = document.getElementById('category-select');
    if (adhkarData) {
        const categories = Object.keys(adhkarData);
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }
}

function displayAdhkar(category) {
    const container = document.getElementById('adhkar-container');
    container.innerHTML = '';
    currentCategory = category;

    // إزالة مؤشر التقدم السابق إذا وجد
    const existingProgress = document.querySelector('.category-progress');
    if (existingProgress) {
        existingProgress.remove();
    }

    if (!category || !adhkarData || !adhkarData[category]) return;

    // إضافة مؤشر التقدم
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'category-progress';
    progressIndicator.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
        <div class="progress-text">0%</div>
    `;
    document.querySelector('.category-selector').appendChild(progressIndicator);

    const adhkar = adhkarData[category];
    if (Array.isArray(adhkar)) {
        const completedDhikrs = JSON.parse(localStorage.getItem('completedDhikrs') || '{}');
        const completedCount = completedDhikrs[category]?.length || 0;
        const totalAdhkar = adhkar.filter(d => d.content && d.content !== 'stop').length;
        
        updateProgress(completedCount, totalAdhkar);

        adhkar.forEach((dhikr, index) => {
            if (dhikr.content && dhikr.content !== 'stop') {
                const card = createDhikrCard(dhikr, totalAdhkar);
                container.appendChild(card);
            }
        });
    }
}

function createDhikrCard(dhikr, totalAdhkar) {
    const card = document.createElement('div');
    card.className = 'dhikr-card';

    const content = document.createElement('div');
    content.className = 'dhikr-content';
    content.textContent = cleanText(dhikr.content);
    card.appendChild(content);

    const info = document.createElement('div');
    info.className = 'dhikr-info';

    const requiredCount = parseInt(dhikr.count) || 1;
    let currentCount = 0;

    const counterDisplay = document.createElement('div');
    counterDisplay.className = 'dhikr-count';
    counterDisplay.textContent = `${currentCount}/${requiredCount}`;
    info.appendChild(counterDisplay);

    if (dhikr.description) {
        const description = document.createElement('div');
        description.className = 'dhikr-description';
        description.textContent = cleanText(dhikr.description);
        info.appendChild(description);
    }

    if (dhikr.reference) {
        const reference = document.createElement('div');
        reference.className = 'dhikr-reference';
        reference.textContent = cleanText(dhikr.reference);
        info.appendChild(reference);
    }

    card.appendChild(info);

    const progressBtn = document.createElement('button');
    progressBtn.className = 'dhikr-progress-btn';
    progressBtn.textContent = 'تسجيل';
    card.appendChild(progressBtn);

    progressBtn.addEventListener('click', () => {
        if (!card.classList.contains('completed')) {
            currentCount++;
            counterDisplay.textContent = `${currentCount}/${requiredCount}`;
            
            if (currentCount >= requiredCount) {
                completeCard();
            }
        }
    });

    function completeCard() {
        card.classList.add('completed');
        progressBtn.className = 'dhikr-progress-btn completed';
        progressBtn.textContent = 'تم ✓';
        progressBtn.disabled = true;

        const badge = document.createElement('div');
        badge.className = 'completion-badge';
        badge.innerHTML = '✓';
        card.appendChild(badge);

        const completedDhikrs = JSON.parse(localStorage.getItem('completedDhikrs') || '{}');
        if (!completedDhikrs[currentCategory]) {
            completedDhikrs[currentCategory] = [];
        }
        if (!completedDhikrs[currentCategory].includes(dhikr.content)) {
            completedDhikrs[currentCategory].push(dhikr.content);
            localStorage.setItem('completedDhikrs', JSON.stringify(completedDhikrs));
            updateProgress(completedDhikrs[currentCategory].length, totalAdhkar);
        }
    }

    // التحقق من حالة الإكمال المخزنة
    const completedDhikrs = JSON.parse(localStorage.getItem('completedDhikrs') || '{}');
    if (completedDhikrs[currentCategory]?.includes(dhikr.content)) {
        currentCount = requiredCount;
        counterDisplay.textContent = `${currentCount}/${requiredCount}`;
        completeCard();
    }

    return card;
}

function updateProgress(completed, total) {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    if (!progressFill || !progressText) return;

    const percentage = Math.round((completed / total) * 100);
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;

    if (percentage === 100) {
        progressFill.classList.add('completed');
        const existingMessage = document.querySelector('.completion-message');
        if (!existingMessage) {
            const message = document.createElement('div');
            message.className = 'completion-message';
            message.textContent = 'أحسنت! لقد أكملت جميع الأذكار';
            document.querySelector('.category-selector').appendChild(message);
        }
    }
}

function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\\n/g, ' ')
        .replace(/'/g, '')
        .replace(/\\/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// إضافة زر إعادة التعيين
function addResetButton() {
    const container = document.querySelector('.category-selector');
    const resetBtn = document.createElement('button');
    resetBtn.className = 'reset-progress-btn';
    resetBtn.textContent = 'إعادة تعيين التقدم';

    resetBtn.addEventListener('click', () => {
        if (confirm('هل أنت متأكد من رغبتك في إعادة تعيين جميع الأذكار؟')) {
            localStorage.removeItem('completedDhikrs');
            const category = document.getElementById('category-select').value;
            if (category) {
                displayAdhkar(category);
            }
        }
    });

    container.appendChild(resetBtn);
}

document.addEventListener('DOMContentLoaded', () => {
    loadAdhkar();
    addResetButton();
    
    const categorySelect = document.getElementById('category-select');
    categorySelect.addEventListener('change', (e) => {
        displayAdhkar(e.target.value);
    });
});