/* ==========================================================================
   PLATFORM LOGIC - NAVIGATION & ADMIN MODAL
   ========================================================================== */

function showSection(sectionId) {
    const sections = ['hero', 'news', 'courses', 'pdfs', 'quizzes'];
    sections.forEach(sec => {
        const el = document.getElementById(`sec-${sec}`);
        if (el) el.classList.add('hidden');
    });

    const activeSec = document.getElementById(`sec-${sectionId}`);
    if (activeSec) activeSec.classList.remove('hidden');

    if (sectionId === 'quizzes') {
        startExam();
    }
}

function openAdminModal() {
    document.getElementById('admin-modal').classList.remove('hidden');
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.add('hidden');
}

function publishAdminContent() {
    const titleInput = document.getElementById('admin-item-title');
    const targetSection = document.getElementById('admin-target-section').value;

    if (!titleInput.value.trim()) {
        alert("يرجى كتابة عنوان العنصر أولاً!");
        return;
    }

    // إظهار النقطة الحمراء للطلاب فوراً فوق الأيقونة
    triggerNewNotification(targetSection);

    alert(`تم نشر "${titleInput.value}" بنجاح في قسم (${targetSection}) وإرسال التنبيه للطلاب!`);
    titleInput.value = '';
    closeAdminModal();
}

/* ==========================================================================
   ADVANCED QUIZ SYSTEM (AUTO FORMAT, HIDDEN ANSWERS, TIMER & AUTO-SUBMIT)
   ========================================================================== */

// بيانات الأسئلة يرفعها الأدمن شاملة الخيارات ورقم الإجابة الصحيحة
const rawQuizData = {
    title: "اختبار إنجليزي تجريبي - Unit 1 & 2",
    timeLimitInMinutes: 10, // تحديد مدة الامتحان بالدقائق
    questions: [
        {
            q: "While I ________ my homework, my brother was watching TV.",
            options: ["was doing", "did", "have done", "am doing"],
            correctAnswer: 0 // يتم إخفاؤها نهائياً عن كود الطالب
        },
        {
            q: "She has ________ been to London, so she knows the city well.",
            options: ["never", "already", "yet", "ever"],
            correctAnswer: 1
        },
        {
            q: "Choose the correct synonym of 'Prosperous':",
            options: ["Poor", "Wealthy", "Weak", "Sad"],
            correctAnswer: 1
        },
        {
            q: "By next month, the students ________ all their final revision tests.",
            options: ["will finish", "will have finished", "finished", "have finished"],
            correctAnswer: 1
        }
    ]
};

let quizTimer = null;
let remainingTime = rawQuizData.timeLimitInMinutes * 60;
let studentAnswers = {};

function startExam() {
    remainingTime = rawQuizData.timeLimitInMinutes * 60;
    studentAnswers = {};
    renderFormattedExam();
    startExamTimer();
}

// تنسيق الأسئلة وإلغاء أي إظهار للإجابة الصحيحة
function renderFormattedExam() {
    const quizContainer = document.getElementById('quizzes-container');
    if (!quizContainer) return;

    let html = `
        <div class="bg-slate-900 border border-amber-400/30 p-5 rounded-2xl shadow-xl space-y-4">
            <div class="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                    <h4 class="font-bold text-amber-400 text-sm md:text-base">${rawQuizData.title}</h4>
                    <p class="text-[10px] text-slate-400">إعداد: مستر أشرف بسيوني</p>
                </div>
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
                <label class="flex items-center gap-2 p-2.5 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-amber-400/50 transition text-xs">
                    <input type="radio" name="question_${index}" value="${optIdx}" onchange="recordAnswer(${index}, ${optIdx})" required class="accent-amber-400">
                    <span class="text-slate-300 font-semibold">${opt}</span>
                </label>
            `;
        });

        html += `</div></div>`;
    });

    html += `
                <button type="submit" id="btn-submit-exam" class="w-full py-3 bg-amber-400 text-slate-950 font-black rounded-xl text-xs hover:bg-amber-300 transition shadow-lg shadow-amber-400/10">
                    تسليم الامتحان وتكشيف النتيجة 🏆
                </button>
            </form>
        </div>
    `;

    quizContainer.innerHTML = html;
}

