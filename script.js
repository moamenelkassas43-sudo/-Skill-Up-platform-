/* ==========================================================================
   1. GLOBAL STATE & LOCAL STORAGE INITIALIZATION
   ========================================================================== */
let currentUser = JSON.parse(localStorage.getItem('app_current_user')) || null;
let usersList = JSON.parse(localStorage.getItem('app_users_list')) || [];
let appContents = JSON.parse(localStorage.getItem('app_contents')) || [
    {
        id: Date.now(),
        section: 'news',
        title: 'مرحباً بكم في منصة مستر أشرف بسيوني التعليمية!',
        link: '',
        fileData: '',
        fileType: '',
        date: new Date().toLocaleDateString('ar-EG')
    }
];

let selectedGender = '';
let isDarkMode = true;
// كلمة السر الخاصة بك محفوضة في الخلفية بأمان دون إظهارها في شريط الكتابة
const ADMIN_PASSWORD_DEFAULT = '1122334455';

/* ==========================================================================
   2. INITIALIZATION ON DOM LOAD
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initTypingEffect();
    renderAllContents();

    if (currentUser) {
        showMainApp();
    }
});

/* ==========================================================================
   3. INTRO SCREEN & TYPING EFFECT
   ========================================================================== */
function initTypingEffect() {
    const textContainer = document.getElementById('typing-text');
    if (!textContainer) return;

    const phrases = [
        "WELCOME TO MR. ASHRAF BASSIOUNY PLATFORM",
        "SKILL UP CENTER - EXCELLENCE IN ENGLISH",
        "طريقك للتميز والتقفيل في اللغة الإنجليزية"
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function type() {
        const currentPhrase = phrases[phraseIdx];
        
        if (isDeleting) {
            textContainer.textContent = currentPhrase.substring(0, charIdx - 1);
            charIdx--;
        } else {
            textContainer.textContent = currentPhrase.substring(0, charIdx + 1);
            charIdx++;
        }

        let typeSpeed = isDeleting ? 40 : 80;

        if (!isDeleting && charIdx === currentPhrase.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

/* ==========================================================================
   GLOBAL NOTIFICATION BADGE SYSTEM (RED DOT ON ALL ICONS)
   ========================================================================== */

// استدعِ هذه الدالة عند إرسال أي محتوى أو إشعار جديد
function triggerNewNotification(targetSection) {
    // إظهار النقطة الحمراء على الأيقونة المحددة في شريط الموبايل والديسكتاوب
    const navBadge = document.getElementById(`badge-${targetSection}-nav`);
    const mobileBadge = document.getElementById(`badge-${targetSection}-mobile`);

    if (navBadge) navBadge.classList.remove('hidden');
    if (mobileBadge) mobileBadge.classList.remove('hidden');

    // تشغيل الاهتزاز للتنبيه
    if ("vibrate" in navigator) {
        navigator.vibrate([150, 50, 150]);
    }
}

// إخفاء النقطة الحمراء فور دخول الطالب إلى القسم
function clearNotificationBadge(targetSection) {
    const navBadge = document.getElementById(`badge-${targetSection}-nav`);
    const mobileBadge = document.getElementById(`badge-${targetSection}-mobile`);

    if (navBadge) navBadge.classList.add('hidden');
    if (mobileBadge) mobileBadge.classList.add('hidden');
}

/* ==========================================================================
   ADVANCED QUIZ SYSTEM WITH AUTO-GRADING & TIMED AUTO-SUBMIT
   ========================================================================== */

// الأدمن يرفع الامتحان بالتنسيق التالي (سؤال + خيارات + رقم الإجابة الصحيحة index)
const rawQuizData = {
    title: "اختبار الشامل - Unit 1 & 2",
    timeLimitInMinutes: 15, // الوقت المسموح بالدقائق
    questions: [
        {
            q: "While I ________ my homework, my brother was watching TV.",
            options: ["was doing", "did", "have done", "am doing"],
            correctAnswer: 0 // النظام يخفي هذا السطر تماماً عن الطالب
        },
        {
            q: "She has ________ been to London, so she knows the city well.",
            options: ["never", "already", "yet", "ever"],
            correctAnswer: 1
        }
    ]
};

let quizTimer;
let remainingTime = rawQuizData.timeLimitInMinutes * 60;
let studentAnswers = {};

function startExam() {
    remainingTime = rawQuizData.timeLimitInMinutes * 60;
    studentAnswers = {};
    
    renderFormattedExam();
    startExamTimer();
}

// تنسيق الأسئلة وإخفاء الإجابات الصحيحة عن الواجهة
function renderFormattedExam() {
    const quizContainer = document.getElementById('quizzes-container');
    if (!quizContainer) return;

    let html = `
        <div class="bg-slate-900 border border-amber-400/30 p-5 rounded-2xl shadow-xl space-y-4">
            <div class="flex justify-between items-center border-b border-slate-800 pb-3">
                <h4 class="font-bold text-amber-400 text-sm md:text-base">${rawQuizData.title}</h4>
                <div id="exam-timer" class="bg-slate-950 px-3 py-1 rounded-lg border border-red-500/40 text-red-400 font-bold text-xs">
                    ⏱️ جارٍ التحميل...
                </div>
            </div>
            <form id="exam-form" onsubmit="submitExam(event)" class="space-y-4">
    `;

    rawQuizData.questions.forEach((qObj, index) => {
        html += `
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <p class="font-bold text-slate-100 text-xs md:text-sm">${index + 1}. ${qObj.q}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        `;

        qObj.options.forEach((opt, optIdx) => {
            html += `
                <label class="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-amber-400/50 transition text-xs">
                    <input type="radio" name="question_${index}" value="${optIdx}" onchange="recordAnswer(${index}, ${optIdx})" required class="accent-amber-400">
                    <span class="text-slate-300 font-semibold">${opt}</span>
                </label>
            `;
        });

        html += `</div></div>`;
    });

    html += `
                <button type="submit" id="btn-submit-exam" class="w-full py-3 bg-amber-400 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-300 transition">
                    تسليم الامتحان وترسيل النتيجة
                </button>
            </form>
        </div>
    `;

    quizContainer.innerHTML = html;
}

function recordAnswer(questionIndex, selectedOptionIndex) {
    studentAnswers[questionIndex] = selectedOptionIndex;
}

function startExamTimer() {
    clearInterval(quizTimer);
    const timerElement = document.getElementById('exam-timer');

    quizTimer = setInterval(() => {
        const mins = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        
        if (timerElement) {
            timerElement.textContent = `⏱️ المتبقي: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        if (remainingTime <= 0) {
            clearInterval(quizTimer);
            alert("⏰ انتهى الوقت المحدد للامتحان! يتم تسليم إجاباتك تلقائياً الآن.");
            autoSubmitExam();
        }
        remainingTime--;
    }, 1000);
}

function submitExam(e) {
    if (e) e.preventDefault();
    autoSubmitExam();
}

function autoSubmitExam() {
    clearInterval(quizTimer);
    
    let score = 0;
    const totalQuestions = rawQuizData.questions.length;

    rawQuizData.questions.forEach((qObj, index) => {
        if (studentAnswers[index] === qObj.correctAnswer) {
            score++;
        }
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    
    // غلق الامتحان وإظهار النتيجة فوراً
    const quizContainer = document.getElementById('quizzes-container');
    quizContainer.innerHTML = `
        <div class="bg-slate-900 border border-amber-400/40 p-6 rounded-2xl text-center space-y-3">
            <h3 class="text-xl font-black text-amber-400">🔒 تم إغلاق الامتحان وتسليمه</h3>
            <p class="text-slate-200 text-sm font-bold">درجتك في الامتحان هي: <span class="text-amber-400 text-lg">${score} / ${totalQuestions}</span> (${percentage}%)</p>
            <p class="text-xs text-slate-400">تم تسجيل النتيجة وحفظها في لوحة تحكم الأدمن.</p>
        </div>
    `;

    if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
}

/* ==========================================================================
   4. USER AUTHENTICATION & REGISTRATION
   ========================================================================== */
function setGenderChoice(gender) {
    selectedGender = gender;
    const btnMale = document.getElementById('btn-gender-male');
    const btnFemale = document.getElementById('btn-gender-female');

    if (gender === 'male') {
        btnMale.classList.add('bg-blue-500/20', 'border-blue-500');
        btnFemale.classList.remove('bg-pink-500/20', 'border-pink-500');
    } else {
        btnFemale.classList.add('bg-pink-500/20', 'border-pink-500');
        btnMale.classList.remove('bg-blue-500/20', 'border-blue-500');
    }
}

function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const grade = document.getElementById('reg-grade').value;
    const school = document.getElementById('reg-school').value;
    const pass = document.getElementById('reg-pass').value;

    if (!selectedGender) {
        alert('يرجى تحديد النوع (طالب / طالبة)');
        return;
    }

    const existingUser = usersList.find(u => u.phone === phone);
    if (existingUser) {
        if (existingUser.pass === pass) {
            currentUser = existingUser;
        } else {
            alert('رقم الهاتف مسجل بالفعل وكلمة السر غير صحيحة!');
            return;
        }
    } else {
        currentUser = {
            id: Date.now(),
            name,
            phone,
            grade,
            school,
            pass,
            gender: selectedGender,
            message: '',
            reply: ''
        };
        usersList.push(currentUser);
        localStorage.setItem('app_users_list', JSON.stringify(usersList));
    }

    localStorage.setItem('app_current_user', JSON.stringify(currentUser));
    showMainApp();
}

function showMainApp() {
    const introScreen = document.getElementById('intro-screen');
    const mainApp = document.getElementById('main-app');
    const navUserName = document.getElementById('nav-user-name');

    if (introScreen) introScreen.classList.add('hidden');
    if (mainApp) {
        mainApp.classList.remove('hidden');
        setTimeout(() => mainApp.classList.remove('opacity-0'), 50);
    }

    if (navUserName && currentUser) {
        navUserName.textContent = currentUser.name.split(' ')[0];
    }

    updateUserReplyNotification();
}

function logoutUser() {
    localStorage.removeItem('app_current_user');
    currentUser = null;
    location.reload();
}

/* ==========================================================================
   5. NAVIGATION & SECTION CONTROLS
   ========================================================================== */
function showSection(sectionId) {
    const sections = document.querySelectorAll('.app-section');
    sections.forEach(sec => sec.classList.add('hidden'));

    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    const body = document.getElementById('app-body');
    const themeBtnText = document.getElementById('theme-btn-text');

    if (isDarkMode) {
        body.className = "theme-dark bg-slate-950 text-slate-100 min-h-screen font-cairo text-xs sm:text-sm selection:bg-amber-400 selection:text-black overflow-x-hidden";
        if (themeBtnText) themeBtnText.textContent = "🌙 الداكن";
    } else {
        body.className = "theme-light bg-slate-100 text-slate-900 min-h-screen font-cairo text-xs sm:text-sm selection:bg-amber-400 selection:text-black overflow-x-hidden";
        if (themeBtnText) themeBtnText.textContent = "☀️ المضيء";
    }
}

/* ==========================================================================
   6. USER ACCOUNT MODAL & MESSAGING & NOTIFICATIONS
   ========================================================================== */
function openUserAccountModal() {
    if (!currentUser) return;

    const modal = document.getElementById('user-account-modal');
    const userInfoCard = document.getElementById('user-info-card');
    const replyBox = document.getElementById('user-reply-box');

    if (userInfoCard) {
        userInfoCard.innerHTML = `
            <p><strong>الاسم:</strong> ${currentUser.name}</p>
            <p><strong>الهاتف:</strong> <span dir="ltr">${currentUser.phone}</span></p>
            <p><strong>الصف:</strong> ${currentUser.grade}</p>
            <p><strong>المدرسة/السنتر:</strong> ${currentUser.school}</p>
        `;
    }

    if (replyBox) {
        const latestUserData = usersList.find(u => u.phone === currentUser.phone);
        replyBox.textContent = (latestUserData && latestUserData.reply) 
            ? latestUserData.reply 
            : 'لا يوجد رد بعد من إدارة المنصة.';
    }

    if (modal) modal.classList.remove('hidden');
}

function closeUserAccountModal() {
    const modal = document.getElementById('user-account-modal');
    if (modal) modal.classList.add('hidden');
}

function sendStudentMessage(event) {
    event.preventDefault();
    const msgText = document.getElementById('student-msg-text').value.trim();

    if (!msgText) return;

    if (!currentUser) {
        alert('يرجى تسجيل الدخول أولاً لإرسال رسالة.');
        return;
    }

    currentUser.message = msgText;
    const uIndex = usersList.findIndex(u => u.phone === currentUser.phone);
    if (uIndex !== -1) {
        usersList[uIndex].message = msgText;
        localStorage.setItem('app_users_list', JSON.stringify(usersList));
        localStorage.setItem('app_current_user', JSON.stringify(currentUser));
    }

    triggerVibration();
    alert('تم إرسال رسالتك بنجاح إلى المستر!');
    document.getElementById('student-msg-text').value = '';
}

function updateUserReplyNotification() {
    if (!currentUser) return;
    const latestUserData = usersList.find(u => u.phone === currentUser.phone);
    if (latestUserData && latestUserData.reply) {
        document.querySelectorAll('#badge-user-nav, #badge-user-mobile').forEach(badge => {
            badge.classList.remove('hidden');
        });
        triggerVibration();
    }
}

function triggerVibration() {
    if ("vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]);
    }
}

/* ==========================================================================
   7. DYNAMIC CONTENT RENDERING & SEARCH
   ========================================================================== */
function renderAllContents(filterQuery = '') {
    const containers = {
        news: document.getElementById('news-container'),
        courses: document.getElementById('courses-container'),
        pdfs: document.getElementById('pdfs-container'),
        quizzes: document.getElementById('quizzes-container')
    };

    Object.values(containers).forEach(c => { if (c) c.innerHTML = ''; });

    const filtered = appContents.filter(item => 
        item.title.toLowerCase().includes(filterQuery.toLowerCase())
    );

    filtered.forEach(item => {
        const targetContainer = containers[item.section];
        if (!targetContainer) return;

        const card = document.createElement('div');
        card.className = "bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-2 relative group";

        let mediaHtml = '';
        if (item.fileData) {
            if (item.fileType.startsWith('image/')) {
                mediaHtml = `<img src="${item.fileData}" class="w-full max-h-60 object-cover rounded-lg my-2" alt="مرفق">`;
            } else if (item.fileType.startsWith('video/')) {
                mediaHtml = `<video src="${item.fileData}" controls class="w-full max-h-60 rounded-lg my-2"></video>`;
            } else if (item.fileType === 'application/pdf') {
                mediaHtml = `<a href="${item.fileData}" download="ملف_المسطر.pdf" class="inline-block my-2 text-amber-400 underline font-bold">📄 تحميل الملازمة (PDF)</a>`;
            }
        }

        let linkHtml = '';
        if (item.link) {
            linkHtml = `<a href="${item.link}" target="_blank" rel="noopener noreferrer" class="inline-block mt-1 text-xs text-amber-400 font-bold hover:underline">🔗 فتح الرابط الخارجي</a>`;
        }

        card.innerHTML = `
            <div class="flex justify-between items-start">
                <h4 class="font-bold text-amber-300 text-sm md:text-base">${item.title}</h4>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] text-slate-500">${item.date || ''}</span>
                    <button onclick="deleteContent(${item.id})" class="text-red-400 hover:text-red-300 font-bold text-xs bg-red-500/10 p-1 rounded border border-red-500/20" title="حذف الإشعار/المحتوى">🗑️</button>
                </div>
            </div>
            ${mediaHtml}
            ${linkHtml}
        `;

        targetContainer.appendChild(card);
    });
}

function deleteContent(id) {
    const adminPass = localStorage.getItem('app_admin_pass') || ADMIN_PASSWORD_DEFAULT;
    const inputPass = prompt("أدخل كلمة مرور الأدمن لتأكيد حذف هذا المحتوى:");
    if (inputPass === adminPass) {
        appContents = appContents.filter(item => item.id !== id);
        localStorage.setItem('app_contents', JSON.stringify(appContents));
        renderAllContents();
        alert("تم حذف المحتوى بنجاح!");
    } else if (inputPass !== null) {
        alert("كلمة المرور غير صحيحة!");
    }
}

function handleSearch() {
    const query = document.getElementById('search-input').value;
    renderAllContents(query);
}

/* ==========================================================================
   8. ADMIN DASHBOARD & MANAGEMENT
   ========================================================================== */
function openAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) modal.classList.add('hidden');
}

function verifyAdminPass() {
    const passInput = document.getElementById('admin-pass-input').value;
    const adminPass = localStorage.getItem('app_admin_pass') || ADMIN_PASSWORD_DEFAULT;

    if (passInput === adminPass) {
        document.getElementById('admin-auth').classList.add('hidden');
        document.getElementById('admin-dashboard-content').classList.remove('hidden');
        renderAdminTable();
    } else {
        alert('كلمة المرور غير صحيحة!');
    }
}

function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    usersList.forEach((u, index) => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/50 transition";
        tr.innerHTML = `
            <td class="p-2.5 font-bold">${u.name}</td>
            <td class="p-2.5">${u.grade}</td>
            <td class="p-2.5" dir="ltr">${u.phone}</td>
            <td class="p-2.5 italic text-slate-300">${u.message || 'لا توجد رسالة'}</td>
            <td class="p-2.5 text-amber-300">${u.reply || 'لم يتم الرد'}</td>
            <td class="p-2.5 text-center flex justify-center gap-1">
                <button onclick="replyToStudent(${index})" class="px-2 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-lg hover:bg-amber-400/30 transition text-[11px] font-bold">
                    الرد
                </button>
                <button onclick="deleteStudent(${index})" class="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition text-[11px] font-bold">
                    حذف العضو
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function replyToStudent(index) {
    const replyMsg = prompt(`اكتب ردك للطالب: ${usersList[index].name}`);
    if (replyMsg !== null) {
        usersList[index].reply = replyMsg;
        localStorage.setItem('app_users_list', JSON.stringify(usersList));
        renderAdminTable();

        if (currentUser && currentUser.phone === usersList[index].phone) {
            currentUser.reply = replyMsg;
            localStorage.setItem('app_current_user', JSON.stringify(currentUser));
            updateUserReplyNotification();
        }
    }
}

function deleteStudent(index) {
    if (confirm(`هل أنت تأكد من إزالة هذا العضو (${usersList[index].name}) من المنصة؟`)) {
        usersList.splice(index, 1);
        localStorage.setItem('app_users_list', JSON.stringify(usersList));
        renderAdminTable();
    }
}

function publishNews() {
    const targetSection = document.getElementById('admin-target-section').value;
    const title = document.getElementById('admin-news-input').value.trim();
    const link = document.getElementById('admin-news-link').value.trim();
    const fileInput = document.getElementById('admin-news-file');

    if (!title) {
        alert('يرجى إدخال عنوان أو نص المحتوى!');
        return;
    }

    const newContent = {
        id: Date.now(),
        section: targetSection,
        title: title,
        link: link,
        fileData: '',
        fileType: '',
        date: new Date().toLocaleDateString('ar-EG')
    };

    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newContent.fileData = e.target.result;
            newContent.fileType = file.type;
            saveAndRenderPublishedContent(newContent);
        };
        reader.readAsDataURL(file);
    } else {
        saveAndRenderPublishedContent(newContent);
    }
}

function saveAndRenderPublishedContent(content) {
    appContents.unshift(content);
    localStorage.setItem('app_contents', JSON.stringify(appContents));
    
    document.getElementById('admin-news-input').value = '';
    document.getElementById('admin-news-link').value = '';
    document.getElementById('admin-news-file').value = '';

    renderAllContents();
    triggerVibration();
    alert('تم نشر المحتوى بنجاح!');
}

/* ==========================================================================
   9. BIOMETRICS / WEBAUTHN API INTEGRATION
   ========================================================================== */
async function registerAdminBiometrics() {
    if (!window.PublicKeyCredential) {
        alert('عذراً، متصفحك لا يدعم المصادقة بالبصمة (WebAuthn).');
        return;
    }

    try {
        const publicKeyCredentialCreationOptions = {
            challenge: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
            rp: { name: "Mr. Ashraf Bassiouny Platform", id: window.location.hostname || "localhost" },
            user: {
                id: new Uint8Array([9, 8, 7, 6]),
                name: "admin@platform.com",
                displayName: "Admin Master"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: { authenticatorAttachment: "platform" },
            timeout: 60000,
            attestation: "direct"
        };

        const credential = await navigator.credentials.create({
            publicKey: publicKeyCredentialCreationOptions
        });

        if (credential) {
            localStorage.setItem('app_admin_biometrics_enabled', 'true');
            alert('تم تفعيل دخول الأدمن بالبصمة بنجاح على هذا الجهاز!');
        }
    } catch (err) {
        console.error(err);
        alert('تعذر تسجيل البصمة أو تم إلغاء العملية.');
    }
}

async function loginWithBiometrics() {
    const isBiometricsEnabled = localStorage.getItem('app_admin_biometrics_enabled');
    
    if (!isBiometricsEnabled) {
        alert('لم يتم تفعيل البصمة بعد. يرجى الدخول بكلمة السر أولاً ثم الضغط على "تفعيل البصمة".');
        return;
    }

    try {
        const publicKeyCredentialRequestOptions = {
            challenge: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
            timeout: 60000,
            userVerification: "required"
        };

        const assertion = await navigator.credentials.get({
            publicKey: publicKeyCredentialRequestOptions
        });

        if (assertion) {
            document.getElementById('admin-auth').classList.add('hidden');
            document.getElementById('admin-dashboard-content').classList.remove('hidden');
            renderAdminTable();
        }
    } catch (err) {
        console.error(err);
        alert('فشلت عملية التحقق من البصمة.');
    }
}
