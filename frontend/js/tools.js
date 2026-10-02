/**
 * Good Health and Well-Being - Interactive Health Tools & Calculators
 * Implements PRD Features: Habit Tracker, Water Calculator, Sleep Cycle, Breathing Guide & Stretch Timer
 */

document.addEventListener('DOMContentLoaded', () => {
  initHabitTracker();
  initWaterCalculator();
  initBreathingExercise();
  initSleepCycleCalculator();
  initStretchTimer();
  initContactForm();
  initTopRatioTracker();
  initPersonalizedHealthAdviser();
  initResultPage();
  initHomePageHub();
  initDailyTipsBox();
  initConditionExerciseModule();
});

/* ==========================================================================
   1. Interactive Daily Habit Tracker (PRD 6.6)
   ========================================================================== */
const DEFAULT_HABITS = [
  { id: 'water', title: 'Drink 8 glasses of fresh water', category: 'Hydration', icon: '💧' },
  { id: 'exercise', title: '30 minutes of physical activity or brisk walking', category: 'Exercise', icon: '🏃' },
  { id: 'food', title: 'Eat 2 servings of fresh fruits & vegetables', category: 'Nutrition', icon: '🥗' },
  { id: 'sleep', title: 'Get 7-8 hours of restful sleep', category: 'Sleep', icon: '🌙' },
  { id: 'hygiene', title: 'Maintain dental and personal hygiene routines', category: 'Hygiene', icon: '✨' },
  { id: 'mind', title: 'Take a 10-minute mental relaxation or breathing break', category: 'Mental', icon: '🧘' }
];

function initHabitTracker() {
  const listContainer = document.getElementById('habit-list-container');
  const progressBar = document.getElementById('habit-progress-bar');
  const percentText = document.getElementById('habit-percent-text');
  const countText = document.getElementById('habit-count-text');
  const resetBtn = document.getElementById('btn-reset-habits');
  const streakText = document.getElementById('habit-streak-count');

  if (!listContainer) return;

  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `gh_habits_${todayKey}`;
  let habitStates = JSON.parse(localStorage.getItem(storageKey) || '{}');

  // Render habit items
  listContainer.innerHTML = '';
  DEFAULT_HABITS.forEach(habit => {
    const isChecked = !!habitStates[habit.id];
    const li = document.createElement('li');
    li.className = `habit-item ${isChecked ? 'completed' : ''}`;
    li.innerHTML = `
      <label class="habit-label" for="habit-${habit.id}">
        <input type="checkbox" id="habit-${habit.id}" class="habit-checkbox" ${isChecked ? 'checked' : ''} data-id="${habit.id}">
        <span class="habit-icon">${habit.icon}</span>
        <span class="habit-title">${habit.title}</span>
      </label>
      <span class="habit-badge">${habit.category}</span>
    `;

    // Click handler
    const checkbox = li.querySelector('.habit-checkbox');
    checkbox.addEventListener('change', (e) => {
      habitStates[habit.id] = e.target.checked;
      li.classList.toggle('completed', e.target.checked);
      localStorage.setItem(storageKey, JSON.stringify(habitStates));
      updateProgress();
    });

    listContainer.appendChild(li);
  });

  function updateProgress() {
    const total = DEFAULT_HABITS.length;
    const completedCount = Object.values(habitStates).filter(Boolean).length;
    const percentage = Math.round((completedCount / total) * 100);

    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (percentText) percentText.textContent = `${percentage}%`;
    if (countText) countText.textContent = `${completedCount} of ${total} completed`;

    // Update streak in localStorage
    updateStreak(completedCount === total);
  }

  function updateStreak(allCompleted) {
    let streak = parseInt(localStorage.getItem('gh_habit_streak') || '0', 10);
    const lastCompletedDate = localStorage.getItem('gh_habit_last_date');
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (allCompleted) {
      if (lastCompletedDate !== todayKey) {
        if (lastCompletedDate === yesterday) {
          streak += 1;
        } else if (!lastCompletedDate) {
          streak = 1;
        }
        localStorage.setItem('gh_habit_streak', streak.toString());
        localStorage.setItem('gh_habit_last_date', todayKey);
      }
    }
    if (streakText) streakText.textContent = streak;
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset today\'s habit progress?')) {
        habitStates = {};
        localStorage.removeItem(storageKey);
        document.querySelectorAll('.habit-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.habit-item').forEach(item => item.classList.remove('completed'));
        updateProgress();
      }
    });
  }

  updateProgress();
}

/* ==========================================================================
   2. Water Intake Calculator (PRD 6.2)
   ========================================================================== */
function initWaterCalculator() {
  const form = document.getElementById('water-calc-form');
  const resultBox = document.getElementById('water-calc-result');
  const litersElem = document.getElementById('water-liters');
  const glassesElem = document.getElementById('water-glasses');
  const adviceElem = document.getElementById('water-advice');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const weight = parseFloat(document.getElementById('water-weight').value);
    const unit = document.getElementById('water-unit').value;
    const activity = document.getElementById('water-activity').value;

    if (isNaN(weight) || weight <= 0) {
      alert('Please enter a valid weight.');
      return;
    }

    // Standard formula: ~35ml per kg of bodyweight + additional for exercise
    let weightInKg = unit === 'lbs' ? weight * 0.453592 : weight;
    let baseLiters = weightInKg * 0.035;

    // Adjust for activity
    if (activity === 'light') baseLiters += 0.35;
    if (activity === 'moderate') baseLiters += 0.65;
    if (activity === 'intense') baseLiters += 1.0;

    // Ensure healthy bounds
    baseLiters = Math.max(1.8, Math.min(baseLiters, 4.5));
    const glasses = Math.round(baseLiters / 0.25); // 250ml glass

    if (litersElem) litersElem.textContent = `${baseLiters.toFixed(1)} Liters`;
    if (glassesElem) glassesElem.textContent = `~${glasses} Glasses (250 ml each)`;
    if (adviceElem) {
      adviceElem.textContent = `Hydration Tip: Drink 1-2 glasses upon waking and space the rest evenly throughout your day. Avoid drinking large quantities immediately before sleep.`;
    }

    if (resultBox) {
      resultBox.classList.add('active');
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

/* ==========================================================================
   3. 4-7-8 Guided Breathing Exercise (PRD 6.4)
   ========================================================================== */
function initBreathingExercise() {
  const circle = document.getElementById('breathing-circle');
  const phaseText = document.getElementById('breathing-phase');
  const timerText = document.getElementById('breathing-timer');
  const startBtn = document.getElementById('btn-breathing-start');
  const cycleCountElem = document.getElementById('breathing-cycles');

  if (!circle || !startBtn) return;

  let isRunning = false;
  let intervalId = null;
  let currentPhase = 'idle'; // 'inhale' (4s), 'hold' (7s), 'exhale' (8s)
  let secondsRemaining = 4;
  let completedCycles = 0;

  function setPhase(phase, duration) {
    currentPhase = phase;
    secondsRemaining = duration;
    
    circle.className = 'breathing-circle';
    if (phase === 'inhale') {
      circle.classList.add('inhale');
      phaseText.textContent = 'Inhale deeply...';
    } else if (phase === 'hold') {
      circle.classList.add('hold');
      phaseText.textContent = 'Hold breath...';
    } else if (phase === 'exhale') {
      circle.classList.add('exhale');
      phaseText.textContent = 'Exhale gently...';
    } else {
      phaseText.textContent = 'Ready';
    }
    timerText.textContent = secondsRemaining;
  }

  function tick() {
    secondsRemaining -= 1;
    timerText.textContent = secondsRemaining;

    if (secondsRemaining <= 0) {
      if (currentPhase === 'inhale') {
        setPhase('hold', 7);
      } else if (currentPhase === 'hold') {
        setPhase('exhale', 8);
      } else if (currentPhase === 'exhale') {
        completedCycles += 1;
        if (cycleCountElem) cycleCountElem.textContent = completedCycles;
        setPhase('inhale', 4);
      }
    }
  }

  startBtn.addEventListener('click', () => {
    if (isRunning) {
      // Pause
      clearInterval(intervalId);
      isRunning = false;
      startBtn.textContent = 'Resume Breathing';
      phaseText.textContent = 'Paused';
    } else {
      // Start
      isRunning = true;
      startBtn.textContent = 'Pause Exercise';
      if (currentPhase === 'idle' || currentPhase === 'paused') {
        setPhase('inhale', 4);
      }
      intervalId = setInterval(tick, 1000);
    }
  });

  const resetBtn = document.getElementById('btn-breathing-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearInterval(intervalId);
      isRunning = false;
      currentPhase = 'idle';
      completedCycles = 0;
      circle.className = 'breathing-circle';
      phaseText.textContent = 'Ready';
      timerText.textContent = '4';
      startBtn.textContent = 'Start 4-7-8 Breathing';
      if (cycleCountElem) cycleCountElem.textContent = '0';
    });
  }
}

/* ==========================================================================
   4. Sleep Cycle Calculator (PRD 6.5)
   ========================================================================== */
