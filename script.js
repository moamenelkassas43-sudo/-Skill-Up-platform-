/* ==========================================================================

1. GLOBAL STATE & LOCAL STORAGE
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
date: new Date().toLocaleDateString('ar-EG'),
createdAt: Date.now()
}
];

let quizzesList = JSON.parse(localStorage.getItem('app_quizzes_list')) || [];

let selectedGender = '';
let isDarkMode = localStorage.getItem('app_dark_mode') !== 'false';

let activeQuiz = null;
let quizTimerInterval = null;
let quizRemainingSeconds = 0;
let quizSubmitted = false;

const ADMIN_PASSWORD_DEFAULT = '1122334455';

/* ==========================================================================
2. INITIALIZATION
========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

initTypingEffect();

renderAllContents();

applySavedTheme();

initializeAdminQuizForm();

if (currentUser) {
    showMainApp();
}

updateAllNewContentBadges();

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

        textContainer.textContent =
            currentPhrase.substring(0, charIdx - 1);

        charIdx--;

    } else {

        textContainer.textContent =
            currentPhrase.substring(0, charIdx + 1);

        charIdx++;

    }


    let typeSpeed = isDeleting ? 40 : 80;


    if (!isDeleting &&
        charIdx === currentPhrase.length) {

        typeSpeed = 2000;

        isDeleting = true;

    }

    else if (isDeleting &&
             charIdx === 0) {

        isDeleting = false;

        phraseIdx =
            (phraseIdx + 1) % phrases.length;

        typeSpeed = 500;

    }


    setTimeout(type, typeSpeed);

}


type();

}

/* ==========================================================================
4. USER REGISTRATION
========================================================================== */

function setGenderChoice(gender) {

selectedGender = gender;


const btnMale =
    document.getElementById('btn-gender-male');

const btnFemale =
    document.getElementById('btn-gender-female');


if (gender === 'male') {

    btnMale.classList.add(
        'bg-blue-500/20',
        'border-blue-500'
    );

    btnFemale.classList.remove(
        'bg-pink-500/20',
        'border-pink-500'
    );

}

else {

    btnFemale.classList.add(
        'bg-pink-500/20',
        'border-pink-500'
    );

    btnMale.classList.remove(
        'bg-blue-500/20',
        'border-blue-500'
    );

}

}

function handleRegister(event) {

event.preventDefault();


const name =
    document.getElementById('reg-name').value.trim();

const phone =
    document.getElementById('reg-phone').value.trim();

const grade =
    document.getElementById('reg-grade').value;

const school =
    document.getElementById('reg-school').value;

const pass =
    document.getElementById('reg-pass').value;


if (!selectedGender) {

    alert('يرجى تحديد النوع: طالب أو طالبة');

    return;

}


if (!name || !phone || !grade || !school || !pass) {

    alert('يرجى استكمال جميع البيانات');

    return;

}


const existingUser =
    usersList.find(
        user => user.phone === phone
    );


if (existingUser) {

    if (existingUser.pass === pass) {

        currentUser = existingUser;

    }

    else {

        alert(
            'رقم الهاتف مسجل بالفعل وكلمة المرور غير صحيحة!'
        );

        return;

    }

}

else {

    currentUser = {

        id: Date.now(),

        name,

        phone,

        grade,

        school,

        pass,

        gender: selectedGender,

        message: '',

        reply: '',

        joinedAt: Date.now()

    };


    usersList.push(currentUser);


    saveUsers();

}


localStorage.setItem(
    'app_current_user',
    JSON.stringify(currentUser)
);


showMainApp();

}

function showMainApp() {

const introScreen =
    document.getElementById('intro-screen');

const mainApp =
    document.getElementById('main-app');

const navUserName =
    document.getElementById('nav-user-name');


if (introScreen) {

    introScreen.classList.add('hidden');

}


if (mainApp) {

    mainApp.classList.remove('hidden');


    setTimeout(() => {

        mainApp.classList.remove('opacity-0');

    }, 50);

}


if (navUserName && currentUser) {

    navUserName.textContent =
        currentUser.name.split(' ')[0];

}


updateUserReplyNotification();

updateAllNewContentBadges();

}

function logoutUser() {

localStorage.removeItem('app_current_user');

currentUser = null;

location.reload();

}

/* ==========================================================================
5. NAVIGATION
========================================================================== */

function showSection(sectionId) {

const sections =
    document.querySelectorAll('.app-section');


sections.forEach(section => {

    section.classList.add('hidden');

});


const target =
    document.getElementById(sectionId);


if (target) {

    target.classList.remove('hidden');


    window.scrollTo({

        top: 0,

        behavior: 'smooth'

    });

}

}

