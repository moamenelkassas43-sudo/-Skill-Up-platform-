/* ==========================================================================
منصة مستر أشرف بسيوني التعليمية
script.js
========================================================================== */

/* ==========================================================================

1. GLOBAL STATE & LOCAL STORAGE
   ========================================================================== */

let currentUser =
JSON.parse(localStorage.getItem('app_current_user')) || null;

let usersList =
JSON.parse(localStorage.getItem('app_users_list')) || [];

let appContents =
JSON.parse(localStorage.getItem('app_contents')) || [];

let selectedGender = '';

let isDarkMode =
localStorage.getItem('app_theme') !== 'light';

let currentQuiz = null;
let quizTimerInterval = null;
let remainingQuizSeconds = 0;

let adminQuestionCounter = 0;

/* كلمة مرور الأدمن */
const ADMIN_PASSWORD_DEFAULT = '1122334455';

/* ==========================================================================
2. INITIALIZATION
========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

initTypingEffect();

applySavedTheme();

renderAllContents();

updateAllNotificationBadges();

if (currentUser) {
    showMainApp();
}

});

/* ==========================================================================
3. TYPING EFFECT
========================================================================== */

function initTypingEffect() {

const textContainer =
    document.getElementById('typing-text');

if (!textContainer) return;


const phrases = [

    'WELCOME TO MR. ASHRAF BASSIOUNY PLATFORM',

    'SKILL UP CENTER - EXCELLENCE IN ENGLISH',

    'طريقك للتميز والتقفيل في اللغة الإنجليزية'

];


let phraseIdx = 0;

let charIdx = 0;

let isDeleting = false;


function type() {

    const currentPhrase =
        phrases[phraseIdx];


    if (isDeleting) {

        textContainer.textContent =
            currentPhrase.substring(
                0,
                Math.max(0, charIdx - 1)
            );

        charIdx--;

    } else {

        textContainer.textContent =
            currentPhrase.substring(
                0,
                charIdx + 1
            );

        charIdx++;

    }


    let speed =
        isDeleting ? 35 : 70;


    if (
        !isDeleting &&
        charIdx === currentPhrase.length
    ) {

        speed = 1800;

        isDeleting = true;

    }

    else if (
        isDeleting &&
        charIdx <= 0
    ) {

        isDeleting = false;

        phraseIdx =
            (phraseIdx + 1)
            %
            phrases.length;

        speed = 400;

    }


    setTimeout(type, speed);

}


type();

}

/* ==========================================================================
4. USER REGISTRATION
========================================================================== */

function setGenderChoice(gender) {

selectedGender = gender;


const maleBtn =
    document.getElementById(
        'btn-gender-male'
    );

const femaleBtn =
    document.getElementById(
        'btn-gender-female'
    );


if (gender === 'male') {

    maleBtn.classList.add(
        'bg-blue-500/20',
        'border-blue-500'
    );

    femaleBtn.classList.remove(
        'bg-pink-500/20',
        'border-pink-500'
    );

}

else {

    femaleBtn.classList.add(
        'bg-pink-500/20',
        'border-pink-500'
    );

    maleBtn.classList.remove(
        'bg-blue-500/20',
        'border-blue-500'
    );

}

}