function initSleepCycleCalculator() {
  const form = document.getElementById('sleep-calc-form');
  const resultBox = document.getElementById('sleep-calc-result');
  const cycleTimesContainer = document.getElementById('sleep-times-list');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const wakeTime = document.getElementById('sleep-wake-time').value;

    if (!wakeTime) {
      alert('Please select your desired wake-up time.');
      return;
    }

    const [hours, minutes] = wakeTime.split(':').map(Number);
    const wakeDate = new Date();
    wakeDate.setHours(hours, minutes, 0, 0);

    // Each cycle is 90 mins (1.5 hours) + 15 mins to fall asleep
    // Recommend 6 cycles (9 hours), 5 cycles (7.5 hours), 4 cycles (6 hours)
    const cycles = [6, 5, 4];
    let html = '';

    cycles.forEach((cycleCount, idx) => {
      const sleepDurationMinutes = (cycleCount * 90) + 15;
      const bedtime = new Date(wakeDate.getTime() - (sleepDurationMinutes * 60000));
      
      let bedHours = bedtime.getHours();
      const bedMins = bedtime.getMinutes().toString().padStart(2, '0');
      const ampm = bedHours >= 12 ? 'PM' : 'AM';
      bedHours = bedHours % 12 || 12;
      const formattedTime = `${bedHours}:${bedMins} ${ampm}`;

      const totalHours = (cycleCount * 1.5).toFixed(1);
      const isOptimal = idx === 1; // 5 cycles (7.5 hours) is optimal for most adults

      html += `
        <div style="background: white; padding: 1rem 1.25rem; border-radius: var(--radius-md); border: 1.5px solid ${isOptimal ? '#10b981' : 'var(--border)'}; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div>
            <div style="font-size: 1.25rem; font-weight: 800; color: ${isOptimal ? '#0f766e' : '#1e293b'};">${formattedTime}</div>
            <div style="font-size: 0.85rem; color: #64748b;">${cycleCount} sleep cycles (${totalHours} hrs sleep + 15m to drift off)</div>
          </div>
          ${isOptimal ? '<span class="badge-tag badge-green">Recommended</span>' : '<span class="badge-tag badge-blue">Alternative</span>'}
        </div>
      `;
    });

    if (cycleTimesContainer) cycleTimesContainer.innerHTML = html;
    if (resultBox) {
      resultBox.classList.add('active');
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

/* ==========================================================================
   5. Quick Stretch Workout Timer (PRD 6.3)
   ========================================================================== */
function initStretchTimer() {
  const startBtn = document.getElementById('btn-stretch-start');
  const timerElem = document.getElementById('stretch-timer-display');
  const exerciseName = document.getElementById('stretch-exercise-name');
  const instructionElem = document.getElementById('stretch-instruction');

  if (!startBtn || !timerElem) return;

  const STRETCH_STEPS = [
    { name: "Neck Rolls & Side Stretches", duration: 30, tip: "Gently tilt head towards left shoulder, hold 15s, then right shoulder. Breathe smoothly." },
    { name: "Shoulder Shrugs & Rolls", duration: 30, tip: "Roll shoulders upward, backward, and down in slow circular motions to release desk tension." },
    { name: "Seated Spinal Twist", duration: 30, tip: "Sit tall, place right hand on left knee and gently rotate torso. Hold 15s, then switch sides." },
    { name: "Chest & Upper Back Opener", duration: 30, tip: "Clasp hands behind your back, gently squeeze shoulder blades together and open chest." },
    { name: "Standing Forward Fold & Calf Stretch", duration: 30, tip: "Stand up, hinge at hips with soft knees, let arms dangle freely to decompress lower back." }
  ];

  let currentStep = 0;
  let remainingSeconds = 30;
  let stretchInterval = null;
  let isRunning = false;

  function renderStep() {
    const step = STRETCH_STEPS[currentStep];
    if (exerciseName) exerciseName.textContent = step.name;
    if (instructionElem) instructionElem.textContent = step.tip;
    if (timerElem) timerElem.textContent = `${remainingSeconds}s`;
  }

  startBtn.addEventListener('click', () => {
    if (isRunning) {
      clearInterval(stretchInterval);
      isRunning = false;
      startBtn.textContent = 'Resume Routine';
    } else {
      isRunning = true;
      startBtn.textContent = 'Pause Routine';
      renderStep();
      stretchInterval = setInterval(() => {
        remainingSeconds -= 1;
        if (remainingSeconds <= 0) {
          currentStep += 1;
          if (currentStep >= STRETCH_STEPS.length) {
            clearInterval(stretchInterval);
            isRunning = false;
            startBtn.textContent = 'Restart Routine';
            currentStep = 0;
            remainingSeconds = 30;
            if (exerciseName) exerciseName.textContent = "🎉 Stretch Routine Completed!";
            if (instructionElem) instructionElem.textContent = "Great job! Your muscles are refreshed and circulation is energized.";
            if (timerElem) timerElem.textContent = "Done";
            return;
          }
          remainingSeconds = STRETCH_STEPS[currentStep].duration;
        }
        renderStep();
      }, 1000);
    }
  });
}

/* ==========================================================================
   6. Contact & Feedback Form Handler (PRD Section 11)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-feedback-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const topic = document.getElementById('contact-topic').value;
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      alert('Please fill in all required fields.');
      return;
    }

    const payload = { name, email, topic, message, timestamp: new Date().toISOString() };

    // Attempt to submit to Java API backend if running
    let submittedViaApi = false;
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        submittedViaApi = true;
      }
    } catch (err) {
      // Running standalone/offline without Java server; graceful fallback
      submittedViaApi = false;
    }

    // Reset form and open nice confirmation modal
    form.reset();
    const modalFeedback = document.getElementById('contact-success-msg');
    if (modalFeedback) {
      modalFeedback.textContent = submittedViaApi
        ? `Thank you, ${name}! Your feedback has been received and saved by the health platform server.`
        : `Thank you, ${name}! Your wellness message has been received. Let's keep working together for good health!`;
    }
    if (typeof window.openModal === 'function') {
      window.openModal('modal-feedback-success');
    } else {
      alert(`Thank you, ${name}! Your feedback has been received.`);
    }
  });
}

/* ==========================================================================
   7. Condition-Specific Top Circular Ratio Tracker & Daily Result Report Card
   ========================================================================== */
const HEALTH_CONDITIONS = {
  general: {
    icon: "🌿",
    title_en: "General Wellness & Daily Vitality",
    title_gu: "સામાન્ય સુખાકારી અને ઊર્જા",
    desc_en: "Maintain peak natural energy, steady immunity, and balanced health.",
    desc_gu: "શરીરમાં કુદરતી ઊર્જા, મજબૂત રોગપ્રતિકારક શક્તિ અને સંતુલિત સ્વાસ્થ્ય જાળવો.",
    btn_title_en: "No Problem",
    btn_sub_en: "Daily Vitality",
    btn_title_gu: "કોઈ સમસ્યા નથી",
    btn_sub_gu: "સામાન્ય ફિટનેસ",
    eat_en: [
      "Fill half your plate with colorful vegetables and fruits (50/25/25 rule).",
      "Drink 8-10 glasses (2.5 to 3 Liters) of clean, fresh water across the day.",
      "Incorporate whole grains (brown rice, oats, whole wheat) and sprouted legumes.",
      "Prefer balanced, freshly cooked wholesome home meals."
    ],
    eat_gu: [
      "૫૦% રંગબેરંગી શાકભાજી અને તાજા ફળો આહારમાં સામેલ કરો (૫૦/૨૫/૨૫ પ્લેટ).",
      "દિવસમાં ૨.૫ થી ૩ લીટર તાજું શુદ્ધ પાણી યોગ્ય અંતરે પીવો.",
      "આખા અનાજ (ઓટ્સ, બ્રાઉન રાઇસ) અને ફણગાવેલા કઠોળનો આહાર લો.",
      "તાજું, સંતુલિત અને ઘરમાં બનેલું પૌષ્ટિક ભોજન લો."
    ],
    avoid_en: [
      "Avoid deep-fried fast food, heavy oily snacks, and packaged junk.",
      "Avoid sugary sodas, artificial energy drinks, and excessive white sugar.",
      "Avoid digital smartphone and TV screens for 60 minutes before bedtime."
    ],
    avoid_gu: [
      "બહારનું તેલવાળું અને ડીપ-ફ્રાઈડ જંક ફૂડ સંપૂર્ણ ટાળો.",
      "ખાંડવાળા પેકેજ્ડ સોડા અને વધુ પડતી ખાંડવાળા પીણાં બંધ કરો.",
      "રાત્રે સૂવાના ૧ કલાક પહેલા મોબાઈલ કે ટીવી સ્ક્રીન જોવાનું ટાળો."
    ],
    condition_exercises: [
        {
            "id": "gen_walk",
            "icon": "🚶‍♂️",
            "name_en": "Morning Brisk Walk",
            "name_gu": "સવારની ઝડપી ચાલ (Brisk Walk)",
            "duration_en": "30 Minutes",
            "duration_gu": "૩૦ મિનિટ",
            "duration_mins": 30,
            "when_en": "Early Morning (Empty Stomach or after water)",
            "when_gu": "સવારે વહેલા (ખાલી પેટે અથવા ૧ ગ્લાસ પાણી પછી)",
            "how_en": "Walk at a steady, purposeful pace with straight spine, shoulders relaxed, swinging arms naturally.",
            "how_gu": "કમર સીધી રાખીને, ખભા ઢીલા રાખીને અને હાથ કુદરતી રીતે હલાવતા સતત ઝડપી ગતિએ ચાલો.",
            "benefit_en": "Strengthens heart and lungs, kickstarts metabolism, and elevates natural energy for the entire day.",
            "benefit_gu": "હૃદય અને ફેફસાં મજબૂત બને છે, મેટાબોલિઝમ ઝડપી બને છે અને આખો દિવસ ઊર્જા રહે છે.",
            "avoid_en": "Avoid slouching or checking mobile phone continuously while walking.",
            "avoid_gu": "ચાલતી વખતે મોબાઈલમાં ન જોવું અને કમર વાંકી રાખીને ન ચાલવું."
        },
        {
            "id": "gen_stretch",
            "icon": "🤸",
            "name_en": "Bodyweight Squats & Full Body Stretch",
            "name_gu": "સ્ક્વોટ્સ અને આખા શરીરનું સ્ટ્રેચિંગ",
            "duration_en": "15 Minutes",
            "duration_gu": "૧૫ મિનિટ",
            "duration_mins": 15,
            "when_en": "Morning or Evening before dinner",
            "when_gu": "સવારે અથવા સાંજે જમતા પહેલાં",
            "how_en": "Perform 3 sets of 10-12 gentle bodyweight squats, followed by arm, shoulder, and hamstring stretches.",
            "how_gu": "૧૦-૧૨ સ્ક્વોટ્સના ૩ સેટ કરો અને ત્યારબાદ હાથ, ખભા, કમર અને પગના સ્નાયુઓનું હળવું સ્ટ્રેચિંગ કરો.",
            "benefit_en": "Preserves lean muscle mass, strengthens knee and leg bones, and prevents stiffness.",
            "benefit_gu": "હાડકાં અને સ્નાયુઓ મજબૂત રહે છે, સાંધામાં લચીલાપણું આવે છે અને સુસ્તી દૂર થાય છે.",
            "avoid_en": "Avoid jerking joints or holding breath during squats.",
            "avoid_gu": "ઝટકા સાથે કસરત ન કરવી અને કસરત દરમિયાન શ્વાસ સામાન્ય ચાલુ રાખવો."
        },
        {
            "id": "gen_breath",
            "icon": "🫁",
            "name_en": "Deep Breathing & Pranayama",
            "name_gu": "ઊંડા શ્વાસોચ્છવાસ (પ્રાણાયામ)",
            "duration_en": "10 Minutes",
            "duration_gu": "૧૦ મિનિટ",
            "duration_mins": 10,
            "when_en": "Early Morning in fresh air",
            "when_gu": "સવારે ખુલ્લી તાજી હવામાં",
            "how_en": "Sit straight in Sukhasana. Inhale deeply through nose for 4 seconds, hold 2s, exhale slowly through nose for 6s.",
            "how_gu": "શાંતિથી કમર સીધી રાખીને બેસો. નાકથી ૪ સેકન્ડ ઊંડો શ્વાસ લો, ૨ સેકન્ડ રોકો અને ૬ સેકન્ડમાં ધીમેથી બહાર કાઢો.",
            "benefit_en": "Oxygenates all body cells, cleanses toxins, and boosts natural immunity.",
            "benefit_gu": "શરીરના દરેક કોષ સુધી ભરપૂર ઓક્સિજન પહોંચાડે છે અને રોગપ્રતિકારક શક્તિ વધારે છે.",
            "avoid_en": "Do not practice immediately after eating heavy meals.",
            "avoid_gu": "ભારે ખોરાક ખાધા પછી તરત પ્રાણાયામ ન કરવો."
        }
    ],
    exercise_en: [
        "⏱️ 30 Mins (Morning): Brisk walk to kickstart metabolism, heart health, and daily energy.",
        "⏱️ 15 Mins (Evening): 3 sets of bodyweight squats and gentle full-body stretches.",
        "⏱️ 10 Mins (Morning): Deep diaphragmatic breathing & Pranayama in fresh outdoor air."
    ],
    exercise_gu: [
        "⏱️ ૩૦ મિનિટ (સવારે): ઝડપી ચાલવું જેથી હૃદય મજબૂત બને અને દિવસભર કુદરતી સ્ફૂર્તિ રહે.",
        "⏱️ ૧૫ મિનિટ (સાંજે): બોડીવેઇટ સ્ક્વોટ્સ અને આખા શરીરનું સ્ટ્રેચિંગ કરો જેથી સ્નાયુઓ મજબૂત રહે.",
        "⏱️ ૧૦ મિનિટ (સવારે): ખુલ્લી હવામાં ઊંડા શ્વાસોચ્છવાસ (પ્રાણાયામ) કરો."
    ],
    sleep_en: [
      "7 to 8 hours of uninterrupted, restful sleep every night.",
      "Maintain a consistent sleep and wake-up time, even on weekends."
    ],
    sleep_gu: [
      "રોજ ૭ થી ૮ કલાકની ગાઢ અને શાંત ઊંઘ લો.",
      "દરરોજ રાત્રે એક જ સમયે સૂવાની અને સવારે ઉઠવાની ટેવ રાખો."
    ],
    ratioTasks: [
      { id: 'water', icon: '💧', type: 'do', name_en: '8 Glasses Water (2.5L+)', name_gu: '૮ ગ્લાસ તાજું પાણી (૨.૫L+)', tip_en: 'Essential for cellular hydration & metabolic function.', tip_gu: 'શરીરના કોષોને હાઇડ્રેટ રાખવા અને પાચન સુધારવા જરૂરી છે.' },
      { id: 'walk', icon: '🏃‍♂️', type: 'do', name_en: '30m Active Exercise or Walk', name_gu: '૩૦ મિનિટ ચાલવું અથવા કસરત', tip_en: 'Strengthens cardiovascular endurance & elevates mood.', tip_gu: 'હૃદયની કાર્યક્ષમતા વધારે છે અને મૂડ સુધારે છે.' },
      { id: 'diet', icon: '🥗', type: 'do', name_en: 'Fresh Fruits & Colorful Veggies', name_gu: 'તાજા ફળો અને લીલા શાકભાજી', tip_en: 'Provides dietary fiber, vitamins A, C, and antioxidants.', tip_gu: 'કુદરતી ફાઈબર, વિટામિન્સ અને એન્ટિઓક્સિડન્ટ્સ આપે છે.' },
      { id: 'avoid_junk', icon: '🛑', type: 'avoid', name_en: 'Avoid Deep-Fried & Junk Snacks', name_gu: 'તળેલું અને જંક ફૂડ ટાળો', tip_en: 'Prevents systemic inflammation & sluggish digestion.', tip_gu: 'શરીરમાં સોજો અને સુસ્તી આવતા અટકાવે છે.' },
      { id: 'avoid_soda', icon: '🛑', type: 'avoid', name_en: 'Avoid Sugary Sodas & Drinks', name_gu: 'ખાંડવાળા સોડા અને પીણાં ટાળો', tip_en: 'Eliminates empty calories and blood sugar spikes.', tip_gu: 'સુગર સ્પાઇક અને વજન વધતું રોકે છે.' },
      { id: 'avoid_screen', icon: '🛑', type: 'avoid', name_en: 'Avoid Screens 60m Before Bed', name_gu: 'સૂવાના ૧ કલાક પહેલા સ્ક્રીન બંધ', tip_en: 'Protects natural melatonin release for restorative sleep.', tip_gu: 'મેલાટોનિન હોર્મોન વધારીને ગાઢ ઊંઘ લાવવામાં મદદ કરે છે.' }
    ],
    diet: [
      "Follow the 50/25/25 plate: 50% colorful vegetables & fruits, 25% whole grains, 25% clean protein.",
      "Drink 8-10 glasses (2.5 Liters) of clean water evenly spaced across your day.",
      "Limit ultra-processed snacks, excess refined white sugar, and deep-fried items."
    ],
    exercise: [
      "30 minutes of brisk walking or moderate physical activity 5 days a week.",
      "Daily 10-minute morning routine: Neck rolls, spinal twists, and 15 bodyweight squats.",
      "Target 7,000 to 10,000 active steps every day."
    ],
    sleep: [
      "7 to 8 hours of restful sleep every night.",
      "Fixed sleep schedule: Sleep and wake up at the same hour every day.",
      "Screen Curfew: Turn off phones and bright screens 45-60 minutes before bed."
    ],
    routine: [
      "Start your morning with 1-2 glasses of water and 10 minutes of outdoor sunlight.",
      "Follow the 20-20-20 rule during screen work to protect vision and reduce fatigue.",
      "Practice 3 deep mindful breaths whenever work or study pressure mounts."
    ]
  },
  digestion: {
    icon: "🫄",
    title_en: "Acidity, Gas & Bloating Support",
    title_gu: "એસિડિટી, ગેસ અને પાચનની સમસ્યા",
    desc_en: "Soothe gut inflammation, stimulate natural enzymes, and prevent acid reflux.",
    desc_gu: "પેટની બળતરા શાંત કરો, પાચન ઉત્સેચકો સક્રિય કરો અને એસિડ રિફ્લક્સ અટકાવો.",
    btn_title_en: "Acidity & Gas",
    btn_sub_en: "Digestive Care",
    btn_title_gu: "એસિડિટી & ગેસ",
    btn_sub_gu: "પાચન સુધાર",
    eat_en: [
      "Sip lukewarm fennel (saunf) and cumin (jeera) infused water 20 minutes post meals.",
      "Eat cooling gut-soothing foods: Papaya, fresh cucumber, pomegranate, and plain fresh buttermilk.",
      "Chew every single bite 25-30 times to let salivary enzymes break down food thoroughly.",
      "Opt for light, easily digestible meals: Moong dal khichdi, bottle gourd, and ridge gourd."
    ],
    eat_gu: [
      "જમ્યા પછી ૨૦ મિનિટે હુંફાળું વરિયાળી અને જીરાનું પાણી પીવો.",
      "ઠંડક આપતો ખોરાક: પપૈયું, કાકડી, દાડમ અને તાજી મોળી છાસ લો.",
      "ખોરાકનો દરેક કોળિયો ૨૫-૩૦ વાર ચાવીને ખાઓ જેથી પાચન સરળ બને.",
      "હળવો, સુપાચ્ય ખોરાક લો: મગની દાળની ખીચડી, દૂધી, ગલકા વગેરે."
    ],
    avoid_en: [
      "Strictly eliminate excessively spicy gravies, deep-fried snacks, and chili oil.",
      "Never lie down flat within 2 hours of eating—gravity prevents gastric reflux.",
      "Avoid chilled ice water, sodas, and carbonated beverages during meals."
    ],
    avoid_gu: [
      "વધુ પડતું તીખું, મસાલેદાર અને તેલવાળું ભોજન સંપૂર્ણ ટાળો.",
      "જમ્યા પછી તરત જ સૂઈ જવું નહીં - ઓછામાં ઓછા ૨ કલાક જાગતા રહો.",
      "જમતી વખતે બરફવાળું ઠંડું પાણી કે સોડા બિલકુલ ન પીવો."
    ],
    condition_exercises: [
        {
            "id": "dig_vajrasana",
            "icon": "🧘",
            "name_en": "Vajrasana (Thunderbolt Pose)",
            "name_gu": "વજ્રાસન (પાચન માટે શ્રેષ્ઠ આસન)",
            "duration_en": "10 Minutes",
            "duration_gu": "૧૦ મિનિટ",
            "duration_mins": 10,
            "when_en": "Immediately after Lunch & Dinner",
            "when_gu": "બપોરે અને રાત્રે જમ્યા પછી તરત જ",
            "how_en": "Fold both legs backward, sit upright on your heels with big toes touching, keep spine straight and hands on knees.",
            "how_gu": "બંને પગ વાળીને એડીઓ પર બેસો, કમર અને ગરદન એકદમ સીધા રાખો અને હાથ ઘૂંટણ પર રાખી ધીમો શ્વાસ લો.",
            "benefit_en": "Redirects blood circulation straight to the stomach, eliminates acidity, gas, and heaviness within 10 minutes.",
            "benefit_gu": "જઠર અને પાચન અંગો તરફ લોહીનો પ્રવાહ વધારે છે; એસિડિટી, ખાટા ઓડકાર અને પેટનું ફૂલવું તરત શાંત કરે છે.",
            "avoid_en": "Avoid if you have acute, severe knee ligament pain.",
            "avoid_gu": "ઘૂંટણમાં વધુ પડતો દુખાવો હોય તો વધુ દબાણ ન આપવું."
        },
        {
            "id": "dig_shatapadi",
            "icon": "🚶",
            "name_en": "Shatapadi (Post-Meal 100 Steps Stroll)",
            "name_gu": "શતપદી (જમ્યા પછી ૧૦૦ ડગલાં હળવું ચાલવું)",
            "duration_en": "15 Minutes",
            "duration_gu": "૧૫ મિનિટ",
            "duration_mins": 15,
            "when_en": "15 to 20 minutes after meals",
            "when_gu": "જમ્યાના ૧૫ થી ૨૦ મિનિટ પછી",
            "how_en": "Walk at an easy, very relaxed stroll. Do not walk fast, do not jog, keep breathing naturally.",
            "how_gu": "એકદમ હળવી અને શાંત ગતિએ ચાલો. ઝડપથી દોડવું કે કૂદવું નહીં; માત્ર સામાન્ય ચાલવું.",
            "benefit_en": "Accelerates stomach gastric transit by 40% and prevents stomach acid from splashing upward.",
            "benefit_gu": "ખોરાકના પાચનની ગતિ ૪૦% ઝડપી બનાવે છે અને એસિડને ગળામાં ઉપર ચડતો અટકાવે છે.",
            "avoid_en": "Never lie down flat or bend forward immediately after eating.",
            "avoid_gu": "જમ્યા પછી ક્યારેય તરત પલંગ પર સૂઈ જવું નહીં કે આગળ નમવું નહીં."
        },
        {
            "id": "dig_catcow",
            "icon": "🐈",
            "name_en": "Cat-Cow & Pawanmuktasana",
            "name_gu": "પવનમુક્તાસન અને કેટ-કાઉ આસન",
            "duration_en": "10 Minutes",
            "duration_gu": "૧૦ મિનિટ",
            "duration_mins": 10,
            "when_en": "Morning on an Empty Stomach",
            "when_gu": "સવારે શૌચ પછી ખાલી પેટે",
            "how_en": "On a yoga mat, gently pull knees toward chest while exhaling, and arch/round spine in cat-cow posture.",
            "how_gu": "યોગ મેટ પર સૂઈને શ્વાસ બહાર કાઢતાં ઘૂંટણને છાતી તરફ લાવો, અને ચોપગા બનીને કમરને હળવેથી ઉપર-નીચે વળો.",
            "benefit_en": "Gently massages the abdominal organs and releases trapped intestinal gas naturally.",
            "benefit_gu": "આંતરડામાં ફસાયેલો ગેસ કુદરતી રીતે બહાર કાઢે છે અને કબજિયાતમાં રાહત આપે છે.",
            "avoid_en": "Never perform abdominal compressions or twists right after eating.",
            "avoid_gu": "જમ્યા પછી ક્યારેય પેટ દબાય તેવી કસરત ન કરવી."
        }
    ],
    exercise_en: [
        "⏱️ 10 Mins (Immediately After Meals): Vajrasana on heels to direct blood flow and eliminate gas/acidity.",
        "⏱️ 15 Mins (15-20m After Meals): Gentle 100-step stroll (Shatapadi) to accelerate digestion.",
        "⏱️ 10 Mins (Morning Empty Stomach): Cat-Cow and gentle Pawanmuktasana to release trapped bloating."
    ],
    exercise_gu: [
        "⏱️ ૧૦ મિનિટ (જમ્યા પછી તરત): વજ્રાસનમાં બેસો જેથી પાચન અંગો તરફ લોહીનો પ્રવાહ વધે અને એસિડિટી શાંત થાય.",
        "⏱️ ૧૫ મિનિટ (જમ્યાના ૧૫ મિનિટ પછી): હળવી ગતિએ શતપદી વોક કરો જેથી ગેસ અને ભારેપણું ન થાય.",
        "⏱️ ૧૦ મિનિટ (સવારે ખાલી પેટે): પવનમુક્તાસન અને કેટ-કાઉ આસન કરો જેથી પેટ સાફ આવે."
    ],
    sleep_en: [
      "7 to 8 hours of sleep with head elevated 4-6 inches to block nighttime reflux.",
      "Sleep on your left side: Keeps stomach acids securely below the esophageal junction."
    ],
    sleep_gu: [
      "૭ થી ૮ કલાકની ઊંઘ લો; ઓશીકું થોડું ઊંચું રાખો જેથી એસિડ ગળામાં ન ચડે.",
      "ડાબી બાજુ પડખું ફરીને સૂવો જેથી એસિડિટીમાં કુદરતી રાહત મળે."
    ],
    ratioTasks: [
      { id: 'fennel_water', icon: '💧', type: 'do', name_en: 'Fennel/Cumin Water Post-Meal', name_gu: 'વરિયાળી/જીરાનું હુંફાળું પાણી', tip_en: 'Cools gastric heat and relaxes intestinal smooth muscle.', tip_gu: 'પેટની ગરમી શાંત કરે છે અને ગેસ અટકાવે છે.' },
      { id: 'vajrasana', icon: '🧘', type: 'do', name_en: '5-10m Vajrasana After Meals', name_gu: 'જમ્યા પછી ૫-૧૦m વજ્રાસન', tip_en: 'Directs blood flow straight to digestive viscera.', tip_gu: 'પાચનતંત્ર તરફ લોહીનો પ્રવાહ વધારી પાચન સુધારે છે.' },
      { id: 'chew_slow', icon: '🚶', type: 'do', name_en: 'Chew Food 25x & Gentle Walk', name_gu: 'ખોરાક ૨૫ વાર ચાવવો & ૧૫m વોક', tip_en: 'Amylase enzymes in saliva pre-digest complex carbohydrates.', tip_gu: 'લાળ રસ ખોરાકને પચાવવામાં મદદ કરે છે.' },
      { id: 'avoid_fried', icon: '🛑', type: 'avoid', name_en: 'Avoid Fried & Spicy Foods', name_gu: 'તીખું અને તળેલું ભોજન ટાળો', tip_en: 'Spicy lipids relax lower esophageal sphincter triggering reflux.', tip_gu: 'મસાલેદાર તેલથી એસિડ અન્નનળીમાં ઉપર ચડે છે.' },
      { id: 'avoid_lie_down', icon: '🛑', type: 'avoid', name_en: 'Avoid Lying Down Flat Within 2h', name_gu: 'જમ્યા પછી ૨ કલાક સૂવું નહીં', tip_en: 'Gravity keeps stomach juices from leaking up the esophagus.', tip_gu: 'ગુરુત્વાકર્ષણ એસિડને પેટમાં જ રાખવામાં મદદ કરે છે.' },
      { id: 'avoid_cold_drinks', icon: '🛑', type: 'avoid', name_en: 'Avoid Chilled Sodas & Ice Water', name_gu: 'બરફવાળું ઠંડું પાણી/સોડા ટાળો', tip_en: 'Cold fluids quench digestive fire (Agni) and slow breakdown.', tip_gu: 'ઠંડું પાણી પાચક રસોને મંદ પાડી દે છે.' }
    ],
    diet: [
      "Cooling & soothing foods: Papaya, soaked raisins, plain fresh yogurt/buttermilk, cucumber.",
      "Sip lukewarm fennel (saunf) and cumin (jeera) infused water 20 mins after meals.",
      "Strictly avoid: Deep-fried snacks, excessive green chillies, raw garlic, and carbonated sodas.",
      "Chew every single mouthful 25-30 times to aid enzyme breakdown in saliva."
    ],
    exercise: [
      "Vajrasana (Thunderbolt Pose) for 5-10 minutes immediately after lunch and dinner.",
      "10-15 minute gentle stroll post meals (never lie flat immediately after eating).",
      "Gentle morning Cat-Cow yoga poses to mobilize the abdominal area."
    ],
    sleep: [
      "7 to 8 hours of sleep with head slightly elevated (4-6 inches) to prevent nighttime acid reflux.",
      "Sleep on your left side: Keeps stomach acids below the esophageal junction.",
      "Maintain a strict 3-hour gap between dinner and sleeping."
    ],
    routine: [
      "Eat smaller, well-spaced meals rather than large heavy feasts.",
      "Avoid drinking large quantities of chilled ice water immediately before or during meals.",
      "Take 3 slow relaxing breaths before taking your first bite of food."
    ]
  },
  weight: {
    icon: "⚖️",
    title_en: "Weight Management & Fat Loss",
    title_gu: "વજન નિયંત્રણ અને ફેટ લોસ",
    desc_en: "Sustainable, non-crash fat reduction through nutrient timing and metabolic pacing.",
    desc_gu: "મેટાબોલિઝમ સુધારીને કુદરતી અને કાયમી રીતે વજન નિયંત્રિત કરો.",
    btn_title_en: "Weight Loss",
    btn_sub_en: "Fat Control",
    btn_title_gu: "વજન ઘટાડો",
    btn_sub_gu: "ચરબી કંટ્રોલ",
    eat_en: [
      "Eat half a plate of raw vegetable salad (cucumber, carrots, leafy greens) before cooked meals.",
      "Ensure high-quality protein in every meal: Sprouts, chickpeas, paneer, tofu, or lentils.",
      "Drink 1 full glass of lukewarm water exactly 20 minutes before meals to moderate appetite.",
      "Replace milky sugary teas with green tea, cinnamon water, or lemon-cumin water."
    ],
    eat_gu: [
      "જમતા પહેલા અડધી પ્લેટ કાચું કચુંબર અને સલાડ ખાવાની આદત રાખો.",
      "પ્રોટીનયુક્ત ખોરાક સામેલ કરો: ફણગાવેલા મગ, ચણા, પનીર અને દાળ.",
      "જમવાના ૨૦ મિનિટ પહેલા ૧ ગ્લાસ હુંફાળું પાણી પીવો જેથી વધુ પડતું ખવાઈ ન જાય.",
      "ખાંડવાળી ચાને બદલે ગ્રીન ટી કે લીંબુ-જીરાનું હુંફાળું પાણી લો."
    ],
    avoid_en: [
      "Zero refined white sugar, sweets, cakes, and sweetened sodas/fruit juices.",
      "Avoid late-night dining: Conclude all food intake by 8:00 PM (12-hour gentle fast).",
      "Avoid sitting uninterrupted for over 45 minutes—stand up to reactivate fat-burning enzymes."
    ],
    avoid_gu: [
      "ખાંડવાળી મીઠાઈઓ, બેકરી વસ્તુઓ અને પેકેજ્ડ સોડા સંપૂર્ણ બંધ કરો.",
      "રાત્રે ૮ વાગ્યા પછી ભારી ભોજન કે નાસ્તો ન કરવો (૧૨ કલાકનું હળવું ઉપવાસ).",
      "સતત ૪૫ મિનિટથી વધુ એક જગ્યાએ બેસી ન રહો; વચ્ચે ઊભા થાઓ."
    ],
    condition_exercises: [
        {
            "id": "wt_brisk",
            "icon": "🏃",
            "name_en": "Fast-Paced Morning Walk",
            "name_gu": "ઝડપી ચાલવું (Fast Brisk Walk)",
            "duration_en": "30 Minutes",
            "duration_gu": "૩૦ મિનિટ",
            "duration_mins": 30,
            "when_en": "Early Morning (6:00 AM to 7:30 AM)",
            "when_gu": "સવારે વહેલા (૬:૦૦ થી ૭:૩૦ વાગ્યા વચ્ચે)",
            "how_en": "Walk at a pace where you breathe harder but can still speak short sentences. Swing arms actively.",
            "how_gu": "ઝડપથી હાથ હલાવતા એવી ગતિએ ચાલો જેથી પરસેવો વળે અને શ્વાસ થોડો ઝડપી થાય.",
            "benefit_en": "Burns stubborn belly fat and keeps calorie burn elevated for hours afterward.",
            "benefit_gu": "પેટ અને કમરની ચરબી બર્ન કરે છે અને આખો દિવસ કેલરી ઝડપથી વપરાય છે.",
            "avoid_en": "Avoid stopping frequently or walking too casually.",
            "avoid_gu": "વચ્ચે વારેઘડીએ ઊભા ન રહેવું; ૩૦ મિનિટ સતત ચાલવાનો પ્રયત્ન કરવો."
        },
        {
            "id": "wt_surya",
            "icon": "☀️",
            "name_en": "Surya Namaskar (Sun Salutations - 6 to 10 rounds)",
            "name_gu": "સૂર્ય નમસ્કાર (૬ થી ૧૦ આવર્તન)",
            "duration_en": "15 Minutes",
            "duration_gu": "૧૫ મિનિટ",
            "duration_mins": 15,
            "when_en": "Morning on an Empty Stomach",
            "when_gu": "સવારે ખાલી પેટે",
            "how_en": "Flow through the 12 classic postures smoothly with rhythmic breathing. Start with 4 rounds and increase.",
            "how_gu": "૧૨ મુદ્રાઓ ધીમે ધીમે શ્વાસ સાથે કરો. શરૂઆતમાં ૪ થી ૬ રાઉન્ડ કરો, પછી ધીમે ધીમે વધારો.",
            "benefit_en": "Full body workout that tones abdomen, arms, and thighs while firing up metabolic rate.",
            "benefit_gu": "આખા શરીરની કસરત થાય છે, પેટના સ્નાયુઓ મજબૂત બને છે અને ચરબી ઝડપથી ઓગળે છે.",
            "avoid_en": "Do not rush or hold breath in any posture.",
            "avoid_gu": "ઉતાવળમાં ઝટકા ન મારવા; દરેક મુદ્રામાં ૧-૨ સેકન્ડ સ્થિર રહેવું."
        },
        {
            "id": "wt_squat_plank",
            "icon": "💪",
            "name_en": "Chair Squats & Core Planks",
            "name_gu": "ખુરશી સ્ક્વોટ્સ અને કોર પ્લાન્ક",
            "duration_en": "15 Minutes",
            "duration_gu": "૧૫ મિનિટ",
            "duration_mins": 15,
            "when_en": "Evening (5:00 PM to 6:30 PM)",
            "when_gu": "સાંજે (૫:૦૦ થી ૬:૩૦ વાગ્યા વચ્ચે)",
            "how_en": "Perform 15 chair squats x 3 sets, then hold forearm plank for 30-45 seconds x 3 sets.",
            "how_gu": "ખુરશી પર બેસવાની મુદ્રામાં ૧૫ સ્ક્વોટ્સના ૩ સેટ કરો અને ત્યારબાદ ૩૦-૪૫ સેકન્ડ પ્લાન્ક હોલ્ડ કરો.",
            "benefit_en": "Builds functional lean muscle which increases calorie burning even while sleeping.",
            "benefit_gu": "સ્નાયુઓ મજબૂત બને છે જેથી શરીર આરામ કરતું હોય ત્યારે પણ કેલરી બર્ન થતી રહે છે.",
            "avoid_en": "Avoid arching or sinking lower back during planks.",
            "avoid_gu": "પ્લાન્ક કરતી વખતે કમર નીચે ઝૂકી ન જાય તેનું ધ્યાન રાખવું."
        }
    ],
    exercise_en: [
        "⏱️ 30 Mins (Morning 6:00-7:30 AM): Continuous brisk walking to maximize fat burning.",
        "⏱️ 15 Mins (Morning Empty Stomach): 6 to 10 rounds of steady Surya Namaskar.",
        "⏱️ 15 Mins (Evening): Chair squats (3 sets x 15) and core plank holds (3 x 30-45s)."
    ],
    exercise_gu: [
        "⏱️ ૩૦ મિનિટ (સવારે ૬:૦૦-૭:૩૦): ઝડપી ચાલવું જેથી પેટ અને કમરની ચરબી ઝડપથી બર્ન થાય.",
        "⏱️ ૧૫ મિનિટ (સવારે ખાલી પેટે): સૂર્ય નમસ્કારના ૬ થી ૧૦ રાઉન્ડ ધીમે ધીમે શ્વાસ સાથે કરો.",
        "⏱️ ૧૫ મિનિટ (સાંજે): ખુરશી સ્ક્વોટ્સ (૧૫ x ૩ સેટ) અને ૩૦-૪૫ સેકન્ડ પ્લાન્ક કરો."
    ],
    sleep_en: [
      "7 to 8 hours of deep restful sleep. Sleep deprivation elevates hunger hormone ghrelin by 30%.",
      "Sleep in a cool, ventilated room to encourage overnight metabolic restoration."
    ],
    sleep_gu: [
      "૭ થી ૮ કલાક પૂરતી ઊંઘ લો (ઓછી ઊંઘથી ભૂખ વધારનાર હોર્મોન ગ્રેલિન વધે છે).",
      "ઠંડા અને હવાઉજાસવાળા ઓરડામાં ઊંઘો જેથી મેટાબોલિક રિકવરી સરસ થાય."
    ],
    ratioTasks: [
      { id: 'brisk_walk', icon: '🏃', type: 'do', name_en: '40m Brisk Walk & Squats', name_gu: '૪૦m ઝડપી ચાલવું & સ્ક્વોટ્સ', tip_en: 'Accelerates daily caloric expenditure and boosts resting metabolism.', tip_gu: 'કેલરી બર્ન વધારે છે અને મેટાબોલિક રેટ સુધારે છે.' },
      { id: 'water_pre_meal', icon: '💧', type: 'do', name_en: '1 Glass Water 20m Before Meals', name_gu: 'જમવાના ૨૦m પહેલા ૧ ગ્લાસ પાણી', tip_en: 'Primes gastric volume preventing unintended overeating.', tip_gu: 'પેટને કુદરતી રીતે ભરે છે જેથી વધુ પડતું ખવાતું નથી.' },
      { id: 'fiber_plate', icon: '🥗', type: 'do', name_en: 'Half-Plate High-Fiber Veggies', name_gu: 'અડધી પ્લેટ કાચું સલાડ/કચુંબર', tip_en: 'Soluble and insoluble fiber slow glucose uptake and sustain satiety.', tip_gu: 'બ્લડ સુગર ધીમેથી વધારે છે અને લાંબો સમય ભૂખ લાગતી નથી.' },
      { id: 'avoid_sugar', icon: '🛑', type: 'avoid', name_en: 'Avoid Sugary Drinks & Sweets', name_gu: 'ખાંડ, મીઠાઈ અને સોડા ટાળો', tip_en: 'Liquid sucrose causes rapid insulin surges driving abdominal fat storage.', tip_gu: 'ઇન્સ્યુલિન સ્પાઇક લાવીને પેટની ચરબી વધારે છે.' },
      { id: 'avoid_late_eat', icon: '🛑', type: 'avoid', name_en: 'Avoid Late Night Snacks (By 8 PM)', name_gu: 'રાત્રે ૮ વાગ્યા પછી ખાવું નહીં', tip_en: 'Allows overnight 12-hour metabolic resting window for cellular autophagy.', tip_gu: '૧૨ કલાકના ઉપવાસથી શરીર ચરબી બાળવા તરફ વળે છે.' },
      { id: 'avoid_sedentary', icon: '🛑', type: 'avoid', name_en: 'Avoid Sedentary Sitting > 45m', name_gu: 'સળંગ ૪૫m થી વધુ બેસવું નહીં', tip_en: 'Prolonged sitting suppresses lipoprotein lipase enzyme needed for lipid clearance.', tip_gu: 'ચરબી ઓગાળતા એન્ઝાઇમ્સને સક્રિય રાખવા ઊભા થવું જરૂરી છે.' }
    ],
    diet: [
      "Eat high-fiber vegetables (cabbage, cucumber, carrots, spinach) to stay naturally full.",
      "Include lean protein (lentils, chickpeas, paneer/tofu, eggs) with every meal.",
      "Drink 1 glass of water 20 minutes before meals; stop drinking calories (no soda or sweetened juices).",
      "Avoid late-night dining: Finish your dinner at least 2.5 to 3 hours before sleeping."
    ],
    exercise: [
      "40-45 minutes of daily physical movement: 30-min brisk walk + 10 mins bodyweight squats & wall push-ups.",
      "Incorporate daily step target: Build towards 8,000 - 10,000 daily steps.",
      "Choose stairs over elevators and take walking phone calls."
    ],
    sleep: [
      "7 to 8 hours of uninterrupted sleep. Lack of sleep spikes ghrelin (hunger hormone) by up to 30%.",
      "Sleep in a slightly cooler bedroom to support overnight metabolic restoration."
    ],
    routine: [
      "Stand up and stretch for 3 minutes after every 45 minutes of seated desk work.",
      "Track your daily meals and hydration using our platform tools.",
      "Eliminate post-dinner snacking: Brush teeth immediately after dinner."
    ]
  },
  stress: {
    icon: "🧠",
    title_en: "Stress, Anxiety & Mental Fatigue Support",
    title_gu: "તણાવ, ચિંતા અને માનસિક શાંતિ",
    desc_en: "Calm an overstimulated nervous system, lower cortisol, and restore peace.",
    desc_gu: "ઓવરએક્ટિવ નર્વસ સિસ્ટમને શાંત કરો, કોર્ટિસોલ ઘટાડો અને મનની શાંતિ મેળવો.",
    btn_title_en: "Stress Care",
    btn_sub_en: "Mental Peace",
    btn_title_gu: "તણાવ & ચિંતા",
    btn_sub_gu: "માનસિક શાંતિ",
    eat_en: [
      "Prioritize magnesium & omega-3 foods: Walnuts, pumpkin seeds, soaked almonds, and bananas.",
      "Sip warm chamomile, peppermint, or lavender herbal tea in the afternoon.",
      "Eat slowly in a calm, screen-free environment with mindful appreciation.",
      "Enjoy fresh berries and a small square of 70%+ dark chocolate for antioxidant mood support."
    ],
    eat_gu: [
      "મેગ્નેશિયમથી ભરપૂર ખોરાક: અખરોટ, કોળાના બીજ, બદામ અને કેળા લો.",
      "બપોરે કે સાંજે કેમોમાઈલ અથવા ફુદીનાની હર્બલ ચા પીવો.",
      "શાંત વાતાવરણમાં, મોબાઈલ જોયા વગર ધીમે ધીમે ભોજન માણો.",
      "તાજા ફળો અને ૭૦%+ ડાર્ક ચોકલેટનો નાનો ટુકડો મૂડ સુધારવામાં મદદ કરે છે."
    ],
    avoid_en: [
      "Zero caffeine (coffee, strong tea, energy drinks) after 12:00 PM noon.",
      "Avoid stressful doomscrolling, sensationalist news feeds, and social comparison.",
      "Avoid eating during emotional stress, rush, or heated arguments."
    ],
    avoid_gu: [
      "બપોરે ૧૨ વાગ્યા પછી કોફી, કડક ચા કે એનર્જી ડ્રિંક્સ બિલકુલ ન પીવો.",
      "સોશિયલ મીડિયા પર તણાવપૂર્ણ સમાચાર અને નેગેટિવ રીલ્સ જોવાનું ટાળો.",
      "ગુસ્સામાં, ઉતાવળમાં કે ચિંતા વચ્ચે ભોજન કરવું નહીં."
    ],
    condition_exercises: [
        {
            "id": "str_anulom",
            "icon": "🧘‍♂️",
            "name_en": "Anulom Vilom & Bhramari Pranayama",
            "name_gu": "અનુલોમ વિલોમ & ભ્રામરી પ્રાણાયામ",
            "duration_en": "10 Minutes",
            "duration_gu": "૧૦ મિનિટ",
            "duration_mins": 10,
            "when_en": "Morning or whenever feeling stressed or overwhelmed",
            "when_gu": "સવારે અથવા જ્યારે માનસિક તણાવ કે બેચેની લાગે ત્યારે",
            "how_en": "5 mins of slow alternate nostril breathing, followed by 5 mins of humming bee sound (Bhramari) on exhalation.",
            "how_gu": "૫ મિનિટ ધીમેથી એક પછી એક નસકોરાથી શ્વાસ લો, ત્યારબાદ ૫ મિનિટ ભમરા જેવો ગુંજારવ (ભ્રામરી) કરો.",
            "benefit_en": "Immediately lowers cortisol stress hormones and calms the overactive nervous system.",
            "benefit_gu": "મગજના તણાવના હોર્મોન્સ ઘટાડે છે અને મનને ક્ષણભરમાં શાંત અને સ્થિર કરે છે.",
            "avoid_en": "Do not force or rush breathing; keep it soft, slow, and natural.",
            "avoid_gu": "શ્વાસ લેવામાં બળજબરી ન કરવી; એકદમ સહજ અને ધીમો શ્વાસ રાખવો."
        },
        {
            "id": "str_478",
            "icon": "🌬️",
            "name_en": "4-7-8 Deep Relaxation Breathing",
            "name_gu": "૪-૭-૮ ડીપ રીલેક્સેશન શ્વાસ",
            "duration_en": "5 Minutes",
            "duration_gu": "૫ મિનિટ",
            "duration_mins": 5,
            "when_en": "During work breaks or 15 mins before sleeping",
            "when_gu": "કામના વિરામ સમયે અથવા રાત્રે સૂવાના ૧૫ મિનિટ પહેલાં",
            "how_en": "Inhale quietly through nose for 4s, hold breath for 7s, exhale completely through mouth with whoosh sound for 8s.",
            "how_gu": "નાકથી ૪ સેકન્ડ શ્વાસ ભરો, ૭ સેકન્ડ રોકી રાખો અને મોં દ્વારા ૮ સેકન્ડમાં ધીમેથી સંપૂર્ણ બહાર કાઢો (૪-૫ વાર).",
            "benefit_en": "Acts as a natural tranquilizer for the nervous system, rapidly reducing anxiety and heart palpitations.",
            "benefit_gu": "નર્વસ સિસ્ટમને તરત શાંત કરે છે, હૃદયના ધબકારા અને બેચેનીને નોર્મલ કરે છે.",
            "avoid_en": "Do not stand while practicing; sit comfortably in a chair or bed.",
            "avoid_gu": "ઊભા ઊભા ન કરવું; ખુરશી કે પલંગ પર આરામથી બેસીને કરવું."
        },
        {
            "id": "str_nature",
            "icon": "🌳",
            "name_en": "Peaceful Nature Walk (No Screen)",
            "name_gu": "કુદરતી વાતાવરણમાં શાંત વોક (મોબાઈલ વગર)",
            "duration_en": "20 Minutes",
            "duration_gu": "૨૦ મિનિટ",
            "duration_mins": 20,
            "when_en": "Evening around sunset",
            "when_gu": "સાંજે સૂર્યાસ્ત સમયે",
            "how_en": "Walk gently in a garden, park, or open terrace. Focus on trees, breeze, and birds without headphones.",
            "how_gu": "બગીચામાં કે ખુલ્લી અગાસી પર શાંતિથી ચાલો. મોબાઈલ કે હેડફોન વગર કુદરત અને તાજી હવાનો અનુભવ કરો.",
            "benefit_en": "Releases endorphins (happiness chemicals) and washes away daily mental fatigue.",
            "benefit_gu": "માનસિક થાક દૂર કરે છે અને મગજમાં સકારાત્મક વિચાર અને શાંતિ લાવે છે.",
            "avoid_en": "Avoid checking emails or thinking about work during this walk.",
            "avoid_gu": "આ સમય દરમિયાન કામનું કે ઘરનું ટેન્શન મનમાં ન રાખવું."
        }
    ],
    exercise_en: [
        "⏱️ 10 Mins (Morning / Stress Flare): Anulom Vilom and Bhramari humming bee breath.",
        "⏱️ 5 Mins (Bedtime / Breaks): 4-7-8 relaxing breathing cycles to calm heart rate.",
        "⏱️ 20 Mins (Evening Sunset): Screen-free quiet walk in a park or open terrace."
    ],
    exercise_gu: [
        "⏱️ ૧૦ મિનિટ (સવારે અથવા તણાવ સમયે): અનુલોમ વિલોમ અને ભ્રામરી પ્રાણાયામ કરો.",
        "⏱️ ૫ મિનિટ (રાત્રે અથવા કામના વિરામે): ૪-૭-૮ ડીપ બ્રીથિંગથી હૃદયના ધબકારા અને બેચેની શાંત કરો.",
        "⏱️ ૨૦ મિનિટ (સાંજે સૂર્યાસ્ત સમયે): મોબાઈલ વગર બગીચામાં કે અગાસી પર શાંતિથી ચાલો."
    ],
    sleep_en: [
      "7.5 to 8.5 hours of uninterrupted sleep for neurological detoxification.",
      "Dim overhead home lighting 60 minutes before bed; play calming nature sounds."
    ],
    sleep_gu: [
      "૭.૫ થી ૮.૫ કલાકની અવિરત ઊંઘ મગજને રિચાર્જ કરવા માટે અત્યંત જરૂરી છે.",
      "સૂવાના ૧ કલાક પહેલા ઘરની બધી લાઈટ્સ ધીમી કરો અને મોબાઈલ દૂર મૂકો."
    ],
    ratioTasks: [
      { id: 'breathing_478', icon: '🧘', type: 'do', name_en: '4-7-8 Breathing Circle (Morning & Night)', name_gu: '૪-૭-૮ ડીપ બ્રીથિંગ પ્રાણાયામ', tip_en: 'Directly activates the vagus nerve to reduce heart rate and adrenaline.', tip_gu: 'વેગસ નર્વને સક્રિય કરીને ધબકારા અને ચિંતા શાંત કરે છે.' },
      { id: 'calm_walk', icon: '🌳', type: 'do', name_en: '25m Gentle Nature Walk or Yoga', name_gu: '૨૫m કુદરતી વાતાવરણમાં વોક/યોગ', tip_en: 'Down-regulates amygdala stress reactivity and releases endorphins.', tip_gu: 'મગજના સ્ટ્રેસ સેન્ટરને શાંત કરે છે અને સુખદ હોર્મોન્સ વધારે છે.' },
      { id: 'herbal_tea', icon: '🍵', type: 'do', name_en: 'Sip Chamomile / Mint Herbal Tea', name_gu: 'કેમોમાઈલ/ફુદીનાની હર્બલ ચા', tip_en: 'Apigenin phytochemical binds to brain GABA receptors to induce tranquility.', tip_gu: 'મગજના રીસેપ્ટર્સને શાંત કરી તણાવ દૂર કરે છે.' },
      { id: 'avoid_caffeine_noon', icon: '🛑', type: 'avoid', name_en: 'Avoid Caffeine After 12:00 PM', name_gu: 'બપોરે ૧૨ પછી કેફીન ન લેવું', tip_en: 'Blocks adenosine receptors, keeping autonomic nervous system in hyperdrive.', tip_gu: 'કેફીન નર્વસ સિસ્ટમને ઉત્તેજિત રાખી ચિંતા વધારે છે.' },
      { id: 'avoid_doomscroll', icon: '🛑', type: 'avoid', name_en: 'Avoid Stressful News & Feeds', name_gu: 'નેગેટિવ ન્યૂઝ અને રીલ્સ ટાળો', tip_en: 'Prevents acute spikes in circulating cortisol and cognitive fatigue.', tip_gu: 'કોર્ટિસોલ સ્ટ્રેસ હોર્મોન વધતું અટકાવે છે.' },
      { id: 'avoid_rush_meal', icon: '🛑', type: 'avoid', name_en: 'Avoid Rushed or Stressful Meals', name_gu: 'ઉતાવળમાં કે તણાવમાં ન ખાવું', tip_en: 'Eating under sympathetic stress shuts down mesenteric digestive blood flow.', tip_gu: 'તણાવમાં ખાવાથી પેટમાં દુખાવો અને અપચો થાય છે.' }
    ],
    diet: [
      "Prioritize magnesium & omega-3 foods: Walnuts, pumpkin seeds, spinach, and bananas.",
      "Sip warm chamomile, lavender, or peppermint herbal tea in the afternoon.",
      "Strictly minimize high caffeine, energy drinks, and sugary snacks that cause adrenaline spikes."
    ],
    exercise: [
      "25-30 minutes of rhythmic low-impact exercise: Calm nature walks, swimming, or light cycling.",
      "Daily restorative yoga: Child's Pose (Balasana), Cat-Cow, and gentle seated forward fold.",
      "Avoid late-night high-intensity gym workouts that keep stress hormones elevated."
    ],
    sleep: [
      "7.5 to 8.5 hours of uninterrupted sleep for brain detoxification.",
      "Bedtime wind-down: Dim overhead lights 1 hour before bed; listen to calming ambient nature sounds.",
      "Zero phone browsing or news reading in bed."
    ],
    routine: [
      "Practice the 4-7-8 breathing circle twice daily (in the morning and before sleeping).",
      "Write down 3 things you are grateful for on paper each morning to reframe your mindset.",
      "Take 5-minute outdoor walking breaks whenever feeling mentally overwhelmed."
    ]
  },
  sleep: {
    icon: "🌙",
    title_en: "Insomnia & Restless Sleep Support",
    title_gu: "ઊંઘની સમસ્યા અને અનિદ્રા કેર",
    desc_en: "Reset your circadian rhythm for effortless sleep onset and restorative REM rest.",
    desc_gu: "કુદરતી બોડી ક્લોક રીસેટ કરો જેથી સરળતાથી ગાઢ ઊંઘ આવે અને સવારે તાજગી રહે.",
    btn_title_en: "Sleep Issues",
    btn_sub_en: "Insomnia Support",
    btn_title_gu: "ઊંઘની સમસ્યા",
    btn_sub_gu: "ગાઢ ઊંઘ",
    eat_en: [
      "Eat light, easy-to-digest dinners: Moong dal khichdi, warm pumpkin soup, or steamed vegetables.",
      "Bedtime tryptophan booster: Half a cup of warm milk or 4-5 soaked almonds 30m before bed.",
      "Strict 2:00 PM caffeine curfew: Zero coffee, black tea, energy drinks, or colas.",
      "Taper evening fluid intake after 7:00 PM to avoid nighttime awakenings."
    ],
    eat_gu: [
      "રાત્રે સાવ હળવો ખોરાક લો: મગની દાળની ખીચડી, ગરમ સૂપ અથવા બાફેલી શાકભાજી.",
      "સૂતા પહેલા અડધો ગ્લાસ હુંફાળું દૂધ અથવા ૪-૫ પલાળેલી બદામ લો.",
      "બપોરે ૨ વાગ્યા પછી કોફી, કડક ચા કે કોલ્ડ્રિંક્સ સંપૂર્ણ ટાળો.",
      "રાત્રે વારંવાર પેશાબ માટે ન ઉઠવું પડે તે માટે સાંજે ૭ પછી પ્રવાહી ઘટાડો."
    ],
    avoid_en: [
      "Strictly no smartphones, tablets, or laptops in bed—blue light halts melatonin production.",
      "Avoid afternoon coffee, tea, or chocolate past 2:00 PM (caffeine has a 6-hour half-life).",
      "Avoid heavy, oily, spicy dinners within 3 hours of your planned sleep time."
    ],
    avoid_gu: [
      "પથારીમાં સ્માર્ટફોન કે લેપટોપનો ઉપયોગ ક્યારેય ન કરવો (બ્લુ લાઈટ ઊંઘ ઉડાડી દે છે).",
      "બપોરે ૨ વાગ્યા પછી કોફી કે કડક ચા સંપૂર્ણ બંધ કરો.",
      "સૂવાના ૩ કલાક પહેલા ભારે, તળેલું અને મસાલેદાર ભોજન ન ખાઓ."
    ],
    condition_exercises: [
        {
            "id": "slp_legs_wall",
            "icon": "🛏️",
            "name_en": "Viparita Karani (Legs-Up-The-Wall Pose)",
            "name_gu": "વિપરીત કરણી (પગ દીવાલ પર ટેકવીને આરામ)",
            "duration_en": "10 Minutes",
            "duration_gu": "૧૦ મિનિટ",
            "duration_mins": 10,
            "when_en": "30 minutes before bed in dim light",
            "when_gu": "રાત્રે સૂવાના ૩૦ મિનિટ પહેલાં ઝાંખા પ્રકાશમાં",
            "how_en": "Lie flat on back near a wall, raise both legs straight up resting against the wall, keep arms open and eyes closed.",
            "how_gu": "દીવાલ પાસે ચત્તા સૂઈ જાઓ, બંને પગ દીવાલ પર ઉપર સીધા રાખો અને આંખો બંધ કરી ઊંડા શ્વાસ લો.",
            "benefit_en": "Relieves heaviness in tired legs, lowers pulse rate, and triggers natural deep sleep signals.",
            "benefit_gu": "પગનો થાક ઉતારે છે, બ્લડ પ્રેશર શાંત કરે છે અને શરીરને ગાઢ ઊંઘ માટે તૈયાર કરે છે.",
            "avoid_en": "Do not look at bright phone or TV screens while in this pose.",
            "avoid_gu": "આ આસન કરતી વખતે મોબાઈલ કે ટીવીની સ્ક્રીન બિલકુલ ન જોવી."
        },
        {
            "id": "slp_child",
            "icon": "🌙",
            "name_en": "Balasana (Child's Pose) & Neck Stretch",
            "name_gu": "બાળાસન (ચાઇલ્ડ પોઝ) અને ગરદન સ્ટ્રેચ",
            "duration_en": "5 Minutes",
            "duration_gu": "૫ મિનિટ",
            "duration_mins": 5,
            "when_en": "In bedroom just before getting into bed",
            "when_gu": "રાત્રે પથારીમાં સૂતા પહેલાં",
            "how_en": "Kneel on mat or bed, sit back on heels, fold torso forward with forehead resting down and arms relaxed forward.",
            "how_gu": "પથારી પર ઘૂંટણ વાળીને બેસો, આગળ નમીને કપાળ પથારી પર ટેકવો અને હાથ આગળ ઢીલા રાખી ૧૦ ઊંડા શ્વાસ લો.",
            "benefit_en": "Gently stretches the spine, releases shoulder and neck tightness, and quiets an overthinking mind.",
            "benefit_gu": "કમર અને ગરદનનું જકડાઈ જવું દૂર કરે છે અને મનમાં ચાલતા વિચારોને શાંત કરે છે.",
            "avoid_en": "Avoid straining neck or forcing knees if uncomfortable.",
            "avoid_gu": "ગરદન પર કોઈ ખેંચાણ ન આપવું; એકદમ હળવાશથી રહેવું."
        },
        {
            "id": "slp_sunlight",
            "icon": "🌅",
            "name_en": "Morning Natural Daylight Walk",
            "name_gu": "સવારની સૂર્યપ્રકાશ ચાલ (બોડી ક્લોક સેટ કરવા)",
            "duration_en": "20 Minutes",
            "duration_gu": "૨૦ મિનિટ",
            "duration_mins": 20,
            "when_en": "7:00 AM to 8:30 AM in morning sunlight",
            "when_gu": "સવારે ૭:૦૦ થી ૮:૩૦ વચ્ચે સૂર્યપ્રકાશમાં",
            "how_en": "Walk outdoors without sunglasses so morning photons enter the eyes and reset your master circadian clock.",
            "how_gu": "સવારના કુદરતી અજવાળામાં ૨૦ મિનિટ ચાલો જેથી આંખોમાં કુદરતી પ્રકાશ પડે અને બાયોલોજિકલ ક્લોક સેટ થાય.",
            "benefit_en": "Anchors circadian rhythm, ensuring high melatonin (sleep hormone) secretion automatically at night.",
            "benefit_gu": "શરીરની સ્લીપ સાયકલ નિયંત્રિત કરે છે જેથી રાત્રે આપોઆપ સમયસર ઊંઘ આવી જાય છે.",
            "avoid_en": "Avoid wearing dark tinted sunglasses during this morning walk.",
            "avoid_gu": "સવારે ચાલતી વખતે કાળા ચશ્મા (સનગ્લાસ) ન પહેરવા."
        }
    ],
    exercise_en: [
        "⏱️ 10 Mins (30m Before Bed): Viparita Karani (Legs-Up-The-Wall) in dim light to trigger sleep signals.",
        "⏱️ 5 Mins (Just Before Sleep): Balasana (Child's Pose) and gentle neck release.",
        "⏱️ 20 Mins (7:00-8:30 AM): Natural morning daylight walk without sunglasses to anchor circadian clock."
    ],
    exercise_gu: [
        "⏱️ ૧૦ મિનિટ (સૂવાના ૩૦ મિનિટ પહેલાં): દીવાલ પર પગ ઊંચા રાખી (વિપરીત કરણી) શાંતિથી સૂવો.",
        "⏱️ ૫ મિનિટ (પથારીમાં સૂતા પહેલાં): બાળાસન (ચાઇલ્ડ પોઝ) અને ગરદન સ્ટ્રેચ કરો.",
        "⏱️ ૨૦ મિનિટ (સવારે ૭:૦૦-૮:૩૦): સૂર્યપ્રકાશમાં વોક કરો જેથી શરીરની બાયોલોજિકલ ક્લોક સેટ થાય."
    ],
    sleep_en: [
      "7.5 to 8.5 hours. Maintain a non-negotiable fixed wake-up time 7 days a week.",
      "Keep bedroom pitch black (use blackout curtains), whisper quiet, and comfortably cool."
    ],
    sleep_gu: [
      "૭.૫ થી ૮.૫ કલાકની નિરાંત ઊંઘ લો; રોજ એક જ સમયે સૂવું અને જાગવું.",
      "ઓરડામાં સંપૂર્ણ અંધારું, શાંતિ અને સાનુકૂળ ઠંડક રાખો."
    ],
    ratioTasks: [
      { id: 'morning_sun', icon: '☀️', type: 'do', name_en: '30m Morning Sunlight & Air', name_gu: 'સવારે ૩૦m સૂર્યપ્રકાશમાં ચાલવું', tip_en: 'Sets suprachiasmatic biological clock for timely evening melatonin surge.', tip_gu: 'કુદરતી સર્કેડિયન રિધમ સેટ કરીને રાત્રે સમયસર ઊંઘ લાવે છે.' },
      { id: 'sleep_schedule', icon: '⏰', type: 'do', name_en: 'Fixed Wake-Up Time Maintained', name_gu: 'દરરોજ એક જ સમયે ઉઠવું', tip_en: 'Anchor circadian rhythm regardless of weekday vs. weekend shifts.', tip_gu: 'રોજ એક જ સમયે ઉઠવાથી ઊંઘની ગુણવત્તા બમણી થાય છે.' },
      { id: 'warm_milk_read', icon: '📖', type: 'do', name_en: 'Relaxing Book & Warm Milk/Tea', name_gu: 'શાંત પુસ્તક વાચન & ગરમ દૂધ', tip_en: 'Prepares psychological cue that daytime cognitive striving has ended.', tip_gu: 'મગજને સંકેત આપે છે કે દિવસનો થાક પૂરો થયો છે.' },
      { id: 'avoid_bed_screens', icon: '🛑', type: 'avoid', name_en: 'Strictly No Screens in Bed', name_gu: 'પથારીમાં સ્માર્ટફોન બંધ રાખવો', tip_en: 'Short-wavelength 460nm blue photons halt pineal gland melatonin secretion.', tip_gu: 'મોબાઈલની બ્લુ લાઈટ મેલાટોનિન હોર્મોન બનતું અટકાવે છે.' },
      { id: 'avoid_pm_coffee', icon: '🛑', type: 'avoid', name_en: 'Avoid Caffeine After 2:00 PM', name_gu: 'બપોરે ૨ પછી ચા-કોફી ન લેવી', tip_en: 'Pharmacological half-life leaves significant adenosine antagonism overnight.', tip_gu: 'કેફીન ૬ કલાક સુધી શરીરમાં રહી ઊંઘની ગુણવત્તા બગાડે છે.' },
      { id: 'avoid_heavy_dinner', icon: '🛑', type: 'avoid', name_en: 'Avoid Heavy Dinner Near Bedtime', name_gu: 'રાત્રે મોડેથી ભારે ભોજન ટાળો', tip_en: 'Thermogenic digestion elevates body temperature preventing deep slow-wave delta sleep.', tip_gu: 'ભારે પાચન પ્રક્રિયાથી શરીર ગરમ રહે છે અને ગાઢ ઊંઘ નથી આવતી.' }
    ],
    diet: [
      "Light, easy-to-digest dinner: Steamed vegetables, warm soup, or light khichdi.",
      "Tryptophan-rich bedtime snacks: A small handful of almonds or warm milk.",
      "Strict 2:00 PM caffeine curfew: No coffee, black tea, or energy drinks in the afternoon/evening."
    ],
    exercise: [
      "30 minutes of outdoor aerobic activity (walking or cycling) preferably in the morning.",
      "Gentle evening stretching (5-10 mins) to decompress the spine and muscles.",
      "Avoid heavy cardiovascular workouts within 3 hours of your planned bedtime."
    ],
    sleep: [
      "7.5 to 8.5 hours. Use our 90-Minute Sleep Cycle Calculator to synchronize optimal bedtimes.",
      "Bedroom environment: Keep room completely dark (use blackout curtains or eye mask) and quiet.",
      "Set an absolute fixed wake-up time 7 days a week, including weekends."
    ],
    routine: [
      "60-minute digital curfew: Keep phones and laptops completely away from the bed.",
      "Read a physical paper book under a warm amber lamp instead of watching screens.",
      "If awake after 20 minutes in bed, get up, sit quietly in dim light, and do slow breathing until sleepy."
    ]
  },
  joints: {
    icon: "🦴",
    title_en: "Back Strain, Neck Tension & Joint Stiffness",
    title_gu: "કમરનો દુખાવો અને સાંધાની જકડન",
    desc_en: "Decompress spinal discs, counteract desk posture strain, and lubricate synovial joints.",
    desc_gu: "કરોડરજ્જુનું દબાણ હળવું કરો, ડેસ્ક પોશ્ચર સુધારો અને સાંધાનું લ્યુબ્રિકેશન જાળવો.",
    btn_title_en: "Joint & Back",
    btn_sub_en: "Mobility Care",
    btn_title_gu: "સાંધા & કમર",
    btn_sub_gu: "દુખાવામાં રાહત",
    eat_en: [
      "Golden turmeric milk (with a pinch of black pepper for curcumin absorption) daily.",
      "Incorporate anti-inflammatory omega-3 sources: Walnuts, ground flaxseeds, and chia seeds.",
      "Ensure sufficient Calcium and Vitamin D3 (morning sunlight exposure) for skeletal strength.",
      "Drink ample water: Cartilage and spinal discs are 80% water and require fluid to cushion."
    ],
    eat_gu: [
      "હળદરવાળું દૂધ (થોડી કાળી મરી સાથે જેથી કરક્યુમિન શોષાય) રોજ પીવો.",
      "સોજો ઘટાડતો ખોરાક લો: અખરોટ, અળસીના બીજ અને ચિયા સીડ્સ.",
      "હાડકાંની મજબૂતી માટે કેલ્શિયમ અને સવારનો વિટામિન ડી૩ સૂર્યપ્રકાશ લો.",
      "પૂરતું પાણી પીવો: કરોડરજ્જુના મણકા અને સાંધા કુશનિંગ માટે પાણી માંગે છે."
    ],
    avoid_en: [
      "Avoid sitting continuously for over 40 minutes—set a standing/walking reminder.",
      "Avoid slumping your neck over phones ('tech neck' puts 50 lbs of cervical pressure).",
      "Avoid overly soft, sagging mattresses or extra thick pillows that twist the spine."
    ],
    avoid_gu: [
      "સળંગ ૪૦ મિનિટથી વધુ સમય એક જ જગ્યાએ બેસી ન રહો; વચ્ચે ઊભા થાઓ.",
      "મોબાઈલ વાપરતી વખતે ડોક નીચે ઝુકાવીને ન બેસો (તેનાથી ગરદન પર ભારે દબાણ આવે છે).",
      "ખૂબ જ નરમ, વાંકાચૂંકા ગાદલા કે ખૂબ ઊંચા ઓશીકા પર ન સૂવું."
    ],
    condition_exercises: [
        {
            "id": "jnt_bhujang",
            "icon": "🦎",
            "name_en": "Bhujangasana & Gentle Cat-Cow Spine Flow",
            "name_gu": "ભુજંગાસન & કેટ-કાઉ કમર સ્ટ્રેચ",
            "duration_en": "10 Minutes",
            "duration_gu": "૧૦ મિનિટ",
            "duration_mins": 10,
            "when_en": "Morning or Evening on a comfortable mat",
            "when_gu": "સવારે અથવા સાંજે નરમ યોગ મેટ પર",
            "how_en": "Lie on stomach, gently lift chest without straining lower back, then move onto hands and knees to arch and round spine.",
            "how_gu": "પેટ પર સૂઈ હથેળી છાતી પાસે રાખી ધીમેથી છાતી ઊંચી કરો, ત્યારબાદ ઘૂંટણ પર આવી કમરને હળવેથી ઉપર-નીચે વાળો.",
            "benefit_en": "Mobilizes spinal vertebrae, relieves lower back compression, and improves posture.",
            "benefit_gu": "કરોડરજ્જુના મણકાને લચીલા બનાવે છે અને કમરના નીચેના ભાગનો દુખાવો ઓછો કરે છે.",
            "avoid_en": "Avoid sharp bending or jerking if you have an acute slipped disc flare-up.",
            "avoid_gu": "ઝટકો મારીને પાછળ ન વળવું; જો વધુ દુખાવો થાય તો તરત અટકવું."
        },
        {
            "id": "jnt_seated_knee",
            "icon": "🪑",
            "name_en": "Seated Knee Extensions & Ankle Rotations",
            "name_gu": "ખુરશી પર બેસીને ઘૂંટણ અને ઘૂંટીની કસરત",
            "duration_en": "10 Minutes",
            "duration_gu": "૧૦ મિનિટ",
            "duration_mins": 10,
            "when_en": "Twice daily (Morning & Late Afternoon)",
            "when_gu": "દિવસમાં ૨ વાર (સવારે અને બપોરે બેઠા બેઠા)",
            "how_en": "Sit tall in chair. Slowly straighten one leg forward, hold 5s, lower down (10 reps each leg). Then rotate ankles 10x each direction.",
            "how_gu": "ખુરશી પર સીધા બેસો. એક પગ સીધો આગળ લંબાવી ૫ સેકન્ડ રોકો, પછી નીચે લાવો (૧૦ વાર). ત્યારબાદ ઘૂંટી ગોળ ફેરવો.",
            "benefit_en": "Pumps synovial lubricating fluid into knee joints without any body-weight impact.",
            "benefit_gu": "ઘૂંટણના સાંધામાં કુદરતી લ્યુબ્રિકેશન (ચીકાશ) વધારે છે જેથી ઘૂંટણનો ઘસારો અને કડાકા ઓછા થાય છે.",
            "avoid_en": "Do not let legs slam down fast; lower smoothly.",
            "avoid_gu": "પગને ઝટકા સાથે નીચે ન પછાડવો; ધીમેથી લાવવો."
        },
        {
            "id": "jnt_flat_walk",
            "icon": "👟",
            "name_en": "Gentle Flat-Surface Walking",
            "name_gu": "સમતલ સપાટી પર હળવું ચાલવું",
            "duration_en": "15 to 20 Minutes",
            "duration_gu": "૧૫ થી ૨૦ મિનિટ",
            "duration_mins": 20,
            "when_en": "Morning wearing well-cushioned shoes",
            "when_gu": "સવારે સારા આરામદાયક શૂઝ પહેરીને",
            "how_en": "Walk on flat grass, track, or flat road with short, gentle strides. Keep body relaxed.",
            "how_gu": "બગીચાના ઘાસ કે સમતલ રસ્તા પર નાના નાના ડગલાં ભરીને ચાલો. શરીરને એકદમ હળવું રાખો.",
            "benefit_en": "Boosts joint blood supply and prevents stiffness without stressing cartilage.",
            "benefit_gu": "સાંધા પર વજન નાખ્યા વિના રક્ત પરિભ્રમણ વધારે છે અને સાંધા જકડાઈ જતા અટકાવે છે.",
            "avoid_en": "Avoid uneven potholes, rocky slopes, or running on hard pavement.",
            "avoid_gu": "ખાડા-ટેકરાવાળા રસ્તા કે પથ્થર પર ન ચાલવું અને કૂદકા ન મારવા."
        }
    ],
    exercise_en: [
        "⏱️ 10 Mins (Morning / Evening): Bhujangasana & Cat-Cow spine flow to mobilize vertebrae.",
        "⏱️ 10 Mins (Twice Daily Seated): Seated knee extensions (10x each leg) and ankle circles.",
        "⏱️ 15-20 Mins (Morning): Gentle flat-surface walking in cushioned shoes without impact."
    ],
    exercise_gu: [
        "⏱️ ૧૦ મિનિટ (સવારે અથવા સાંજે): ભુજંગાસન અને કેટ-કાઉ આસનથી કમરના મણકા લચીલા બનાવો.",
        "⏱️ ૧૦ મિનિટ (દિવસમાં ૨ વાર બેઠા બેઠા): ખુરશી પર બેસી ઘૂંટણ સીધા કરી રોકો અને ઘૂંટી ગોળ ફેરવો.",
        "⏱️ ૧૫-૨૦ મિનિટ (સવારે): સમતલ સપાટી પર હળવા ડગલાં ભરીને ચાલો જેથી સાંધા જકડાય નહીં."
    ],
    sleep_en: [
      "7 to 8 hours of sleep on a medium-firm supportive mattress.",
      "Spine alignment: Place a pillow between knees when sleeping on side, or under knees if on back."
    ],
    sleep_gu: [
      "૭ થી ૮ કલાકની ઊંઘ; સાધારણ કડક (Medium-Firm) ગાદલાનો ઉપયોગ કરો.",
      "પડખું ફરીને સૂતી વખતે બે ઘૂંટણ વચ્ચે ઓશીકું રાખવાથી કમર સીધી રહે છે."
    ],
    ratioTasks: [
      { id: 'desk_stretch', icon: '⏱️', type: 'do', name_en: '5-Min Stretch Timer 2x Daily', name_gu: 'દિવસમાં ૨ વાર ૫m સ્ટ્રેચિંગ', tip_en: 'Decompresses trapezius tension and cervical vertebrae.', tip_gu: 'ગરદન અને ખભાના સ્નાયુઓનો તણાવ દૂર કરે છે.' },
      { id: 'low_impact_walk', icon: '🏊', type: 'do', name_en: '25m Flat Ground Walk / Swim', name_gu: '૨૫m સપાટ જમીન પર ચાલવું', tip_en: 'Pumps synovial fluid through cartilage without joint pounding.', tip_gu: 'સાંધા પર વજન આવ્યા વગર લ્યુબ્રિકેશન વધારે છે.' },
      { id: 'turmeric_walnuts', icon: '🌿', type: 'do', name_en: 'Turmeric Milk & Walnuts', name_gu: 'હળદરવાળું દૂધ અને અખરોટ', tip_en: 'Curcumin and plant omega-3s downregulate inflammatory cytokines.', tip_gu: 'કુદરતી એન્ટિ-ઇન્ફ્લેમેટરી ગુણોથી દુખાવામાં રાહત આપે છે.' },
      { id: 'avoid_long_sit', icon: '🛑', type: 'avoid', name_en: 'Avoid Sitting > 40m Continuously', name_gu: 'સળંગ ૪૦m થી વધુ બેસવું નહીં', tip_en: 'Sitting raises intradiscal lumbar pressure by 140% compared to standing.', tip_gu: 'બેસી રહેવાથી કમરના મણકા પર ૧૪૦% વધુ દબાણ આવે છે.' },
      { id: 'avoid_slouch', icon: '🛑', type: 'avoid', name_en: 'Avoid Tech Neck / Phone Slouch', name_gu: 'મોબાઈલ માટે ડોક નમાવી ન બેસવું', tip_en: '45-degree cervical flexion exerts 49 lbs of force on upper vertebrae.', tip_gu: 'વાંકા વળીને ફોન જોવાથી ગરદન પર ૨૨ કિલો જેટલું વજન પડે છે.' },
      { id: 'avoid_soft_bed', icon: '🛑', type: 'avoid', name_en: 'Avoid Sagging Soft Mattresses', name_gu: 'અતિશય નરમ ગાદલા પર ન સૂવું', tip_en: 'Sagging beds torque the lumbar and thoracic column out of neutral alignment.', tip_gu: 'કડક કે મધ્યમ ગાદલું કરોડરજ્જુને સીધી રાખે છે.' }
    ],
    diet: [
      "Anti-inflammatory nutrition: Turmeric with black pepper, walnuts, flaxseeds, and colorful berries.",
      "Ensure sufficient Vitamin D3 (morning sunlight) and Calcium for bone and joint health.",
      "Stay hydrated: Spinal discs and cartilage require water to remain cushioned."
    ],
    exercise: [
      "Follow our 5-Minute Desk Stretch Timer: Focus on neck rolls, chest openers, and seated spinal twists.",
      "Low-impact movement: Walking on flat ground, swimming, or stationary cycling.",
      "Gentle core stabilization: Bird-Dog, Glute Bridges, and pelvic tilts (avoid heavy jerky weights)."
    ],
    sleep: [
      "7 to 8 hours of sleep on a medium-firm supportive mattress.",
      "Sleeping alignment: Place a pillow between your knees if on side, or under knees if on back.",
      "Use an ergonomic pillow that keeps your neck and spine in a straight neutral line."
    ],
    routine: [
      "Never sit continuously for more than 40 minutes—set a standing timer.",
      "Position monitor so the top third of screen is at natural eye level.",
      "Take a warm shower or apply warm compress in the morning to release muscle stiffness."
    ]
  },
  sugar_bp: {
    icon: "🩺",
    title_en: "Blood Sugar & Blood Pressure Support",
    title_gu: "ડાયાબિટીસ અને બ્લડ પ્રેશર કેર",
    desc_en: "Enhance insulin sensitivity and regulate arterial pressure with structured lifestyle care.",
    desc_gu: "ઇન્સ્યુલિન સેન્સિટિવિટી વધારો અને સ્વસ્થ જીવનશૈલીથી બીપી નિયંત્રિત રાખો.",
    btn_title_en: "Sugar & BP",
    btn_sub_en: "Cardio Care",
    btn_title_gu: "શુગર & BP",
    btn_sub_gu: "હૃદય & શુગર",
    eat_en: [
      "Base meals on low-glycemic, fiber-rich whole foods: Rolled oats, millets, beans, and lentils.",
      "Morning ritual: Soak 1 teaspoon of fenugreek (methi) seeds in warm water overnight; drink on empty stomach.",
      "Lower sodium intake: Use potassium-rich vegetables (spinach, cucumber) and herbal seasonings instead of salt.",
      "Add cinnamon powder or fresh amla (Indian gooseberry) for natural glycemic balance."
    ],
    eat_gu: [
      "હાઈ-ફાઈબર અને ઓછો ગ્લાયસેમિક આહાર લો: ઓટ્સ, જુવાર-બાજરી, કાકડી અને કઠોળ.",
      "સવારે ખાલી પેટે રાત્રે પલાળેલા મેથી દાણાનું હુંફાળું પાણી પીવો.",
      "મીઠું (નમક) ઓછું કરો; પેકેજ્ડ ફૂડ ટાળો અને પોટેશિયમયુક્ત લીલા શાકભાજી ખાઓ.",
      "તજ પાવડર અથવા આંબળાનું સેવન કુદરતી રીતે સુગર કંટ્રોલ કરે છે."
    ],
    avoid_en: [
      "Strictly eliminate refined white sugar, sugary confectionery, bakery pastries, and fruit juice drinks.",
      "Avoid high-sodium packaged snacks: Potato chips, processed namkeen, salted nuts, and pickles.",
      "Avoid skipping prescribed doctor consultations or daily monitoring logs."
    ],
    avoid_gu: [
      "સફેદ ખાંડ, મીઠાઈઓ, બેકરી વસ્તુઓ અને સોડા સંપૂર્ણ બંધ કરો.",
      "પેકેજ્ડ વેફર્સ, અથાણાં, નમકીન અને વધુ મીઠાવાળા ખોરાક ટાળો.",
      "રોજિંદી તપાસ (BP / Sugar Testing) લેવામાં ક્યારેય આળસ ન કરવી."
    ],
    condition_exercises: [
        {
            "id": "sbp_post_meal",
            "icon": "🚶‍♂️",
            "name_en": "Post-Meal Blood Glucose Walk",
            "name_gu": "જમ્યા પછીની સુગર કંટ્રોલ ચાલ",
            "duration_en": "15 Minutes",
            "duration_gu": "૧૫ મિનિટ",
            "duration_mins": 15,
            "when_en": "20 to 30 minutes after Lunch & Dinner",
            "when_gu": "બપોરે અને રાત્રે જમ્યાના ૨૦-૩૦ મિનિટ પછી",
            "how_en": "Walk at a steady, moderate pace for 15 minutes. Large thigh and calf muscles actively take up sugar from blood.",
            "how_gu": "જમ્યાની ૨૦ મિનિટ પછી ૧૫ મિનિટ મધ્યમ ગતિએ ચાલો. પગના સ્નાયુઓ લોહીમાંથી સીધી સુગર ખેંચી લે છે.",
            "benefit_en": "Blunts post-meal glucose spikes by 25-30% without demanding extra insulin from the pancreas.",
            "benefit_gu": "જમ્યા પછી સુગરને એકદમ વધતી અટકાવે છે અને ઇન્સ્યુલિન વગર કુદરતી કંટ્રોલ આપે છે.",
            "avoid_en": "Avoid sitting down immediately after heavy carbohydrate meals.",
            "avoid_gu": "જમ્યા પછી તરત ખુરશી કે પલંગ પર બેસી ન રહેવું."
        },
        {
            "id": "sbp_wall_sit",
            "icon": "🧱",
            "name_en": "Isometric Wall Sits (BP Reducer)",
            "name_gu": "આઇસોમેટ્રિક વોલ સીટ (BP ઘટાડવા માટે)",
            "duration_en": "5 Minutes",
            "duration_gu": "૫ મિનિટ",
            "duration_mins": 5,
            "when_en": "3 to 4 days a week (Morning or Evening)",
            "when_gu": "અઠવાડિયામાં ૩ થી ૪ દિવસ (સવારે અથવા સાંજે)",
            "how_en": "Lean back flat against a wall, slide down into chair-like posture, hold for 1 to 2 minutes. Rest 1 min and repeat 2-3 times.",
            "how_gu": "દીવાલને અડીને બેક સપોર્ટ લઈ ખુરશીની જેમ નીચે બેસો. ૧ થી ૨ મિનિટ રોકાઈ રહો, ૧ મિનિટ આરામ કરી ૨-૩ વાર દોહરાવો.",
            "benefit_en": "Stimulates arterial release of nitric oxide, significantly lowering resting systolic and diastolic blood pressure.",
            "benefit_gu": "રક્તવાહિનીઓને પહોળી કરી લોહીનું દબાણ (High BP) કુદરતી રીતે ઘટાડવામાં ખૂબ અસરકારક છે.",
            "avoid_en": "Never hold your breath while sitting; breathe steadily and smoothly.",
            "avoid_gu": "આ કસરત વખતે શ્વાસ ક્યારેય રોકી ન રાખવો; શ્વાસોચ્છવાસ ચાલુ રાખવો."
        },
        {
            "id": "sbp_nadi_shodhana",
            "icon": "🧘",
            "name_en": "Nadi Shodhana Pranayama (Alternate Nostril)",
            "name_gu": "નાડી શોધન પ્રાણાયામ (શાંત શ્વાસ)",
            "duration_en": "10 Minutes",
            "duration_gu": "૧૦ મિનિટ",
            "duration_mins": 10,
            "when_en": "Morning on an empty stomach",
            "when_gu": "સવારે ખાલી પેટે",
            "how_en": "Sit comfortably, close right nostril with thumb, inhale left 4s, close left with ring finger, exhale right 4s, repeat alternate.",
            "how_gu": "સુખાસનમાં બેસો. જમણા અંગૂઠાથી જમણું નસકોરું બંધ કરી ડાબેથી ૪ સેકન્ડ શ્વાસ લો, પછી ડાબું બંધ કરી જમણેથી ૪ સેકન્ડ બહાર કાઢો.",
            "benefit_en": "Down-regulates arterial vasoconstriction, calming high systolic BP and stabilizing glucose variability.",
            "benefit_gu": "નર્વસ સિસ્ટમ શાંત કરીને હૃદય અને ધમનીઓનું દબાણ નોર્મલ રાખે છે.",
            "avoid_en": "Do not rush or blow nostrils forcefully.",
            "avoid_gu": "શ્વાસ જોરથી ખેંચવો કે બહાર ફેંકવો નહીં; એકદમ શાંતિથી કરવો."
        }
    ],
    exercise_en: [
        "⏱️ 15 Mins (20m Post-Meals): Moderate glucose walk after lunch & dinner to blunt sugar spikes.",
        "⏱️ 5 Mins (3-4 Days/Week): Isometric wall sits (hold 1-2 mins x 3 sets) to lower resting blood pressure.",
        "⏱️ 10 Mins (Morning Empty Stomach): Nadi Shodhana calm breathing to steady systolic BP."
    ],
    exercise_gu: [
        "⏱️ ૧૫ મિનિટ (જમ્યાના ૨૦ મિનિટ પછી): બપોરે અને રાત્રે ૧૫ મિનિટ ચાલો જેથી બ્લડ સુગર સ્પાઇક ન થાય.",
        "⏱️ ૫ મિનિટ (અઠવાડિયામાં ૩-૪ વાર): આઇસોમેટ્રિક વોલ સીટ કરો જેથી બ્લડ પ્રેશર કુદરતી રીતે ઘટે.",
        "⏱️ ૧૦ મિનિટ (સવારે ખાલી પેટે): નાડી શોધન પ્રાણાયામ કરો જેથી હૃદય અને બ્લડ પ્રેશર નોર્મલ રહે."
    ],
    sleep_en: [
      "7 to 8 hours of consistent, restorative sleep. Sleep debt spikes nocturnal cortisol and fasting glucose.",
      "Maintain predictable bedtime routines to support endocrine metabolic stability."
    ],
    sleep_gu: [
      "૭ થી ૮ કલાકની નિયમિત ઊંઘ લો (ઊંઘ ઓછી થવાથી બ્લડ પ્રેશર અને સુગર વધે છે).",
      "તણાવમુક્ત અને શાંત વાતાવરણમાં સૂવાનો આગ્રહ રાખો."
    ],
    ratioTasks: [
      { id: 'post_meal_walk', icon: '🏃', type: 'do', name_en: '35m Brisk Walking (Post-Meals)', name_gu: 'જમ્યા પછી ૨૦m ઝડપી ચાલવું', tip_en: 'Skeletal muscle contractions pull glucose from bloodstream without requiring insulin.', tip_gu: 'સ્નાયુઓ લોહીમાંથી સુગર શોષી લે છે જેથી સુગર સ્પાઇક અટકે છે.' },
      { id: 'fiber_oats_methi', icon: '🥗', type: 'do', name_en: 'High-Fiber Oats & Methi Water', name_gu: 'હાઈ-ફાઈબર ઓટ્સ & મેથી પાણી', tip_en: 'Viscous soluble mucilage slows carbohydrate digestion and enzymatic hydrolysis.', tip_gu: 'કાર્બોહાઇડ્રેટ્સનું પાચન ધીમું કરીને સુગર સ્થિર રાખે છે.' },
      { id: 'deep_breath_bp', icon: '🧘', type: 'do', name_en: '10m 4-7-8 Breathing to Lower BP', name_gu: '૧૦m ડીપ બ્રીથિંગ (BP કંટ્રોલ)', tip_en: 'Suppresses sympathetic vasomotor tone, yielding measurable reductions in systolic pressure.', tip_gu: 'નર્વસ સિસ્ટમ શાંત કરીને સિસ્ટોલિક બ્લડ પ્રેશર ઘટાડે છે.' },
      { id: 'avoid_refined_sugar', icon: '🛑', type: 'avoid', name_en: 'Avoid Refined Sugar & Pastries', name_gu: 'સફેદ ખાંડ અને મીઠાઈ ટાળો', tip_en: 'High glycemic carbohydrates exhaust pancreatic beta cells and elevate HbA1c.', tip_gu: 'ઝડપી સુગર સ્પાઇક લાવી પેન્ક્રિયાસ પર દબાણ વધારે છે.' },
      { id: 'avoid_high_salt', icon: '🛑', type: 'avoid', name_en: 'Avoid High-Sodium Chips & Pickles', name_gu: 'પેકેજ્ડ વેફર્સ & વધુ મીઠું ટાળો', tip_en: 'Excess sodium expands extracellular fluid volume, directly spiking arterial pressure.', tip_gu: 'સોડિયમ શરીરમાં પ્રવાહી વધારીને સીધું બ્લડ પ્રેશર વધારે છે.' },
      { id: 'avoid_skip_checks', icon: '🛑', type: 'avoid', name_en: 'Avoid Skipping Daily Monitoring', name_gu: 'રોજિંદી તપાસ સ્કીપ ન કરવી', tip_en: 'Maintains crucial clinical awareness to prevent undetected glycemic or hypertensive events.', tip_gu: 'નિયમિત ચેક કરવાથી અચાનક સુગર કે બીપી વધવાનું જોખમ ટળે છે.' }
    ],
    diet: [
      "Focus on low-glycemic, fiber-dense foods: Oats, millets, leafy vegetables, lentils, and nuts.",
      "Lower sodium/salt: Avoid packaged chips, salted nuts, and processed instant soups.",
      "Add fenugreek (methi) or cinnamon to morning water for natural glucose metabolism.",
      "Zero added refined white sugar, sweetened beverages, and bakery pastries."
    ],
    exercise: [
      "35-45 minutes of daily brisk walking (can be split into two 20-minute sessions after meals).",
      "Light resistance exercises: Wall sits, chair squats, light resistance bands 3 days a week.",
      "Consistency over intensity: Daily moderate movement improves insulin uptake for up to 48 hours."
    ],
    sleep: [
      "7 to 8 hours of deep, restful sleep. Chronic sleep debt elevates cortisol and fasting glucose.",
      "Maintain a predictable sleep schedule to support metabolic hormones."
    ],
    routine: [
      "Monitor and record your blood pressure and glucose readings as advised by your doctor.",
      "Dedicate 10 minutes daily to 4-7-8 breathing or meditation to calm blood pressure.",
      "Always consult your certified healthcare provider for medical diagnosis and prescriptions."
    ]
  }
};

/* ==========================================================================
   Rotating Daily Health Tips (English & Gujarati)
   ========================================================================== */
const DAILY_HEALTH_TIPS = [
  {
    icon: '💧',
    en: 'Drink a glass of warm water first thing in the morning to awaken digestion and flush metabolic toxins.',
    gu: 'સવારે ઉઠતાની સાથે એક ગ્લાસ હુંફાળું પાણી પીવાથી પાચનક્રિયા તેજ બને છે અને શરીરના ઝેરી તત્વો બહાર નીકળે છે.'
  },
  {
    icon: '👀',
    en: 'Practice the 20-20-20 rule: Every 20 minutes of screen work, look at an object 20 feet away for 20 seconds.',
    gu: 'સ્ક્રીન જોતી વખતે ૨૦-૨૦-૨૦ નિયમ પાળો: દર ૨૦ મિનિટે ૨૦ ફૂટ દૂર રહેલી વસ્તુ સામે ૨૦ સેકન્ડ જુઓ.'
  },
  {
    icon: '🚶',
    en: 'Take a gentle 10-15 minute walk after meals to prevent sudden blood sugar spikes and improve gut motility.',
    gu: 'જમ્યા પછી ૧૦-૧૫ મિનિટ ધીમું ચાલવાથી (શતપાવલી) બ્લડ સુગર નિયંત્રણમાં રહે છે અને ગેસ થતો નથી.'
  },
  {
    icon: '☀️',
    en: 'Get 10-15 minutes of early morning sunlight to trigger serotonin, strengthen bones, and sync your sleep cycle.',
    gu: 'સવારના કુમળા તડકામાં ૧૫ મિનિટ બેસવાથી વિટામિન D બને છે અને રાત્રે ગાઢ ઊંઘ માટે મેલાટોનિન નિયમિત થાય છે.'
  },
  {
    icon: '🫁',
    en: 'Whenever feeling stressed, take 5 slow deep breaths (inhale 4s, exhale 6s) to instantly calm the vagus nerve.',
    gu: 'જ્યારે પણ તણાવ લાગે ત્યારે ૫ ઊંડા શ્વાસ લો (૪ સેકન્ડ અંદર, ૬ સેકન્ડ બહાર); તે હૃદયના ધબકારા અને મગજને શાંત કરે છે.'
  },
  {
    icon: '🥗',
    en: 'Chew each bite of food 25-30 times; mindful chewing mixes digestive enzymes and prevents bloating.',
    gu: 'ખોરાકને હંમેશા ૨૫-૩૦ વખત ચાવીને ખાઓ; લાળમાં રહેલા એન્ઝાઇમ્સ પાચન સરળ બનાવે છે અને પેટ ફૂલતું અટકાવે છે.'
  },
  {
    icon: '🪑',
    en: 'Keep your spine straight, shoulders relaxed, and feet flat on the floor while sitting to avoid chronic back strain.',
    gu: 'બેસતી વખતે કમર સીધી, ખભા રિલેક્સ અને પગ જમીન પર સપાટ રાખો જેથી કમર અને ગરદનનો દુખાવો ન થાય.'
  },
  {
    icon: '🥥',
    en: 'Choose fresh coconut water, buttermilk, or lemon water over sugary sodas to maintain vital mineral balance.',
    gu: 'પેક્ડ કોલ્ડ્રિંક્સને બદલે છાશ, નાળિયેર પાણી કે લીંબુ શરબત પીવો જેથી શરીરમાં ઈલેક્ટ્રોલાઈટ અને હાઈડ્રેશન જળવાઈ રહે.'
  },
  {
    icon: '🌙',
    en: 'Keep smartphones and bright screens out of bed 45 minutes before sleep to protect natural melatonin production.',
    gu: 'સૂવાના ૪૫ મિનિટ પહેલા મોબાઈલ સ્ક્રીન બંધ કરી દો, જેથી આંખો અને મગજને ગાઢ ઊંઘ માટે કુદરતી સંકેત મળે.'
  },
  {
    icon: '🧘',
    en: 'Spend 5 minutes in silent gratitude or meditation every evening to reduce cortisol and reset your mindset.',
    gu: 'સાંજે કે રાત્રે ૫ મિનિટ શાંતિથી બેસી ધ્યાન કે પ્રાર્થના કરો; તેનાથી દિવસભરનો માનસિક થાક અને સ્ટ્રેસ દૂર થાય છે.'
  }
];

/* ==========================================================================
   Home Page UI Labels (English & Gujarati)
   ========================================================================== */
const HOME_UI_LABELS = {
  en: {
    tip_box_title: 'Health Tip of the Moment',
    tip_counter: (cur, tot) => `Tip ${cur} / ${tot}`,
    step1_badge: '🩺 Step 1: Health Assessment',
    step1_title: 'Do you have any health issues?',
    step1_desc: 'Select your health status below to see tailored daily guidance and your checklist:',
    step1_active: (name) => `Selected: ${name}`,
    step2_badge: "✅ Step 2: Today's Action Checklist",
    step2_title: "What You Need to Do Today",
    step2_desc: "Check the box for each task you have completed today:",
    completed_of: (done, total) => `${done} of ${total} Done`,
    all_done: '🎉 All Tasks Completed!',
    score_grade: (pct) => pct >= 85 ? '🌟 Excellent' : (pct >= 65 ? '✅ Good' : (pct >= 40 ? '⚠️ Fair' : '🛑 Needs Care')),
    footer_hint: '💡 Your daily score and recovery plan are calculated from this checklist.',
    btn_result: '📊 View Daily Result →',
    step3_badge: '📋 Step 3: Daily Health Prescription',
    pillar_eat_title: 'What to Eat',
    pillar_eat_sub: 'Beneficial nourishment for your body',
    pillar_avoid_title: 'What to Strictly Avoid',
    pillar_avoid_sub: 'Harmful triggers to eliminate',
    pillar_exercise_title: 'Exercise Routine',
    pillar_exercise_sub: 'Target daily physical activity',
    pillar_sleep_title: 'Sleep Target',
    pillar_sleep_sub: 'Restorative recovery goal',
    btn_add_task: 'Add Custom Task',
    modal_add_title: 'Add Custom Health Task',
    modal_edit_title: 'Edit Health Task',
    label_task_name: 'Task Name',
    label_task_tip: 'Health Benefit / Tip',
    label_task_icon: 'Choose an Icon',
    placeholder_name: 'e.g., Morning 20m Yoga, Drink Green Tea...',
    placeholder_tip: 'e.g., Promotes joint flexibility & stress relief',
    btn_save: 'Save Task',
    btn_cancel: 'Cancel',
    custom_badge: 'Custom',
    confirm_delete: 'Delete this custom task?'
  },
  gu: {
    tip_box_title: '💡 હેલ્થ ટીપ (Health Tip)',
    tip_counter: (cur, tot) => `ટીપ ${cur} / ${tot}`,
    step1_badge: '🩺 પગલું ૧: સ્વાસ્થ્ય તપાસ',
    step1_title: 'તમને કોઈ સ્વાસ્થ્ય સમસ્યા છે કે નહીં?',
    step1_desc: 'જો તમને કોઈ સમસ્યા હોય તો નીચેથી પસંદ કરો, અથવા સામાન્ય ફિટનેસ માટે "કોઈ સમસ્યા નથી" પસંદ કરો:',
    step1_active: (name) => `પસંદ કરેલ: ${name}`,
    step2_badge: '✅ પગલું ૨: તમારે આજે શું શું કરવાનું છે',
    step2_title: 'આજે તમારે શું કરવાનું છે (Daily Tasks)',
    step2_desc: 'તમે આજે જે કાર્ય પૂરું કર્યું હોય તેના પર ટીક (✓) કરો:',
    completed_of: (done, total) => `${done} / ${total} પૂર્ણ`,
    all_done: '🎉 તમામ કાર્યો પૂર્ણ!',
    score_grade: (pct) => pct >= 85 ? '🌟 ઉત્તમ' : (pct >= 65 ? '✅ સારું' : (pct >= 40 ? '⚠️ સામાન્ય' : '🛑 કાળજી જરૂરી')),
    footer_hint: '💡 આ ચેકલિસ્ટ પરથી તમારો દૈનિક હેલ્થ સ્કોર અને રિકવરી પ્લાન ગણાય છે.',
    btn_result: '📊 દૈનિક પરિણામ જુઓ →',
    step3_badge: '📋 પગલું ૩: દૈનિક માર્ગદર્શન (વિગતવાર)',
    pillar_eat_title: 'શું ખાવું (What to Eat)',
    pillar_eat_sub: 'શરીર માટે ફાયદાકારક આહાર',
    pillar_avoid_title: 'શું અવોઇડ કરવું (What to Avoid)',
    pillar_avoid_sub: 'હાનિકારક બાબતો જે ટાળવી જ જોઈએ',
    pillar_exercise_title: 'કસરત & મુવમેન્ટ (Exercise)',
    pillar_exercise_sub: 'દરરોજ કરવાની શારીરિક પ્રવૃત્તિ',
    pillar_sleep_title: 'ઊંઘનો સમય (Sleep Target)',
    pillar_sleep_sub: 'શરીરને રીચાર્જ કરવા આરામ',
    btn_add_task: 'નવું કાર્ય ઉમેરો',
    modal_add_title: 'નવું સ્વાસ્થ્ય કાર્ય ઉમેરો',
    modal_edit_title: 'કાર્ય સુધારો (Edit Task)',
    label_task_name: 'કાર્યનું નામ',
    label_task_tip: 'શા માટે કરવું? (લાભ)',
    label_task_icon: 'આઇકોન પસંદ કરો',
    placeholder_name: 'દા.ત., સવારે ૨૦ મિનિટ યોગ, ગ્રીન ટી...',
    placeholder_tip: 'દા.ત., સાંધાની લવચીકતા અને તણાવ ઘટાડે છે',
    btn_save: 'સેવ કરો',
    btn_cancel: 'રદ કરો',
    custom_badge: 'કસ્ટમ',
    confirm_delete: 'આ કસ્ટમ કાર્ય ડિલીટ કરવું છે?'
  }
};

/* ==========================================================================
   Home Page Minimal Health Concern & Action Checklist Hub
   Supports dynamic language switching (English default / Gujarati option)
   ========================================================================== */
function initHomePageHub() {
  const buttonsContainer = document.getElementById('home-problem-buttons');
  if (!buttonsContainer) return;

  const step1Badge = document.getElementById('home-step1-badge');
  const step1Title = document.getElementById('home-step1-title');
  const step1Desc = document.getElementById('home-step1-desc');
  const step1ActiveLabel = document.getElementById('home-step1-active-label');

  const step2Badge = document.getElementById('home-step2-badge');
  const step2Title = document.getElementById('home-step2-title');
  const step2Desc = document.getElementById('home-step2-desc');
  const footerHint = document.getElementById('home-footer-hint');
  const btnResult = document.getElementById('home-btn-result');

  const step3Badge = document.getElementById('home-guidance-tag');
  const titleEl = document.getElementById('home-condition-title');
  const descEl = document.getElementById('home-condition-desc');
  const eatTitle = document.getElementById('pillar-eat-title');
  const eatSub = document.getElementById('pillar-eat-sub');
  const avoidTitle = document.getElementById('pillar-avoid-title');
  const avoidSub = document.getElementById('pillar-avoid-sub');
  const exerciseTitle = document.getElementById('pillar-exercise-title');
  const exerciseSub = document.getElementById('pillar-exercise-sub');
  const sleepTitle = document.getElementById('pillar-sleep-title');
  const sleepSub = document.getElementById('pillar-sleep-sub');

  const eatList = document.getElementById('home-eat-list');
  const avoidList = document.getElementById('home-avoid-list');
  const exerciseList = document.getElementById('home-exercise-list');
  const sleepList = document.getElementById('home-sleep-list');
  const checkboxesContainer = document.getElementById('home-checkboxes-container');
  const progressChip = document.getElementById('home-checklist-progress');
  const homeRatioDonut = document.getElementById('home-ratio-donut');
  const homeRatioPct = document.getElementById('home-ratio-donut-pct');
  const homeRatioGrade = document.getElementById('home-ratio-grade');

  const todayKey = new Date().toISOString().slice(0, 10);
  let currentCondition = localStorage.getItem('gh_selected_condition') || 'general';

  function getCurrentLang() {
    return localStorage.getItem('gh_lang') || 'en';
  }

  // Bind problem buttons
  const buttons = buttonsContainer.querySelectorAll('.problem-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cond = btn.getAttribute('data-condition');
      if (!cond) return;
      currentCondition = cond;
      localStorage.setItem('gh_selected_condition', currentCondition);
      updateActiveButton();
      renderHomeConditionData();
      syncCompletionsForCondition(currentCondition);
    });
  });

  function updateActiveButton() {
    buttons.forEach(btn => {
      if (btn.getAttribute('data-condition') === currentCondition) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });
  }

  function updateButtonTexts(lang) {
    buttons.forEach(btn => {
      const cond = btn.getAttribute('data-condition');
      const data = HEALTH_CONDITIONS[cond];
      if (data) {
        const strong = btn.querySelector('strong');
        const span = btn.querySelector('span');
        if (strong) strong.textContent = data['btn_title_' + lang] || data.btn_title_en;
        if (span) span.textContent = data['btn_sub_' + lang] || data.btn_sub_en;
      }
    });
  }

  function getStorageKey(cond) {
    return `gh_ratio_${cond}_${todayKey}`;
  }

  function renderHomeConditionData() {
    const lang = getCurrentLang();
    const labels = HOME_UI_LABELS[lang] || HOME_UI_LABELS.en;
    const data = HEALTH_CONDITIONS[currentCondition] || HEALTH_CONDITIONS.general;

    // Update static UI text labels
    if (step1Badge) step1Badge.textContent = labels.step1_badge;
    if (step1Title) step1Title.textContent = labels.step1_title;
    if (step1Desc) step1Desc.textContent = labels.step1_desc;
    if (step1ActiveLabel) {
      const activeBtnTitle = data['btn_title_' + lang] || data.btn_title_en;
      step1ActiveLabel.textContent = labels.step1_active(`${data.icon} ${activeBtnTitle}`);
    }

    if (step2Badge) step2Badge.textContent = labels.step2_badge;
    if (step2Title) step2Title.textContent = labels.step2_title;
    if (step2Desc) step2Desc.textContent = labels.step2_desc;
    if (footerHint) footerHint.textContent = labels.footer_hint;
    if (btnResult) btnResult.textContent = labels.btn_result;

    if (step3Badge) step3Badge.textContent = labels.step3_badge;
    if (eatTitle) eatTitle.textContent = labels.pillar_eat_title;
    if (eatSub) eatSub.textContent = labels.pillar_eat_sub;
    if (avoidTitle) avoidTitle.textContent = labels.pillar_avoid_title;
    if (avoidSub) avoidSub.textContent = labels.pillar_avoid_sub;
    if (exerciseTitle) exerciseTitle.textContent = labels.pillar_exercise_title;
    if (exerciseSub) exerciseSub.textContent = labels.pillar_exercise_sub;
    if (sleepTitle) sleepTitle.textContent = labels.pillar_sleep_title;
    if (sleepSub) sleepSub.textContent = labels.pillar_sleep_sub;

    // Update button text in the chosen language
    updateButtonTexts(lang);

    // Active condition info
    const condTitle = data['title_' + lang] || data.title_en;
    const condDesc = data['desc_' + lang] || data.desc_en;
    if (titleEl) titleEl.textContent = `${data.icon} ${condTitle}`;
    if (descEl) descEl.textContent = condDesc;

    // 1. What to Eat
    if (eatList) {
      eatList.innerHTML = '';
      const items = data['eat_' + lang] || data.eat_en || [];
      items.forEach(text => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="bullet">✓</span> <span>${text}</span>`;
        eatList.appendChild(li);
      });
    }

    // 2. What to Strictly Avoid
    if (avoidList) {
      avoidList.innerHTML = '';
      const items = data['avoid_' + lang] || data.avoid_en || [];
      items.forEach(text => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="bullet">✗</span> <span>${text}</span>`;
        avoidList.appendChild(li);
      });
    }

    // 3. Exercise Routine
    if (exerciseList) {
      exerciseList.innerHTML = '';
      const items = data['exercise_' + lang] || data.exercise_en || [];
      items.forEach(text => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="bullet">🏃</span> <span>${text}</span>`;
        exerciseList.appendChild(li);
      });
    }

    // 4. Sleep Target
    if (sleepList) {
      sleepList.innerHTML = '';
      const items = data['sleep_' + lang] || data.sleep_en || [];
      items.forEach(text => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="bullet">🌙</span> <span>${text}</span>`;
        sleepList.appendChild(li);
      });
    }

    // 5. Checkboxes
    if (checkboxesContainer) {
      renderCheckboxes(currentCondition, data, lang, labels);
    }

    // 6. Update Add Task button text
    const addTaskBtn = document.getElementById('home-btn-add-task-text');
    if (addTaskBtn) addTaskBtn.textContent = labels.btn_add_task || 'Add Custom Task';
  }

  /* --- Custom Task Storage & Backend Sync --- */
  let cachedTasks = null;

  function getCustomTasks() {
    if (cachedTasks !== null) return cachedTasks;
    try {
      const local = JSON.parse(localStorage.getItem('gh_custom_tasks') || '[]').filter(t => t !== null && typeof t === 'object');
      cachedTasks = local;
      return local;
    } catch (e) {
      return [];
    }
  }

  function saveCustomTasks(tasks) {
    cachedTasks = tasks;
    localStorage.setItem('gh_custom_tasks', JSON.stringify(tasks));
  }

  // Load latest tasks and completions from MySQL backend on startup
  async function syncTasksWithBackend() {
    if (window.HealthAPI && window.HealthAPI.getTasks) {
      try {
        const backendTasks = await window.HealthAPI.getTasks('all');
        if (backendTasks && Array.isArray(backendTasks)) {
          saveCustomTasks(backendTasks);
        }
      } catch (err) {
        console.warn('[Sync]: Using local tasks fallback', err);
      }
    }

    await syncCompletionsForCondition(currentCondition);
    renderHomeConditionData();
  }

  async function syncCompletionsForCondition(cond) {
    if (window.HealthAPI && window.HealthAPI.getCompletions) {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const completions = await window.HealthAPI.getCompletions(cond, today);
        if (completions && Array.isArray(completions)) {
          const storageKey = getStorageKey(cond);
          let taskStates = {};
          try { taskStates = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch(e) {}
          completions.forEach(c => {
            taskStates[c.task_id] = c.status;
          });
          localStorage.setItem(storageKey, JSON.stringify(taskStates));
          renderHomeConditionData();
        }
      } catch (err) {
        console.warn('[Sync]: Could not sync completions from MySQL', err);
      }
    }
  }

  
  function renderCheckboxes(condKey, data, lang, labels) {
    checkboxesContainer.innerHTML = '';
    const allTasks = getCustomTasks().filter(t => !t.condition_key || t.condition_key === condKey);
    console.log('RENDER allTasks:', allTasks, 'condKey:', condKey);
    const storageKey = getStorageKey(condKey);
    let taskStates = {};
    try { taskStates = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch(e) {}
    
    const categories = [
      { key: 'food', title: '🥗 Diet & Food', color: '#10b981' },
      { key: 'exercise', title: '🏃 Exercise & Movement', color: '#f59e0b' },
      { key: 'mental', title: '🧘 Mental Well-Being', color: '#8b5cf6' },
      { key: 'sleep', title: '🌙 Sleep & Rest', color: '#3b82f6' },
      { key: 'habits', title: '✨ Daily Habits', color: '#ec4899' }
    ];

    function updateCounter() {
      const completed = allTasks.filter(t => taskStates[t.id] === 'done' || t.status === 'done').length;
      const total = allTasks.length || 1;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      if (progressChip) {
        progressChip.textContent = labels.completed_of(completed, total);
        if (completed === total && total > 0) {
          progressChip.style.background = '#15803d';
          progressChip.style.color = '#ffffff';
        } else {
          progressChip.style.background = '#dcfce7';
          progressChip.style.color = '#15803d';
        }
      }

      if (homeRatioDonut) {
        homeRatioDonut.style.background = `conic-gradient(#10b981 0% ${pct}%, #e2e8f0 ${pct}% 100%)`;
      }
      if (homeRatioPct) {
        homeRatioPct.textContent = `${pct}%`;
      }
    }

    if (allTasks.length === 0) {
      checkboxesContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No tasks configured for this condition.</p>';
      updateCounter();
      return;
    }

    
    let mappedTaskIds = new Set();
    
    categories.forEach(cat => {
      const catTasks = allTasks.filter(t => t.category === cat.key);
      if (catTasks.length === 0) return;
      
      catTasks.forEach(t => mappedTaskIds.add(t.id));

      const catSection = document.createElement('div');

      catSection.style.marginBottom = '1.5rem';
      
      const catHeader = document.createElement('h4');
      catHeader.textContent = cat.title;
      catHeader.style.fontSize = '1.05rem';
      catHeader.style.fontWeight = '700';
      catHeader.style.color = cat.color;
      catHeader.style.marginBottom = '0.75rem';
      catHeader.style.paddingBottom = '0.4rem';
      catHeader.style.borderBottom = '1px solid #e2e8f0';
      catSection.appendChild(catHeader);

      catTasks.forEach(task => {
        const isDone = (taskStates[task.id] === 'done') || (task.status === 'done');
        if (isDone && taskStates[task.id] !== 'done') taskStates[task.id] = 'done';
        
        const taskName = task['name_' + lang] || task.name_en || task.name;
        const taskTip = task['tip_' + lang] || task.tip_en || task.tip;
        const isCustom = task.user_id !== null && task.user_id !== undefined; // not preset

        const row = document.createElement('label');
        row.className = `home-check-row ${isDone ? 'checked' : ''}`;
        row.setAttribute('for', `home-task-${task.id}`);

        const customBadgeHtml = isCustom
          ? `<span class="task-custom-badge">${labels.custom_badge || 'Custom'}</span>`
          : '';

        const actionBtnsHtml = isCustom
          ? `<div class="task-actions-wrap">
               <button type="button" class="task-action-btn edit-task-btn" data-task-id="${task.id}" title="Edit">✏️</button>
               <button type="button" class="task-action-btn del-task-btn" data-task-id="${task.id}" title="Delete">🗑️</button>
             </div>`
          : '';

        row.innerHTML = `
          <input type="checkbox" id="home-task-${task.id}" class="home-check-box" ${isDone ? 'checked' : ''}>
          <span class="custom-check-box"></span>
          <div class="home-check-text">
            <span class="home-check-title">${task.icon || '📝'} ${taskName} ${customBadgeHtml}</span>
            ${taskTip ? `<span class="home-check-sub">${taskTip}</span>` : ''}
          </div>
          ${actionBtnsHtml}
        `;

        // Handle toggle
        const cb = row.querySelector('.home-check-box');
        cb.addEventListener('change', (e) => {
          e.stopPropagation();
          const newStatus = cb.checked ? 'done' : 'pending';
          taskStates[task.id] = newStatus;
          row.classList.toggle('checked', cb.checked);
          localStorage.setItem(storageKey, JSON.stringify(taskStates));
          updateCounter();

          if (window.HealthAPI && window.HealthAPI.toggleCompletion) {
            const today = new Date().toISOString().slice(0, 10);
            window.HealthAPI.toggleCompletion(task.id, newStatus, condKey, today, task.category || 'general').then(() => {
              if (window.refreshHealthCalendar) window.refreshHealthCalendar();
            });
          }
        });

        if (isCustom) {
          const editBtn = row.querySelector('.edit-task-btn');
          const delBtn = row.querySelector('.del-task-btn');
          if (editBtn) {
            editBtn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (typeof openTaskModal === 'function') openTaskModal(task.id);
            });
          }
          if (delBtn) {
            delBtn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (confirm(labels.confirm_delete || 'Are you sure you want to delete this custom task?')) {
                let currentTasks = getCustomTasks();
                currentTasks = currentTasks.filter(t => t.id !== task.id);
                saveCustomTasks(currentTasks);
                if (window.HealthAPI && window.HealthAPI.deleteTask) {
                  window.HealthAPI.deleteTask(task.id);
                }
                renderHomeConditionData();
              }
            });
          }
        }

        catSection.appendChild(row);
      });
      
      checkboxesContainer.appendChild(catSection);
    });

    const unmappedTasks = allTasks.filter(t => !mappedTaskIds.has(t.id));
    if (unmappedTasks.length > 0) {
      const catSection = document.createElement('div');
      catSection.style.marginBottom = '1.5rem';
      const catHeader = document.createElement('h4');
      catHeader.textContent = '📦 Other Tasks';
      catHeader.style.fontSize = '1.05rem';
      catHeader.style.fontWeight = '700';
      catHeader.style.color = '#64748b';
      catHeader.style.marginBottom = '0.75rem';
      catHeader.style.paddingBottom = '0.4rem';
      catHeader.style.borderBottom = '1px solid #e2e8f0';
      catSection.appendChild(catHeader);

      unmappedTasks.forEach(task => {
        const isDone = (taskStates[task.id] === 'done') || (task.status === 'done');
        if (isDone && taskStates[task.id] !== 'done') taskStates[task.id] = 'done';
        
        const taskName = task['name_' + lang] || task.name_en || task.name;
        const taskTip = task['tip_' + lang] || task.tip_en || task.tip;
        const isCustom = task.user_id !== null && task.user_id !== undefined;

        const row = document.createElement('label');
        row.className = `home-check-row ${isDone ? 'checked' : ''}`;
        row.setAttribute('for', `home-task-${task.id}`);

        const customBadgeHtml = isCustom ? `<span class="task-custom-badge">${labels.custom_badge || 'Custom'}</span>` : '';
        const actionBtnsHtml = isCustom ? `<div class="task-actions-wrap">
               <button type="button" class="task-action-btn edit-task-btn" data-task-id="${task.id}" title="Edit">✏️</button>
               <button type="button" class="task-action-btn del-task-btn" data-task-id="${task.id}" title="Delete">🗑️</button>
             </div>` : '';

        row.innerHTML = `
          <input type="checkbox" id="home-task-${task.id}" class="home-check-box" ${isDone ? 'checked' : ''}>
          <span class="custom-check-box"></span>
          <div class="home-check-text">
            <span class="home-check-title">${task.icon || '📝'} ${taskName} ${customBadgeHtml}</span>
            ${taskTip ? `<span class="home-check-sub">${taskTip}</span>` : ''}
          </div>
          ${actionBtnsHtml}
        `;

        const cb = row.querySelector('.home-check-box');
        cb.addEventListener('change', (e) => {
          e.stopPropagation();
          const newStatus = cb.checked ? 'done' : 'pending';
          taskStates[task.id] = newStatus;
          row.classList.toggle('checked', cb.checked);
          localStorage.setItem(storageKey, JSON.stringify(taskStates));
          updateCounter();
          if (window.HealthAPI && window.HealthAPI.toggleCompletion) {
            window.HealthAPI.toggleCompletion(task.id, newStatus, condKey, new Date().toISOString().slice(0, 10), task.category || 'general').then(() => {
              if (window.refreshHealthCalendar) window.refreshHealthCalendar();
            });
          }
        });

        if (isCustom) {
          const editBtn = row.querySelector('.edit-task-btn');
          const delBtn = row.querySelector('.del-task-btn');
          if (editBtn) editBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (typeof openTaskModal === 'function') openTaskModal(task.id); });
          if (delBtn) delBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); 
            let currentTasks = getCustomTasks(); currentTasks = currentTasks.filter(t => t.id !== task.id); saveCustomTasks(currentTasks);
            if (window.HealthAPI && window.HealthAPI.deleteTask) window.HealthAPI.deleteTask(task.id); renderHomeConditionData();
          });
        }
        catSection.appendChild(row);
      });
      checkboxesContainer.appendChild(catSection);
    }


    updateCounter();
  }


  /* ===== Task Modal Controller (Create & Update) ===== */
  const taskModal = document.getElementById('task-modal');
  const taskForm = document.getElementById('task-form');
  const taskEditId = document.getElementById('task-edit-id');
  const taskInputTitle = document.getElementById('task-input-title');
  const taskInputTip = document.getElementById('task-input-tip');
  const taskSelectedIcon = document.getElementById('task-selected-icon');
  const taskModalTitle = document.getElementById('task-modal-title');
  const taskModalBadgeIcon = document.getElementById('task-modal-badge-icon');
  const taskLabelTitle = document.getElementById('task-label-title');
  const taskLabelTip = document.getElementById('task-label-tip');
  const taskLabelIcon = document.getElementById('task-label-icon');
  const taskModalSubmitBtn = document.getElementById('task-modal-submit');
  const taskModalCancelBtn = document.getElementById('task-modal-cancel');
  const taskModalCloseBtn = document.getElementById('task-modal-close');
  const taskIconPicker = document.getElementById('task-icon-picker');
  const addTaskBtn = document.getElementById('home-btn-add-task');

  function openTaskModal(editId) {
    if (!taskModal) return;
    const lang = getCurrentLang();
    const labels = HOME_UI_LABELS[lang] || HOME_UI_LABELS.en;

    // Update labels
    if (taskLabelTitle) taskLabelTitle.textContent = labels.label_task_name || 'Task Name';
    if (taskLabelTip) taskLabelTip.textContent = labels.label_task_tip || 'Health Benefit / Tip';
    if (taskLabelIcon) taskLabelIcon.textContent = labels.label_task_icon || 'Choose an Icon';
    if (taskInputTitle) taskInputTitle.placeholder = labels.placeholder_name || '';
    if (taskInputTip) taskInputTip.placeholder = labels.placeholder_tip || '';
    if (taskModalSubmitBtn) taskModalSubmitBtn.textContent = labels.btn_save || 'Save Task';
    if (taskModalCancelBtn) taskModalCancelBtn.textContent = labels.btn_cancel || 'Cancel';

    if (editId) {
      // EDIT mode
      const customTasks = getCustomTasks();
      const found = customTasks.find(t => t.id === editId);
      if (found) {
        if (taskModalTitle) taskModalTitle.textContent = labels.modal_edit_title || 'Edit Health Task';
        if (taskModalBadgeIcon) taskModalBadgeIcon.textContent = '✏️';
        if (taskEditId) taskEditId.value = found.id;
        if (taskInputTitle) taskInputTitle.value = found.name;
        if (taskInputTip) taskInputTip.value = found.tip || '';
        const catInput = document.getElementById('task-input-category');
        if (catInput && found.category) catInput.value = found.category;
        if (taskSelectedIcon) taskSelectedIcon.value = found.icon || '📝';
        setActiveIcon(found.icon || '📝');
      }
    } else {
      // CREATE mode
      if (taskModalTitle) taskModalTitle.textContent = labels.modal_add_title || 'Add Custom Health Task';
      if (taskModalBadgeIcon) taskModalBadgeIcon.textContent = '📝';
      if (taskEditId) taskEditId.value = '';
      if (taskInputTitle) taskInputTitle.value = '';
      if (taskInputTip) taskInputTip.value = '';
      const catInput = document.getElementById('task-input-category');
      if (catInput) catInput.value = 'food';
      if (taskSelectedIcon) taskSelectedIcon.value = '📝';
      setActiveIcon('📝');
    }

    taskModal.style.display = 'flex';
    if (taskInputTitle) taskInputTitle.focus();
  }

  function closeTaskModal() {
    if (!taskModal) return;
    taskModal.style.display = 'none';
    if (taskForm) taskForm.reset();
    if (taskEditId) taskEditId.value = '';
  }

  function setActiveIcon(icon) {
    if (!taskIconPicker) return;
    const opts = taskIconPicker.querySelectorAll('.icon-opt');
    opts.forEach(opt => {
      if (opt.getAttribute('data-icon') === icon) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  // Icon picker click
  if (taskIconPicker) {
    taskIconPicker.addEventListener('click', (e) => {
      const btn = e.target.closest('.icon-opt');
      if (!btn) return;
      const icon = btn.getAttribute('data-icon');
      if (taskSelectedIcon) taskSelectedIcon.value = icon;
      setActiveIcon(icon);
    });
  }

  // Add Task button
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => openTaskModal(null));
  }

  // Cancel & Close
  if (taskModalCancelBtn) taskModalCancelBtn.addEventListener('click', closeTaskModal);
  if (taskModalCloseBtn) taskModalCloseBtn.addEventListener('click', closeTaskModal);

  // Close on backdrop click
  if (taskModal) {
    taskModal.addEventListener('click', (e) => {
      if (e.target === taskModal) closeTaskModal();
    });
  }

  // Form submit: Create or Update
  if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = (taskInputTitle ? taskInputTitle.value.trim() : '');
      if (!title) return;
      const tip = (taskInputTip ? taskInputTip.value.trim() : '');
      const catInput = document.getElementById('task-input-category');
      const category = catInput ? catInput.value : 'general';
      const icon = (taskSelectedIcon ? taskSelectedIcon.value : '📝');
      const editingId = (taskEditId ? taskEditId.value : '');

      let customTasks = getCustomTasks();

      if (editingId) {
        // UPDATE existing
        customTasks = customTasks.map(t => {
          if (t.id === editingId) {
            return { ...t, name: title, tip: tip, icon: icon, category: category };
          }
          return t;
        });
        if (window.HealthAPI && window.HealthAPI.updateTask) {
          window.HealthAPI.updateTask(editingId, { name: title, tip: tip, icon: icon, category: category });
        }
      } else {
        // CREATE new
        const newId = 'custom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        const newTask = { id: newId, name: title, tip: tip, icon: icon, condition_key: currentCondition, category: category, user_id: 1 };
        customTasks.push(newTask);
        if (window.HealthAPI && window.HealthAPI.createTask) {
          window.HealthAPI.createTask({ name: title, tip: tip, icon: icon, conditionKey: currentCondition, category: category });
        }
      }

      saveCustomTasks(customTasks);
      closeTaskModal();
      renderHomeConditionData();
    });
  }

  // Listen for language changes from navbar
  window.addEventListener('gh_lang_changed', () => {
    renderHomeConditionData();
  });

  // Initial load
  updateActiveButton();
  renderHomeConditionData();
  syncTasksWithBackend();
}

