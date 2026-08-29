// Typing effect
const typingTextElement = document.getElementById('typing-text');
const fullText = "Mr. Ashraf Bassiouny: An Expert Teacher in English";
let charIndex = 0;

function typeWriter() {
    if (charIndex < fullText.length) {
        typingTextElement.textContent += fullText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 35);
    } else {
        document.getElementById('registration-box').classList.remove('hidden');
    }
}

// Sound & Vibration Trigger
function triggerNotificationAlert() {
    // Play Notification Sound
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 587.33; // D5 Note
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}

    // Phone Vibration
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

// Check Session & Badges on load
window.addEventListener('load', () => {
    const savedUser = JSON.parse(localStorage.getItem('current_user'));
    
    if (savedUser) {
        document.getElementById('intro-screen').classList.add('hidden');
        showMainApp(savedUser);
    } else {
        typeWriter();
    }
    loadNews();
    checkNotificationBadges();
});

// Theme Toggle Mechanism
function toggleTheme() {
    const body = document.getElementById('app-body');
    const themeBtnText = document.getElementById('theme-btn-text');
    if (body.classList.contains('theme-dark')) {
        body.classList.remove('theme-dark');
        body.classList.add('theme-light');
        themeBtnText.textContent = '☀️ الفاتح';
    } else {
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
        themeBtnText.textContent = '🌙 الداكن';
    }
}

function showMainApp(user) {
    document.getElementById('nav-user-name').textContent = user.name.split(' ')[0];
    const mainApp = document.getElementById('main-app');
    mainApp.classList.remove('hidden');
    setTimeout(() => mainApp.classList.remove('opacity-0'), 50);
}

// Gender Choice
let selectedGender = 'male';
function setGenderChoice(gender) {
    selectedGender = gender;
    document.getElementById('btn-gender-male').classList.toggle('active-male', gender === 'male');
    document.getElementById('btn-gender-female').classList.toggle('active-female', gender === 'female');
}
setGenderChoice('male');

function showSection(sectionId) {
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.add('hidden'));
    const activeSection = document.getElementById(sectionId);
    if (activeSection) activeSection.classList.remove('hidden');

    // Remove Red Badge from News upon clicking
    if (sectionId === 'news') {
        document.getElementById('badge-news-nav').classList.add('hidden');
        document.getElementById('badge-news-mobile').classList.add('hidden');
    }
}

// Registration Submit
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const studentData = {
        id: Date.now(),
        name: document.getElementById('reg-name').value,
        phone: document.getElementById('reg-phone').value,
        grade: document.getElementById('reg-grade').value,
        school: document.getElementById('reg-school').value,
        pass: document.getElementById('reg-pass').value,
        gender: selectedGender,
        message: 'عضو مُسجّل بالمنصة',
        adminReply: 'أهلاً بك في المنصة'
    };

    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    studentsList.push(studentData);
    localStorage.setItem('platform_students', JSON.stringify(studentsList));
    localStorage.setItem('current_user', JSON.stringify(studentData));

    document.getElementById('intro-screen').classList.add('hidden');
    showMainApp(studentData);
});

// Check & Display Red Badges
function checkNotificationBadges() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser) return;

    const studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    const myData = studentsList.find(st => st.phone === currentUser.phone);

    if (myData && myData.hasNewReply) {
        document.getElementById('badge-user-nav').classList.remove('hidden');
        document.getElementById('badge-user-mobile').classList.remove('hidden');
    }
}

// Account Modal Actions
function openUserAccountModal() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser) return;

    document.getElementById('user-account-modal').classList.remove('hidden');
    
    // Clear Badge
    document.getElementById('badge-user-nav').classList.add('hidden');
    document.getElementById('badge-user-mobile').classList.add('hidden');

    const infoCard = document.getElementById('user-info-card');
    infoCard.innerHTML = `
        <p class="font-bold">${currentUser.name}</p>
        <p class="text-amber-400 font-semibold">${currentUser.grade}</p>
        <p class="text-slate-400 text-[11px]">${currentUser.school}</p>
    `;

    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    const myData = studentsList.find(st => st.phone === currentUser.phone);
    if (myData) {
        document.getElementById('user-reply-box').textContent = myData.adminReply || 'لا يوجد رد بعد.';
        myData.hasNewReply = false;
        localStorage.setItem('platform_students', JSON.stringify(studentsList));
    }
}