function openContentSection(sectionId) {

showSection(sectionId);

markSectionAsSeen(sectionId);

}

/* ==========================================================================
6. THEME
========================================================================== */

function applySavedTheme() {

const body =
    document.getElementById('app-body');

const themeBtnText =
    document.getElementById('theme-btn-text');


if (!body) return;


if (isDarkMode) {

    body.className =
        "theme-dark bg-slate-950 text-slate-100 min-h-screen font-cairo text-xs sm:text-sm selection:bg-amber-400 selection:text-black overflow-x-hidden";


    if (themeBtnText) {

        themeBtnText.textContent =
            "🌙 الداكن";

    }

}

else {

    body.className =
        "theme-light bg-slate-100 text-slate-900 min-h-screen font-cairo text-xs sm:text-sm selection:bg-amber-400 selection:text-black overflow-x-hidden";


    if (themeBtnText) {

        themeBtnText.textContent =
            "☀️ المضيء";

    }

}

}

function toggleTheme() {

isDarkMode = !isDarkMode;


localStorage.setItem(
    'app_dark_mode',
    isDarkMode
);


applySavedTheme();

}

/* ==========================================================================
7. USER ACCOUNT & MESSAGES
========================================================================== */

function openUserAccountModal() {

if (!currentUser) return;


const modal =
    document.getElementById(
        'user-account-modal'
    );


const userInfoCard =
    document.getElementById(
        'user-info-card'
    );


const replyBox =
    document.getElementById(
        'user-reply-box'
    );


const latestUserData =
    usersList.find(
        user =>
            user.phone === currentUser.phone
    );


if (userInfoCard) {

    userInfoCard.innerHTML = `

        <p><strong>الاسم:</strong> ${escapeHtml(currentUser.name)}</p>

        <p>
            <strong>الهاتف:</strong>

            <span dir="ltr">
                ${escapeHtml(currentUser.phone)}
            </span>
        </p>

        <p>
            <strong>الصف:</strong>
            ${escapeHtml(currentUser.grade)}
        </p>

        <p>
            <strong>المدرسة/السنتر:</strong>
            ${escapeHtml(currentUser.school)}
        </p>

    `;

}


if (replyBox) {

    replyBox.textContent =

        latestUserData &&
        latestUserData.reply

            ? latestUserData.reply

            : 'لا يوجد رد بعد من إدارة المنصة.';

}


if (modal) {

    modal.classList.remove('hidden');

}


markUserReplyAsSeen();

}

function closeUserAccountModal() {

const modal =
    document.getElementById(
        'user-account-modal'
    );


if (modal) {

    modal.classList.add('hidden');

}

}

function sendStudentMessage(event) {

event.preventDefault();


const messageInput =
    document.getElementById(
        'student-msg-text'
    );


const msgText =
    messageInput.value.trim();


if (!msgText) return;


if (!currentUser) {

    alert(
        'يرجى تسجيل الدخول أولاً لإرسال رسالة.'
    );

    return;

}


currentUser.message = msgText;


const userIndex =
    usersList.findIndex(
        user =>
            user.phone === currentUser.phone
    );


if (userIndex !== -1) {

    usersList[userIndex].message =
        msgText;


    currentUser =
        usersList[userIndex];


    saveUsers();


    localStorage.setItem(
        'app_current_user',
        JSON.stringify(currentUser)
    );

}


triggerVibration();


alert(
    'تم إرسال رسالتك بنجاح إلى المستر!'
);


messageInput.value = '';

}

function updateUserReplyNotification() {

if (!currentUser) return;


const latestUserData =
    usersList.find(
        user =>
            user.phone === currentUser.phone
    );


const hasReply =
    latestUserData &&
    latestUserData.reply &&
    !latestUserData.replySeen;


toggleBadges(
    [
        'badge-user-nav',
        'badge-user-mobile'
    ],
    hasReply
);

}

function markUserReplyAsSeen() {

if (!currentUser) return;


const index =
    usersList.findIndex(
        user =>
            user.phone === currentUser.phone
    );


if (index !== -1) {

    usersList[index].replySeen = true;


    currentUser =
        usersList[index];


    saveUsers();


    localStorage.setItem(
        'app_current_user',
        JSON.stringify(currentUser)
    );


    updateUserReplyNotification();

}

}

/* ==========================================================================
8. VIBRATION
========================================================================== */

function triggerVibration() {

if ('vibrate' in navigator) {

    navigator.vibrate(
        [100, 50, 100]
    );

}

}