/* ==========================================================================
   Rotating Daily Health Tips Controller
   Auto-rotates every 7 seconds, supports Prev/Next buttons & Gujarati/English
   ========================================================================== */
function initDailyTipsBox() {
  const box = document.getElementById('daily-tips-box');
  if (!box) return;

  const badgeTitle = document.getElementById('tip-badge-title');
  const tipBodyIcon = document.getElementById('tip-body-icon');
  const tipText = document.getElementById('tip-text-content');
  const tipCounter = document.getElementById('tip-counter');
  const btnPrev = document.getElementById('tip-prev-btn');
  const btnNext = document.getElementById('tip-next-btn');

  let currentTipIndex = 0;
  let autoRotateTimer = null;

  function getCurrentLang() {
    return localStorage.getItem('gh_lang') || 'en';
  }

  function renderTip(animate = true) {
    const lang = getCurrentLang();
    const labels = HOME_UI_LABELS[lang] || HOME_UI_LABELS.en;
    const tip = DAILY_HEALTH_TIPS[currentTipIndex];
    if (!tip) return;

    if (badgeTitle && labels.tip_box_title) {
      badgeTitle.textContent = labels.tip_box_title;
    }
    if (tipCounter && labels.tip_counter) {
      tipCounter.textContent = labels.tip_counter(currentTipIndex + 1, DAILY_HEALTH_TIPS.length);
    }

    const tipContent = tip[lang] || tip.en;

    if (animate && tipText) {
      tipText.classList.add('fade-out');
      setTimeout(() => {
        if (tipBodyIcon) tipBodyIcon.textContent = tip.icon;
        if (tipText) {
          tipText.textContent = tipContent;
          tipText.classList.remove('fade-out');
          tipText.classList.add('fade-in');
          setTimeout(() => {
            if (tipText) tipText.classList.remove('fade-in');
          }, 250);
        }
      }, 180);
    } else {
      if (tipBodyIcon) tipBodyIcon.textContent = tip.icon;
      if (tipText) tipText.textContent = tipContent;
    }
  }

  function nextTip() {
    currentTipIndex = (currentTipIndex + 1) % DAILY_HEALTH_TIPS.length;
    renderTip(true);
    resetAutoRotate();
  }

  function prevTip() {
    currentTipIndex = (currentTipIndex - 1 + DAILY_HEALTH_TIPS.length) % DAILY_HEALTH_TIPS.length;
    renderTip(true);
    resetAutoRotate();
  }

  function resetAutoRotate() {
    if (autoRotateTimer) clearInterval(autoRotateTimer);
    autoRotateTimer = setInterval(nextTip, 7000);
  }

  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      nextTip();
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      e.preventDefault();
      prevTip();
    });
  }

  window.addEventListener('gh_lang_changed', () => {
    renderTip(false);
  });

  // Initial render & timer
  renderTip(false);
  resetAutoRotate();
}