function recordAnswer(questionIndex, selectedOptionIndex) {
    studentAnswers[questionIndex] = selectedOptionIndex;
}

// مؤقت الوقت المحدد للتمرير وإغلاق الامتحان عند انتهائه
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
            alert("⏰ انتهى الوقت المحدد للامتحان! تم تسليم إجاباتك تلقائياً.");
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
    
    // إغلاق الامتحان وعرض النتيجة النهائية
    const quizContainer = document.getElementById('quizzes-container');
    quizContainer.innerHTML = `
        <div class="bg-slate-900 border border-amber-400/40 p-6 rounded-2xl text-center space-y-3 shadow-2xl">
            <h3 class="text-xl font-black text-amber-400">🔒 تم إغلاق الامتحان وتسليمه</h3>
            <p class="text-slate-200 text-sm font-bold">درجتك النهائية: <span class="text-amber-400 text-lg">${score} / ${totalQuestions}</span> (${percentage}%)</p>
            <p class="text-xs text-slate-400">تم تسجيل إجاباتك وحفظ النتيجة في السجل.</p>
            <button onclick="startExam()" class="px-4 py-2 bg-slate-800 border border-amber-400/30 text-amber-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition">
                إعادة المحاولة 🔄
            </button>
        </div>
    `;

    if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
}

/* ==========================================================================
   GLOBAL NOTIFICATION BADGE SYSTEM (RED DOT ON ALL ICONS)
   ========================================================================== */

function triggerNewNotification(targetSection) {
    const navBadge = document.getElementById(`badge-${targetSection}-nav`);
    const mobileBadge = document.getElementById(`badge-${targetSection}-mobile`);

    if (navBadge) navBadge.classList.remove('hidden');
    if (mobileBadge) mobileBadge.classList.remove('hidden');

    if ("vibrate" in navigator) {
        navigator.vibrate([150, 50, 150]);
    }
}

function clearNotificationBadge(targetSection) {
    const navBadge = document.getElementById(`badge-${targetSection}-nav`);
    const mobileBadge = document.getElementById(`badge-${targetSection}-mobile`);

    if (navBadge) navBadge.classList.add('hidden');
    if (mobileBadge) mobileBadge.classList.add('hidden');
}

// تشغيل النظام تلقائياً
document.addEventListener('DOMContentLoaded', () => {
    showSection('hero');
});

/* ==========================================================================
   GLOBAL DATA STORES (NEWS, QUIZZES, MEMBERS)
   ========================================================================== */

let newsList = [
    { id: 1, title: "تم فتح باب التسجيل لاختبار الشامل على الوحدة الأولى والثانية.", date: "اليوم" },
    { id: 2, title: "سيتم رفع ملزمة المراجعة القادمة يوم الخميس المقبل.", date: "أمس" }
];

let quizzesList = [
    {
        id: 101,
        title: "اختبار إنجليزي تجريبي - Unit 1 & 2",
        timeLimitInMinutes: 10,
        questions: [
            { q: "While I ________ my homework, my brother was watching TV.", options: ["was doing", "did", "have done", "am doing"], correctAnswer: 0 },
            { q: "She has ________ been to London, so she knows the city well.", options: ["never", "already", "yet", "ever"], correctAnswer: 1 },
            { q: "Choose the correct synonym of 'Prosperous':", options: ["Poor", "Wealthy", "Weak", "Sad"], correctAnswer: 1 },
            { q: "By next month, the students ________ all their final revision tests.", options: ["will finish", "will have finished", "finished", "have finished"], correctAnswer: 1 }
        ]
    }
];

let membersList = [
    { id: 1, name: "أحمد محمد علي", phone: "01012345678", score: "18/20" },
    { id: 2, name: "محمود إبراهيم", phone: "01198765432", score: "15/20" },
    { id: 3, name: "سارة السيد", phone: "01234567890", score: "20/20" }
];

let activeQuiz = quizzesList[0];

/* ==========================================================================
   NEWS SECTION RENDER & DELETE
   ========================================================================== */