/* ==========================================================================
9. CONTENT RENDERING
========================================================================== */

function renderAllContents(filterQuery = '') {

const containers = {

    news:
        document.getElementById(
            'news-container'
        ),

    courses:
        document.getElementById(
            'courses-container'
        ),

    pdfs:
        document.getElementById(
            'pdfs-container'
        )

};


Object.values(containers)
    .forEach(container => {

        if (container) {

            container.innerHTML = '';

        }

    });


const query =
    filterQuery.toLowerCase().trim();


const filteredContents =
    appContents.filter(item =>
        item.title
            .toLowerCase()
            .includes(query)
    );


filteredContents.forEach(item => {

    const targetContainer =
        containers[item.section];


    if (!targetContainer) return;


    const card =
        document.createElement('div');


    card.className =
        "bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-2 relative group";


    let mediaHtml = '';


    if (item.fileData) {

        if (
            item.fileType &&
            item.fileType.startsWith('image/')
        ) {

            mediaHtml = `

                <img
                    src="${item.fileData}"
                    class="w-full max-h-80 object-cover rounded-lg my-2"
                    alt="مرفق">

            `;

        }


        else if (
            item.fileType &&
            item.fileType.startsWith('video/')
        ) {

            mediaHtml = `

                <video
                    src="${item.fileData}"
                    controls
                    class="w-full max-h-80 rounded-lg my-2">
                </video>

            `;

        }


        else if (
            item.fileType ===
            'application/pdf'
        ) {

            mediaHtml = `

                <a
                    href="${item.fileData}"
                    download="ملف_تعليمي.pdf"
                    class="inline-block my-2 text-amber-400 underline font-bold">

                    📄 تحميل الملف PDF

                </a>

            `;

        }

    }


    let linkHtml = '';


    if (item.link) {

        linkHtml = `

            <a
                href="${escapeAttribute(item.link)}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-block mt-1 text-xs text-amber-400 font-bold hover:underline">

                🔗 فتح الرابط الخارجي

            </a>

        `;

    }


    card.innerHTML = `

        <div class="flex justify-between items-start gap-3">

            <h4 class="font-bold text-amber-300 text-sm md:text-base">

                ${escapeHtml(item.title)}

            </h4>


            <div class="flex items-center gap-2 shrink-0">

                <span class="text-[10px] text-slate-500">

                    ${escapeHtml(item.date || '')}

                </span>


                <button
                    onclick="deleteContent(${item.id})"
                    class="text-red-400 hover:text-red-300 font-bold text-xs bg-red-500/10 p-1 rounded border border-red-500/20"
                    title="حذف المحتوى">

                    🗑️

                </button>

            </div>

        </div>


        ${mediaHtml}

        ${linkHtml}

    `;


    targetContainer.appendChild(card);

});


renderQuizzes(filterQuery);

}

/* ==========================================================================
10. SEARCH
========================================================================== */

function handleSearch() {

const searchInput =
    document.getElementById(
        'search-input'
    );


const query =
    searchInput
        ? searchInput.value
        : '';


renderAllContents(query);

}

/* ==========================================================================
11. CONTENT DELETION
========================================================================== */

function deleteContent(id) {

const adminPass =

    localStorage.getItem(
        'app_admin_pass'
    )

    ||

    ADMIN_PASSWORD_DEFAULT;


const inputPass = prompt(
    'أدخل كلمة مرور الأدمن لتأكيد حذف المحتوى:'
);


if (inputPass === null) return;


if (inputPass === adminPass) {

    appContents =
        appContents.filter(
            item =>
                item.id !== id
        );


    saveContents();


    renderAllContents();


    alert(
        'تم حذف المحتوى بنجاح!'
    );

}

else {

    alert(
        'كلمة المرور غير صحيحة!'
    );

}

}

/* ==========================================================================
12. ADMIN MODAL
========================================================================== */

function openAdminModal() {

const modal =
    document.getElementById(
        'admin-modal'
    );


const auth =
    document.getElementById(
        'admin-auth'
    );


const dashboard =
    document.getElementById(
        'admin-dashboard-content'
    );


if (modal) {

    modal.classList.remove('hidden');

}


if (auth) {

    auth.classList.remove('hidden');

}


if (dashboard) {

    dashboard.classList.add('hidden');

}

}

function closeAdminModal() {

const modal =
    document.getElementById(
        'admin-modal'
    );


if (modal) {

    modal.classList.add('hidden');

}


const passInput =
    document.getElementById(
        'admin-pass-input'
    );


if (passInput) {

    passInput.value = '';

}

}

