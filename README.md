# Good Health and Well-Being (SDG 3) 🌿

A modern, responsive, and educational web platform dedicated to **United Nations Sustainable Development Goal 3: Good Health and Well-Being**.

The platform spreads health awareness and provides actionable daily tools for students, working professionals, and families across five core well-being pillars: **Healthy Food**, **Exercise**, **Mental Well-Being**, **Restorative Sleep**, and **Daily Habits**.

---

## 🌟 Key Features (PRD Alignment)

1. **Home Page (`index.html`)**:
   - Project mission, statistics, and 5-pillar health overview.
   - Interactive **Daily Health Tip Rotator** with instant refresh.
   - UN Sustainable Development Goal 3 showcase.
   - Direct navigation to all health disciplines.

2. **Healthy Food (`food.html`)**:
   - The **Balanced Plate Model** (50% veggies & fruits, 25% whole grains, 25% lean proteins).
   - Foods to embrace vs. ultra-processed foods to avoid or limit.
   - **Interactive Water Intake Calculator**: Computes personalized hydration targets based on body weight and activity level.
   - Quick 10-minute wholesome snack ideas.

3. **Exercise & Physical Activity (`exercise.html`)**:
   - The science of walking and daily step strategies.
   - 4 core home bodyweight workouts (squats, incline push-ups, glute bridges, wall sits).
   - Beginner yoga postures (Child's Pose, Cat-Cow, Tree Pose).
   - **Interactive 5-Minute Stretch Interval Timer** to relieve posture stiffness while working or studying.

4. **Mental Well-Being (`mental-health.html`)**:
   - Daily stress-reduction strategies and 5-4-3-2-1 grounding techniques.
   - **Interactive 4-7-8 Breathing Circle**: Visual animated breathing bubble guiding 4s inhale, 7s hold, and 8s exhale.
   - Simple 5-minute meditation routine for beginners.
   - Digital mindfulness and work break strategies.

5. **Restorative Sleep (`sleep.html`)**:
   - Sleep science and why 7–9 hours of rest is non-negotiable.
   - Evening digital detox guide & blue light screen curfew.
   - **Interactive 90-Minute Sleep Cycle Calculator**: Calculates optimal bedtimes based on ultradian sleep cycles so you wake up refreshed without morning grogginess.
   - 5 essential sleep hygiene commandments.

6. **Daily Healthy Habits (`habits.html`)**:
   - **Interactive Daily Habit Tracker**: Interactive checklist for hydration, movement, nutrition, hygiene, and rest.
   - Real-time progress bar, daily completion percentage, and streak counter stored locally in `localStorage`.
   - Behavioral science of **Habit Stacking**: *"After [Current Habit], I will [New Healthy Habit]"*.

7. **About Us & Contact (`about.html`)**:
   - Project background, UN SDG 3 alignment, and target audience.
   - Frequently Asked Questions (interactive FAQ accordion).
   - **Contact & Feedback Form** with validation and instant feedback.
   - Emergency medical & crisis helpline numbers.

8. **Login & User Account Portal (`login.html`)**:
   - Official health logo branding and visual portal header.
   - Detailed login information & guidance: explains personalized benefits (syncing habit streaks, saving hydration goals, private health tracking).
   - Interactive tabbed interface: Sign In / Create Account.
   - Password visibility toggle (👁️ / 🙈).
   - **1-Click Demo Login** for immediate evaluation without manual input.
   - Dynamic navbar profile state displaying active user badge and Sign Out option.

---

## 🚀 How to Run the Application

The project is built with clean, modern **Java**, **HTML5**, **CSS3**, and **JavaScript**. You can run it in multiple ways:

### Option 1: Running with Java (Embedded Server)

If you have Java installed (Java 11 or higher):

```bash
# Direct run with Java (no compilation step needed in Java 11+)
java HealthAppServer.java

# Or compile and run
javac HealthAppServer.java
java HealthAppServer
```

Open your browser to:
👉 **`http://localhost:8080`**

The Java server provides:
- Static file serving with proper MIME types.
- REST API `/api/tips` (daily health tips JSON).
- REST API `/api/contact` (handles feedback submissions).
- REST API `/api/health-check` (server health status).

### Option 2: Using the Universal Runner Script

Run the automated detection script:
```bash
./run.sh
```
This automatically launches with Java, Node.js, Python, or directly opens in your default browser.

### Option 3: Running with Node.js

```bash
node server.js
```
Open **`http://localhost:8080`** in your browser.

### Option 4: Pure Frontend (Direct Browser Usage)

You can double-click **`index.html`** or open it directly in Google Chrome, Safari, Firefox, or Edge. All interactive tools (Habit Tracker, Breathing Bubble, Water Calculator, Sleep Cycle Calculator, Tip Rotator) work standalone via client-side JavaScript and `localStorage`.

---

## 📂 Project Structure

```
good health/
├── index.html              # Home Page (Overview, Categories, Daily Tip, CTA)
├── food.html               # Healthy Food (Balanced Diet, Hydration, Water Calc)
├── exercise.html           # Exercise (Workouts, Walking, Yoga, Stretch Timer)
├── mental-health.html      # Mental Well-Being (Stress relief, Breathing Bubble)
├── sleep.html              # Sleep (Hygiene, Screen detox, Sleep Cycle Calc)
├── habits.html             # Healthy Habits (Interactive Habit Tracker & Progress)
├── about.html              # About Project, SDG Goal 3, FAQ & Contact Form
├── css/
│   ├── style.css           # Core styling, responsive layout, theme & components
│   └── animations.css      # Smooth animations (breathing bubble, tip cards)
├── js/
│   ├── main.js             # Navigation, theme, active states, mobile menu
│   └── tools.js            # Interactive widgets (Calculators, Tracker, Breathing)
├── HealthAppServer.java    # Pure Java HTTP Server (zero dependencies)
├── java/
│   └── HealthAppServer.java # Packaged Java Server copy
├── server.js               # Node.js server alternative
├── run.sh                  # One-click multi-environment launch script
├── pom.xml                 # Maven configuration for Java IDEs
└── README.md               # Complete project documentation
```

---

## 🎨 Design System & Accessibility

- **Theme Palette**: Deep forest teal (`#0f766e`), emerald green (`#10b981`), warm amber (`#f59e0b`), and calming ocean blue (`#0284c7`).
- **Responsive**: Fully optimized for smartphones, tablets, laptops, and ultra-wide screens.
- **Accessibility**: Semantic HTML5 tags (`<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`), accessible ARIA attributes, and high-contrast text.
- **Privacy**: Interactive habit tracking data stays in the user's browser via secure local storage.

---

## 📜 License & Acknowledgments

This project is created to advance awareness for **UN Sustainable Development Goal 3: Good Health and Well-Being**. Free to use, adapt, and share for educational and community wellness initiatives.