function handleRegister(event) {

event.preventDefault();


const name =
    document.getElementById(
        'reg-name'
    ).value.trim();


const phone =
    document.getElementById(
        'reg-phone'
    ).value.trim();


const grade =
    document.getElementById(
        'reg-grade'
    ).value;


const school =
    document.getElementById(
        'reg-school'
    ).value;


const pass =
    document.getElementById(
        'reg-pass'
    ).value;


if (!selectedGender) {

    alert(
        'يرجى تحديد النوع: طالب أو طالبة'
    );

    return;

}


if (
    !name ||
    !phone ||
    !grade ||
    !school ||
    !pass
) {

    alert(
        'يرجى استكمال جميع البيانات.'
    );

    return;

}


const existingUser =
    usersList.find(
        user =>
            user.phone === phone
    );


if (existingUser) {

    if (
        existingUser.pass === pass
    ) {

        currentUser =
            existingUser;

    }

    else {

        alert(
            'رقم الهاتف مسجل بالفعل وكلمة المرور غير صحيحة.'
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

        gender:
            selectedGender,

        message: '',

        reply: '',

        seenSections: []

    };


    usersList.push(
        currentUser
    );


    saveUsers();

}


localStorage.setItem(

    'app_current_user',

    JSON.stringify(
        currentUser
    )

);


showMainApp();

}

/* ==========================================================================
5. MAIN APP
========================================================================== */

function showMainApp() {

const intro =
    document.getElementById(
        'intro-screen'
    );


const mainApp =
    document.getElementById(
        'main-app'
    );


if (intro) {

    intro.classList.add(
        'hidden'
    );

}


if (mainApp) {

    mainApp.classList.remove(
        'hidden'
    );


    setTimeout(() => {

        mainApp.classList.remove(
            'opacity-0'
        );

    }, 50);

}


const navName =
    document.getElementById(
        'nav-user-name'
    );


if (
    navName &&
    currentUser
) {

    navName.textContent =
        currentUser.name
            .split(' ')[0];

}


updateAllNotificationBadges();

updateUserReplyNotification();

}

function logoutUser() {

localStorage.removeItem(
    'app_current_user'
);


currentUser = null;


location.reload();

}

/* ==========================================================================
6. NAVIGATION
========================================================================== */

function showSection(sectionId) {

const sections =
    document.querySelectorAll(
        '.app-section'
    );


sections.forEach(
    section => {

        section.classList.add(
            'hidden'
        );

    }
);


const target =
    document.getElementById(
        sectionId
    );


if (target) {

    target.classList.remove(
        'hidden'
    );


    window.scrollTo({

        top: 0,

        behavior: 'smooth'

    });

}

}

/*
فتح قسم المحتوى
وإزالة علامة الجديد
*/

function openContentSection(sectionId) {

showSection(sectionId);


markSectionAsSeen(
    sectionId
);

}

/* ==========================================================================
7. THEME
========================================================================== */

function toggleTheme() {

isDarkMode =
    !isDarkMode;


localStorage.setItem(

    'app_theme',

    isDarkMode
        ? 'dark'
        : 'light'

);


applySavedTheme();

}

function applySavedTheme() {

const body =
    document.getElementById(
        'app-body'
    );


const themeText =
    document.getElementById(
        'theme-btn-text'
    );


if (!body) return;


if (isDarkMode) {

    body.className =
        'theme-dark bg-slate-950 text-slate-100 min-h-screen font-cairo text-xs sm:text-sm selection:bg-amber-400 selection:text-black overflow-x-hidden';


    if (themeText) {

        themeText.textContent =
            '🌙 الداكن';

    }

}

else {

    body.className =
        'theme-light bg-slate-100 text-slate-900 min-h-screen font-cairo text-xs sm:text-sm selection:bg-amber-400 selection:text-black overflow-x-hidden';


    if (themeText) {

        themeText.textContent =
            '☀️ المضيء';

    }

}

}

/* ==========================================================================
8. USER ACCOUNT
========================================================================== */

function openUserAccountModal() {

if (!currentUser) return;


const modal =
    document.getElementById(
        'user-account-modal'
    );


const infoCard =
    document.getElementById(
        'user-info-card'
    );


const replyBox =
    document.getElementById(
        'user-reply-box'
    );


const latestUser =
    usersList.find(
        user =>
            user.phone ===
            currentUser.phone
    );


if (latestUser) {

    currentUser =
        latestUser;


    localStorage.setItem(

        'app_current_user',

        JSON.stringify(
            currentUser
        )

    );

}


if (infoCard) {

    infoCard.innerHTML = `

        <p>
            <strong>الاسم:</strong>
            ${escapeHtml(currentUser.name)}
        </p>

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
        latestUser &&
        latestUser.reply
            ?
            latestUser.reply
            :
            'لا يوجد رد بعد من إدارة المنصة.';

}


if (modal) {

    modal.classList.remove(
        'hidden'
    );

}


markUserReplyAsSeen();

}

function closeUserAccountModal() {

const modal =
    document.getElementById(
        'user-account-modal'
    );


if (modal) {

    modal.classList.add(
        'hidden'
    );

}

}

/* ==========================================================================
9. STUDENT MESSAGES
========================================================================== */

function sendStudentMessage(event) {

event.preventDefault();


if (!currentUser) {

    alert(
        'يرجى تسجيل الدخول أولاً.'
    );

    return;

}


const textarea =
    document.getElementById(
        'student-msg-text'
    );


const message =
    textarea.value.trim();


if (!message) return;


const index =
    usersList.findIndex(
        user =>
            user.phone ===
            currentUser.phone
    );


if (index === -1) {

    alert(
        'تعذر العثور على الحساب.'
    );

    return;

}


usersList[index].message =
    message;


currentUser.message =
    message;


saveUsers();


localStorage.setItem(

    'app_current_user',

    JSON.stringify(
        currentUser
    )

);


triggerVibration();


alert(
    'تم إرسال رسالتك إلى المستر بنجاح.'
);


textarea.value = '';

}

/* ==========================================================================
10. NOTIFICATIONS
========================================================================== */

function getLastSeenData() {

if (!currentUser) {

    return {};

}


return JSON.parse(

    localStorage.getItem(

        'app_seen_' +
        currentUser.phone

    )

) || {};

}

function saveLastSeenData(data) {

if (!currentUser) return;


localStorage.setItem(

    'app_seen_' +
    currentUser.phone,

    JSON.stringify(data)

);

}

function markSectionAsSeen(section) {

if (!currentUser) return;


const data =
    getLastSeenData();


data[section] =
    Date.now();


saveLastSeenData(data);


updateAllNotificationBadges();

}

function hasNewContent(section) {

if (!currentUser) {

    return false;

}


const seenData =
    getLastSeenData();


const lastSeen =
    seenData[section] || 0;


return appContents.some(

    item =>

        item.section === section &&

        item.createdAt > lastSeen

);

}

function updateSectionBadge(section) {

const isNew =
    hasNewContent(section);


const badges =
    document.querySelectorAll(

        '#badge-' +
        section +
        '-nav, ' +

        '#badge-' +
        section +
        '-mobile'

    );


badges.forEach(
    badge => {

        if (isNew) {

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

function updateAllNotificationBadges() {

[
    'news',
    'courses',
    'pdfs',
    'quizzes'
].forEach(

    section =>
        updateSectionBadge(section)

);

}

/* إشعار الرد */

function updateUserReplyNotification() {

if (!currentUser) return;


const latestUser =
    usersList.find(

        user =>
            user.phone ===
            currentUser.phone

    );


const hasReply =
    latestUser &&
    latestUser.reply &&
    !latestUser.replySeen;


document
    .querySelectorAll(

        '#badge-user-nav, ' +
        '#badge-user-mobile'

    )

    .forEach(

        badge => {

            badge.classList.toggle(

                'hidden',

                !hasReply

            );

        }

    );


if (hasReply) {

    triggerVibration();

}

}

function markUserReplyAsSeen() {

if (!currentUser) return;


const index =
    usersList.findIndex(

        user =>
            user.phone ===
            currentUser.phone

    );


if (index !== -1) {

    usersList[index].replySeen =
        true;


    saveUsers();


    currentUser =
        usersList[index];


    localStorage.setItem(

        'app_current_user',

        JSON.stringify(
            currentUser
        )

    );

}


updateUserReplyNotification();

}

/* ==========================================================================
11. VIBRATION
========================================================================== */

function triggerVibration() {

if (

    'vibrate' in navigator

) {

    navigator.vibrate(
        [100, 50, 100]
    );

}

}

/* ==========================================================================
12. RENDER CONTENT
========================================================================== */

function renderAllContents(
filterQuery = ''
) {

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
        ),

    quizzes:
        document.getElementById(
            'quizzes-container'
        )

};


Object.values(containers)
    .forEach(

        container => {

            if (container) {

                container.innerHTML = '';

            }

        }

    );


const query =
    filterQuery
        .toLowerCase()
        .trim();


const filteredContents =
    appContents.filter(

        item =>

            item.title
                .toLowerCase()
                .includes(query)

    );


filteredContents.forEach(

    item => {

        const container =
            containers[
                item.section
            ];


        if (!container) return;


        if (
            item.section ===
            'quizzes'
        ) {

            renderQuizCard(
                item,
                container
            );

        }

        else {

            renderNormalContentCard(
                item,
                container
            );

        }

    }

);


updateAllNotificationBadges();

}

/* ==========================================================================
13. NORMAL CONTENT CARD
========================================================================== */

function renderNormalContentCard(
item,
container
) {

const card =
    document.createElement(
        'div'
    );


card.className =
    'bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md space-y-3';


let mediaHtml = '';


if (item.fileData) {

    if (

        item.fileType.startsWith(
            'image/'
        )

    ) {

        mediaHtml = `

            <img
                src="${item.fileData}"
                class="w-full max-h-80 object-cover rounded-lg"
                alt="مرفق">

        `;

    }


    else if (

        item.fileType.startsWith(
            'video/'
        )

    ) {

        mediaHtml = `

            <video
                src="${item.fileData}"
                controls
                class="w-full max-h-80 rounded-lg">
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
                download
                class="inline-block text-amber-400 underline font-bold">

                📄 تحميل ملف PDF

            </a>

        `;

    }

}


let linkHtml = '';


if (item.link) {

    linkHtml = `

        <a
            href="${item.link}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block text-amber-400 font-bold hover:underline">

            🔗 فتح الرابط

        </a>

    `;

}


card.innerHTML = `

    <div class="flex justify-between gap-3">

        <div>

            <h4
            class="font-bold text-amber-300 text-sm md:text-base">

                ${escapeHtml(item.title)}

            </h4>

            <p
            class="text-[10px] text-slate-500 mt-1">

                ${item.date || ''}

            </p>

        </div>


        <button
        onclick="deleteContent(${item.id})"
        class="shrink-0 text-red-400 text-xs bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20">

            🗑️ حذف

        </button>

    </div>


    ${mediaHtml}

    ${linkHtml}

`;


container.appendChild(card);

}

/* ==========================================================================
14. SEARCH
========================================================================== */

function handleSearch() {

const input =
    document.getElementById(
        'search-input'
    );


renderAllContents(

    input
        ? input.value
        : ''

);

}

/* ==========================================================================
15. DELETE CONTENT
========================================================================== */

function deleteContent(id) {

const adminPass =

    localStorage.getItem(
        'app_admin_pass'
    )

    ||

    ADMIN_PASSWORD_DEFAULT;


const inputPass =
    prompt(

        'أدخل كلمة مرور الأدمن لحذف المحتوى:'

    );


if (

    inputPass === null

) return;


if (

    inputPass !== adminPass

) {

    alert(
        'كلمة المرور غير صحيحة.'
    );

    return;

}


const confirmed =
    confirm(

        'هل تريد حذف هذا المحتوى نهائياً؟'

    );


if (!confirmed) return;


appContents =
    appContents.filter(

        item =>
            item.id !== id

    );


saveContents();


renderAllContents();


alert(
    'تم حذف المحتوى بنجاح.'
);

}

/* ==========================================================================
16. ADMIN
========================================================================== */

function openAdminModal() {

const modal =
    document.getElementById(
        'admin-modal'
    );


if (modal) {

    modal.classList.remove(
        'hidden'
    );

}

}

function closeAdminModal() {

const modal =
    document.getElementById(
        'admin-modal'
    );


if (modal) {

    modal.classList.add(
        'hidden'
    );

}


resetAdminLogin();

}

function resetAdminLogin() {

const auth =
    document.getElementById(
        'admin-auth'
    );


const dashboard =
    document.getElementById(
        'admin-dashboard-content'
    );


if (auth) {

    auth.classList.remove(
        'hidden'
    );

}


if (dashboard) {

    dashboard.classList.add(
        'hidden'
    );

}


const pass =
    document.getElementById(
        'admin-pass-input'
    );


if (pass) {

    pass.value = '';

}

}

function verifyAdminPass() {

const passInput =
    document.getElementById(
        'admin-pass-input'
    );


const adminPass =

    localStorage.getItem(
        'app_admin_pass'
    )

    ||

    ADMIN_PASSWORD_DEFAULT;


if (

    passInput.value ===
    adminPass

) {

    document
        .getElementById(
            'admin-auth'
        )

        .classList.add(
            'hidden'
        );


    document
        .getElementById(
            'admin-dashboard-content'
        )

        .classList.remove(
            'hidden'
        );


    renderAdminTable();


    toggleAdminPublishMode();

}

else {

    alert(
        'كلمة المرور غير صحيحة.'
    );

}

}

/* ==========================================================================
17. ADMIN STUDENTS TABLE
========================================================================== */

function renderAdminTable() {

const tbody =
    document.getElementById(
        'admin-table-body'
    );


if (!tbody) return;


tbody.innerHTML = '';


usersList.forEach(

    (user, index) => {

        const row =
            document.createElement(
                'tr'
            );


        row.className =
            'hover:bg-slate-800/50 transition';


        row.innerHTML = `

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


            <td
            class="p-2.5 text-slate-300">

                ${escapeHtml(
                    user.message ||
                    'لا توجد رسالة'
                )}

            </td>


            <td
            class="p-2.5 text-amber-300">

                ${escapeHtml(
                    user.reply ||
                    'لم يتم الرد'
                )}

            </td>


            <td
            class="p-2.5 text-center">

                <div
                class="flex justify-center gap-1">

                    <button
                    onclick="replyToStudent(${index})"
                    class="px-2 py-1 bg-amber-400/20 text-amber-300 rounded-lg">

                        الرد

                    </button>


                    <button
                    onclick="deleteStudent(${index})"
                    class="px-2 py-1 bg-red-500/20 text-red-400 rounded-lg">

                        حذف

                    </button>

                </div>

            </td>

        `;


        tbody.appendChild(
            row
        );

    }

);

}

function replyToStudent(index) {

const student =
    usersList[index];


if (!student) return;


const reply =
    prompt(

        'اكتب ردك للطالب: ' +
        student.name

    );


if (

    reply === null

) return;


usersList[index].reply =
    reply.trim();


usersList[index].replySeen =
    false;


saveUsers();


renderAdminTable();


if (

    currentUser &&

    currentUser.phone ===
    usersList[index].phone

) {

    currentUser =
        usersList[index];


    localStorage.setItem(

        'app_current_user',

        JSON.stringify(
            currentUser
        )

    );


    triggerVibration();

    updateUserReplyNotification();

}

}

function deleteStudent(index) {

const student =
    usersList[index];


if (!student) return;


const confirmed =
    confirm(

        'هل تريد حذف ' +

        student.name +

        ' من المنصة؟'

    );


if (!confirmed) return;


if (

    currentUser &&

    currentUser.phone ===
    student.phone

) {

    logoutUser();

}


usersList.splice(
    index,
    1
);


saveUsers();


renderAdminTable();

}

/* ==========================================================================
18. ADMIN PUBLISH MODE
========================================================================== */

function toggleAdminPublishMode() {

const section =
    document.getElementById(
        'admin-target-section'
    );


const normalForm =
    document.getElementById(
        'normal-content-form'
    );


const quizForm =
    document.getElementById(
        'quiz-publish-form'
    );


if (

    !section ||
    !normalForm ||
    !quizForm

) return;


if (

    section.value ===
    'quizzes'

) {

    normalForm.classList.add(
        'hidden'
    );


    quizForm.classList.remove(
        'hidden'
    );


    const container =
        document.getElementById(
            'admin-questions-container'
        );


    if (

        container &&
        container.children.length === 0

    ) {

        addQuizQuestion();

    }

}

else {

    normalForm.classList.remove(
        'hidden'
    );


    quizForm.classList.add(
        'hidden'
    );

}

}

/* ==========================================================================
19. PUBLISH NORMAL CONTENT
========================================================================== */

function publishNews() {

const targetSection =
    document.getElementById(
        'admin-target-section'
    ).value;


if (

    targetSection ===
    'quizzes'

) {

    alert(
        'استخدم نموذج نشر الاختبار.'
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
        'يرجى كتابة عنوان المحتوى.'
    );

    return;

}


const content = {

    id: Date.now(),

    section:
        targetSection,

    title,

    link,

    fileData: '',

    fileType: '',

    date:
        new Date()
        .toLocaleDateString(
            'ar-EG'
        ),

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

            content.fileData =
                event.target.result;


            content.fileType =
                file.type;


            savePublishedContent(
                content
            );

        };


    reader.readAsDataURL(
        file
    );

}

else {

    savePublishedContent(
        content
    );

}

}

function savePublishedContent(content) {

appContents.unshift(
    content
);


saveContents();


document
    .getElementById(
        'admin-news-input'
    )
    .value = '';


document
    .getElementById(
        'admin-news-link'
    )
    .value = '';


document
    .getElementById(
        'admin-news-file'
    )
    .value = '';


renderAllContents();


triggerVibration();


alert(
    'تم نشر المحتوى بنجاح.'
);

}

/* ==========================================================================
20. QUIZ ADMIN - ADD QUESTION
========================================================================== */

function addQuizQuestion() {

adminQuestionCounter++;


const container =
    document.getElementById(
        'admin-questions-container'
    );


if (!container) return;


const questionId =
    adminQuestionCounter;


const question =
    document.createElement(
        'div'
    );


question.className =
    'quiz-admin-question bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3';


question.dataset.questionId =
    questionId;


question.innerHTML = `

    <div
    class="flex justify-between items-center">

        <h5
        class="text-amber-400 font-bold">

            السؤال رقم
            ${questionId}

        </h5>


        <button
        type="button"
        onclick="removeQuizQuestion(this)"
        class="text-red-400 text-xs">

            🗑️ حذف السؤال

        </button>

    </div>


    <input
    type="text"
    class="quiz-question-text w-full p-3 bg-slate-800 border border-slate-700 rounded-xl"
    placeholder="اكتب السؤال هنا">


    <div class="space-y-2">


        <input
        type="text"
        class="quiz-option w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg"
        placeholder="الإجابة الأولى">


        <input
        type="text"
        class="quiz-option w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg"
        placeholder="الإجابة الثانية">


        <input
        type="text"
        class="quiz-option w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg"
        placeholder="الإجابة الثالثة">


        <input
        type="text"
        class="quiz-option w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg"
        placeholder="الإجابة الرابعة">

    </div>


    <select
    class="quiz-correct-answer w-full p-3 bg-slate-800 border border-amber-400/40 rounded-xl text-amber-400">

        <option value="">
            اختر الإجابة الصحيحة
        </option>

        <option value="0">
            الإجابة الأولى
        </option>

        <option value="1">
            الإجابة الثانية
        </option>

        <option value="2">
            الإجابة الثالثة
        </option>

        <option value="3">
            الإجابة الرابعة
        </option>

    </select>

`;


container.appendChild(
    question
);

}

function removeQuizQuestion(button) {

const question =
    button.closest(
        '.quiz-admin-question'
    );


if (question) {

    question.remove();

}

}

/* ==========================================================================
21. PUBLISH QUIZ
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


const questionElements =
    document.querySelectorAll(
        '.quiz-admin-question'
    );


if (!title) {

    alert(
        'يرجى كتابة عنوان الاختبار.'
    );

    return;

}


if (

    !time ||
    time < 1

) {

    alert(
        'يرجى تحديد مدة صحيحة للاختبار.'
    );

    return;

}


if (

    questionElements.length === 0

) {

    alert(
        'أضف سؤالاً واحداً على الأقل.'
    );

    return;

}


const questions = [];


for (

    const element of
    questionElements

) {

    const text =
        element
        .querySelector(
            '.quiz-question-text'
        )
        .value
        .trim();


    const optionInputs =
        element.querySelectorAll(
            '.quiz-option'
        );


    const options =
        Array.from(
            optionInputs
        )

        .map(
            input =>
                input.value.trim()
        );


    const correct =
        element
        .querySelector(
            '.quiz-correct-answer'
        )
        .value;


    if (

        !text ||

        options.some(
            option => !option
        ) ||

        correct === ''

    ) {

        alert(
            'يرجى استكمال جميع بيانات الأسئلة والإجابات.'
        );

        return;

    }


    questions.push({

        text,

        options,

        correct:
            Number(correct)

    });

}


const quiz = {

    id:
        Date.now(),

    section:
        'quizzes',

    title,

    time,

    questions,

    date:
        new Date()
        .toLocaleDateString(
            'ar-EG'
        ),

    createdAt:
        Date.now()

};


appContents.unshift(
    quiz
);


saveContents();


document
    .getElementById(
        'quiz-admin-title'
    )
    .value = '';


document
    .getElementById(
        'quiz-admin-time'
    )
    .value = 15;


document
    .getElementById(
        'admin-questions-container'
    )
    .innerHTML = '';


adminQuestionCounter = 0;


addQuizQuestion();


renderAllContents();


triggerVibration();


alert(
    'تم نشر الاختبار بنجاح.'
);

}

/* ==========================================================================
22. RENDER QUIZ CARD
========================================================================== */

function renderQuizCard(
quiz,
container
) {

const card =
    document.createElement(
        'div'
    );


card.className =
    'bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3';


card.innerHTML = `

    <div
    class="flex justify-between gap-3">

        <div>

            <h4
            class="font-bold text-amber-400 text-base">

                📝
                ${escapeHtml(quiz.title)}

            </h4>


            <p
            class="text-slate-400 text-xs mt-2">

                عدد الأسئلة:
                ${quiz.questions.length}

                <br>

                المدة:
                ${quiz.time}
                دقيقة

            </p>

        </div>


        <button
        onclick="deleteContent(${quiz.id})"
        class="text-red-400 text-xs bg-red-500/10 px-2 py-1 rounded-lg h-fit">

            🗑️

        </button>

    </div>


    <button
    onclick="startQuiz(${quiz.id})"
    class="w-full py-3 bg-amber-400 text-slate-950 font-black rounded-xl">

        بدء الاختبار

    </button>

`;


container.appendChild(
    card
);

}

/* ==========================================================================
23. START QUIZ
========================================================================== */

function startQuiz(id) {

const quiz =
    appContents.find(

        item =>

            item.id === id &&

            item.section ===
            'quizzes'

    );


if (!quiz) {

    alert(
        'تعذر العثور على الاختبار.'
    );

    return;

}


currentQuiz =
    quiz;


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


questionsContainer.innerHTML =
    '';


form.classList.remove(
    'hidden'
);


result.classList.add(
    'hidden'
);


quiz.questions.forEach(

    (question, questionIndex) => {

        const wrapper =
            document.createElement(
                'div'
            );


        wrapper.className =
            'p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3';


        let optionsHtml = '';


        question.options.forEach(

            (option, optionIndex) => {

                optionsHtml += `

                    <label
                    class="flex items-center gap-2 p-3 bg-slate-800 rounded-xl cursor-pointer hover:border-amber-400 border border-transparent transition">

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


        wrapper.innerHTML = `

            <h4
            class="font-bold text-amber-300">

                ${questionIndex + 1}.
                ${escapeHtml(question.text)}

            </h4>


            <div
            class="space-y-2">

                ${optionsHtml}

            </div>

        `;


        questionsContainer.appendChild(
            wrapper
        );

    }

);


remainingQuizSeconds =
    quiz.time * 60;


updateQuizTimer();


clearInterval(
    quizTimerInterval
);


quizTimerInterval =
    setInterval(

        () => {

            remainingQuizSeconds--;


            updateQuizTimer();


            if (

                remainingQuizSeconds <= 0

            ) {

                clearInterval(
                    quizTimerInterval
                );


                alert(
                    'انتهى وقت الاختبار.'
                );


                submitQuiz();

            }

        },

        1000

    );


modal.classList.remove(
    'hidden'
);


markSectionAsSeen(
    'quizzes'
);

}