/* ==========================================================================
13. ADMIN LOGIN
========================================================================== */

function verifyAdminPass() {

const passInput =
    document.getElementById(
        'admin-pass-input'
    );


const enteredPassword =
    passInput.value;


const adminPass =

    localStorage.getItem(
        'app_admin_pass'
    )

    ||

    ADMIN_PASSWORD_DEFAULT;


if (enteredPassword === adminPass) {

    document
        .getElementById('admin-auth')
        .classList.add('hidden');


    document
        .getElementById(
            'admin-dashboard-content'
        )
        .classList.remove('hidden');


    renderAdminTable();

}

else {

    alert(
        'كلمة المرور غير صحيحة!'
    );

}

}

/* ==========================================================================
14. ADMIN TABLE
========================================================================== */

function renderAdminTable() {

const tbody =
    document.getElementById(
        'admin-table-body'
    );


if (!tbody) return;


tbody.innerHTML = '';


usersList.forEach((user, index) => {

    const tr =
        document.createElement('tr');


    tr.className =
        "hover:bg-slate-800/50 transition";


    tr.innerHTML = `

        <td class="p-2.5 font-bold">
            ${escapeHtml(user.name)}
        </td>


        <td class="p-2.5">
            ${escapeHtml(user.grade)}
        </td>


        <td
            class="p-2.5"
            dir="ltr">

            ${escapeHtml(user.phone)}

        </td>


        <td class="p-2.5 italic text-slate-300">

            ${escapeHtml(
                user.message ||
                'لا توجد رسالة'
            )}

        </td>


        <td class="p-2.5 text-amber-300">

            ${escapeHtml(
                user.reply ||
                'لم يتم الرد'
            )}

        </td>


        <td class="p-2.5 text-center">

            <div class="flex justify-center gap-1">

                <button
                    onclick="replyToStudent(${index})"
                    class="px-2 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-lg hover:bg-amber-400/30 transition text-[11px] font-bold">

                    الرد

                </button>


                <button
                    onclick="deleteStudent(${index})"
                    class="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition text-[11px] font-bold">

                    حذف

                </button>

            </div>

        </td>

    `;


    tbody.appendChild(tr);

});

}

function replyToStudent(index) {

const user =
    usersList[index];


if (!user) return;


const replyMsg = prompt(
    `اكتب ردك للطالب: ${user.name}`,
    user.reply || ''
);


if (replyMsg === null) return;


usersList[index].reply =
    replyMsg.trim();


usersList[index].replySeen =
    false;


saveUsers();


renderAdminTable();


if (
    currentUser &&
    currentUser.phone === user.phone
) {

    currentUser =
        usersList[index];


    localStorage.setItem(
        'app_current_user',
        JSON.stringify(currentUser)
    );


    updateUserReplyNotification();

}

}

function deleteStudent(index) {

const user =
    usersList[index];


if (!user) return;


const confirmed = confirm(
    `هل أنت متأكد من إزالة ${user.name} من المنصة؟`
);


if (!confirmed) return;


if (
    currentUser &&
    currentUser.phone === user.phone
) {

    logoutUser();

    return;

}


usersList.splice(index, 1);


saveUsers();


renderAdminTable();


alert(
    'تم حذف العضو بنجاح.'
);

}

/* ==========================================================================
15. PUBLISH NORMAL CONTENT
========================================================================== */

function toggleAdminPublishMode() {

const targetSection =
    document.getElementById(
        'admin-target-section'
    ).value;


const normalForm =
    document.getElementById(
        'normal-content-form'
    );


const quizForm =
    document.getElementById(
        'quiz-publish-form'
    );


if (targetSection === 'quizzes') {

    normalForm.classList.add('hidden');

    quizForm.classList.remove('hidden');

}

else {

    normalForm.classList.remove('hidden');

    quizForm.classList.add('hidden');

}

}

function publishNews() {

const targetSection =
    document.getElementById(
        'admin-target-section'
    ).value;


if (targetSection === 'quizzes') {

    alert(
        'يرجى استخدام نموذج إنشاء الاختبار.'
    );

    return;

}


const title =
    document.getElementById(
        'admin-news-input'
    ).value.trim();


const link =
    document.getElementById(
        'admin-news-link'
    ).value.trim();


const fileInput =
    document.getElementById(
        'admin-news-file'
    );


if (!title) {

    alert(
        'يرجى إدخال عنوان أو نص المحتوى!'
    );

    return;

}


const newContent = {

    id: Date.now(),

    section: targetSection,

    title,

    link,

    fileData: '',

    fileType: '',

    date:
        new Date()
            .toLocaleDateString('ar-EG'),

    createdAt:
        Date.now()

};


const file =
    fileInput.files[0];


if (file) {

    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            newContent.fileData =
                event.target.result;


            newContent.fileType =
                file.type;


            saveAndRenderPublishedContent(
                newContent
            );

        };


    reader.readAsDataURL(file);

}

