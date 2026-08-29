// ==========================================
// 1. ميزة البصمة والأدمن (Biometric & Security)
// ==========================================

async function registerAdminBiometrics() {
    if (!window.PublicKeyCredential) {
        alert("متصفحك أو جهازك لا يدعم دخول البصمة.");
        return;
    }
    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const credential = await navigator.credentials.create({
            publicKey: {
                challenge: challenge,
                rp: { name: "منصة مستر أشرف بسيوني" },
                user: {
                    id: Uint8Array.from("ADMIN_ID", c => c.charCodeAt(0)),
                    name: "admin",
                    displayName: "Mr. Ashraf Bassiouny"
                },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                authenticatorSelection: { authenticatorAttachment: "platform" },
                timeout: 60000
            }
        });
        if (credential) {
            localStorage.setItem('admin_biometric_enabled', 'true');
            alert('تم ربط بصمة الجهاز بنجاح!');
        }
    } catch (err) {
        alert('تعذر إعداد البصمة أو تم إلغاء العملية.');
    }
}

async function loginWithBiometrics() {
    if (!localStorage.getItem('admin_biometric_enabled')) {
        alert('لم يتم تفعيل البصمة بعد! قم بالدخول بكلمة السر أولاً ثم اضغط على (تفعيل البصمة).');
        return;
    }
    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const assertion = await navigator.credentials.get({
            publicKey: { challenge: challenge, timeout: 60000 }
        });
        if (assertion) {
            document.getElementById('admin-auth')?.classList.add('hidden');
            document.getElementById('admin-dashboard-content')?.classList.remove('hidden');
            loadDashboardData();
        }
    } catch (err) {
        alert('فشل التحقق من البصمة.');
    }
}

function verifyAdminPass() {
    const passInput = document.getElementById('admin-pass-input');
    if (passInput && passInput.value === '1122334455') {
        document.getElementById('admin-auth')?.classList.add('hidden');
        document.getElementById('admin-dashboard-content')?.classList.remove('hidden');
        loadDashboardData();
    } else {
        alert('كلمة السر خاطئة!');
    }
}

function openAdminModal() { document.getElementById('admin-modal')?.classList.remove('hidden'); }
function closeAdminModal() { 
    document.getElementById('admin-modal')?.classList.add('hidden'); 
    document.getElementById('admin-auth')?.classList.remove('hidden');
    document.getElementById('admin-dashboard-content')?.classList.add('hidden');
}

// ==========================================
// 2. ميزة النشر الشامل المتقدم في الأقسام والرفع
// ==========================================

async function publishContent() {
    const category = document.getElementById('admin-post-category').value;
    const title = document.getElementById('admin-post-title').value.trim();
    const text = document.getElementById('admin-post-text').value.trim();
    const link = document.getElementById('admin-post-link').value.trim();
    const fileInput = document.getElementById('admin-post-file');

    let fileData = "";
    let fileType = "";

    if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        fileType = file.type;
        fileData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    if (!title && !text && !link && !fileData) {
        alert('يرجى كتابة محتوى أو إرفاق ملف للنشر!');
        return;
    }

    // إعداد التاريخ والوقت تلقائياً
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) + 
                          ' - ' + now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    const postItem = {
        id: Date.now(),
        category: category,
        title: title,
        text: text,
        link: link,
        fileData: fileData,
        fileType: fileType,
        date: dateFormatted
    };

    let platformPosts = JSON.parse(localStorage.getItem('platform_all_posts')) || [];
    platformPosts.unshift(postItem);
    localStorage.setItem('platform_all_posts', JSON.stringify(platformPosts));

    // تفريغ الحقول
    document.getElementById('admin-post-title').value = '';
    document.getElementById('admin-post-text').value = '';
    document.getElementById('admin-post-link').value = '';
    document.getElementById('admin-post-file').value = '';

    triggerNotificationAlert();
    alert('تم النشر في القسم المختار بنجاح!');
    renderAllSections();
}