let activeConditionKey = 'general';

function initTopRatioTracker() {
  const container = document.getElementById('top-ratio-tracker');
  if (!container) return;

  const donut = document.getElementById('ratio-donut');
  const centerPct = document.getElementById('ratio-center-pct');
  const badgeDone = document.getElementById('ratio-badge-done');
  const badgeSkip = document.getElementById('ratio-badge-skip');
  const badgePending = document.getElementById('ratio-badge-pending');
  const listContainer = document.getElementById('ratio-tasks-container');
  const conditionSelect = document.getElementById('ratio-condition-select');
  const reportContainer = document.getElementById('daily-result-report');

  const todayKey = new Date().toISOString().slice(0, 10);

  // Retrieve saved condition
  activeConditionKey = localStorage.getItem('gh_selected_condition') || 'general';
  if (conditionSelect) {
    conditionSelect.value = activeConditionKey;
    conditionSelect.addEventListener('change', (e) => {
      activeConditionKey = e.target.value;
      localStorage.setItem('gh_selected_condition', activeConditionKey);
      syncWithAssessmentSection(activeConditionKey);
      renderConditionRatio();
    });
  }

  function getStorageKey() {
    return `gh_ratio_${activeConditionKey}_${todayKey}`;
  }

  function getTaskStates() {
    return JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
  }

  function renderConditionRatio() {
    const condition = HEALTH_CONDITIONS[activeConditionKey] || HEALTH_CONDITIONS.general;
    const tasks = condition.ratioTasks || [];
    let taskStates = getTaskStates();

    if (conditionSelect) conditionSelect.value = activeConditionKey;

    if (!listContainer) return;
    listContainer.innerHTML = '';

    tasks.forEach(task => {
      const state = taskStates[task.id] || 'pending';
      const isDo = task.type === 'do';
      const row = document.createElement('div');
      row.className = `ratio-task-row status-${state}`;
      row.innerHTML = `
        <div class="ratio-task-main-content">
          <div class="ratio-task-top-line">
            <div class="ratio-task-title-wrap">
              <span class="task-icon">${task.icon}</span>
              <span>${task.name}</span>
            </div>
          </div>
          <p class="ratio-task-tip-text">${task.tip || ''}</p>
        </div>
        <div class="ratio-task-btns">
          <button type="button" class="btn-ratio-toggle ${state === 'done' ? 'active-done' : ''}" data-task="${task.id}" data-action="done" title="${isDo ? 'Completed this action today' : 'Successfully avoided this today'}">
            <span>✓</span> <span>${isDo ? 'Done' : 'Avoided'}</span>
          </button>
          <button type="button" class="btn-ratio-toggle ${state === 'skip' ? 'active-skip' : ''}" data-task="${task.id}" data-action="skip" title="${isDo ? 'Skipped this action today' : 'Cheated on this item today'}">
            <span>✗</span> <span>${isDo ? 'Skipped' : 'Cheated'}</span>
          </button>
        </div>
      `;

      const doneBtn = row.querySelector('[data-action="done"]');
      const skipBtn = row.querySelector('[data-action="skip"]');

      doneBtn.addEventListener('click', () => {
        taskStates[task.id] = (taskStates[task.id] === 'done') ? 'pending' : 'done';
        localStorage.setItem(getStorageKey(), JSON.stringify(taskStates));
        renderConditionRatio();
      });

      skipBtn.addEventListener('click', () => {
        taskStates[task.id] = (taskStates[task.id] === 'skip') ? 'pending' : 'skip';
        localStorage.setItem(getStorageKey(), JSON.stringify(taskStates));
        renderConditionRatio();
      });

      listContainer.appendChild(row);
    });

    updateRatioVisuals(tasks, taskStates);
    renderDailyReport(condition, tasks, taskStates);
  }

  function updateRatioVisuals(tasks, taskStates) {
    const total = tasks.length || 6;
    let doneCount = 0;
    let skipCount = 0;

    tasks.forEach(t => {
      const st = taskStates[t.id] || 'pending';
      if (st === 'done') doneCount++;
      if (st === 'skip') skipCount++;
    });

    const pendingCount = total - doneCount - skipCount;
    const donePct = Math.round((doneCount / total) * 100);
    const skipPct = Math.round((skipCount / total) * 100);

    if (donut) {
      donut.style.background = `conic-gradient(
        #10b981 0% ${donePct}%,
        #ef4444 ${donePct}% ${donePct + skipPct}%,
        #e2e8f0 ${donePct + skipPct}% 100%
      )`;
    }

    if (centerPct) centerPct.textContent = `${donePct}%`;
    if (badgeDone) badgeDone.textContent = `🟢 ${doneCount} Done (${donePct}%)`;
    if (badgeSkip) badgeSkip.textContent = `🔴 ${skipCount} Skipped (${skipPct}%)`;
    if (badgePending) badgePending.textContent = `⚪ ${pendingCount} Pending`;

    const ctaLink = document.getElementById('ratio-cta-link');
    if (ctaLink) {
      if (doneCount + skipCount === 0) {
        ctaLink.innerHTML = `<span>📊 View Daily Result & Recovery Plan (Awaiting Today's Log) →</span>`;
      } else {
        ctaLink.innerHTML = `<span>📊 View Full Daily Result & Recovery Plan (${donePct}% Score • ${skipCount} Extra Action${skipCount === 1 ? '' : 's'} Needed) →</span>`;
      }
    }
  }

  function renderDailyReport(condition, tasks, taskStates) {
    if (!reportContainer) return;

    const total = tasks.length || 6;
    let doneCount = 0;
    let skipCount = 0;
    const completedItems = [];
    const skippedItems = [];

    tasks.forEach(t => {
      const st = taskStates[t.id] || 'pending';
      if (st === 'done') {
        doneCount++;
        completedItems.push(t);
      } else if (st === 'skip') {
        skipCount++;
        skippedItems.push(t);
      }
    });

    const donePct = Math.round((doneCount / total) * 100);
    
    // Calculate grade
    let gradeLabel = 'Pending Review';
    let gradeClass = 'grade-needs-work';
    if (doneCount + skipCount === 0) {
      gradeLabel = 'Awaiting Today\'s Log';
      gradeClass = 'grade-good';
    } else if (donePct >= 85) {
      gradeLabel = '🌟 Grade A+ (Outstanding Control)';
      gradeClass = 'grade-excellent';
    } else if (donePct >= 65) {
      gradeLabel = '✅ Grade A (Good Progress)';
      gradeClass = 'grade-good';
    } else if (donePct >= 40) {
      gradeLabel = '⚠️ Grade B (Needs Attention)';
      gradeClass = 'grade-good';
    } else {
      gradeLabel = '🛑 Grade C (High Risk / Cheated)';
      gradeClass = 'grade-needs-work';
    }

    let successHtml = completedItems.length > 0 
      ? completedItems.map(i => `<li><strong>${i.icon} ${i.name}:</strong> ${i.tip}</li>`).join('')
      : '<li>No tasks or avoidances completed yet today. Start by taking action above!</li>';

    let warningHtml = skippedItems.length > 0 
      ? skippedItems.map(i => `<li><strong>⚠️ ${i.name}:</strong> Skipping this directly aggravates your ${condition.title.split('(')[0].trim()}.</li>`).join('')
      : '<li>🎉 Fantastic discipline! No habits skipped or prohibited items violated so far.</li>';

    reportContainer.innerHTML = `
      <div class="daily-result-header">
        <div class="daily-result-title">
          <span>📊</span>
          <span>Daily Health Result & Evaluation (${condition.title.split('(')[0].trim()})</span>
        </div>
        <div class="grade-badge ${gradeClass}">${gradeLabel} - ${donePct}%</div>
      </div>

      <div class="daily-feedback-grid">
        <div class="feedback-box feedback-box-success">
          <h5><span>✓</span> Positive Discipline Accomplished (${completedItems.length}/${total}):</h5>
          <ul style="padding-left: 1rem; margin: 0;">${successHtml}</ul>
        </div>

        <div class="feedback-box feedback-box-warning">
          <h5><span>⚠</span> Skipped / Cheated Avoidances (${skippedItems.length}/${total}):</h5>
          <ul style="padding-left: 1rem; margin: 0;">${warningHtml}</ul>
        </div>

        <div class="feedback-box feedback-box-tip">
          <strong>💡 Tomorrow's Doctor Recommendation for ${condition.title.split('(')[0].trim()}:</strong>
          ${condition.desc} Focus on maintaining your avoidances consistently—avoiding trigger foods is 80% of healing.
        </div>
      </div>
    `;
  }

  // Global listener for condition changes from the lower assessment section
  window.switchGlobalCondition = function(newKey) {
    activeConditionKey = newKey;
    if (conditionSelect) conditionSelect.value = newKey;
    renderConditionRatio();
  };

  renderConditionRatio();
}