else {

    saveAndRenderPublishedContent(
        newContent
    );

}

}

function saveAndRenderPublishedContent(content) {

appContents.unshift(content);


saveContents();


document.getElementById(
    'admin-news-input'
).value = '';


document.getElementById(
    'admin-news-link'
).value = '';


document.getElementById(
    'admin-news-file'
).value = '';


renderAllContents();


triggerVibration();


alert(
    'تم نشر المحتوى بنجاح!'
);

}

/* ==========================================================================
16. QUIZ ADMIN INITIALIZATION
========================================================================== */

function initializeAdminQuizForm() {

const container =
    document.getElementById(
        'admin-questions-container'
    );


if (
    container &&
    container.children.length === 0
) {

    /* لا يتم إنشاء اختبار تلقائي.
       يظهر السؤال فقط عند ضغط الأدمن على إضافة سؤال. */

}

}

/* ==========================================================================
17. ADD QUIZ QUESTION
========================================================================== */

function addQuizQuestion() {

const container =
    document.getElementById(
        'admin-questions-container'
    );


if (!container) return;


const questionNumber =
    container.children.length + 1;


const questionId =
    `question-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 7)}`;


const questionBox =
    document.createElement('div');


questionBox.className =
    "quiz-question-admin bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3";


questionBox.dataset.questionId =
    questionId;


questionBox.innerHTML = `

    <div class="flex justify-between items-center">

        <h5 class="font-bold text-amber-400">

            السؤال رقم
            ${questionNumber}

        </h5>


        <button
            type="button"
            onclick="removeQuizQuestion('${questionId}')"
            class="text-red-400 text-xs border border-red-500/30 px-2 py-1 rounded-lg">

            حذف السؤال

        </button>

    </div>


    <textarea
        class="quiz-question-text w-full p-3 bg-slate-800 border border-slate-700 rounded-xl"
        rows="2"
        placeholder="اكتب السؤال هنا...">
    </textarea>


    <div class="space-y-2">


        <input
            type="text"
            class="quiz-option w-full p-3 bg-slate-800 border border-slate-700 rounded-xl"
            placeholder="الاختيار الأول">


        <input
            type="text"
            class="quiz-option w-full p-3 bg-slate-800 border border-slate-700 rounded-xl"
            placeholder="الاختيار الثاني">


        <input
            type="text"
            class="quiz-option w-full p-3 bg-slate-800 border border-slate-700 rounded-xl"
            placeholder="الاختيار الثالث">


        <input
            type="text"
            class="quiz-option w-full p-3 bg-slate-800 border border-slate-700 rounded-xl"
            placeholder="الاختيار الرابع">

    </div>


    <div>

        <label class="block text-slate-300 mb-1 font-bold">

            اختر الإجابة الصحيحة

        </label>


        <select
            class="quiz-correct-answer w-full p-3 bg-slate-800 border border-amber-400/30 rounded-xl">

            <option value="0">
                الاختيار الأول
            </option>

            <option value="1">
                الاختيار الثاني
            </option>

            <option value="2">
                الاختيار الثالث
            </option>

            <option value="3">
                الاختيار الرابع
            </option>

        </select>

    </div>

`;


container.appendChild(questionBox);

}

function removeQuizQuestion(questionId) {

const question =
    document.querySelector(
        `[data-question-id="${questionId}"]`
    );


if (question) {

    question.remove();

    updateQuestionNumbers();

}

}

function updateQuestionNumbers() {

const questions =
    document.querySelectorAll(
        '.quiz-question-admin'
    );


questions.forEach(
    (question, index) => {

        const title =
            question.querySelector('h5');


        if (title) {

            title.textContent =
                `السؤال رقم ${index + 1}`;

        }

    }
);

}

/* ==========================================================================
18. PUBLISH QUIZ
========================================================================== */

