// Typing Animation
const typingTextElement = document.getElementById('typing-text');
const fullText = "Mr. Ashraf Bassiouny: An Expert Teacher in English";
let charIndex = 0;

function typeWriter() {
    if (charIndex < fullText.length) {
        typingTextElement.textContent += fullText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 40);
    } else {
        document.getElementById('registration-box').classList.remove('hidden');
    }
}
window.addEventListener('load', () => {
    typeWriter();
    requestNotificationPermission();
    loadNews();
});

// Request Mobile/Browser Notifications
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}

function sendMobileNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: body });
    }
}

// Gender Theme Selection
let selectedGender = 'male';
function setGenderChoice(gender) {
    selectedGender = gender;
    document.getElementById('btn-gender-male').classList.toggle('active-male', gender === 'male');
    document.getElementById('btn-gender-female').classList.toggle('active-female', gender === 'female');
}
setGenderChoice('male');

function toggleThemeMode() {
    const isDark = document.body.classList.toggle('theme-dark');
    document.body.classList.toggle('theme-light', !isDark);
    document.getElementById('theme-mode-text').textContent = isDark ? 'الوضع الفاتح' : 'الوضع الداكن';
}

function showSection(sectionId) {
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.add('hidden'));
    const activeSection = document.getElementById(sectionId);
    if (activeSection) activeSection.classList.remove('hidden');
}

// Student Registration
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const studentData = {
        name: document.getElementById('reg-name').value,
        phone: document.getElementById('reg-phone').value,
        grade: document.getElementById('reg-grade').value,
        school: document.getElementById('reg-school').value,
        pass: document.getElementById('reg-pass').value,
        gender: selectedGender,
        message: 'لا يوجد رسالة بعد',
        adminReply: 'لا يوجد رد بعد'
    };

    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    studentsList.push(studentData);
    localStorage.setItem('platform_students', JSON.stringify(studentsList));
    localStorage.setItem('current_user', JSON.stringify(studentData));

    document.getElementById('intro-screen').classList.add('hidden');
    const mainApp = document.getElementById('main-app');
    mainApp.classList.remove('hidden');
    setTimeout(() => mainApp.classList.remove('opacity-0'), 50);
});

// Account & Notification Modal Logic
function openUserAccountModal() {
    document.getElementById('user-account-modal').classList.remove('hidden');
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    const studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    
    if (currentUser) {
        const myData = studentsList.find(st => st.phone === currentUser.phone);
        if (myData && myData.adminReply) {
            document.getElementById('user-reply-box').textContent = myData.adminReply;
        }
    }
}

function closeUserAccountModal() {
    document.getElementById('user-account-modal').classList.add('hidden');
}

// News Functionality
function publishNews() {
    const text = document.getElementById('admin-news-input').value;
    if (!text) return;
    let newsList = JSON.parse(localStorage.getItem('platform_news')) || [];
    newsList.unshift(text);
    localStorage.setItem('platform_news', JSON.stringify(newsList));
    document.getElementById('admin-news-input').value = '';
    alert('تم نشر الخبر بنجاح!');
    sendMobileNotification("تنويه جديد من مستر أشرف بسيوني", text);
    loadNews();
}

function loadNews() {
    const newsList = JSON.parse(localStorage.getItem('platform_news')) || ["أهلاً بكم في المنصة التعليمية لمستر أشرف بسيوني."];
    const newsContainer = document.getElementById('news-container');
    const notifList = document.getElementById('user-notifications-list');

    if (newsContainer) {
        newsContainer.innerHTML = newsList.map(n => `
            <div class="p-4 rounded-2xl bg-slate-900 border border-amber-400/30 font-bold text-sm text-slate-200">
                📌 ${n}
            </div>
        `).join('');
    }

    if (notifList) {
        notifList.innerHTML = newsList.map(n => `<div class="p-2 rounded bg-slate-950 text-xs text-slate-300">🔔 ${n}</div>`).join('');
    }
}

// Admin Panel Logic & Reply to Student
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
        alert('كلمة السر غير صحيحة!');
    }
}

function replyToStudent(phone) {
    const replyText = prompt("أدخل رد الأدمن للطالب:");
    if (!replyText) return;

    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    studentsList = studentsList.map(st => {
        if (st.phone === phone) st.adminReply = replyText;
        return st;
    });

    localStorage.setItem('platform_students', JSON.stringify(studentsList));
    alert('تم إرسال الرد للطالب!');
    sendMobileNotification("رد جديد من مستر أشرف", replyText);
    loadDashboardData();
}

function loadDashboardData() {
    const studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    const tableBody = document.getElementById('admin-table-body');
    tableBody.innerHTML = '';

    studentsList.forEach(st => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="p-3 font-bold text-white">${st.name}</td>
            <td class="p-3 text-amber-300 font-bold">${st.grade || 'غير محدد'}</td>
            <td class="p-3 font-mono" dir="ltr">${st.phone}</td>
            <td class="p-3 text-slate-200">${st.message}</td>
            <td class="p-3 text-amber-400 font-bold">${st.adminReply || 'لا يوجد'}</td>
            <td class="p-3">
                <button onclick="replyToStudent('${st.phone}')" class="px-3 py-1 bg-amber-400 text-slate-950 rounded-lg text-xs font-bold">رد</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}
