/**
 * Good Health and Well-Being - Interactive Health Activity Calendar & History
 * Displays daily task completion history and allows inspecting any date's completed tasks,
 * with full category-wise reporting and user-chosen category filtering.
 */

(function () {
  let calCurrentYear = new Date().getFullYear();
  let calCurrentMonth = new Date().getMonth() + 1; // 1-12
  let calSelectedDate = new Date().toISOString().slice(0, 10);
  let calMonthCache = {};
  let calActiveCategory = localStorage.getItem('gh_active_cat_filter') || 'all';

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const CAT_META = {
    all: { name: 'All Categories', icon: '🌟', color: '#10b981' },
    food: { name: 'Diet & Food', icon: '🥗', color: '#10b981' },
    exercise: { name: 'Exercise & Movement', icon: '🏃', color: '#f59e0b' },
    mental: { name: 'Mental Well-Being', icon: '🧘', color: '#8b5cf6' },
    sleep: { name: 'Sleep & Rest', icon: '🌙', color: '#3b82f6' },
    habits: { name: 'Daily Habits', icon: '✨', color: '#ec4899' }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const calendarSection = document.getElementById('health-calendar-section');
    if (calendarSection) {
      initCalendarUI();
    }
  });

  function getTodayString() {
    return new Date().toISOString().slice(0, 10);
  }

  function getActiveCondition() {
    return localStorage.getItem('gh_selected_condition') || 'general';
  }

  function updateCalendarCatPills() {
    calActiveCategory = localStorage.getItem('gh_active_cat_filter') || 'all';
    const calPillsContainer = document.getElementById('cal-cat-pills');
    if (!calPillsContainer) return;
    const pills = calPillsContainer.querySelectorAll('.cal-cat-pill');
    pills.forEach(pill => {
      const cat = pill.getAttribute('data-cat') || 'all';
      pill.classList.toggle('active', cat === calActiveCategory);
    });
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

    // Bind Calendar Category Pills
    const calPillsContainer = document.getElementById('cal-cat-pills');
    if (calPillsContainer) {
      const pills = calPillsContainer.querySelectorAll('.cal-cat-pill');
      pills.forEach(pill => {
        pill.addEventListener('click', () => {
          const cat = pill.getAttribute('data-cat') || 'all';
          calActiveCategory = cat;
          localStorage.setItem('gh_active_cat_filter', cat);
          updateCalendarCatPills();
          renderCalendarMonth();

          // Sync home category pills if present
          const homeFilterContainer = document.getElementById('home-category-filter-pills');
          if (homeFilterContainer) {
            homeFilterContainer.querySelectorAll('.cat-pill').forEach(hp => {
              hp.classList.toggle('active', (hp.getAttribute('data-cat') || 'all') === cat);
            });
          }

          // Save preference to backend
          if (window.HealthAPI && window.HealthAPI.saveCategoryPreferences) {
            const selected = cat === 'all'
              ? ['food', 'exercise', 'mental', 'sleep', 'habits']
              : [cat];
            window.HealthAPI.saveCategoryPreferences(selected);
          }

          // Dispatch event for other listeners
          window.dispatchEvent(new CustomEvent('gh_category_changed', { detail: { category: cat } }));
        });
      });
    }

    // Listen to category changes from Home Page checklist pills
    window.addEventListener('gh_category_changed', (e) => {
      if (e.detail && e.detail.category && e.detail.category !== calActiveCategory) {
        calActiveCategory = e.detail.category;
        updateCalendarCatPills();
        renderCalendarMonth();
      }
    });

    // Listen to condition changes
    window.addEventListener('gh_condition_changed', () => {
      renderCalendarMonth();
    });

    updateCalendarCatPills();
    await renderCalendarMonth();
  }

  async function renderCalendarMonth() {
    const monthYearLabel = document.getElementById('cal-month-year-label');
    const gridContainer = document.getElementById('cal-days-grid');
    if (!gridContainer) return;

    calActiveCategory = localStorage.getItem('gh_active_cat_filter') || 'all';
    updateCalendarCatPills();
    const activeCondition = getActiveCondition();

    if (monthYearLabel) {
      monthYearLabel.textContent = `${MONTH_NAMES[calCurrentMonth - 1]} ${calCurrentYear}`;
    }

    // Fetch month history from backend if logged in
    let monthLogs = {};
    if (window.HealthAPI && window.HealthAPI.getCalendarMonth) {
      try {
        const history = await window.HealthAPI.getCalendarMonth(calCurrentYear, calCurrentMonth, calActiveCategory, activeCondition);
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
    const catMeta = CAT_META[calActiveCategory] || { name: 'All', icon: '🌟' };

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

        const titleText = calActiveCategory !== 'all'
          ? `${score}% (${log.done}/${log.total || log.done} ${catMeta.name} tasks completed)`
          : `${score}% (${log.done}/${log.total || log.done} tasks completed)`;

        badgeHtml = `<span class="cal-day-badge ${badgeClass}" title="${titleText}">${score}%</span>`;
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

    calActiveCategory = localStorage.getItem('gh_active_cat_filter') || 'all';
    const activeCondition = getActiveCondition();
    const catMeta = CAT_META[calActiveCategory] || { name: 'All Categories', icon: '🌟' };

    // Format human-readable date
    const [y, m, d] = dateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateFormatted = dateObj.toLocaleDateString('en-US', options);

    if (titleEl) {
      if (calActiveCategory !== 'all') {
        titleEl.textContent = `📅 Activity on ${dateFormatted} • ${catMeta.icon} ${catMeta.name}`;
      } else {
        titleEl.textContent = `📅 Activity on ${dateFormatted}`;
      }
    }
    if (subEl) subEl.textContent = `Checking completed tasks for ${dateKey}...`;
    if (scoreBadge) {
      scoreBadge.className = 'cal-details-score-badge';
      scoreBadge.textContent = '--';
    }

    listEl.innerHTML = '<div class="cal-empty-msg">Loading tasks from database...</div>';

    let dayData = null;
    if (window.HealthAPI && window.HealthAPI.getCalendarDay) {
      try {
        dayData = await window.HealthAPI.getCalendarDay(dateKey, activeCondition, calActiveCategory);
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

    const condTitle = log && log.condition_key ? `Condition: ${log.condition_key.replace('_', ' ').toUpperCase()}` : '';

    if (doneVal > 0) {
      if (scoreBadge) {
        if (calActiveCategory !== 'all') {
          scoreBadge.textContent = `🏆 ${score}% (${catMeta.name})`;
        } else {
          scoreBadge.textContent = `🏆 ${score}% Health Score (${doneVal} Done)`;
        }
        if (score >= 70) scoreBadge.classList.add('badge-green');
      }
      if (subEl) {
        if (calActiveCategory !== 'all') {
          subEl.textContent = `${doneVal} of ${totalVal} ${catMeta.name} tasks completed. ${condTitle}`;
        } else {
          subEl.textContent = `${doneVal} of ${totalVal} tasks completed. ${condTitle}`;
        }
      }
    } else {
      if (scoreBadge) {
        scoreBadge.textContent = calActiveCategory !== 'all' ? `0% (${catMeta.name})` : '0% Score';
      }
      if (subEl) {
        subEl.textContent = calActiveCategory !== 'all'
          ? `No ${catMeta.name} tasks recorded for this date.`
          : 'No activity recorded or rest day.';
      }
    }

    const categoryBreakdown = (dayData && dayData.categoryBreakdown) || [];

    let breakdownHtml = '';
    if (categoryBreakdown.length > 0) {
      breakdownHtml = `
        <div style="margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; flex-wrap: wrap; gap: 0.5rem;">
            <h5 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #334155;">
              📊 Category-Wise Completion Report
            </h5>
            ${calActiveCategory !== 'all' ? `<span style="font-size: 0.8rem; color: #10b981; font-weight: 700; background: #ecfdf5; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid #a7f3d0;">Selected Focus: ${catMeta.name}</span>` : ''}
          </div>
          <div class="cal-category-breakdown-grid">
            ${categoryBreakdown.map(cat => {
              const isSelected = cat.category === calActiveCategory;
              return `
              <div class="cal-cat-summary-card ${isSelected ? 'cat-card-selected' : ''}" data-cat="${cat.category}" style="cursor: pointer;" title="Click to filter calendar by ${cat.name}">
                <div class="cal-cat-card-header">
                  <div class="cal-cat-title">
                    <span>${cat.icon}</span>
                    <span>${cat.name}</span>
                  </div>
                  <span class="cal-cat-pct-badge ${cat.done > 0 && cat.done >= cat.total ? 'badge-done' : ''}">
                    ${cat.score}%
                  </span>
                </div>
                <div class="cal-cat-progress-track">
                  <div class="cal-cat-progress-fill" style="width: ${cat.score}%; background: ${cat.color};"></div>
                </div>
                <div class="cal-cat-stats-row">
                  <span>${cat.done} of ${cat.total} Completed</span>
                  <span>${cat.done >= cat.total && cat.total > 0 ? '🎉 Complete' : (cat.done > 0 ? '⚡ In Progress' : '⚪ Not Started')}</span>
                </div>
              </div>
            `;
            }).join('')}
          </div>
        </div>
      `;
    }

    let filterNotice = '';
    if (calActiveCategory !== 'all') {
      filterNotice = `
        <div style="display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 0.55rem 0.9rem; border-radius: 12px; margin-bottom: 0.95rem; font-size: 0.85rem; color: #166534;">
          <span>Showing only <strong>${catMeta.name}</strong> tasks.</span>
          <button type="button" id="btn-cal-show-all" style="background: white; border: 1px solid #86efac; color: #059669; font-weight: 700; cursor: pointer; border-radius: 9999px; padding: 0.25rem 0.75rem; font-size: 0.82rem; transition: all 0.2s ease;">🌟 Show All Categories</button>
        </div>
      `;
    }

    if (completedTasks.length === 0) {
      listEl.innerHTML = `
        ${breakdownHtml}
        ${filterNotice}
        <div class="cal-empty-msg" style="border: 1px dashed #cbd5e1; border-radius: 14px; padding: 1.75rem 1rem;">
          <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">⚪</span>
          <strong>No ${calActiveCategory !== 'all' ? catMeta.name : ''} tasks completed on ${dateFormatted}.</strong>
          <p style="margin: 0.25rem 0 0; font-size: 0.85rem; color: #94a3b8;">
            Check tasks off on today's checklist to record your progress!
          </p>
        </div>
      `;
      attachCategoryCardClickHandlers();
      return;
    }

    listEl.innerHTML = breakdownHtml + filterNotice + `
      <h5 style="margin: 1.25rem 0 0.65rem; font-size: 0.95rem; font-weight: 800; color: #334155;">
        ✅ Itemized Tasks Completed (${completedTasks.length})
      </h5>
      <div style="display: flex; flex-direction: column; gap: 0.65rem;">
        ${completedTasks.map(task => {
          const catKey = task.category || 'habits';
          const catClass = `cal-cat-${catKey}`;
          return `
            <div class="cal-task-card">
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
            </div>
          `;
        }).join('')}
      </div>
    `;

    attachCategoryCardClickHandlers();
  }

  function attachCategoryCardClickHandlers() {
    const showAllBtn = document.getElementById('btn-cal-show-all');
    if (showAllBtn) {
      showAllBtn.addEventListener('click', () => {
        calActiveCategory = 'all';
        localStorage.setItem('gh_active_cat_filter', 'all');
        updateCalendarCatPills();
        renderCalendarMonth();

        // Sync home category pills if present
        const homeFilterContainer = document.getElementById('home-category-filter-pills');
        if (homeFilterContainer) {
          homeFilterContainer.querySelectorAll('.cat-pill').forEach(hp => {
            hp.classList.toggle('active', (hp.getAttribute('data-cat') || 'all') === 'all');
          });
        }

        if (window.HealthAPI && window.HealthAPI.saveCategoryPreferences) {
          window.HealthAPI.saveCategoryPreferences(['food', 'exercise', 'mental', 'sleep', 'habits']);
        }

        window.dispatchEvent(new CustomEvent('gh_category_changed', { detail: { category: 'all' } }));
      });
    }

    const cards = document.querySelectorAll('.cal-cat-summary-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.getAttribute('data-cat');
        if (cat) {
          calActiveCategory = cat;
          localStorage.setItem('gh_active_cat_filter', cat);
          updateCalendarCatPills();
          renderCalendarMonth();

          // Sync home category pills if present
          const homeFilterContainer = document.getElementById('home-category-filter-pills');
          if (homeFilterContainer) {
            homeFilterContainer.querySelectorAll('.cat-pill').forEach(hp => {
              hp.classList.toggle('active', (hp.getAttribute('data-cat') || 'all') === cat);
            });
          }

          if (window.HealthAPI && window.HealthAPI.saveCategoryPreferences) {
            window.HealthAPI.saveCategoryPreferences([cat]);
          }

          window.dispatchEvent(new CustomEvent('gh_category_changed', { detail: { category: cat } }));
        }
      });
    });
  }

  // Expose global calendar refresh
  window.refreshHealthCalendar = function () {
    renderCalendarMonth();
  };
})();