function publishQuiz() {

const title =
    document.getElementById(
        'quiz-admin-title'
    ).value.trim();


const time =
    parseInt(
        document.getElementById(
            'quiz-admin-time'
        ).value
    );


const questionBoxes =
    document.querySelectorAll(
        '.quiz-question-admin'
    );


if (!title) {

    alert(
        'يرجى كتابة عنوان الاختبار.'
    );

    return;

}


if (!time || time < 1) {

    alert(
        'يرجى تحديد مدة صحيحة للاختبار.'
    );

    return;

}


if (
    questionBoxes.length === 0
) {

    alert(
        'يرجى إضافة سؤال واحد على الأقل.'
    );

    return;

}


const questions = [];


for (
    let i = 0;
    i < questionBoxes.length;
    i++
) {

    const box =
        questionBoxes[i];


    const questionText =
        box.querySelector(
            '.quiz-question-text'
        ).value.trim();


    const optionInputs =
        box.querySelectorAll(
            '.quiz-option'
        );


    const options =
        Array.from(optionInputs)
            .map(
                input =>
                    input.value.trim()
            );


    const correctAnswer =
        parseInt(
            box.querySelector(
                '.quiz-correct-answer'
            ).value
        );


    if (!questionText) {

        alert(
            `يرجى كتابة السؤال رقم ${i + 1}`
        );

        return;

    }


    if (
        options.some(
            option => !option
        )
    ) {

        alert(
            `يرجى استكمال جميع اختيارات السؤال رقم ${i + 1}`
        );

        return;

    }


    questions.push({

        id:
            Date.now() + i,

        question:
            questionText,

        options,

        correctAnswer

    });

}


const newQuiz = {

    id:
        Date.now(),

    title,

    duration:
        time,

    questions,

    date:
        new Date()
            .toLocaleDateString('ar-EG'),

    createdAt:
        Date.now()

};


quizzesList.unshift(
    newQuiz
);


saveQuizzes();


resetQuizPublishForm();


renderQuizzes();


updateAllNewContentBadges();


triggerVibration();


alert(
    'تم نشر الاختبار بنجاح!'
);

}

function resetQuizPublishForm() {

document.getElementById(
    'quiz-admin-title'
).value = '';


document.getElementById(
    'quiz-admin-time'
).value = 15;


document.getElementById(
    'admin-questions-container'
).innerHTML = '';

}

/* ==========================================================================
19. RENDER QUIZZES
========================================================================== */

function renderQuizzes(filterQuery = '') {

const container =
    document.getElementById(
        'quizzes-container'
    );


if (!container) return;


container.innerHTML = '';


const query =
    filterQuery
        .toLowerCase()
        .trim();


const filteredQuizzes =
    quizzesList.filter(quiz =>
        quiz.title
            .toLowerCase()
            .includes(query)
    );


if (
    filteredQuizzes.length === 0
) {

    container.innerHTML = `

        <div class="text-center p-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">

            لا توجد اختبارات منشورة حالياً.

        </div>

    `;

    return;

}


filteredQuizzes.forEach(quiz => {

    const card =
        document.createElement('div');


    card.className =
        "bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md space-y-3";


    card.innerHTML = `

        <div class="flex justify-between items-start gap-3">

            <div>

                <h4 class="font-bold text-amber-300 text-base">

                    ${escapeHtml(quiz.title)}

                </h4>


                <div class="text-xs text-slate-400 mt-2 space-y-1">

                    <p>
                        📝 عدد الأسئلة:
                        ${quiz.questions.length}
                    </p>

                    <p>
                        ⏱️ المدة:
                        ${quiz.duration} دقيقة
                    </p>

                    <p>
                        📅 ${escapeHtml(quiz.date || '')}
                    </p>

                </div>

            </div>


            <button
                onclick="deleteQuiz(${quiz.id})"
                class="text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg text-xs">

                🗑️

            </button>

        </div>


        <button
            onclick="startQuiz(${quiz.id})"
            class="w-full py-3 bg-amber-400 text-slate-950 font-black rounded-xl hover:bg-amber-300 transition">

            🚀 بدء الاختبار

        </button>

    `;


    container.appendChild(card);

});

}

/* ==========================================================================
20. DELETE QUIZ
========================================================================== */

function deleteQuiz(id) {

const adminPass =

    localStorage.getItem(
        'app_admin_pass'
    )

    ||

    ADMIN_PASSWORD_DEFAULT;


const inputPass = prompt(
    'أدخل كلمة مرور الأدمن لحذف الاختبار:'
);


if (inputPass === null) return;


if (inputPass !== adminPass) {

    alert(
        'كلمة المرور غير صحيحة!'
    );

    return;

}


quizzesList =
    quizzesList.filter(
        quiz =>
            quiz.id !== id
    );


saveQuizzes();


renderQuizzes();


alert(
    'تم حذف الاختبار بنجاح.'
);

}

/* ==========================================================================
21. START QUIZ
========================================================================== */