function closeUserAccountModal() { document.getElementById('user-account-modal').classList.add('hidden'); }
function logoutUser() { localStorage.removeItem('current_user'); location.reload(); }

// Send Message
document.getElementById('student-msg-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const msgText = document.getElementById('student-msg-text').value;
    const currentUser = JSON.parse(localStorage.getItem('current_user'));

    if (!currentUser) return;

    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    studentsList = studentsList.map(st => {
        if (st.phone === currentUser.phone) st.message = msgText;
        return st;
    });

    localStorage.setItem('platform_students', JSON.stringify(studentsList));
    alert('تم إرسال الرسالة للأدمن!');
    document.getElementById('student-msg-text').value = '';
});

// Admin Control Panel Modal
function openAdminModal() { document.getElementById('admin-modal').classList.remove('hidden'); }
function closeAdminModal() { 
    document.getElementById('admin-modal').classList.add('hidden'); 
    document.getElementById('admin-auth').classList.remove('hidden');
    document.getElementById('admin-dashboard-content').classList.add('hidden');
}

function verifyAdminPass() {
    if (document.getElementById('admin-pass-input').value === '1122334455') {
        document.getElementById('admin-auth').classList.add('hidden');
        document.getElementById('admin-dashboard-content').classList.remove('hidden');
        loadDashboardData();
    } else {
        alert('كلمة السر خاطئة!');
    }
}

// Admin Reply & Delete Functions
function replyToStudent(phone) {
    const replyText = prompt("أدخل رد الأدمن/المستر للطالب:");
    if (!replyText) return;

    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    studentsList = studentsList.map(st => {
        if (st.phone === phone) {
            st.adminReply = replyText;
            st.hasNewReply = true;
        }
        return st;
    });

    localStorage.setItem('platform_students', JSON.stringify(studentsList));
    triggerNotificationAlert();
    loadDashboardData();
}

function deleteStudentData(phone) {
    if (!confirm('هل تريد حذف هذه الرسالة/الطالب؟')) return;

    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    studentsList = studentsList.filter(st => st.phone !== phone);

    localStorage.setItem('platform_students', JSON.stringify(studentsList));
    loadDashboardData();
}

function loadDashboardData() {
    const studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    const tableBody = document.getElementById('admin-table-body');
    tableBody.innerHTML = '';

    studentsList.forEach(st => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="p-2.5 font-bold">${st.name}</td>
            <td class="p-2.5 text-amber-400">${st.grade || 'عام'}</td>
            <td class="p-2.5 font-mono" dir="ltr">${st.phone}</td>
            <td class="p-2.5">${st.message}</td>
            <td class="p-2.5 text-amber-400 font-bold">${st.adminReply || '-'}</td>
            <td class="p-2.5 flex justify-center gap-1">
                <button onclick="replyToStudent('${st.phone}')" class="px-2 py-1 bg-amber-400 text-slate-950 rounded font-bold text-[11px]">رد</button>
                <button onclick="deleteStudentData('${st.phone}')" class="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-bold text-[11px]">حذف</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// News Functionality & Trigger Red Badges
function publishNews() {
    const text = document.getElementById('admin-news-input').value;
    if (!text) return;
    let newsList = JSON.parse(localStorage.getItem('platform_news')) || [];
    newsList.unshift(text);
    localStorage.setItem('platform_news', JSON.stringify(newsList));
    document.getElementById('admin-news-input').value = '';

    // Show Red Badges
    document.getElementById('badge-news-nav').classList.remove('hidden');
    document.getElementById('badge-news-mobile').classList.remove('hidden');
    
    triggerNotificationAlert();
    alert('تم نشر الخبر مع تفعيل صوت وإشعار التنبيه!');
    loadNews();
}

function loadNews() {
    const newsList = JSON.parse(localStorage.getItem('platform_news')) || ["مرحباً بكم في التحديث الجديد لمنصة مستر أشرف بسيوني."];
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        newsContainer.innerHTML = newsList.map(n => `
            <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 font-bold text-xs">
                📌 ${n}
            </div>
        `).join('');
    }
}
