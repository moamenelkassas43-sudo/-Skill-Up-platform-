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
window.addEventListener('load', typeWriter);

// Gender Selection
let selectedGender = 'male';
function setGenderChoice(gender) {
    selectedGender = gender;
    document.getElementById('btn-gender-male').classList.toggle('active-male', gender === 'male');
    document.getElementById('btn-gender-female').classList.toggle('active-female', gender === 'female');
}
setGenderChoice('male');

// Toggle Light / Dark Background Theme Mode
function toggleThemeMode() {
    const isDark = document.body.classList.toggle('theme-dark');
    document.body.classList.toggle('theme-light', !isDark);
    document.getElementById('theme-mode-text').textContent = isDark ? 'الوضع الفاتح' : 'الوضع الداكن';
}

// Section Navigation Switcher
function showSection(sectionId) {
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.add('hidden'));
    const activeSection = document.getElementById(sectionId);
    if (activeSection) activeSection.classList.remove('hidden');
}

// Register Form Submission
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const studentData = {
        name: document.getElementById('reg-name').value,
        phone: document.getElementById('reg-phone').value,
        grade: document.getElementById('reg-grade').value,
        school: document.getElementById('reg-school').value,
        pass: document.getElementById('reg-pass').value,
        gender: selectedGender,
        message: 'لا يوجد رسالة بعد'
    };

    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    studentsList.push(studentData);
    localStorage.setItem('platform_students', JSON.stringify(studentsList));
    localStorage.setItem('current_user', JSON.stringify(studentData));

    document.getElementById('user-badge').textContent = `${studentData.name} (${studentData.grade})`;
    document.getElementById('intro-screen').classList.add('hidden');
    
    const mainApp = document.getElementById('main-app');
    mainApp.classList.remove('hidden');
    setTimeout(() => mainApp.classList.remove('opacity-0'), 50);
});

// Student Direct Message to Admin
document.getElementById('student-msg-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const msgText = document.getElementById('student-msg-text').value;
    const currentUser = JSON.parse(localStorage.getItem('current_user'));

    if (!currentUser) return alert('سجل دخولك أولاً');

    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    studentsList = studentsList.map(st => {
        if (st.phone === currentUser.phone) st.message = msgText;
        return st;
    });

    localStorage.setItem('platform_students', JSON.stringify(studentsList));
    alert('تم إرسال رسالتك بنجاح إلى لوحة التحكم!');
    document.getElementById('student-msg-text').value = '';
});

// Admin Panel Logic (Password: 1122334455)
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

function loadDashboardData() {
    const studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    const tableBody = document.getElementById('admin-table-body');
    tableBody.innerHTML = '';
    
    let msgCount = 0;
    document.getElementById('stat-students-count').textContent = studentsList.length;

    studentsList.forEach(st => {
        if (st.message && st.message !== 'لا يوجد رسالة بعد') msgCount++;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="p-3 font-bold text-white">${st.name}</td>
            <td class="p-3 text-amber-300 font-bold">${st.grade || 'غير محدد'}</td>
            <td class="p-3 text-amber-400 font-mono" dir="ltr">${st.phone}</td>
            <td class="p-3 text-slate-300">${st.school}</td>
            <td class="p-3 font-bold ${st.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}">${st.gender === 'male' ? 'ولد' : 'بنت'}</td>
            <td class="p-3 text-slate-100 font-bold">${st.message}</td>
        `;
        tableBody.appendChild(tr);
    });
    document.getElementById('stat-messages-count').textContent = msgCount;
}
