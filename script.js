document.addEventListener('DOMContentLoaded', () => {
  const textToType = "Mr. Ashraf Bassiouny: An Expert Teacher in English";
  const typingElement = document.getElementById('typing-text');
  const genderSelection = document.getElementById('gender-selection');
  let charIndex = 0;

  // Start Typing Effect after Pyramid finishes drawing (2.2s)
  setTimeout(() => {
    const typingInterval = setInterval(() => {
      if (charIndex < textToType.length) {
        typingElement.textContent += textToType.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(typingInterval);
        // Show Bubble Buttons after typing finishes
        genderSelection.classList.remove('hidden');
      }
    }, 60);
  }, 2200);
});

function selectGender(gender) {
  const introScreen = document.getElementById('intro-screen');
  const mainApp = document.getElementById('main-app');

  if (gender === 'male') {
    document.body.classList.add('theme-male');
  } else if (gender === 'female') {
    document.body.classList.add('theme-female');
  }

  // Smooth Fade-out of Intro Screen
  introScreen.style.transition = 'opacity 0.8s ease';
  introScreen.style.opacity = '0';

  setTimeout(() => {
    introScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
  }, 800);
}

// Form Submission Handling
document.getElementById('student-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('تم إرسال رسالتك بنجاح إلى مستر أشرف وسيتم الرد عليك قريباً!');
  e.target.reset();
});