function syncWithAssessmentSection(conditionKey) {
  const buttons = document.querySelectorAll('.condition-btn');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-condition') === conditionKey);
  });
  if (typeof window.renderAssessmentCondition === 'function') {
    window.renderAssessmentCondition(conditionKey);
  }
}

/* ==========================================================================
   8. Personalized Health Assessment & Condition Adviser
   ========================================================================== */
function initPersonalizedHealthAdviser() {
  const container = document.getElementById('personalized-health-adviser');
  if (!container) return;

  const buttons = container.querySelectorAll('.condition-btn');
  const titleElem = document.getElementById('prescript-condition-title');
  const descElem = document.getElementById('prescript-condition-desc');
  const dietList = document.getElementById('prescript-diet-list');
  const exerciseList = document.getElementById('prescript-exercise-list');
  const sleepList = document.getElementById('prescript-sleep-list');
  const routineList = document.getElementById('prescript-routine-list');

  window.renderAssessmentCondition = function(conditionKey) {
    const data = HEALTH_CONDITIONS[conditionKey] || HEALTH_CONDITIONS.general;

    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-condition') === conditionKey);
    });

    if (titleElem) titleElem.innerHTML = `${data.icon} ${data.title}`;
    if (descElem) descElem.textContent = data.desc;

    if (dietList) {
      dietList.innerHTML = data.diet.map(item => `<li><span class="bullet">✓</span> <span>${item}</span></li>`).join('');
    }
    if (exerciseList) {
      exerciseList.innerHTML = data.exercise.map(item => `<li><span class="bullet">✓</span> <span>${item}</span></li>`).join('');
    }
    if (sleepList) {
      sleepList.innerHTML = data.sleep.map(item => `<li><span class="bullet">✓</span> <span>${item}</span></li>`).join('');
    }
    if (routineList) {
      routineList.innerHTML = data.routine.map(item => `<li><span class="bullet">✓</span> <span>${item}</span></li>`).join('');
    }
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-condition');
      localStorage.setItem('gh_selected_condition', key);
      window.renderAssessmentCondition(key);
      if (typeof window.switchGlobalCondition === 'function') {
        window.switchGlobalCondition(key);
      }
    });
  });

  const saved = localStorage.getItem('gh_selected_condition') || 'general';
  window.renderAssessmentCondition(saved);
}