function renderAllSections(filterKeyword = '') {
    const allPosts = JSON.parse(localStorage.getItem('platform_all_posts')) || [];

    const categories = ['news', 'lectures', 'books', 'exams'];
    
    categories.forEach(cat => {
        const container = document.getElementById(`container-${cat}`);
        if (!container) return;

        let categoryPosts = allPosts.filter(p => p.category === cat);

        if (filterKeyword) {
            categoryPosts = categoryPosts.filter(p => 
                (p.title && p.title.toLowerCase().includes(filterKeyword.toLowerCase())) ||
                (p.text && p.text.toLowerCase().includes(filterKeyword.toLowerCase()))
            );
        }

        if (categoryPosts.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-500 py-4 text-center">لا يوجد محتوى متاح حالياً.</p>`;
            return;
        }

        container.innerHTML = categoryPosts.map(item => {
            let mediaHTML = '';
            
            if (item.fileData) {
                if (item.fileType.startsWith('image/')) {
                    mediaHTML = `<div class="rounded-lg overflow-hidden border border-slate-700 max-h-72 my-2"><img src="${item.fileData}" class="w-full h-full object-cover" /></div>`;
                } else if (item.fileType.startsWith('video/')) {
                    mediaHTML = `<div class="rounded-lg overflow-hidden border border-slate-700 my-2"><video src="${item.fileData}" controls class="w-full max-h-72 bg-black"></video></div>`;
                } else if (item.fileType === 'application/pdf') {
                    mediaHTML = `<div class="my-2"><a href="${item.fileData}" download="file_${item.id}.pdf" class="inline-flex items-center gap-2 p-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold">📄 تحميل ملف الـ PDF</a></div>`;
                }
            }

            return `
                <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div class="flex justify-between items-center text-[10px] text-amber-400/70 border-b border-slate-800/60 pb-1">
                        <span>📅 ${item.date || 'سابقاً'}</span>
                    </div>
                    ${item.title ? `<h4 class="font-bold text-sm text-amber-400">${item.title}</h4>` : ''}
                    ${item.text ? `<p class="text-xs text-slate-200">${item.text}</p>` : ''}
                    ${mediaHTML}
                    ${item.link ? `
                        <div class="pt-1">
                            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline">
                                🔗 فتح الرابط المرفق
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    });
}

// ==========================================
// 3. البحث والتنقل في الواجهات
// ==========================================

function handleSearch() {
    const keyword = document.getElementById('search-input')?.value.trim() || '';
    renderAllSections(keyword);
}

function showSection(sectionId) {
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.add('hidden'));
    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.classList.remove('hidden');
}

// ==========================================
// 4. إدارة حسابات الطلاب والردود
// ==========================================

function loadDashboardData() {
    const studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    const tableBody = document.getElementById('admin-table-body');
    if (!tableBody) return;
    
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

function replyToStudent(phone) {
    const replyText = prompt("أدخل رد الأدمن للطالب:");
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
    if (!confirm('هل تريد حذف هذا الحساب؟')) return;
    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    studentsList = studentsList.filter(st => st.phone !== phone);
    localStorage.setItem('platform_students', JSON.stringify(studentsList));
    loadDashboardData();
}

// ==========================================
// 5. تهيئة النظام والتشغيل الابتدائي
// ==========================================

const typingTextElement = document.getElementById('typing-text');
const fullText = "Mr. Ashraf Bassiouny: An Expert Teacher in English";
let charIndex = 0;

function typeWriter() {
    if (typingTextElement && charIndex < fullText.length) {
        typingTextElement.textContent += fullText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 35);
    } else {
        document.getElementById('registration-box')?.classList.remove('hidden');
    }
}

function triggerNotificationAlert() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 587.33;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

window.addEventListener('load', () => {
    const savedUser = JSON.parse(localStorage.getItem('current_user'));
    if (savedUser) {
        document.getElementById('intro-screen')?.classList.add('hidden');
        showMainApp(savedUser);
    } else {
        typeWriter();
    }
    renderAllSections();
});

function toggleTheme() {
    const body = document.getElementById('app-body');
    const themeBtnText = document.getElementById('theme-btn-text');
    if (!body || !themeBtnText) return;

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
    const userNameElem = document.getElementById('nav-user-name');
    if (userNameElem) userNameElem.textContent = user.name.split(' ')[0];
    const mainApp = document.getElementById('main-app');
    if (mainApp) {
        mainApp.classList.remove('hidden');
        setTimeout(() => mainApp.classList.remove('opacity-0'), 50);
    }
}

let selectedGender = 'male';
function setGenderChoice(gender) {
    selectedGender = gender;
    document.getElementById('btn-gender-male')?.classList.toggle('active-male', gender === 'male');
    document.getElementById('btn-gender-female')?.classList.toggle('active-female', gender === 'female');
}

document.getElementById('register-form')?.addEventListener('submit', function(e) {
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

    document.getElementById('intro-screen')?.classList.add('hidden');
    showMainApp(studentData);
});

function openUserAccountModal() {
    const currentUser = JSON.parse(localStorage.getItem('current_user'));
    if (!currentUser) return;

    document.getElementById('user-account-modal')?.classList.remove('hidden');
    const infoCard = document.getElementById('user-info-card');
    if (infoCard) {
        infoCard.innerHTML = `
            <p class="font-bold">${currentUser.name}</p>
            <p class="text-amber-400 font-semibold">${currentUser.grade}</p>
            <p class="text-slate-400 text-[11px]">${currentUser.school}</p>
        `;
    }

    let studentsList = JSON.parse(localStorage.getItem('platform_students')) || [];
    const myData = studentsList.find(st => st.phone === currentUser.phone);
    if (myData) {
        const replyBox = document.getElementById('user-reply-box');
        if (replyBox) replyBox.textContent = myData.adminReply || 'لا يوجد رد بعد.';
    }
}

function closeUserAccountModal() { document.getElementById('user-account-modal')?.classList.add('hidden'); }
function logoutUser() { localStorage.removeItem('current_user'); location.reload(); }
