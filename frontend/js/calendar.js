/**
 * Good Health and Well-Being - Interactive Health Activity Calendar & History
 * Displays daily task completion history and allows inspecting any date's completed tasks.
 */

(function () {
  let calCurrentYear = new Date().getFullYear();
  let calCurrentMonth = new Date().getMonth() + 1; // 1-12
  let calSelectedDate = new Date().toISOString().slice(0, 10);
  let calMonthCache = {};

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  document.addEventListener('DOMContentLoaded', () => {
    const calendarSection = document.getElementById('health-calendar-section');
    if (calendarSection) {
      initCalendarUI();
    }
  });

  function getTodayString() {
    return new Date().toISOString().slice(0, 10);
  }

  async function initCalendarUI() {
    const prevBtn = document.getElementById('cal-btn-prev');
    const nextBtn = document.getElementById('cal-btn-next');
    const todayBtn = document.getElementById('cal-btn-today');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        calCurrentMonth--;
        if (calCurrentMonth < 1) {
          calCurrentMonth = 12;
          calCurrentYear--;
        }
        renderCalendarMonth();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        calCurrentMonth++;
        if (calCurrentMonth > 12) {
          calCurrentMonth = 1;
          calCurrentYear++;
        }
        renderCalendarMonth();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        const now = new Date();
        calCurrentYear = now.getFullYear();
        calCurrentMonth = now.getMonth() + 1;
        calSelectedDate = getTodayString();
        renderCalendarMonth();
      });
    }

    await renderCalendarMonth();
  }

  async function renderCalendarMonth() {
    const monthYearLabel = document.getElementById('cal-month-year-label');
    const gridContainer = document.getElementById('cal-days-grid');
    if (!gridContainer) return;

    if (monthYearLabel) {
      monthYearLabel.textContent = `${MONTH_NAMES[calCurrentMonth - 1]} ${calCurrentYear}`;
    }

    // Fetch month history from backend if logged in
    let monthLogs = {};
    if (window.HealthAPI && window.HealthAPI.getCalendarMonth) {
      try {
        const history = await window.HealthAPI.getCalendarMonth(calCurrentYear, calCurrentMonth);
        if (history && Array.isArray(history)) {
          history.forEach(item => {
            const dateKey = typeof item.date === 'string' ? item.date.slice(0, 10) : new Date(item.date).toISOString().slice(0, 10);
            monthLogs[dateKey] = item;
          });
        }
      } catch (err) {
        console.warn('Could not load month history:', err);
      }
    }
    calMonthCache = monthLogs;

    // Calculate days in month and starting day of week
    const firstDay = new Date(calCurrentYear, calCurrentMonth - 1, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(calCurrentYear, calCurrentMonth, 0).getDate();
    const todayStr = getTodayString();

    gridContainer.innerHTML = '';

    // Render leading empty cells
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day-cell empty';
      gridContainer.appendChild(emptyCell);
    }

    // Render actual day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(calCurrentMonth).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${calCurrentYear}-${monthStr}-${dayStr}`;

      const cell = document.createElement('div');
      cell.className = 'cal-day-cell';
      cell.setAttribute('data-date', dateKey);

      if (dateKey === todayStr) cell.classList.add('today');
      if (dateKey === calSelectedDate) cell.classList.add('selected');

      const log = monthLogs[dateKey];
      let badgeHtml = '';
      if (log && log.done > 0) {
        const score = Math.round(Number(log.score) || 0);
        let badgeClass = 'status-low';
        if (score >= 70) badgeClass = 'status-high';
        else if (score >= 30) badgeClass = 'status-mid';

        badgeHtml = `<span class="cal-day-badge ${badgeClass}" title="${score}% (${log.done}/${log.total || log.done} done)">${score}%</span>`;
      }

      cell.innerHTML = `
        <span class="cal-day-num">${day}</span>
        ${badgeHtml}
      `;

      cell.addEventListener('click', () => {
        document.querySelectorAll('.cal-day-cell.selected').forEach(el => el.classList.remove('selected'));
        cell.classList.add('selected');
        calSelectedDate = dateKey;
        loadDayDetails(dateKey);
      });

      gridContainer.appendChild(cell);
    }

    // Load details for selected date
    await loadDayDetails(calSelectedDate);
  }

  async function loadDayDetails(dateKey) {
    const titleEl = document.getElementById('cal-details-date-title');
    const subEl = document.getElementById('cal-details-date-sub');
    const scoreBadge = document.getElementById('cal-details-score-badge');
    const listEl = document.getElementById('cal-completed-tasks-list');
    if (!listEl) return;

    // Format human-readable date
    const [y, m, d] = dateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateFormatted = dateObj.toLocaleDateString('en-US', options);

    if (titleEl) titleEl.textContent = `📅 Activity on ${dateFormatted}`;
    if (subEl) subEl.textContent = `Checking completed tasks for ${dateKey}...`;
    if (scoreBadge) {
      scoreBadge.className = 'cal-details-score-badge';
      scoreBadge.textContent = '--';
    }

    listEl.innerHTML = '<div class="cal-empty-msg">Loading tasks from database...</div>';

    let dayData = null;
    if (window.HealthAPI && window.HealthAPI.getCalendarDay) {
      try {
        dayData = await window.HealthAPI.getCalendarDay(dateKey);
      } catch (err) {
        console.warn('Could not fetch calendar day details:', err);
      }
    }

    const log = (dayData && dayData.log) || calMonthCache[dateKey] || null;
    const completedTasks = (dayData && dayData.completedTasks) || [];

    const doneVal = (log && (log.done !== undefined ? log.done : log.tasks_done)) || completedTasks.length;
    const totalVal = (log && (log.total !== undefined ? log.total : log.tasks_total)) || (doneVal > 0 ? doneVal : 22);
    const scoreVal = (log && (log.score !== undefined ? log.score : log.score_percent)) || (totalVal > 0 ? (doneVal / totalVal) * 100 : 0);
    const score = Math.round(Number(scoreVal) || 0);

    if (doneVal > 0) {
      if (scoreBadge) {
        scoreBadge.textContent = `🏆 ${score}% Health Score (${doneVal} Done)`;
        if (score >= 70) scoreBadge.classList.add('badge-green');
      }
      if (subEl) {
        const condTitle = log && log.condition_key ? `Condition: ${log.condition_key.replace('_', ' ').toUpperCase()}` : '';
        subEl.textContent = `${doneVal} of ${totalVal} tasks completed. ${condTitle}`;
      }
    } else {
      if (scoreBadge) scoreBadge.textContent = '0% Score';
      if (subEl) subEl.textContent = 'No activity recorded or rest day.';
    }

    if (completedTasks.length === 0) {
      listEl.innerHTML = `
        <div class="cal-empty-msg">
          <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">⚪</span>
          <strong>No tasks were completed on ${dateFormatted}.</strong>
          <p style="margin: 0.25rem 0 0; font-size: 0.85rem; color: #94a3b8;">
            Check tasks off on today's checklist to record your progress!
          </p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = '';
    completedTasks.forEach(task => {
      const card = document.createElement('div');
      card.className = 'cal-task-card';

      const catKey = task.category || 'habits';
      const catClass = `cal-cat-${catKey}`;

      card.innerHTML = `
        <div class="cal-task-info">
          <span class="cal-task-icon">${task.icon || '📝'}</span>
          <div>
            <div class="cal-task-name">${task.name}</div>
            ${task.tip ? `<div class="cal-task-tip">${task.tip}</div>` : ''}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <span class="cal-category-tag ${catClass}">${catKey}</span>
          <span style="color: #10b981; font-weight: 800; font-size: 1.1rem;" title="Completed on this date">✓</span>
        </div>
      `;
      listEl.appendChild(card);
    });
  }

  // Expose global calendar refresh
  window.refreshHealthCalendar = function () {
    renderCalendarMonth();
  };
})();