/* ==========================================================================
   9. Compensatory Actions Dictionary (હવે વધારાનું શું કરવું પડશે)
   ========================================================================== */
const COMPENSATORY_ACTIONS = {
  // General Health
  water: {
    title: "Immediate Rehydration Protocol (તાત્કાલિક હાઇડ્રેશન)",
    desc: "Drink 2 large glasses (500ml) of lukewarm water right now. Place a 1-liter water bottle directly on your work desk and set a recurring 45-minute drink timer.",
    gujarati: "હમણાં જ ૨ મોટા ગ્લાસ નવશેકું પાણી પીવો અને ટેબલ પર બોટલ રાખી દર ૪૫ મિનિટે પાણી પીઓ.",
    urgency: "urgent",
    icon: "💧"
  },
  walk: {
    title: "Evening 20-Minute Recovery Stroll & Calisthenics (સાંજનું વોકિંગ)",
    desc: "Make up for missed activity: Take a 20-minute brisk walk after dinner, or do 2 sets of 15 chair squats and 20 calf raises right now.",
    gujarati: "રાત્રિ ભોજન પછી ૨૦ મિનિટ ઝડપી ચાલવું અથવા હમણાં જ ૧૫-૧૫ બેઠક (Chair Squats) કરો.",
    urgency: "vital",
    icon: "🚶"
  },
  diet: {
    title: "Fiber & Micronutrient Compensation (ફાઇબર બેલેન્સ)",
    desc: "Add a raw cucumber, tomato, or carrot salad to your next meal. Sip a glass of warm lemon water or take an apple as an evening snack.",
    gujarati: "આજના ભોજનમાં કાકડી/ટામેટાનું કાચું સલાડ ઉમેરો અથવા સાંજે લીંબુ પાણી સાથે સફરજન ખાઓ.",
    urgency: "recovery",
    icon: "🥗"
  },
  avoid_junk: {
    title: "Digestive Detox & Anti-Inflammatory Flush (ડિટોક્સ અને પાચન રક્ષણ)",
    desc: "You consumed deep-fried/junk food: Drink a warm cup of ginger or cumin (jeera) water to stimulate bile flow. Keep tonight's dinner strictly light (steamed soup or khichdi) and do not lie down for 2.5 hours.",
    gujarati: "તળેલું કે જંકફૂડ ખવાઈ ગયું છે: અડધી ચમચી જીરું ઉકાળીને પીવો, રાત્રે સાવ હળવો ખોરાક લો અને ૨.૫ કલાક સુધી સૂવું નહીં.",
    urgency: "urgent",
    icon: "🍵"
  },
  avoid_soda: {
    title: "Blood Sugar Balancing & Calorie Burn (શુગર સ્પાઇક ઘટાડવો)",
    desc: "Sodas deliver concentrated fructose that stresses the liver: Do a 15-minute brisk walk immediately to utilize circulating glucose. Drink 2 extra glasses of plain water to accelerate clearance.",
    gujarati: "ગળ્યા પીણાથી શુગર વધી શકે છે: તરત ૧૫ મિનિટ ચાલો અને વધારાનું ૨ ગ્લાસ સાદું પાણી પીવો.",
    urgency: "urgent",
    icon: "🛑"
  },
  avoid_screen: {
    title: "Melatonin Reset & Screen Blackout (સ્ક્રીન ડિટોક્સ અને શાંત ઊંઘ)",
    desc: "Late-night screen light suppresses sleep melatonin: Shut down phones and laptops at 9:30 PM tonight. Read 5 pages of a physical book or listen to calming nature sounds in dim light.",
    gujarati: "મોબાઇલ સ્ક્રીન ઊંઘ બગાડે છે: આજે રાત્રે ૯:૩૦ વાગ્યે ફોન સાઇલન્ટ કરી દૂર મૂકી દો અને હળવું પુસ્તક વાંચો.",
    urgency: "vital",
    icon: "📵"
  },

  // Digestion & Acidity
  fennel_water: {
    title: "Herbal Digestive Infusion (વરિયાળી અને જીરું પાણી)",
    desc: "Boil 1 teaspoon fennel (saunf) and 1/2 teaspoon cumin (jeera) in 2 cups of water for 3 minutes. Strain and sip warm to relax stomach spasms and eliminate gas.",
    gujarati: "૧ ચમચી વરિયાળી અને અડધી ચમચી જીરું પાણીમાં ઉકાળીને નવશેકું પીવો, ગેસ અને આફરો તરત શાંત થશે.",
    urgency: "urgent",
    icon: "🫖"
  },
  vajrasana: {
    title: "Post-Meal Bloodflow Stimulation (વજ્રાસન અથવા હળવું ચાલવું)",
    desc: "Sit in Vajrasana on a firm mat for 7 to 10 minutes right now, or walk at a gentle leisurely pace for 15 minutes. Avoid slouching on a soft sofa.",
    gujarati: "જમ્યા પછી સોફા પર પડ્યા રહેવાને બદલે ૭ થી ૧૦ મિનિટ વજ્રાસનમાં બેસો અથવા ધીમે ધીમે ચાલો.",
    urgency: "vital",
    icon: "🧘"
  },
  chew_slow: {
    title: "Mindful Salivary Digestion for Next Meal (ખોરાક ચાવીને ખાવો)",
    desc: "Rapid swallowing overburdened your stomach acid: At your next meal, put your spoon down between bites and chew each mouthful a minimum of 25 times.",
    gujarati: "ખોરાક ઝડપથી ગળી જવાથી એસિડિટી થાય છે: હવે પછીના ભોજનમાં દરેક કોળિયો ૨૫ થી ૩૦ વખત ચાવો.",
    urgency: "recovery",
    icon: "🥢"
  },
  avoid_fried: {
    title: "Acid Reflux Neutralization (એસિડિટી શમન ઉપાય)",
    desc: "Fried oils relax the esophageal valve: Drink half a cup of cold milk or fresh buttermilk with roasted cumin powder. Elevate your pillow head by 4 inches tonight.",
    gujarati: "તળેલા ખોરાકથી એસિડિટી થાય: અડધો કપ ઠંડું દૂધ અથવા જીરું છાંટેલી છાશ પીવો અને માથું થોડું ઊંચું રાખીને સૂવું.",
    urgency: "urgent",
    icon: "🥛"
  },
  avoid_lie_down: {
    title: "Upright Gravity Positioning (સીધા બેસવું / ઊભા રહેવું)",
    desc: "Lying flat within 2 hours of eating causes painful gastric acid backflow: Stand up or sit upright in a straight-backed chair for the next 45 minutes.",
    gujarati: "જમ્યા પછી તરત સૂવાથી એસિડ ઉપર ચડે છે: ઓછામાં ઓછી ૪૫ મિનિટ સીધા બેસો અથવા ઘરની અંદર હળવા ડગલાં ભરો.",
    urgency: "urgent",
    icon: "🛋️"
  },
  avoid_cold_drinks: {
    title: "Digestive Fire (Agni) Restoration (પાચક અગ્નિ પ્રદીપ્ત કરવો)",
    desc: "Icy drinks freeze digestive enzymes: Sip a warm cup of hot water with a slice of fresh ginger and a pinch of black salt to restore gastric digestive power.",
    gujarati: "ઠંડા પીણાં પાચન ધીમું પાડે છે: નવશેકા પાણીમાં આદુનો ટુકડો અને સંચળ નાખીને ગૂંટડે ગૂંટડે પીવો.",
    urgency: "recovery",
    icon: "☕"
  },

  // Weight Management
  brisk_walk: {
    title: "Emergency Metabolic Kickstart (કેલરી બર્ન અને કસરત)",
    desc: "Perform 15 minutes of brisk outdoor walking or stationary marching, followed by 3 sets of 10 wall push-ups and 15 air squats before dinner.",
    gujarati: "આજની કસરત ચૂકી ગયા: ૧૫ મિનિટ ઝડપી ચાલો અને ૧૫-૧૫ બેઠક (Air Squats) લગાવો.",
    urgency: "vital",
    icon: "🏃"
  },
  water_pre_meal: {
    title: "Pre-Meal Appetite Regulation (ભોજન પહેલાં પાણી)",
    desc: "Drink 300ml of room-temperature water 20 minutes before your next meal to naturally curb portion sizes and prevent binge eating.",
    gujarati: "ભોજનના ૨૦ મિનિટ પહેલાં ૧ મોટો ગ્લાસ પાણી પીવો જેથી વધારાનો ખોરાક ખવાઈ ન જાય.",
    urgency: "recovery",
    icon: "💧"
  },
  fiber_plate: {
    title: "Evening Vegetable Compensation (કાચું સલાડ અને ફાઈબર)",
    desc: "Eat a large bowl of sliced cucumbers, tomatoes, and boiled sprouts before touching the main carbohydrate portion of dinner.",
    gujarati: "રાત્રિ ભોજનમાં રોટલી/ભાત પહેલાં કાકડી, ટામેટાં અને બાફેલા કઠોળનું ભરપૂર સલાડ ખાઓ.",
    urgency: "vital",
    icon: "🥗"
  },
  avoid_sugar: {
    title: "Insulin Spike Mitigation Walk (શુગર સ્પાઇક કંટ્રોલ)",
    desc: "You had sweet items/sugary snacks: Take a 20-minute brisk walk immediately to mobilize GLUT4 receptors and clear glucose into muscles instead of fat stores.",
    gujarati: "મીઠાઈ કે ખાંડ ખવાઈ ગઈ: તરત ૨૦ મિનિટ ઝડપી ચાલો જેથી શુગર ચરબી બનવાને બદલે ઊર્જામાં વપરાઈ જાય.",
    urgency: "urgent",
    icon: "⚡"
  },
  avoid_late_eat: {
    title: "12-Hour Intermittent Fasting Reset (૧૨ કલાકનું પાચક ઉપવાસ)",
    desc: "Late eating halts fat oxidation: Stop eating completely right now. Do not consume anything except water or herbal tea until 9:00 AM tomorrow morning.",
    gujarati: "મોડી રાત્રે ખાવાથી વજન વધે છે: હવે કશું જ ન ખાવ અને આવતીકાલે સવારે ૯ વાગ્યા સુધી માત્ર પાણી જ પીવું.",
    urgency: "urgent",
    icon: "⏱️"
  },
  avoid_sedentary: {
    title: "Active Desk Break (બેઠા બેઠા બ્રેક અને સ્ટ્રેચ)",
    desc: "Prolonged sitting shuts down muscle lipase enzymes: Stand up right now, do 20 high-knees, and work standing for the next 20 minutes.",
    gujarati: "લાંબો સમય બેસી રહેવાથી ફેટ બર્નિંગ અટકી જાય છે: હમણાં જ ઊભા થાઓ અને ૨૦ વખત હાઈ-નીઝ કસરત કરો.",
    urgency: "recovery",
    icon: "🧍"
  },

  // Stress & Anxiety
  breathing_478: {
    title: "Emergency Parasympathetic Reset (૪-૭-૮ શ્વાસ સત્ર)",
    desc: "Sit quietly, close your eyes, and execute 4 consecutive cycles of 4-7-8 breathing: Inhale 4s through nose, hold 7s, exhale 8s with whoosh sound.",
    gujarati: "માનસિક શાંતિ માટે હમણાં જ ૪ વખત ૪-૭-૮ શ્વાસની કસરત કરો (૪ સેકન્ડ શ્વાસ લો, ૭ સેકન્ડ રોકો, ૮ સેકન્ડ બહાર કાઢો).",
    urgency: "urgent",
    icon: "🧘"
  },
  calm_walk: {
    title: "15-Minute Sensory Nature Stroll (શાંત વોક)",
    desc: "Leave your phone at your desk and take a quiet 15-minute stroll outside. Notice 5 things you can see, 4 you can touch, and 3 you can hear.",
    gujarati: "મોબાઇલ વગર ૧૫ મિનિટ બહાર ખુલ્લી હવામાં આંટો મારો અને કુદરતી વાતાવરણ અનુભવો.",
    urgency: "vital",
    icon: "🌳"
  },
  herbal_tea: {
    title: "Neuro-Calming Chamomile / Mint Tea (હર્બલ ટી)",
    desc: "Brew a cup of warm chamomile, tulsi, or peppermint tea. The calming phytochemicals bind to brain GABA receptors to dissipate nervous tension.",
    gujarati: "તુલસી અથવા ફુદીનાની ગરમ હર્બલ ચા પીવો જેથી મગજ અને ચેતાતંત્રને તરત રાહત મળે.",
    urgency: "recovery",
    icon: "🍵"
  },
  avoid_caffeine_noon: {
    title: "Caffeine Flush & Hydration Buffer (કેફીન અસર ઘટાડવી)",
    desc: "Late caffeine keeps cortisol high: Drink 2 large glasses of room-temperature water with a squeeze of fresh lemon to flush stimulants out of your system.",
    gujarati: "બપોર પછી કોફી/ચા પીવાથી તણાવ વધે: ૨ મોટા ગ્લાસ લીંબુ પાણી પીવો જેથી કેફીન શરીરમાંથી બહાર નીકળે.",
    urgency: "recovery",
    icon: "🍋"
  },
  avoid_doomscroll: {
    title: "Strict 1-Hour Screen Blackout (સ્ક્રીન અને સોશિયલ મીડિયા બંધ)",
    desc: "Social media feeds amplify anxiety hormones: Turn on 'Do Not Disturb' mode on your phone right now and put the device in another room for 60 minutes.",
    gujarati: "સોશિયલ મીડિયાની નકારાત્મકતાથી બચવા ફોન 'Do Not Disturb' કરી ૧ કલાક માટે બીજા રૂમમાં મૂકી દો.",
    urgency: "vital",
    icon: "📵"
  },
  avoid_rush_meal: {
    title: "Mindful 5-Minute Decompression (શાંતિથી ભોજન)",
    desc: "Eating while stressed causes indigestion: Take 3 slow, deep abdominal breaths before your next snack or dinner. Chew slowly and eat in a quiet room.",
    gujarati: "ઉતાવળમાં ખાવાથી પાચન બગડે છે: હવે પછી જમતાં પહેલાં ૩ ઊંડા શ્વાસ લો અને એકદમ શાંતિથી જમો.",
    urgency: "recovery",
    icon: "🥣"
  },

  // Sleep & Insomnia
  morning_sun: {
    title: "Late Afternoon Natural Light Exposure (કુદરતી પ્રકાશ)",
    desc: "Missed morning light: Step outside right now for 15-20 minutes of natural outdoor sunlight before dusk to anchor your circadian rhythm for tonight.",
    gujarati: "સવારનો તડકો ચૂકી ગયા: હમણાં જ સાંજ પહેલાં ૧૫-૨૦ મિનિટ બહાર ખુલ્લા આકાશ નીચે જાઓ.",
    urgency: "vital",
    icon: "☀️"
  },
  sleep_schedule: {
    title: "Lock In Bedtime Target for Tonight (ચોક્કસ ઊંઘવાનો સમય)",
    desc: "Decide on an unshakeable bedtime (e.g. 10:30 PM). Set an alarm 45 minutes prior (9:45 PM) as your cue to begin your pre-sleep wind-down ritual.",
    gujarati: "આજે રાત્રે સૂવાનો સમય નક્કી કરો (દા.ત. ૧૦:૩૦) અને તેના ૪૫ મિનિટ પહેલાંનું રિમાઇન્ડર સેટ કરો.",
    urgency: "vital",
    icon: "⏰"
  },
  warm_milk_read: {
    title: "Tryptophan Bedtime Drink & Paper Book (હળવું દૂધ અને પુસ્તક)",
    desc: "Drink half a glass of warm milk with a pinch of nutmeg or turmeric 30 minutes before bed. Read a physical paper book under a warm amber bedside lamp.",
    gujarati: "સૂતા પહેલાં ચપટી જાયફળ કે હળદરવાળું નવશેકું દૂધ પીવો અને ફોનની જગ્યાએ પુસ્તક વાંચો.",
    urgency: "recovery",
    icon: "📖"
  },
  avoid_bed_screens: {
    title: "Bedroom Phone Quarantine (ફોન બેડરૂમની બહાર મૂકવો)",
    desc: "Phone in bed ruins sleep latency: Put your phone on charge outside the bedroom or at least 10 feet away from your mattress right now.",
    gujarati: "મોબાઇલ પલંગથી દૂર રાખો જેથી વારંવાર સ્ક્રીન જોવાની આદત બંધ થાય અને ગાઢ ઊંઘ આવે.",
    urgency: "urgent",
    icon: "📵"
  },
  avoid_pm_coffee: {
    title: "Adenosine Sleep Drive Protection (કેફીન કટઓફ)",
    desc: "You consumed afternoon caffeine: Stop all further coffee, tea, and soda immediately. Drink chamomile tea and take a warm shower before bed to lower body temperature.",
    gujarati: "બપોરે ચા/કોફી પીવાઈ ગઈ: હવે રાત સુધી માત્ર સાદું પાણી કે હર્બલ ટી જ પીવી અને સૂતા પહેલાં નવશેકા પાણીએ નાહવું.",
    urgency: "urgent",
    icon: "🚿"
  },
  avoid_heavy_dinner: {
    title: "Light Digestive Dinner Adjustment (હળવો રાત્રિ ખોરાક)",
    desc: "Heavy dinners cause restless micro-arousals: Keep dinner strictly light (e.g., vegetable soup, boiled oats, or light dal khichdi). Finish at least 3 hours before sleep.",
    gujarati: "રાત્રે ભારે ખોરાક ન લો: ફક્ત મગની દાળની ખીચડી કે ગરમ સૂપ લો અને સૂવાના ૩ કલાક પહેલાં જમી લો.",
    urgency: "vital",
    icon: "🍲"
  },

  // Joints & Back Pain
  desk_stretch: {
    title: "Emergency Spinal Decompression (કરોડરજ્જુ અને ગરદન સ્ટ્રેચ)",
    desc: "Perform 10 slow neck rotations, 10 shoulder blade squeezes, and 2-minute seated spinal twists right now using our 5-Minute Stretch Timer.",
    gujarati: "હમણાં જ ખુરશી પર બેસીને ગરદન અને ખભાનું સ્ટ્રેચિંગ કરો જેથી જકડાયેલા સ્નાયુઓ ખુલી જાય.",
    urgency: "urgent",
    icon: "🧘"
  },
  low_impact_walk: {
    title: "Synovial Fluid Lubrication Walk (હળવું સપાટ વોક)",
    desc: "Cartilage requires movement to receive nutrients: Take a gentle 15-minute walk on a flat surface in comfortable cushioned footwear.",
    gujarati: "સાંધાના લુબ્રિકેશન માટે આરામદાયક ચંપલ પહેરીને ૧૫ મિનિટ સપાટ રસ્તા પર ચાલો.",
    urgency: "vital",
    icon: "👟"
  },
  turmeric_walnuts: {
    title: "Golden Turmeric Anti-Inflammatory Elixir (હળદરવાળું દૂધ)",
    desc: "Mix 1/2 tsp pure turmeric powder and a pinch of black pepper into warm milk or water. Curcumin suppresses inflammatory COX-2 joint enzymes.",
    gujarati: "નવશેકા દૂધમાં અડધી ચમચી હળદર અને ચપટી કાળા મરી નાખીને પીવો, સાંધાનો દુખાવો ઓછો થશે.",
    urgency: "recovery",
    icon: "🥛"
  },
  avoid_long_sit: {
    title: "Standing Desk Interval & Lumbar Reset (ઊભા થઈને કામ કરવું)",
    desc: "Prolonged sitting triples spinal disc pressure: Stand up right now. Place hands on your lower back and perform 5 gentle standing backward extensions.",
    gujarati: "સતત બેસી રહેવાથી કમરનો દુખાવો વધે છે: હમણાં જ ઊભા થઈને પાછળની તરફ ૫ વખત હળવા સ્ટ્રેચ કરો.",
    urgency: "urgent",
    icon: "🧍"
  },
  avoid_slouch: {
    title: "Posture Correction & Eye-Level Screen Alignment (પોશ્ચર સુધારણા)",
    desc: "Slouching strains cervical vertebrae: Raise your laptop or phone so the top third of the display is at direct eye level. Pull your chin slightly backwards.",
    gujarati: "વાંકા વળીને ફોન ન જુઓ: સ્ક્રીનને આંખની સામે સીધી રાખો અને ગરદન સીધી રાખો.",
    urgency: "vital",
    icon: "💻"
  },
  avoid_soft_bed: {
    title: "Pillow Alignment Check (ઓશિકા અને ગાદલાની ગોઠવણ)",
    desc: "Misaligned spine causes morning stiffness: Place a pillow between your knees if sleeping on your side, or under your knees if on your back.",
    gujarati: "ઊંઘતી વખતે કરોડરજ્જુ સીધી રાખવા પડખું ફરીને સૂતી વખતે બે ઘૂંટણ વચ્ચે એક ઓશિકું રાખો.",
    urgency: "recovery",
    icon: "🛏️"
  },

  // Sugar & BP Support
  post_meal_walk: {
    title: "Postprandial Glucose Clearance Walk (જમ્યા પછી ૧૫-૨૦ મિનિટ વોક)",
    desc: "Walking after meals activates muscle GLUT4 receptors to absorb blood sugar without insulin: Take a gentle 15-20 minute walk immediately after dinner.",
    gujarati: "જમ્યા પછી ૧૫ થી ૨૦ મિનિટ ધીમે ધીમે ચાલો જેથી બ્લડ શુગર કુદરતી રીતે નિયંત્રણમાં રહે.",
    urgency: "urgent",
    icon: "🚶"
  },
  fiber_oats_methi: {
    title: "Fenugreek/Cinnamon Glucose Buffer (મેથી અથવા તજનો ઉકાળો)",
    desc: "Soak 1 tsp fenugreek (methi) seeds or steep a cinnamon stick in hot water. Sip before your meal to slow down carbohydrate breakdown and sugar spikes.",
    gujarati: "૧ ચમચી મેથીના દાણા અથવા તજનો પાઉડર ગરમ પાણીમાં ઉકાળીને પીવો, શુગર સ્પાઇક અટકશે.",
    urgency: "vital",
    icon: "🌾"
  },
  deep_breath_bp: {
    title: "10-Minute Arterial Blood Pressure Calming (બીપી ઘટાડવા ઊંડા શ્વાસ)",
    desc: "Slow rhythmic breathing reduces sympathetic nervous vascular tone: Practice the 4-7-8 breathing circle for 6 full minutes to naturally lower systolic pressure.",
    gujarati: "હાઈ બીપી ઘટાડવા માટે ૬ મિનિટ શાંતિથી બેસીને ઊંડા શ્વાસ લો અને છોડો.",
    urgency: "urgent",
    icon: "🧘"
  },
  avoid_refined_sugar: {
    title: "Zero-Carb Dinner Compensation (મીઠાઈ પછીનો સુધારો)",
    desc: "You consumed refined sugar or sweets: Strictly eliminate all refined bread, rice, and desserts for dinner tonight. Choose high-fiber green vegetables, lentils, or paneer.",
    gujarati: "આજે ખાંડ કે મીઠાઈ ખવાઈ ગઈ: રાત્રિ ભોજનમાં રોટલી-ભાત ઓછાં કરી માત્ર લીલાં શાકભાજી અને દાળ જ લો.",
    urgency: "urgent",
    icon: "🥗"
  },
  avoid_high_salt: {
    title: "Potassium Flush & Sodium Dilution (સોડિયમ અને નમક કંટ્રોલ)",
    desc: "High salt retains fluid and spikes blood pressure: Drink 3 large glasses of plain water over the next 2 hours. Eat a banana or coconut water for potassium counter-balance.",
    gujarati: "વધુ પડતું નમક કે ચિપ્સ ખવાઈ ગઈ: ૨ કલાકમાં ૩ ગ્લાસ પાણી પીવો અને પોટેશિયમ માટે કેળું અથવા નારિયેળ પાણી લો.",
    urgency: "urgent",
    icon: "🥥"
  },
  avoid_skip_checks: {
    title: "Log Your Health Metrics Right Now (શુગર અને બીપી ચેક કરો)",
    desc: "Do not leave health to guesswork: Measure and record your resting blood pressure or postprandial glucose reading in your health diary right away.",
    gujarati: "આળસ કર્યા વગર હમણાં જ તમારું બ્લડ પ્રેશર અથવા શુગર માપીને ડાયરીમાં નોંધો.",
    urgency: "vital",
    icon: "🩺"
  }
};

