// Modal functionality
const modal = document.getElementById('videoModal');
const videoFrame = document.getElementById('videoFrame');
const closeModal = document.querySelector('.close-modal');

function openVideoModal(videoUrl) {
    videoFrame.src = videoUrl;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    modal.style.display = 'none';
    videoFrame.src = '';
    document.body.style.overflow = 'auto';
}

closeModal.onclick = closeVideoModal;
window.onclick = (event) => {
    if (event.target == modal) {
        closeVideoModal();
    }
};

async function fetchTadaborData() {
    try {
        const response = await fetch('https://mp3quran.net/api/v3/tadabor');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const tadaborContent = document.getElementById('tadabor-content');
        tadaborContent.innerHTML = '';

        if (data.tadabor && Object.keys(data.tadabor).length > 0) {
            for (const suraNumber in data.tadabor) {
                if (data.tadabor.hasOwnProperty(suraNumber)) {
                    const tadaborItems = data.tadabor[suraNumber];

                    if (Array.isArray(tadaborItems)) {
                        tadaborItems.forEach(item => {
                            const tadaborItem = document.createElement('div');
                            tadaborItem.classList.add('tadabor-item');
                            tadaborItem.innerHTML = `
                                <div class="item-header">
                                    <h2>${item.sora_name}</h2>
                                </div>
                                <div class="item-content">
                                    <span class="reciter-name">القارئ: ${item.reciter_name}</span>
                                    <div class="video-thumbnail">
                                        ${item.image_url ? `<img src="${item.image_url}" alt="${item.sora_name}" class="tadabor-image">` : ''}
                                        ${item.video_url ? `<button onclick="openVideoModal('${item.video_url}')" class="play-button">
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                        </button>` : ''}
                                    </div>
                                    <p class="tadabor-text">${item.text}</p>
                                </div>
                            `;
                            tadaborContent.appendChild(tadaborItem);
                        });
                    }
                }
            }
        } else {
            tadaborContent.innerHTML = '<div class="no-data">لا توجد بيانات تدبر متاحة</div>';
        }
    } catch (error) {
        console.error('❌ حدث خطأ أثناء جلب بيانات التدبر:', error);
        document.getElementById('tadabor-content').innerHTML = 
            '<div class="error-message">⚠️ حدث خطأ أثناء جلب البيانات</div>';
    }
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    fetchTadaborData();
    document.documentElement.style.scrollBehavior = 'smooth';
});