/* ==========================================================================
24. QUIZ TIMER
========================================================================== */

function updateQuizTimer() {

const timer =
    document.getElementById(
        'quiz-timer'
    );


if (!timer) return;


const minutes =
    Math.floor(
        Math.max(
            0,
            remainingQuizSeconds
        ) / 60
    );


const seconds =
    Math.max(
        0,
        remainingQuizSeconds
    ) % 60;


timer.textContent =

    String(minutes)
        .padStart(2, '0')

    +

    ':'

    +

    String(seconds)
        .padStart(2, '0');

}

/* ==========================================================================
25. SUBMIT QUIZ
========================================================================== */

function submitQuiz(event) {

if (event) {

    event.preventDefault();

}


if (!currentQuiz) return;


clearInterval(
    quizTimerInterval
);


let score = 0;


currentQuiz.questions.forEach(

    (question, index) => {

        const selected =
            document.querySelector(

                `input[name="question-${index}"]:checked`

            );


        if (

            selected &&

            Number(
                selected.value
            )

            ===

            question.correct

        ) {

            score++;

        }

    }

);


const total =
    currentQuiz.questions.length;


const percentage =
    Math.round(

        (score / total) *
        100

    );


document
    .getElementById(
        'quiz-form'
    )

    .classList.add(
        'hidden'
    );


document
    .getElementById(
        'quiz-result'
    )

    .classList.remove(
        'hidden'
    );


document
    .getElementById(
        'quiz-score'
    )

    .textContent =

        `نتيجتك: ${score} من ${total} (${percentage}%)`;


let message = '';


if (

    percentage >= 90

) {

    message =
        'ممتاز جداً! أداء رائع 👏';

}

else if (

    percentage >= 70

) {

    message =
        'نتيجة جيدة جداً، استمر في التطور.';

}

else if (

    percentage >= 50

) {

    message =
        'نتيجة جيدة، راجع الدرس وحاول مرة أخرى.';

}

else {

    message =
        'تحتاج إلى مراجعة الدرس بشكل أكبر ثم حاول مرة أخرى.';

}


document
    .getElementById(
        'quiz-result-text'
    )

    .textContent =
        message;


triggerVibration();

}

/* ==========================================================================
26. CLOSE QUIZ
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

    modal.classList.add(
        'hidden'
    );

}


currentQuiz = null;

}

/* ==========================================================================
27. STORAGE FUNCTIONS
========================================================================== */

function saveUsers() {

localStorage.setItem(

    'app_users_list',

    JSON.stringify(
        usersList
    )

);

}

function saveContents() {

localStorage.setItem(

    'app_contents',

    JSON.stringify(
        appContents
    )

);

}

/* ==========================================================================
28. SECURITY / HTML ESCAPE
========================================================================== */

function escapeHtml(text) {

if (

    text === undefined ||

    text === null

) {

    return '';

}


return String(text)

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