function startQuiz(quizId) {

const quiz =
    quizzesList.find(
        item =>
            item.id === quizId
    );


if (!quiz) {

    alert(
        'تعذر العثور على الاختبار.'
    );

    return;

}


activeQuiz = quiz;

quizSubmitted = false;


const modal =
    document.getElementById(
        'quiz-modal'
    );


const title =
    document.getElementById(
        'quiz-title'
    );


const questionsContainer =
    document.getElementById(
        'quiz-questions-container'
    );


const form =
    document.getElementById(
        'quiz-form'
    );


const result =
    document.getElementById(
        'quiz-result'
    );


title.textContent =
    quiz.title;


questionsContainer.innerHTML = '';


form.classList.remove('hidden');

result.classList.add('hidden');


quiz.questions.forEach(
    (question, questionIndex) => {

        const questionBox =
            document.createElement('div');


        questionBox.className =
            "bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3";


        let optionsHtml = '';


        question.options.forEach(
            (option, optionIndex) => {

                optionsHtml += `

                    <label class="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-amber-400/50 transition">

                        <input
                            type="radio"
                            name="question-${questionIndex}"
                            value="${optionIndex}"
                            class="accent-amber-400">

                        <span>

                            ${escapeHtml(option)}

                        </span>

                    </label>

                `;

            }
        );


        questionBox.innerHTML = `

            <h4 class="font-bold text-slate-100 leading-relaxed">

                ${questionIndex + 1}.
                ${escapeHtml(question.question)}

            </h4>


            <div class="space-y-2">

                ${optionsHtml}

            </div>

        `;


        questionsContainer.appendChild(
            questionBox
        );

    }
);


modal.classList.remove('hidden');


markSectionAsSeen(
    'quizzes'
);


startQuizTimer(
    quiz.duration
);


window.scrollTo({
    top: 0,
    behavior: 'smooth'
});

}

/* ==========================================================================
22. QUIZ TIMER
========================================================================== */

function startQuizTimer(minutes) {

clearInterval(
    quizTimerInterval
);


quizRemainingSeconds =
    minutes * 60;


updateQuizTimerDisplay();


quizTimerInterval =
    setInterval(() => {

        quizRemainingSeconds--;


        updateQuizTimerDisplay();


        if (
            quizRemainingSeconds <= 0
        ) {

            clearInterval(
                quizTimerInterval
            );


            if (!quizSubmitted) {

                submitQuiz(
                    null,
                    true
                );

            }

        }

    }, 1000);

}

function updateQuizTimerDisplay() {

const timer =
    document.getElementById(
        'quiz-timer'
    );


if (!timer) return;


const minutes =
    Math.floor(
        quizRemainingSeconds / 60
    );


const seconds =
    quizRemainingSeconds % 60;


timer.textContent =

    `${String(minutes).padStart(2, '0')}:` +

    `${String(seconds).padStart(2, '0')}`;

}

/* ==========================================================================
23. SUBMIT QUIZ
========================================================================== */

function submitQuiz(
event,
isAutoSubmit = false
) {

if (event) {

    event.preventDefault();

}


if (
    !activeQuiz ||
    quizSubmitted
) return;


quizSubmitted = true;


clearInterval(
    quizTimerInterval
);


let correctAnswers = 0;


activeQuiz.questions.forEach(
    (question, index) => {

        const selected =
            document.querySelector(
                `input[name="question-${index}"]:checked`
            );


        if (selected) {

            const selectedValue =
                parseInt(
                    selected.value
                );


            if (
                selectedValue ===
                question.correctAnswer
            ) {

                correctAnswers++;

            }

        }

    }
);


showQuizResult(
    correctAnswers,
    activeQuiz.questions.length,
    isAutoSubmit
);

}

/* ==========================================================================
24. QUIZ RESULT
========================================================================== */

function showQuizResult(
correctAnswers,
totalQuestions,
isAutoSubmit
) {

const form =
    document.getElementById(
        'quiz-form'
    );


const result =
    document.getElementById(
        'quiz-result'
    );


const score =
    document.getElementById(
        'quiz-score'
    );


const resultText =
    document.getElementById(
        'quiz-result-text'
    );


const percentage =
    Math.round(
        (
            correctAnswers /
            totalQuestions
        ) * 100
    );


form.classList.add('hidden');

result.classList.remove('hidden');


score.textContent =

    `${correctAnswers} من ${totalQuestions}` +

    ` (${percentage}%)`;


let message = '';


if (percentage >= 90) {

    message =
        'ممتاز جداً! أداء رائع.';

}

else if (percentage >= 75) {

    message =
        'أداء ممتاز، استمر في التقدم.';

}

else if (percentage >= 50) {

    message =
        'نتيجة جيدة، ويمكنك التحسن أكثر بالمراجعة.';

}

else {

    message =
        'حاول مراجعة الدرس ثم اختبر نفسك مرة أخرى.';

}


if (isAutoSubmit) {

    message =
        'انتهى الوقت وتم إرسال إجاباتك تلقائياً. ' +
        message;

}


resultText.textContent =
    message;


triggerVibration();

}

