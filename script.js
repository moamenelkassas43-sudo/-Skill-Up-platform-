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
const ADMIN_PASSWORD_DEFAULT = '123456';

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
   6. USER ACCOUNT MODAL & MESSAGING
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
        card.className = "bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-2";

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
                <span class="text-[10px] text-slate-500">${item.date || ''}</span>
            </div>
            ${mediaHtml}
            ${linkHtml}
        `;

        targetContainer.appendChild(card);
    });
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
            <td class="p-2.5 text-center">
                <button onclick="replyToStudent(${index})" class="px-2 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-lg hover:bg-amber-400/30 transition text-[11px] font-bold">
                    الرد
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function replyToStudent(index) {
    const replyMsg = prompt(`اكتب ردك للفي الطالب: ${usersList[index].name}`);
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
    
    // Clear Admin Inputs
    document.getElementById('admin-news-input').value = '';
    document.getElementById('admin-news-link').value = '';
    document.getElementById('admin-news-file').value = '';

    renderAllContents();
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