/* ==========================================================================
   10. Dedicated Daily Result & Compensatory Action Protocol (result.html)
   ========================================================================== */

const RESULT_UI_LABELS = {
  en: {
    heroBadge: '📊 Daily Health Evaluation & Recovery Engine',
    heroTitle: 'Your Daily Health Result & <span class="hero-highlight" style="color: #6ee7b7;">Recovery Protocol</span>',
    heroDesc: '<strong>Daily Evaluation & Recovery Plan:</strong> Review your daily score, track your completed tasks, and follow your condition-specific compensatory protocol to maintain peak health.',
    conditionLabel: '🩺 Health Condition Target:',
    scoreLbl: 'Health Score',
    scoreSub: 'Live Day Evaluation',
    auditTitle: '<span>📋</span> Today\'s Tasks Status',
    auditSub: 'Synchronized with your Home Page checklist (tick to update):',
    recoveryBadge: '🚨 Action Required',
    recoveryTitle: '<span>👉</span> What Extra You Need To Do Now',
    recoveryDesc: '<strong>Compensatory Action Protocol:</strong> Based on the habits you missed or have not completed today, here are your immediate compensatory steps to recover and balance your body.',
    recoveryProgressLbl: 'Recovery Checklist Progress',
    printBtn: '<span>🖨️ Print / Save Daily Health Report</span>',
    resetBtn: '<span>🔄 Reset Today\'s Log</span>',
    returnHomeBtn: '<span>🏠 Return to Home Page</span>',
    statusDone: '✓ Done',
    statusPending: '⏳ Pending',
    gradeAwaiting: 'Awaiting Today\'s Tasks',
    gradeAwaitingDiag: 'No tasks have been checked yet today. Once you start ticking tasks on the home page or below, your recovery diagnosis will update live!',
    gradeAplus: '🌟 Grade A+ (Outstanding Control)',
    gradeAplusDiag: 'Exceptional adherence for <strong>{condition}</strong>! You are successfully maintaining positive habits. Keep this momentum for long-term health transformation.',
    gradeA: '✅ Grade A (Good Progress)',
    gradeADiag: 'Good work! You completed the majority of your health targets for <strong>{condition}</strong>. Complete the compensatory recovery actions on the right to reach 100%.',
    gradeB: '⚠️ Grade B (Needs Attention)',
    gradeBDiag: 'Attention needed: Skipping critical daily habits directly impacts your <strong>{condition}</strong>. Complete the extra compensatory actions on the right to regain balance.',
    gradeC: '🛑 Grade C (Action Required)',
    gradeCDiag: 'Action required: Today\'s vital health habits are pending for <strong>{condition}</strong>. Follow the restorative recovery steps on the right to keep your body balanced.',
    chipDone: '🟢 {count} Completed',
    chipSkip: '🔴 {count} Need Extra Care',
    chipPending: '⚪ {count} Pending',
    recCompletedEmptyTitle: 'All Goals Met! No Extra Actions Needed',
    recCompletedEmptyDesc: 'You maintained flawless discipline for <strong>{condition}</strong> today. Continue with light evening stretching, drink a warm cup of herbal tea, and enjoy 8 hours of restorative sleep.',
    recPendingEmptyTitle: 'No Tasks Pending',
    recPendingEmptyDesc: 'All tasks completed today.',
    pillUrgent: '🚨 Immediate Action',
    pillVital: '⚡ Vital Recovery Step',
    pillRecovery: '🔄 Compensatory Action',
    recProgressFormat: '{done} of {total} Recovery Actions Completed ({pct}%)',
    resetConfirm: 'Are you sure you want to reset today\'s health log for this condition? All checked items will be cleared.'
  },
  gu: {
    heroBadge: '📊 દૈનિક સ્વાસ્થ્ય મૂલ્યાંકન & રિકવરી એન્જિન',
    heroTitle: 'તમારું દૈનિક સ્વાસ્થ્ય પરિણામ & <span class="hero-highlight" style="color: #6ee7b7;">રિકવરી પ્લાન</span>',
    heroDesc: '<strong>આજનું સ્વાસ્થ્ય પરિણામ અને વધારાનું એક્શન પ્લાન:</strong> તમારો દૈનિક સ્કોર તપાસો, પૂર્ણ થયેલા કાર્યો જુઓ, અને શરીરનું સંતુલન જાળવવા વધારાનું શું કરવું તે અનુસરો.',
    conditionLabel: '🩺 સ્વાસ્થ્ય લક્ષ્ય:',
    scoreLbl: 'હેલ્થ સ્કોર',
    scoreSub: 'આજનું લાઈવ મૂલ્યાંકન',
    auditTitle: '<span>📋</span> આજના કાર્યોની સ્થિતિ',
    auditSub: 'હોમ પેજ સાથે લાઈવ જોડાયેલ છે (બદલવા માટે ટીક કરો):',
    recoveryBadge: '🚨 જરૂરી એક્શન',
    recoveryTitle: '<span>👉</span> હવે વધારાનું શું કરવું પડશે',
    recoveryDesc: '<strong>વધારાનું એક્શન પ્લાન:</strong> તમે આજે જે કાર્યો પૂરા નથી કર્યા, તેને સરભર કરવા માટે નીચેના વધારાના પગલાં તરત ભરો.',
    recoveryProgressLbl: 'રિકવરી પ્રગતિ',
    printBtn: '<span>🖨️ રિપોર્ટ પ્રિન્ટ / સેવ કરો</span>',
    resetBtn: '<span>🔄 આજનો લોગ રીસેટ કરો</span>',
    returnHomeBtn: '<span>🏠 હોમ પેજ પર જાઓ</span>',
    statusDone: '✓ પૂર્ણ થયું',
    statusPending: '⏳ બાકી છે',
    gradeAwaiting: 'આજના કાર્યો બાકી છે',
    gradeAwaitingDiag: 'આજે હજુ સુધી કોઈ કાર્ય ચેક કરવામાં આવ્યું નથી. હોમ પેજ પર અથવા નીચે આપેલા કાર્યો ટીક કરો, જેથી તમારો સ્કોર અને રિકવરી પ્લાન લાઈવ અપડેટ થશે.',
    gradeAplus: '🌟 ગ્રેડ A+ (શ્રેષ્ઠ નિયંત્રણ)',
    gradeAplusDiag: '<strong>{condition}</strong> માટે ખૂબ જ ઉત્તમ પરિણામ! તમે સ્વસ્થ ટેવોનું પાલન કરી રહ્યા છો. લાંબા ગાળે આનાથી સ્વાસ્થ્યમાં મોટો સુધારો થશે.',
    gradeA: '✅ ગ્રેડ A (સારી પ્રગતિ)',
    gradeADiag: 'સરસ કામ! તમે <strong>{condition}</strong> માટે મોટાભાગના લક્ષ્યો પૂર્ણ કર્યા છે. બાકી રહેલી બાબતો માટે જમણી બાજુ આપેલા વધારાના પગલાં ભરો.',
    gradeB: '⚠️ ગ્રેડ B (ધ્યાન આપવાની જરૂર)',
    gradeBDiag: 'ધ્યાન આપો: મહત્વપૂર્ણ કાર્યો બાકી રહેવાથી <strong>{condition}</strong> પર અસર પડે છે. સંતુલન પાછું મેળવવા જમણી બાજુ આપેલા વધારાના પગલાં ભરો.',
    gradeC: '🛑 ગ્રેડ C (પગલાં લેવા જરૂરી)',
    gradeCDiag: 'ધ્યાન આપવું જરૂરી: આજે <strong>{condition}</strong> માટેના કાર્યો હજુ બાકી છે. શરીરને રાહત આપવા જમણી બાજુ આપેલા તાત્કાલિક પગલાં પૂર્ણ કરો.',
    chipDone: '🟢 {count} પૂર્ણ',
    chipSkip: '🔴 {count} વધારાની કાળજી જરૂરી',
    chipPending: '⚪ {count} બાકી',
    recCompletedEmptyTitle: 'શાબાશ! આજના બધા લક્ષ્યો પૂરા થયા છે',
    recCompletedEmptyDesc: 'તમે આજે <strong>{condition}</strong> માટે ઉત્તમ શિસ્ત જાળવી છે. કોઈ વધારાની એક્શન કરવાની જરૂર નથી. રાત્રે હળવું સ્ટ્રેચિંગ કરીને શાંતિથી ઊંઘ લો.',
    recPendingEmptyTitle: 'બધા કાર્યો પૂર્ણ',
    recPendingEmptyDesc: 'આજના તમામ કાર્યો પૂર્ણ થયા છે.',
    pillUrgent: '🚨 તાત્કાલિક ઉપાય',
    pillVital: '⚡ મહત્વપૂર્ણ પગલું',
    pillRecovery: '🔄 સરભર કરવાની એક્શન',
    recProgressFormat: '{total} માંથી {done} રિકવરી એક્શન પૂર્ણ ({pct}%)',
    resetConfirm: 'શું તમે આ પરિસ્થિતિ માટે આજનો હેલ્થ લોગ રીસેટ કરવા માંગો છો? તમામ ચેક કરેલ વસ્તુઓ સાફ થઈ જશે.'
  }
};

