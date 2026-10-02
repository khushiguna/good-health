/**
 * Good Health and Well-Being - Main Application Scripts
 * Manages responsive navigation, tip rotator, FAQ accordions, and global UI
 */

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();
  initMobileNavigation();
  initDailyTipRotator();
  initFaqAccordions();
  highlightActiveNavLink();
  initHomeHealthChecklist();
});

/**
 * Global Language Switcher (English / Gujarati)
 * Sets English ('en') as default; allows user to switch anytime.
 */
const NAV_TRANSLATIONS = {
  en: {
    'index.html': 'Home',
    'food.html': 'Healthy Food',
    'exercise.html': 'Exercise',
    'mental-health.html': 'Mental Well-Being',
    'sleep.html': 'Sleep',
    'habits.html': 'Healthy Habits',
    'result.html': 'Daily Result',
    'about.html': 'About Us',
    'login.html': 'Sign In'
  },
  gu: {
    'index.html': 'હોમ',
    'food.html': 'પૌષ્ટિક આહાર',
    'exercise.html': 'કસરત',
    'mental-health.html': 'માનસિક સ્વાસ્થ્ય',
    'sleep.html': 'ઊંઘ',
    'habits.html': 'સ્વસ્થ આદતો',
    'result.html': 'દૈનિક પરિણામ',
    'about.html': 'અમારા વિશે',
    'login.html': 'સાઇન ઇન'
  }
};

function initLanguageSwitcher() {
  const langSelect = document.getElementById('site-lang-select');
  let currentLang = localStorage.getItem('gh_lang') || 'en';

  if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', (e) => {
      currentLang = e.target.value;
      localStorage.setItem('gh_lang', currentLang);
      applyGlobalLanguage(currentLang);
      window.dispatchEvent(new CustomEvent('gh_lang_changed', { detail: { lang: currentLang } }));
    });
  }

  applyGlobalLanguage(currentLang);
}

function applyGlobalLanguage(lang) {
  const navLinks = document.querySelectorAll('.nav-link');
  const translations = NAV_TRANSLATIONS[lang] || NAV_TRANSLATIONS.en;
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && translations[href]) {
      link.textContent = translations[href];
    }
  });

  const langSelect = document.getElementById('site-lang-select');
  if (langSelect && langSelect.value !== lang) {
    langSelect.value = lang;
  }
}

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileNavigation() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
      toggleBtn.innerHTML = isOpen ? '✕' : '☰';
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = '☰';
      });
    });
  }
}

/**
 * Highlight Current Active Navigation Item
 */
function highlightActiveNavLink() {
  const currentPath = window.location.pathname;
  const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === pageName || (pageName === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * PRD 6.7: Daily Health Tips Rotator
 */
const DAILY_TIPS = [
  { text: "Drink at least 8 glasses of water today to keep your cells energized and skin radiant.", category: "Hydration", icon: "💧" },
  { text: "Take a brisk 20-minute walk outdoors. Sunlight boosts Vitamin D and natural serotonin.", category: "Exercise", icon: "🚶" },
  { text: "Eat a rainbow plate: Include at least 2 vibrant fruits and colorful vegetables in your meals.", category: "Nutrition", icon: "🥗" },
  { text: "Take regular micro-breaks: Rest your eyes for 20 seconds every 20 minutes (20-20-20 rule).", category: "Mental Health", icon: "🧘" },
  { text: "Sleep on time tonight. Power down screens 60 minutes before bed for deeper, restorative REM rest.", category: "Sleep", icon: "🌙" },
  { text: "Practice 3 deep mindful belly breaths whenever you feel tension building in your shoulders.", category: "Stress Relief", icon: "✨" },
  { text: "Choose whole fruits over concentrated fruit juices to get the natural fiber benefits.", category: "Healthy Food", icon: "🍎" },
  { text: "Gentle morning stretching awakens muscles, improves posture, and increases blood circulation.", category: "Movement", icon: "🤸" }
];

let currentTipIndex = 0;

function initDailyTipRotator() {
  const tipTextElem = document.getElementById('tip-text-content');
  const tipCategoryElem = document.getElementById('tip-badge-title');
  const tipIconElem = document.getElementById('tip-body-icon');
  const nextTipBtn = document.getElementById('tip-next-btn');

  if (!tipTextElem) return;

  function renderTip(index) {
    const tip = DAILY_TIPS[index];
    tipTextElem.classList.remove('animate-fade-in');
    
    // Slight timeout for animation re-trigger
    setTimeout(() => {
      tipTextElem.textContent = `"${tip.text}"`;
      if (tipCategoryElem) tipCategoryElem.textContent = tip.category;
      if (tipIconElem) tipIconElem.textContent = tip.icon;
      tipTextElem.classList.add('animate-fade-in');
    }, 50);
  }

  // Set initial daily tip based on day of month for consistency
  const dayOfMonth = new Date().getDate();
  currentTipIndex = dayOfMonth % DAILY_TIPS.length;
  renderTip(currentTipIndex);

  if (nextTipBtn) {
    nextTipBtn.addEventListener('click', () => {
      currentTipIndex = (currentTipIndex + 1) % DAILY_TIPS.length;
      renderTip(currentTipIndex);
    });
  }
}

/**
 * FAQ Accordion Toggles
 */
function initFaqAccordions() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close others for clean accordion experience
        faqItems.forEach(other => other.classList.remove('active'));
        
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

/**
 * Global Modal Helpers
 */
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

/**
 * Home Page Quick Health Checklist & Real-Time Score Tracker
 */
function initHomeHealthChecklist() {
  const container = document.getElementById('home-checkboxes-container');
  if (!container) return;

  const scoreNum = document.getElementById('home-health-score');
  const scoreMsg = document.getElementById('home-score-msg');
  const checkboxes = container.querySelectorAll('.home-check-box');
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `gh_home_actions_${todayKey}`;

  let states = JSON.parse(localStorage.getItem(storageKey) || '{}');

  checkboxes.forEach(cb => {
    const id = cb.getAttribute('data-action-id');
    const parent = cb.closest('.quick-action-item');
    if (states[id]) {
      cb.checked = true;
      if (parent) parent.classList.add('checked');
    }

    cb.addEventListener('change', () => {
      states[id] = cb.checked;
      if (parent) parent.classList.toggle('checked', cb.checked);
      localStorage.setItem(storageKey, JSON.stringify(states));
      updateScore();
    });
  });

  function updateScore() {
    const total = checkboxes.length || 6;
    const completed = Object.values(states).filter(Boolean).length;
    const percentage = Math.round((completed / total) * 100);

    if (scoreNum) scoreNum.textContent = `${percentage}%`;
    if (scoreMsg) {
      if (percentage === 0) {
        scoreMsg.textContent = 'Tap or check items as you complete them today to see your health score rise!';
      } else if (percentage <= 35) {
        scoreMsg.textContent = 'Great start! Keep drinking water and taking active movement breaks.';
      } else if (percentage <= 70) {
        scoreMsg.textContent = 'Well done! You are more than halfway to your optimal wellness day.';
      } else if (percentage < 100) {
        scoreMsg.textContent = 'Almost there! Complete your evening wind-down and sleep on time to reach 100%.';
      } else {
        scoreMsg.textContent = '🎉 Perfect Health Score (100%)! Outstanding commitment to your well-being today!';
      }
    }
  }

  updateScore();
}