/* ==========================================================================
25. CLOSE QUIZ
========================================================================== */

function closeQuizModal() {

clearInterval(
    quizTimerInterval
);


const modal =
    document.getElementById(
        'quiz-modal'
    );


if (modal) {

    modal.classList.add('hidden');

}


activeQuiz = null;

quizSubmitted = false;


showSection(
    'quizzes'
);

}

/* ==========================================================================
26. NEW CONTENT BADGES
========================================================================== */

function getSeenSections() {

return JSON.parse(

    localStorage.getItem(
        'app_seen_sections'
    )

) || {};

}

function markSectionAsSeen(section) {

const seenSections =
    getSeenSections();


let latestTimestamp = 0;


if (
    section === 'quizzes'
) {

    if (
        quizzesList.length > 0
    ) {

        latestTimestamp =
            Math.max(
                ...quizzesList.map(
                    quiz =>
                        quiz.createdAt ||
                        quiz.id
                )
            );

    }

}

else {

    const sectionContents =
        appContents.filter(
            item =>
                item.section === section
        );


    if (
        sectionContents.length > 0
    ) {

        latestTimestamp =
            Math.max(
                ...sectionContents.map(
                    item =>
                        item.createdAt ||
                        item.id
                )
            );

    }

}


seenSections[section] =
    latestTimestamp;


localStorage.setItem(
    'app_seen_sections',
    JSON.stringify(seenSections)
);


updateAllNewContentBadges();

}

function sectionHasNewContent(section) {

const seenSections =
    getSeenSections();


const lastSeen =
    seenSections[section] || 0;


let latestTimestamp = 0;


if (
    section === 'quizzes'
) {

    quizzesList.forEach(
        quiz => {

            const timestamp =
                quiz.createdAt ||
                quiz.id ||
                0;


            if (
                timestamp >
                latestTimestamp
            ) {

                latestTimestamp =
                    timestamp;

            }

        }
    );

}

else {

    appContents
        .filter(
            item =>
                item.section === section
        )
        .forEach(
            item => {

                const timestamp =
                    item.createdAt ||
                    item.id ||
                    0;


                if (
                    timestamp >
                    latestTimestamp
                ) {

                    latestTimestamp =
                        timestamp;

                }

            }
        );

}


return (
    latestTimestamp > lastSeen
);

}

function updateAllNewContentBadges() {

const sections = [

    'news',

    'courses',

    'pdfs',

    'quizzes'

];


sections.forEach(
    section => {

        const hasNew =
            sectionHasNewContent(
                section
            );


        toggleBadges(
            [

                `badge-${section}-nav`,

                `badge-${section}-mobile`

            ],
            hasNew
        );

    }
);

}

function toggleBadges(
badgeIds,
show
) {

badgeIds.forEach(
    id => {

        const badge =
            document.getElementById(
                id
            );


        if (!badge) return;


        if (show) {

            badge.classList.remove(
                'hidden'
            );

        }

        else {

            badge.classList.add(
                'hidden'
            );

        }

    }
);

}

/* ==========================================================================
27. STORAGE HELPERS
========================================================================== */

function saveUsers() {

localStorage.setItem(
    'app_users_list',
    JSON.stringify(usersList)
);

}

function saveContents() {

localStorage.setItem(
    'app_contents',
    JSON.stringify(appContents)
);

}

function saveQuizzes() {

localStorage.setItem(
    'app_quizzes_list',
    JSON.stringify(quizzesList)
);

}

/* ==========================================================================
28. SECURITY HELPERS
========================================================================== */

function escapeHtml(value) {

if (
    value === null ||
    value === undefined
) {

    return '';

}


return String(value)

    .replace(
        /&/g,
        '&amp;'
    )

    .replace(
        /</g,
        '&lt;'
    )

    .replace(
        />/g,
        '&gt;'
    )

    .replace(
        /"/g,
        '&quot;'
    )

    .replace(
        /'/g,
        '&#039;'
    );

}

function escapeAttribute(value) {

return escapeHtml(value);

   }