const RESULT_CONDITION_OPTIONS = {
  en: {
    general: '🌿 General Health & Vitality',
    digestion: '🫄 Acidity, Gas & Bloating',
    weight: '⚖️ Weight Loss & Fat Burn',
    stress: '🧠 Stress & Anxiety Care',
    sleep: '🌙 Insomnia / Sleep Issues',
    joints: '🦴 Back & Joint Stiffness',
    sugar_bp: '🩺 Blood Sugar & BP Support'
  },
  gu: {
    general: '🌿 સામાન્ય સ્વાસ્થ્ય & ઉર્જા',
    digestion: '🫄 એસિડિટી, ગેસ & અપચો',
    weight: '⚖️ વજન નિયંત્રણ & ચરબી ઘટાડો',
    stress: '🧠 તણાવ, ચિંતા & માનસિક શાંતિ',
    sleep: '🌙 અનિદ્રા & ઊંઘની સમસ્યા',
    joints: '🦴 કમર & સાંધાનો દુખાવો',
    sugar_bp: '🩺 બ્લડ શુગર & બીપી કેર'
  }
};

function initResultPage() {
  const pageContainer = document.getElementById('result-page-container');
  if (!pageContainer) return;

  const todayKey = new Date().toISOString().slice(0, 10);
  const conditionSelect = document.getElementById('result-condition-select');
  const dateBadge = document.getElementById('result-today-date');
  const scoreDonut = document.getElementById('result-score-donut');
  const scoreNum = document.getElementById('result-score-num');
  const gradePill = document.getElementById('result-grade-pill');
  const chipDone = document.getElementById('chip-done-count');
  const chipSkip = document.getElementById('chip-skip-count');
  const chipPending = document.getElementById('chip-pending-count');
  const diagnosisText = document.getElementById('result-diagnosis-text');
  const auditList = document.getElementById('result-audit-list');
  const recoveryList = document.getElementById('result-recovery-list');
  const recoveryProgressBox = document.getElementById('recovery-progress-box');
  const recoveryProgressText = document.getElementById('recovery-progress-text');
  const recoveryBarFill = document.getElementById('recovery-bar-fill');
  const btnPrint = document.getElementById('btn-print-report');
  const btnReset = document.getElementById('btn-reset-report');

  let currentLang = localStorage.getItem('gh_lang') || 'en';
  let selectedCondition = localStorage.getItem('gh_selected_condition') || 'general';

  function updateStaticLabels() {
    const labels = RESULT_UI_LABELS[currentLang] || RESULT_UI_LABELS.en;
    const heroBadge = document.getElementById('result-hero-badge');
    if (heroBadge) heroBadge.textContent = labels.heroBadge;

    const heroTitle = document.getElementById('result-hero-title');
    if (heroTitle) heroTitle.innerHTML = labels.heroTitle;

    const heroDesc = document.getElementById('result-hero-desc');
    if (heroDesc) heroDesc.innerHTML = labels.heroDesc;

    const conditionLabel = document.getElementById('result-condition-label');
    if (conditionLabel) conditionLabel.textContent = labels.conditionLabel;

    const scoreLbl = document.getElementById('result-score-lbl');
    if (scoreLbl) scoreLbl.textContent = labels.scoreLbl;

    const scoreSub = document.getElementById('result-score-sub');
    if (scoreSub) scoreSub.textContent = labels.scoreSub;

    const auditTitle = document.getElementById('result-audit-title');
    if (auditTitle) auditTitle.innerHTML = labels.auditTitle;

    const auditSub = document.getElementById('result-audit-sub');
    if (auditSub) auditSub.textContent = labels.auditSub;

    const recoveryBadgeTag = document.getElementById('recovery-badge-tag');
    if (recoveryBadgeTag) recoveryBadgeTag.textContent = labels.recoveryBadge;

    const recoveryCardTitle = document.getElementById('recovery-card-title');
    if (recoveryCardTitle) recoveryCardTitle.innerHTML = labels.recoveryTitle;

    const recoveryCardDesc = document.getElementById('recovery-card-desc');
    if (recoveryCardDesc) recoveryCardDesc.innerHTML = labels.recoveryDesc;

    const recoveryProgressLbl = document.getElementById('recovery-progress-lbl');
    if (recoveryProgressLbl) recoveryProgressLbl.textContent = labels.recoveryProgressLbl;

    if (btnPrint) btnPrint.innerHTML = labels.printBtn;
    if (btnReset) btnReset.innerHTML = labels.resetBtn;
    const btnReturnHome = document.getElementById('btn-return-home');
    if (btnReturnHome) btnReturnHome.innerHTML = labels.returnHomeBtn;

    if (dateBadge) {
      const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
      dateBadge.textContent = '📅 ' + new Date().toLocaleDateString(currentLang === 'gu' ? 'gu-IN' : 'en-US', options);
    }

    if (conditionSelect) {
      const optMap = RESULT_CONDITION_OPTIONS[currentLang] || RESULT_CONDITION_OPTIONS.en;
      Array.from(conditionSelect.options).forEach(opt => {
        if (optMap[opt.value]) {
          opt.textContent = optMap[opt.value];
        }
      });
    }
  }

  if (conditionSelect) {
    conditionSelect.value = selectedCondition;
    conditionSelect.addEventListener('change', (e) => {
      selectedCondition = e.target.value;
      localStorage.setItem('gh_selected_condition', selectedCondition);
      renderResultPage();
    });
  }

  function getRatioKey() {
    return `gh_ratio_${selectedCondition}_${todayKey}`;
  }

  function getRecoveryKey() {
    return `gh_recovery_${selectedCondition}_${todayKey}`;
  }

  function getTaskStates() {
    return JSON.parse(localStorage.getItem(getRatioKey()) || '{}');
  }

  function getRecoveryStates() {
    return JSON.parse(localStorage.getItem(getRecoveryKey()) || '{}');
  }

  function getCompensatoryItem(task) {
    const advice = COMPENSATORY_ACTIONS[task.id];
    const taskName = (currentLang === 'gu' ? task.name_gu : task.name_en) || task.name;
    if (!advice) {
      return {
        title: currentLang === 'gu' ? `${taskName} સરભર કરો` : `Compensate for Missed ${taskName}`,
        desc: currentLang === 'gu' ? `${taskName} સ્કીપ થયું છે: હળવી કસરત કરો અને વધારાનું પાણી પીવો.` : `Take immediate action to offset skipping ${taskName}. Engage in light physical activity and hydrate thoroughly.`,
        urgency: 'recovery',
        rawGujarati: `${taskName} સ્કીપ થયું છે: હળવી કસરત કરો અને વધારાનું પાણી પીવો.`
      };
    }

    let title = advice.title;
    if (currentLang === 'gu') {
      const gujMatch = advice.title.match(/\((.*?)\)/);
      title = gujMatch ? gujMatch[1].trim() : advice.title;
    } else {
      title = advice.title.split('(')[0].trim();
    }

    const desc = (currentLang === 'gu' && advice.gujarati) ? advice.gujarati : advice.desc;

    return {
      title: `${advice.icon || '⚡'} ${title}`,
      desc: desc,
      urgency: advice.urgency || 'recovery',
      rawGujarati: advice.gujarati
    };
  }

  function renderResultPage() {
    updateStaticLabels();
    const labels = RESULT_UI_LABELS[currentLang] || RESULT_UI_LABELS.en;
    const condition = HEALTH_CONDITIONS[selectedCondition] || HEALTH_CONDITIONS.general;
    const tasks = condition.ratioTasks || [];
    let taskStates = getTaskStates();
    let recoveryStates = getRecoveryStates();

    const total = tasks.length || 6;
    let doneCount = 0;
    const completedItems = [];
    const skippedItems = [];

    tasks.forEach(t => {
      const isDone = taskStates[t.id] === 'done';
      if (isDone) {
        doneCount++;
        completedItems.push(t);
      } else {
        skippedItems.push(t);
      }
    });

    const skipCount = skippedItems.length;
    const donePct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    // 1. Update Score & Visuals
    if (scoreDonut) {
      scoreDonut.style.background = `conic-gradient(
        #10b981 0% ${donePct}%,
        #e2e8f0 ${donePct}% 100%
      )`;
    }
    if (scoreNum) scoreNum.textContent = `${donePct}%`;

    // 2. Grade & Diagnosis
    let gradeLabel = '';
    let gradeClass = '';
    let diagMsg = '';

    const condTitle = (currentLang === 'gu' ? (condition.title_gu || condition.title) : (condition.title_en || condition.title)).split('(')[0].trim();

    if (donePct >= 85) {
      gradeLabel = labels.gradeAplus;
      gradeClass = 'grade-excellent';
      diagMsg = labels.gradeAplusDiag.replace('{condition}', condTitle);
    } else if (donePct >= 65) {
      gradeLabel = labels.gradeA;
      gradeClass = 'grade-good';
      diagMsg = labels.gradeADiag.replace('{condition}', condTitle);
    } else if (donePct >= 40) {
      gradeLabel = labels.gradeB;
      gradeClass = 'grade-good';
      diagMsg = labels.gradeBDiag.replace('{condition}', condTitle);
    } else {
      gradeLabel = labels.gradeC;
      gradeClass = 'grade-needs-work';
      diagMsg = labels.gradeCDiag.replace('{condition}', condTitle);
    }

    if (gradePill) {
      gradePill.className = `score-grade-pill ${gradeClass}`;
      gradePill.textContent = gradeLabel;
    }
    if (chipDone) chipDone.textContent = labels.chipDone.replace('{count}', doneCount);
    if (chipSkip) chipSkip.textContent = labels.chipSkip.replace('{count}', skipCount);
    if (chipPending) chipPending.style.display = 'none';
    if (diagnosisText) diagnosisText.innerHTML = diagMsg;

    // 3. Render Status List (Clean Synchronized Checkboxes)
    if (auditList) {
      auditList.innerHTML = '';
      tasks.forEach(task => {
        const isDone = taskStates[task.id] === 'done';
        const taskName = (currentLang === 'gu' ? task.name_gu : task.name_en) || task.name;
        const taskTip = (currentLang === 'gu' ? task.tip_gu : task.tip_en) || task.tip;
        const statusText = isDone ? (labels.statusDone || '✓ Done') : (labels.statusPending || '⏳ Pending');

        const row = document.createElement('label');
        row.className = `audit-check-row ${isDone ? 'checked' : ''}`;
        row.setAttribute('for', `result-task-${task.id}`);
        row.innerHTML = `
          <input type="checkbox" id="result-task-${task.id}" class="audit-check-box" ${isDone ? 'checked' : ''}>
          <div class="audit-check-content">
            <div class="audit-check-top">
              <span class="audit-check-title">
                <span>${task.icon}</span>
                <span>${taskName}</span>
              </span>
              <span class="audit-status-tag ${isDone ? 'tag-done' : 'tag-pending'}">${statusText}</span>
            </div>
            <p class="audit-check-tip">${taskTip || ''}</p>
          </div>
        `;

        const checkbox = row.querySelector('.audit-check-box');
        checkbox.addEventListener('change', (e) => {
          taskStates[task.id] = e.target.checked ? 'done' : 'pending';
          localStorage.setItem(getRatioKey(), JSON.stringify(taskStates));
          renderResultPage();
        });

        auditList.appendChild(row);
      });
    }

    // 4. Render What Extra You Need To Do Now (Compensatory Action Protocol)
    if (recoveryList) {
      recoveryList.innerHTML = '';

      if (skippedItems.length === 0) {
        // 100% Perfect day
        recoveryList.innerHTML = `
          <div class="recovery-empty-state">
            <div class="empty-icon">🏆</div>
            <h4>${labels.recCompletedEmptyTitle}</h4>
            <p>${labels.recCompletedEmptyDesc.replace('{condition}', condTitle)}</p>
          </div>
        `;
        if (recoveryProgressBox) recoveryProgressBox.style.display = 'none';
      } else {
        if (recoveryProgressBox) recoveryProgressBox.style.display = 'block';

        let completedRecoveryCount = 0;
        const totalRecoveryCount = skippedItems.length;

        skippedItems.forEach(task => {
          const recItem = getCompensatoryItem(task);
          const isChecked = !!recoveryStates[task.id];
          if (isChecked) completedRecoveryCount++;

          const pillClass = recItem.urgency === 'urgent' ? 'pill-urgent' : (recItem.urgency === 'vital' ? 'pill-vital' : 'pill-recovery');
          const pillText = recItem.urgency === 'urgent' ? labels.pillUrgent : (recItem.urgency === 'vital' ? labels.pillVital : labels.pillRecovery);

          const card = document.createElement('div');
          card.className = `extra-action-item ${isChecked ? 'completed' : ''}`;
          card.innerHTML = `
            <div class="extra-action-top">
              <input type="checkbox" class="extra-action-checkbox" id="rec-check-${task.id}" ${isChecked ? 'checked' : ''} title="${currentLang === 'gu' ? 'પૂર્ણ થયું માર્ક કરો' : 'Mark as completed'}">
              <div class="extra-action-content">
                <span class="extra-action-pill ${pillClass}">${pillText}</span>
                <div class="extra-action-title">${recItem.title}</div>
                <div class="extra-action-desc">${recItem.desc}</div>
                ${currentLang === 'gu' ? `<div class="extra-action-gujarati"><strong>👉 હવે વધારાનું શું કરવું પડશે:</strong> ${recItem.rawGujarati || recItem.desc}</div>` : ''}
              </div>
            </div>
          `;

          const checkbox = card.querySelector('.extra-action-checkbox');
          checkbox.addEventListener('change', (e) => {
            recoveryStates[task.id] = e.target.checked;
            localStorage.setItem(getRecoveryKey(), JSON.stringify(recoveryStates));
            renderResultPage();
          });

          recoveryList.appendChild(card);
        });

        // Update Recovery Progress Bar
        const recoveryPct = Math.round((completedRecoveryCount / totalRecoveryCount) * 100);
        if (recoveryProgressText) {
          recoveryProgressText.textContent = labels.recProgressFormat
            .replace('{done}', completedRecoveryCount)
            .replace('{total}', totalRecoveryCount)
            .replace('{pct}', recoveryPct);
        }
        if (recoveryBarFill) {
          recoveryBarFill.style.width = `${recoveryPct}%`;
        }
      }
    }
  }

  // Handle Print Report
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // Handle Reset Today's Log
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      const labels = RESULT_UI_LABELS[currentLang] || RESULT_UI_LABELS.en;
      if (confirm(labels.resetConfirm)) {
        localStorage.removeItem(getRatioKey());
        localStorage.removeItem(getRecoveryKey());
        renderResultPage();
      }
    });
  }

  // Reactive listener for language switch
  window.addEventListener('gh_lang_changed', (e) => {
    currentLang = (e && e.detail && e.detail.lang) ? e.detail.lang : (localStorage.getItem('gh_lang') || 'en');
    renderResultPage();
  });

  renderResultPage();
}


/* ==========================================================================
   11. Problem-Specific Exercise & Daily Routine Module (exercise.html)
   Exact Exercises with Time Duration, Best Timing, and Interactive Timers
   ========================================================================== */
function initConditionExerciseModule() {
  const container = document.getElementById('problem-exercise-app');
  if (!container) return;

  let currentLang = localStorage.getItem('gh_lang') || 'en';
  let activeCondition = localStorage.getItem('gh_selected_condition') || 'general';

  const conditionPills = document.querySelectorAll('.ex-problem-btn');
  const activeIconEl = document.getElementById('ex-active-icon');
  const activeTitleEl = document.getElementById('ex-active-title');
  const activeDescEl = document.getElementById('ex-active-desc');
  const cardsContainer = document.getElementById('ex-cards-container');

  // Active timers tracker
  const runningTimers = {};

  function playChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function renderConditionExercises() {
    const isGu = currentLang === 'gu';
    const condData = HEALTH_CONDITIONS[activeCondition] || HEALTH_CONDITIONS.general;

    // Update Pill active states and language labels
    conditionPills.forEach(btn => {
      const cond = btn.getAttribute('data-condition');
      const cData = HEALTH_CONDITIONS[cond];
      if (cData) {
        const textSpan = btn.querySelector('span:last-child');
        if (textSpan) {
          textSpan.textContent = isGu 
            ? (cData.btn_title_gu || cData.title_gu)
            : (cData.btn_title_en || cData.title_en);
        }
      }
      if (cond === activeCondition) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    // Update active banner
    if (activeIconEl) activeIconEl.textContent = condData.icon;
    if (activeTitleEl) {
      const title = isGu ? (condData.title_gu || condData.btn_title_gu) : (condData.title_en || condData.btn_title_en);
      activeTitleEl.textContent = title;
    }
    if (activeDescEl) {
      activeDescEl.textContent = isGu 
        ? (condData.desc_gu || 'આ સમસ્યા માટે નીચે દર્શાવેલ કસરતો ચોક્કસ સમય અને વિધિ સાથે નિયમિત કરો:')
        : (condData.desc_en || 'Targeted daily exercises with duration, when to perform, and interactive timers:');
    }

    // Static text labels on page
    const heroBadge = document.getElementById('ex-hero-badge');
    const heroTitle = document.getElementById('ex-hero-title');
    const heroDesc = document.getElementById('ex-hero-desc');
    const selectLabel = document.getElementById('ex-select-label');

    if (heroBadge) heroBadge.textContent = isGu ? '🏃 સ્વાસ્થ્ય સમસ્યા મુજબ કસરત' : '🏃 Health Problem Exercise Guide';
    if (heroTitle) heroTitle.innerHTML = isGu 
      ? 'તમારી સમસ્યા માટે <span class="hero-highlight">યોગ્ય કસરત અને ચોક્કસ સમય</span>' 
      : 'Right Exercise for Your Problem, <span class="hero-highlight">With Exact Time</span>';
    if (heroDesc) heroDesc.textContent = isGu
      ? 'કોઈ અઘરા કેલ્ક્યુલેશન કે અટપટા શબ્દો નહીં! તમારી સ્વાસ્થ્ય સમસ્યા પસંદ કરો અને જાણો કઈ કસરત, કેટલો સમય (મિનિટ) અને ક્યારે કરવી જોઈએ:'
      : 'No confusing formulas or athletic jargon! Choose your health condition to see targeted exercises with exact minutes, best timing, and built-in timers:';
    if (selectLabel) selectLabel.textContent = isGu ? '👇 તમારી સ્વાસ્થ્ય સમસ્યા પસંદ કરો:' : '👇 Select Your Health Condition:';

    // Render 3 Exercise Cards
    if (cardsContainer) {
      cardsContainer.innerHTML = '';
      const exercises = condData.condition_exercises || [];

      exercises.forEach((ex, idx) => {
        const card = document.createElement('div');
        card.className = 'ex-card';

        const name = isGu ? ex.name_gu : ex.name_en;
        const duration = isGu ? ex.duration_gu : ex.duration_en;
        const when = isGu ? ex.when_gu : ex.when_en;
        const how = isGu ? ex.how_gu : ex.how_en;
        const benefit = isGu ? ex.benefit_gu : ex.benefit_en;
        const avoid = isGu ? ex.avoid_gu : ex.avoid_en;

        const totalSecs = (ex.duration_mins || 10) * 60;
        const timerId = `timer_${activeCondition}_${ex.id}`;

        if (!runningTimers[timerId]) {
          runningTimers[timerId] = {
            totalSeconds: totalSecs,
            remainingSeconds: totalSecs,
            interval: null,
            isRunning: false
          };
        }

        const tState = runningTimers[timerId];

        card.innerHTML = `
          <div>
            <div class="ex-card-header">
              <div class="ex-card-title">
                <span style="font-size: 1.6rem;">${ex.icon}</span>
                <span>${name}</span>
              </div>
            </div>

            <div class="ex-pill-group">
              <span class="ex-time-pill" title="Duration / સમય">
                ⏱️ <strong>${duration}</strong>
              </span>
              <span class="ex-when-pill" title="When to do / ક્યારે કરવું">
                🕒 ${when}
              </span>
            </div>

            <div class="ex-section-box">
              <strong>${isGu ? '👉 કેવી રીતે કરવું:' : '👉 How to Do:'}</strong>
              ${how}
            </div>

            <div class="ex-section-box" style="background: #f0fdf4; border-left: 3px solid #10b981;">
              <strong style="color: #047857;">${isGu ? '✨ આ સમસ્યામાં શું ફાયદો થાય:' : '✨ Why it Helps this Condition:'}</strong>
              ${benefit}
            </div>

            <div class="ex-avoid-box">
              <strong>${isGu ? '🛑 સાવચેતી / શું ન કરવું:' : '🛑 Caution / What to Avoid:'}</strong> ${avoid}
            </div>
          </div>

          <div class="ex-timer-module" id="module_${timerId}">
            <div style="font-size: 0.82rem; font-weight: 700; color: #6b21a8; text-transform: uppercase; margin-bottom: 0.35rem;">
              ${isGu ? '⏱️ કસરત ટાઈમર' : '⏱️ Exercise Timer'}
            </div>
            <div class="ex-timer-clock" id="display_${timerId}">
              ${formatTime(tState.remainingSeconds)}
            </div>
            <div class="ex-timer-btns">
              <button type="button" class="ex-timer-btn ex-timer-btn-start" id="start_${timerId}">
                ${tState.isRunning ? (isGu ? '⏸ થોભો' : '⏸ Pause') : (isGu ? '▶ શરૂ કરો' : '▶ Start Timer')}
              </button>
              <button type="button" class="ex-timer-btn ex-timer-btn-reset" id="reset_${timerId}">
                ${isGu ? '🔄 રીસેટ' : '🔄 Reset'}
              </button>
            </div>
          </div>
        `;

        cardsContainer.appendChild(card);

        // Bind Timer Controls for this card
        const startBtn = card.querySelector(`#start_${timerId}`);
        const resetBtn = card.querySelector(`#reset_${timerId}`);
        const clockEl = card.querySelector(`#display_${timerId}`);

        if (startBtn && resetBtn && clockEl) {
          startBtn.addEventListener('click', () => {
            if (tState.isRunning) {
              // Pause
              clearInterval(tState.interval);
              tState.isRunning = false;
              startBtn.textContent = isGu ? '▶ ચાલુ રાખો' : '▶ Resume';
              startBtn.style.background = '#10b981';
            } else {
              // Start or Resume
              tState.isRunning = true;
              startBtn.textContent = isGu ? '⏸ થોભો' : '⏸ Pause';
              startBtn.style.background = '#f59e0b';

              tState.interval = setInterval(() => {
                if (tState.remainingSeconds > 0) {
                  tState.remainingSeconds--;
                  clockEl.textContent = formatTime(tState.remainingSeconds);
                } else {
                  clearInterval(tState.interval);
                  tState.isRunning = false;
                  clockEl.textContent = isGu ? '🎉 પૂર્ણ!' : '🎉 Done!';
                  clockEl.classList.add('ex-timer-completed');
                  startBtn.textContent = isGu ? '▶ ફરીથી શરૂ કરો' : '▶ Start Again';
                  startBtn.style.background = '#10b981';
                  playChime();
                }
              }, 1000);
            }
          });

          resetBtn.addEventListener('click', () => {
            clearInterval(tState.interval);
            tState.isRunning = false;
            tState.remainingSeconds = tState.totalSeconds;
            clockEl.textContent = formatTime(tState.remainingSeconds);
            clockEl.classList.remove('ex-timer-completed');
            startBtn.textContent = isGu ? '▶ શરૂ કરો' : '▶ Start Timer';
            startBtn.style.background = '#10b981';
          });
        }
      });
    }
  }

  // Bind Condition Button clicks
  conditionPills.forEach(btn => {
    btn.addEventListener('click', () => {
      const cond = btn.getAttribute('data-condition');
      if (!cond) return;
      activeCondition = cond;
      localStorage.setItem('gh_selected_condition', activeCondition);
      renderConditionExercises();
    });
  });

  // Reactive listener for language changes
  window.addEventListener('gh_lang_changed', (e) => {
    currentLang = (e && e.detail && e.detail.lang) ? e.detail.lang : (localStorage.getItem('gh_lang') || 'en');
    renderConditionExercises();
  });

  renderConditionExercises();
}