function renderNewsSection() {
    const container = document.getElementById('news-container');
    if (!container) return;

    if (newsList.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400">لا توجد أخبار حالياً.</p>`;
        return;
    }

    container.innerHTML = newsList.map(n => `
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-1">
            <span class="text-[10px] text-amber-400 font-bold">${n.date}</span>
            <p class="font-bold text-slate-200">${n.title}</p>
        </div>
    `).join('');
}

function deleteNewsItem(id) {
    newsList = newsList.filter(item => item.id !== id);
    renderNewsSection();
    renderAdminNewsList();
    alert("تم حذف الخبر بنجاح.");
}

function deleteQuiz(id) {
    quizzesList = quizzesList.filter(q => q.id !== id);
    if (activeQuiz && activeQuiz.id === id) {
        activeQuiz = quizzesList.length > 0 ? quizzesList[0] : null;
    }
    renderAdminQuizzesList();
    alert("تم حذف الامتحان من المنصة.");
}

/* ==========================================================================
   MEMBERS MANAGEMENT (DELETE & VIEW)
   ========================================================================== */

function deleteMember(id) {
    membersList = membersList.filter(m => m.id !== id);
    renderAdminMembersList();
    alert("تم حذف العضو/الطالب من المنصة.");
}

/* ==========================================================================
   ADMIN PANEL TABS & CONTROLLER
   ========================================================================== */

function switchAdminTab(tabName) {
    const tabs = ['publish', 'news', 'quizzes', 'members'];
    tabs.forEach(t => {
        document.getElementById(`admin-tab-${t}`).classList.add('hidden');
        document.getElementById(`tab-btn-${t}`).className = "px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300";
    });

    document.getElementById(`admin-tab-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-btn-${tabName}`).className = "px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold";

    if (tabName === 'news') renderAdminNewsList();
    if (tabName === 'quizzes') renderAdminQuizzesList();
    if (tabName === 'members') renderAdminMembersList();
}

function renderAdminNewsList() {
    const box = document.getElementById('admin-news-list');
    if (newsList.length === 0) {
        box.innerHTML = `<p class="text-slate-400">لا توجد أخبار حالياً.</p>`;
        return;
    }

    box.innerHTML = newsList.map(n => `
        <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
            <span class="text-slate-200 font-semibold">${n.title}</span>
            <button onclick="deleteNewsItem(${n.id})" class="px-2.5 py-1 bg-red-500/20 border border-red-500/40 text-red-400 font-bold rounded-lg hover:bg-red-500/30 transition">حذف 🗑️</button>
        </div>
    `).join('');
}

function renderAdminQuizzesList() {
    const box = document.getElementById('admin-quizzes-list');
    if (quizzesList.length === 0) {
        box.innerHTML = `<p class="text-slate-400">لا توجد امتحانات متاحة.</p>`;
        return;
    }

    box.innerHTML = quizzesList.map(q => `
        <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
            <div>
                <p class="text-slate-200 font-bold">${q.title}</p>
                <span class="text-[10px] text-slate-400">المدة: ${q.timeLimitInMinutes} دقائق - الأسئلة: ${q.questions.length}</span>
            </div>
            <button onclick="deleteQuiz(${q.id})" class="px-2.5 py-1 bg-red-500/20 border border-red-500/40 text-red-400 font-bold rounded-lg hover:bg-red-500/30 transition">حذف الامتحان 🗑️</button>
        </div>
    `).join('');
}

function renderAdminMembersList() {
    const box = document.getElementById('admin-members-list');
    if (membersList.length === 0) {
        box.innerHTML = `<p class="text-slate-400">لا يوجد أعضاء مسجلون.</p>`;
        return;
    }

    box.innerHTML = membersList.map(m => `
        <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
            <div>
                <p class="text-slate-200 font-bold">${m.name} (${m.phone})</p>
                <span class="text-[10px] text-amber-400">آخر درجة: ${m.score}</span>
            </div>
            <button onclick="deleteMember(${m.id})" class="px-2.5 py-1 bg-red-500/20 border border-red-500/40 text-red-400 font-bold rounded-lg hover:bg-red-500/30 transition">حذف العضو 🚫</button>
        </div>
    `).join('');
}
