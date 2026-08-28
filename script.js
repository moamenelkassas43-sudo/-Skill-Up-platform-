// 1. Typing English Text Animation
const typingTextElement = document.getElementById('typing-text');
const fullText = "Mr. Ashraf Bassiouny: An Expert Teacher in English";
let charIndex = 0;

function typeWriter() {
    if (charIndex < fullText.length) {
        typingTextElement.textContent += fullText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 50);
    } else {
        // Show registration box after typing completes
        document.getElementById('registration-box').classList.remove('hidden');
    }
}

// Start typing animation on window load
window.addEventListener('load', () => {
    typeWriter();
    loadDashboardData();
});

// 2. Gender Selection Theme Logic
let selectedGender = 'male'; // Default choice

function setGenderChoice(gender) {
    selectedGender = gender;
    const btnMale = document.getElementById('btn-gender-male');
    const btnFemale = document.getElementById('btn-gender-female');

    if (gender === 'male') {
        btnMale.classList.add('active-male');
        btnFemale.classList.remove('active-female');
    } else {
        btnFemale.classList.add('active-female');
        btnMale.classList.remove('active-male');
    }
}

// Set initial selection
setGenderChoice('male');

// 3. Student Registration & Entry
const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const studentData = {
        name: document.getElementById('reg-name').value,
        phone: document.getElementById('reg-phone').value,
        school: document.getElementById('reg-school').value,
        pass: document.getElementById('reg-pass').value,
        gender: selectedGender,
        message: 'لا يوجد رسالة بعد'
    };

    // Save to LocalStorage
    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    studentsList.push(studentData);
    localStorage.setItem('platform_students', JSON.stringify(studentsList));
    localStorage.setItem('current_user', JSON.stringify(studentData));

    // Apply Gender Theme to Body
    if (selectedGender === 'female') {
        document.body.classList.add('theme-female');
        document.body.classList.remove('theme-male');
    } else {
        document.body.classList.add('theme-male');
        document.body.classList.remove('theme-female');
    }

    // Set User Badge in Navbar
    const userBadge = document.getElementById('user-badge');
    userBadge.textContent = studentData.name;
    userBadge.className = selectedGender === 'female' 
        ? 'px-3 py-1 rounded-full text-xs font-bold border border-pink-500/50 bg-pink-500/10 text-pink-300'
        : 'px-3 py-1 rounded-full text-xs font-bold border border-blue-500/50 bg-blue-500/10 text-blue-300';

    // Transition Screen
    document.getElementById('intro-screen').classList.add('hidden');
    const mainApp = document.getElementById('main-app');
    mainApp.classList.remove('hidden');
    setTimeout(() => {
        mainApp.classList.remove('opacity-0');
    }, 50);

    loadDashboardData();
});

// 4. Student Direct Message Submission
const studentMsgForm = document.getElementById('student-msg-form');

studentMsgForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const msgText = document.getElementById('student-msg-text').value;
    const currentUser = JSON.parse(localStorage.getItem('current_user'));

    if (!currentUser) {
        alert('يرجى إعادة التسجيل أولاً.');
        return;
    }

    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    
    // Update message for student
    studentsList = studentsList.map(student => {
        if (student.phone === currentUser.phone) {
            student.message = msgText;
        }
        return student;
    });

    localStorage.setItem('platform_students', JSON.stringify(studentsList));
    alert('تم إرسال رسالتك بنجاح إلى مستر أشرف بسيوني!');
    document.getElementById('student-msg-text').value = '';
    loadDashboardData();
});

// 5. Admin Dashboard Password & Data Loading
function openAdminModal() {
    document.getElementById('admin-modal').classList.remove('hidden');
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('hidden');
    document.getElementById('admin-auth').classList.remove('hidden');
    document.getElementById('admin-dashboard-content').classList.add('hidden');
    document.getElementById('admin-pass-input').value = '';
}

function verifyAdminPass() {
    const inputPass = document.getElementById('admin-pass-input').value;
    if (inputPass === '1122334455') {
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
    const statStudentsCount = document.getElementById('stat-students-count');
    const statMessagesCount = document.getElementById('stat-messages-count');

    if (!tableBody) return;

    tableBody.innerHTML = '';
    let messagesCount = 0;

    statStudentsCount.textContent = studentsList.length;

    studentsList.forEach(student => {
        if (student.message && student.message !== 'لا يوجد رسالة بعد') {
            messagesCount++;
        }

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-900/60 transition-colors';
        
        tr.innerHTML = `
            <td class="p-3 font-bold text-white">${student.name}</td>
            <td class="p-3 text-amber-400 font-mono" dir="ltr">${student.phone}</td>
            <td class="p-3 text-slate-300">${student.school}</td>
            <td class="p-3 font-bold ${student.gender === 'male' ? 'text-blue-400' : 'text-pink-400'}">
                ${student.gender === 'male' ? 'ولد' : 'بنت'}
            </td>
            <td class="p-3 text-slate-200">${student.message}</td>
        `;

        tableBody.appendChild(tr);
    });

    statMessagesCount.textContent = messagesCount;
}
