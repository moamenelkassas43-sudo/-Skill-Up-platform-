document.addEventListener('DOMContentLoaded', () => {
    const textToType = "Mr. Ashraf Bassiouny: An Expert Teacher in English";
    const typingElement = document.getElementById('typing-text');
    const genderSelection = document.getElementById('gender-selection');
    let charIndex = 0;

    // Typewriter effect execution after Triple Pyramids draw completion
    setTimeout(() => {
        const typingInterval = setInterval(() => {
            if (charIndex < textToType.length) {
                typingElement.textContent += textToType.charAt(charIndex);
                charIndex++;
            } else {
                clearInterval(typingInterval);
                // Reveal gender choice bubbles
                genderSelection.classList.remove('hidden');
            }
        }, 50);
    }, 2000);
});

function selectGender(gender) {
    const introScreen = document.getElementById('intro-screen');
    const mainApp = document.getElementById('main-app');
    const userBadge = document.getElementById('user-badge');

    if (gender === 'male') {
        document.body.classList.add('theme-male');
        userBadge.textContent = "حساب طالب 👨‍🎓";
        userBadge.classList.add('border-blue-500/40', 'bg-blue-500/10', 'text-blue-400');
    } else if (gender === 'female') {
        document.body.classList.add('theme-female');
        userBadge.textContent = "حساب طالبة 👩‍🎓";
        userBadge.classList.add('border-pink-500/40', 'bg-pink-500/10', 'text-pink-400');
    }

    // Transition between Intro and Main Web Platform
    introScreen.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    introScreen.style.opacity = '0';
    introScreen.style.transform = 'scale(1.05)';

    setTimeout(() => {
        introScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        setTimeout(() => {
            mainApp.classList.remove('opacity-0');
        }, 50);
    }, 700);
}

function checkAnswer(isCorrect) {
    if (isCorrect) {
        alert("إجابة ممتازة وصحيحة! 🎉 (has been learning - زمن المضارع التام المستمر)");
    } else {
        alert("إجابة خاطئة، حاول مرة أخرى! 💡");
    }
}

// Student Form submission handling
document.getElementById('student-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('student-name').value;
    alert(`شكراً لك يا ${name}! تم إرسال رسالتك بنجاح لمستر أشرف وسيتم الرد عليك قريبًا.`);
    e.target.reset();
});
