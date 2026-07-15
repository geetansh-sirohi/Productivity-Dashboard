// ═══════════════════════════════════════════════════════════════
// PRODUCTIVITY DASHBOARD — script.js
// Coding Style matches user's assignments (excluding FinTrack Pro)
// Uses Arrow Functions, global state arrays, and innerHTML rendering.
// ═══════════════════════════════════════════════════════════════

// ── DOM SELECTORS ─────────────────────────────────────────────
const timeDisplay = document.querySelector("#live-time");
const dateDisplay = document.querySelector("#live-date");
const themeBtn = document.querySelector("#theme-toggle-btn");
const bgOverlay = document.querySelector("#dynamic-bg-overlay");

// Weather selectors
const weatherLoading = document.querySelector("#weather-loading");
const weatherContent = document.querySelector("#weather-content");
const weatherIcon = document.querySelector("#weather-icon");
const weatherTemp = document.querySelector("#weather-temp");
const weatherCity = document.querySelector("#weather-city");
const weatherDesc = document.querySelector("#weather-desc");

// Todo selectors
const todoInput = document.querySelector("#todo-input");
const todoAddBtn = document.querySelector("#add-task-btn");
const todoList = document.querySelector("#todo-list-container");
const todoCardBadge = document.querySelector("#todo-badge");

// Goals selectors
const goalsInput = document.querySelector("#goals-input");
const goalsAddBtn = document.querySelector("#add-goal-btn");
const goalsList = document.querySelector("#goals-list-container");
const goalsCardBadge = document.querySelector("#goals-badge");
const goalsProgressText = document.querySelector("#goals-progress-text");
const goalsPercentage = document.querySelector("#goals-percentage");
const goalsProgressBar = document.querySelector("#goals-progress-bar");

// Planner selectors
const plannerSlots = document.querySelector("#planner-slots-container");
const plannerCardBadge = document.querySelector("#planner-badge");

// Pomodoro selectors
const pomoDisplay = document.querySelector("#pomo-display");
const pomoLabel = document.querySelector("#pomo-status-label");
const pomoStartBtn = document.querySelector("#pomo-start-btn");
const pomoPauseBtn = document.querySelector("#pomo-pause-btn");
const pomoResetBtn = document.querySelector("#pomo-reset-btn");
const pomoCardBadge = document.querySelector("#pomo-badge");
const alarmSound = document.querySelector("#alarm-sound");

// Quotes selectors
const quoteText = document.querySelector("#quote-text");
const quoteAuthor = document.querySelector("#quote-author");
const quoteNewBtn = document.querySelector("#new-quote-btn");

// ── GLOBAL STATE ──────────────────────────────────────────────
let tasks = [];
let goals = [];
let plannerNotes = {}; // Keys: '8:00 AM', '9:00 AM', etc.

// Pomodoro state
let pomoTimer = null;
let pomoSeconds = 1500; // 25 mins default
let pomoMode = "work"; // 'work', 'break', 'longBreak'
let pomoIsRunning = false;

// Fallback Quote Database (Used if Fetch fails/offline)
const quotesDatabase = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" }
];

// ── INITIALIZATION ────────────────────────────────────────────
const init = () => {
  loadLocalStorage();
  updateTimeAndDate();
  updateBackgroundGradient();
  initTheme();
  fetchWeather();
  fetchQuote();

  // Set up intervals
  setInterval(updateTimeAndDate, 1000);
  setInterval(updateBackgroundGradient, 60000); // Check background gradient every minute

  // Render lists
  renderTasks();
  renderGoals();
  renderPlanner();
  updatePomoDisplay();
};

// ── LOCAL STORAGE HELPERS ─────────────────────────────────────
const loadLocalStorage = () => {
  try {
    const savedTasks = localStorage.getItem("prod_tasks");
    tasks = savedTasks ? JSON.parse(savedTasks) : [];
  } catch (e) {
    tasks = [];
  }

  try {
    const savedGoals = localStorage.getItem("prod_goals");
    goals = savedGoals ? JSON.parse(savedGoals) : [];
  } catch (e) {
    goals = [];
  }

  try {
    const savedPlanner = localStorage.getItem("prod_planner");
    plannerNotes = savedPlanner ? JSON.parse(savedPlanner) : {
      "08:00 AM": "", "09:00 AM": "", "10:00 AM": "", "11:00 AM": "",
      "12:00 PM": "", "01:00 PM": "", "02:00 PM": "", "03:00 PM": "",
      "04:00 PM": "", "05:00 PM": "", "06:00 PM": "", "07:00 PM": "",
      "08:00 PM": ""
    };
  } catch (e) {
    plannerNotes = {};
  }
};

const saveTasks = () => {
  localStorage.setItem("prod_tasks", JSON.stringify(tasks));
  renderTasks();
};

const saveGoals = () => {
  localStorage.setItem("prod_goals", JSON.stringify(goals));
  renderGoals();
};

// ── NAVIGATION CONTROLLERS ────────────────────────────────────
const openFeature = (viewName) => {
  // Hide all screens
  document.querySelector("#dashboard-view").classList.remove("active-view");
  document.querySelector("#dashboard-view").classList.add("hidden-view");

  const views = document.querySelectorAll(".feature-view");
  views.forEach((v) => {
    v.classList.remove("active-view");
    v.classList.add("hidden-view");
  });

  // Show active view
  const targetView = document.querySelector(`#${viewName}-view`);
  if (targetView) {
    targetView.classList.remove("hidden-view");
    targetView.classList.add("active-view");
  }
};

const goHome = () => {
  const views = document.querySelectorAll(".feature-view");
  views.forEach((v) => {
    v.classList.remove("active-view");
    v.classList.add("hidden-view");
  });

  document.querySelector("#dashboard-view").classList.remove("hidden-view");
  document.querySelector("#dashboard-view").classList.add("active-view");

  // Re-render dashboard badges on return
  updateDashboardBadges();
};

const updateDashboardBadges = () => {
  // Todo badge
  const pendingCount = tasks.filter(t => !t.completed).length;
  todoCardBadge.textContent = `${pendingCount} task${pendingCount !== 1 ? 's' : ''}`;

  // Goals badge
  const completedGoals = goals.filter(g => g.completed).length;
  goalsCardBadge.textContent = `${completedGoals} of ${goals.length} done`;

  // Planner badge
  const activeSlots = Object.values(plannerNotes).filter(n => n.trim() !== "").length;
  plannerCardBadge.textContent = activeSlots > 0 ? `${activeSlots} block${activeSlots !== 1 ? 's' : ''}` : "Empty";
};

// ── LIVE DATE & TIME ──────────────────────────────────────────
const updateTimeAndDate = () => {
  const now = new Date();
  
  // Format Time
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'
  const formattedTime = `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
  timeDisplay.textContent = formattedTime;

  // Format Date
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  dateDisplay.textContent = now.toLocaleDateString("en-US", options);
};

// ── DYNAMIC GRADIENT BACKGROUND ───────────────────────────────
const updateBackgroundGradient = () => {
  const hour = new Date().getHours();
  bgOverlay.className = ""; // Reset class list

  if (hour >= 5 && hour < 12) {
    bgOverlay.classList.add("bg-morning");
  } else if (hour >= 12 && hour < 17) {
    bgOverlay.classList.add("bg-afternoon");
  } else if (hour >= 17 && hour < 21) {
    bgOverlay.classList.add("bg-evening");
  } else {
    bgOverlay.classList.add("bg-night");
  }
};

// ── THEME INTERACTIVE SYSTEM ──────────────────────────────────
const initTheme = () => {
  const savedTheme = localStorage.getItem("prod_theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
    themeBtn.innerHTML = `<span class="btn-icon">🌙</span><span class="btn-text">Dark Mode</span>`;
  } else {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
    themeBtn.innerHTML = `<span class="btn-icon">☀️</span><span class="btn-text">Light Mode</span>`;
  }
  updateDashboardBadges();
};

themeBtn.addEventListener("click", () => {
  if (document.body.classList.contains("light-theme")) {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
    themeBtn.innerHTML = `<span class="btn-icon">🌙</span><span class="btn-text">Dark Mode</span>`;
    localStorage.setItem("prod_theme", "dark");
  } else {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
    themeBtn.innerHTML = `<span class="btn-icon">☀️</span><span class="btn-text">Light Mode</span>`;
    localStorage.setItem("prod_theme", "light");
  }
});

// ── WEATHER INTEGRATION (Open-Meteo & Geolocation) ──
const fetchWeather = () => {
  weatherLoading.textContent = "Loading weather...";
  weatherLoading.classList.remove("hidden");
  weatherContent.classList.add("hidden");

  // Try browser GPS geolocation first for exact local coordinates
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        // Fetch city name from ipwho.is for coords, or show "My Location"
        fetch("https://ipwho.is/")
          .then(res => res.json())
          .then(data => {
            const city = (data && data.success && data.city) ? data.city : "My Location";
            callMeteoAPI(lat, lon, city);
          })
          .catch(() => {
            callMeteoAPI(lat, lon, "My Location");
          });
      },
      () => {
        // Geolocation denied/failed: Fallback to IP geolocation
        fetchIPWeather();
      },
      { timeout: 5000 }
    );
  } else {
    // Geolocation not supported: Fallback to IP geolocation
    fetchIPWeather();
  }
};

const fetchIPWeather = () => {
  fetch("https://ipwho.is/")
    .then(res => res.json())
    .then(data => {
      if (data && data.success) {
        callMeteoAPI(data.latitude, data.longitude, data.city || "Local Area");
      } else {
        callMeteoAPI(40.7128, -74.0060, "New York");
      }
    })
    .catch(() => {
      callMeteoAPI(40.7128, -74.0060, "New York");
    });
};

const callMeteoAPI = (lat, lon, city) => {
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
    .then(res => res.json())
    .then(data => {
      if (data.current_weather) {
        const temp = parseFloat(data.current_weather.temperature).toFixed(1);
        const code = data.current_weather.weathercode;
        const weatherInfo = mapWeatherCode(code);
        
        weatherTemp.textContent = `${temp}°C`;
        weatherCity.textContent = city;
        weatherIcon.textContent = weatherInfo.icon;
        weatherDesc.textContent = weatherInfo.text;

        weatherLoading.classList.add("hidden");
        weatherContent.classList.remove("hidden");
      } else {
        showWeatherError();
      }
    })
    .catch(() => {
      showWeatherError();
    });
};

const showWeatherError = () => {
  weatherLoading.textContent = "Weather unavailable";
};

const mapWeatherCode = (code) => {
  if (code === 0) return { icon: "☀️", text: "Clear Sky" };
  if (code >= 1 && code <= 3) return { icon: "⛅", text: "Partly Cloudy" };
  if (code >= 45 && code <= 48) return { icon: "🌫️", text: "Foggy" };
  if (code >= 51 && code <= 55) return { icon: "🌧️", text: "Drizzle" };
  if (code >= 61 && code <= 65) return { icon: "🌧️", text: "Rainy" };
  if (code >= 71 && code <= 77) return { icon: "❄️", text: "Snowy" };
  if (code >= 80 && code <= 82) return { icon: "🌧️", text: "Showers" };
  if (code >= 95) return { icon: "⛈️", text: "Thunderstorm" };
  return { icon: "🌡️", text: "Normal" };
};

// ── MOTIVATION QUOTES ─────────────────────────────────────────
const fetchQuote = () => {
  quoteText.textContent = "Fetching motivational quote...";
  quoteAuthor.textContent = "";

  // Use a direct Random Quotes API (dummyjson) with cache buster to prevent caching
  fetch(`https://dummyjson.com/quotes/random?cb=${Date.now()}`)
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(data => {
      if (data && data.quote) {
        quoteText.textContent = data.quote;
        quoteAuthor.textContent = `— ${data.author || "Unknown"}`;
      } else {
        loadLocalQuote();
      }
    })
    .catch(() => {
      loadLocalQuote();
    });
};

const loadLocalQuote = () => {
  const index = Math.floor(Math.random() * quotesDatabase.length);
  quoteText.textContent = quotesDatabase[index].text;
  quoteAuthor.textContent = `— ${quotesDatabase[index].author}`;
};

quoteNewBtn.addEventListener("click", fetchQuote);

// ── TODO LIST MODULE ──────────────────────────────────────────
const renderTasks = () => {
  todoList.innerHTML = "";
  
  // Sort tasks: Priority first, then uncompleted first
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.important !== b.important) return a.important ? -1 : 1;
    return 0;
  });

  sortedTasks.forEach((task) => {
    // Find original index in global state array for callbacks
    const originalIndex = tasks.findIndex(t => t.id === task.id);
    
    todoList.innerHTML += `
      <li class="task-item ${task.completed ? 'task-completed' : ''}">
        <div class="task-text-group">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTask(${originalIndex})">
          <span class="task-title">${escapeHTML(task.title)}</span>
          ${task.important ? '<span class="task-badge badge-priority">HIGH</span>' : ''}
        </div>
        <div class="item-actions">
          <button class="important-star ${task.important ? 'starred' : ''}" onclick="togglePriority(${originalIndex})">★</button>
          <button class="btn-icon btn-delete" onclick="deleteTask(${originalIndex})">🗑️</button>
        </div>
      </li>
    `;
  });

  updateDashboardBadges();
};

const addTask = () => {
  const title = todoInput.value.trim();
  if (title === "") return;

  tasks.push({
    id: Date.now(),
    title: title,
    completed: false,
    important: false
  });

  todoInput.value = "";
  saveTasks();
};

const toggleTask = (index) => {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
};

const togglePriority = (index) => {
  tasks[index].important = !tasks[index].important;
  saveTasks();
};

const deleteTask = (index) => {
  tasks.splice(index, 1);
  saveTasks();
};

todoAddBtn.addEventListener("click", addTask);
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

// ── DAILY GOALS MODULE ────────────────────────────────────────
const renderGoals = () => {
  goalsList.innerHTML = "";

  goals.forEach((goal, index) => {
    goalsList.innerHTML += `
      <li class="goal-item ${goal.completed ? 'goal-completed' : ''}">
        <div class="goal-text-group">
          <input type="checkbox" class="goal-checkbox" ${goal.completed ? 'checked' : ''} onclick="toggleGoal(${index})">
          <span class="goal-title">${escapeHTML(goal.title)}</span>
        </div>
        <div class="item-actions">
          <button class="btn-icon btn-delete" onclick="deleteGoal(${index})">🗑️</button>
        </div>
      </li>
    `;
  });

  updateGoalsProgress();
};

const addGoal = () => {
  const title = goalsInput.value.trim();
  if (title === "") return;

  goals.push({
    title: title,
    completed: false
  });

  goalsInput.value = "";
  saveGoals();
};

const toggleGoal = (index) => {
  goals[index].completed = !goals[index].completed;
  saveGoals();
};

const deleteGoal = (index) => {
  goals.splice(index, 1);
  saveGoals();
};

const updateGoalsProgress = () => {
  const total = goals.length;
  const completed = goals.filter(g => g.completed).length;
  
  goalsProgressText.textContent = `${completed} of ${total} Completed`;
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  goalsPercentage.textContent = `${percentage}%`;
  goalsProgressBar.style.width = `${percentage}%`;

  updateDashboardBadges();
};

goalsAddBtn.addEventListener("click", addGoal);
goalsInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addGoal();
});

// ── DAILY HOURLY PLANNER MODULE ───────────────────────────────
const renderPlanner = () => {
  plannerSlots.innerHTML = "";
  
  const hoursKeys = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
    "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
    "08:00 PM"
  ];

  // Get current hour in local system format for highlighting (e.g. "09:00 AM")
  const currentHour = getCurrentHourString();

  hoursKeys.forEach((hour) => {
    const note = plannerNotes[hour] || "";
    const isCurrent = hour === currentHour;

    plannerSlots.innerHTML += `
      <div class="planner-row ${isCurrent ? 'current-hour-row' : ''}">
        <span class="planner-time">${hour}</span>
        <input type="text" 
               class="planner-note-input" 
               id="planner-note-${hour.replace(/[: ]/g, '')}" 
               value="${escapeHTML(note)}" 
               placeholder="No plans scheduled..." 
               oninput="onPlannerInputChange('${hour}')"
               onblur="savePlannerNote('${hour}')">
        <button class="planner-save-btn" 
                id="save-btn-${hour.replace(/[: ]/g, '')}" 
                onclick="savePlannerNote('${hour}')">Saved</button>
      </div>
    `;
  });

  updateDashboardBadges();
};

const getCurrentHourString = () => {
  const now = new Date();
  let hour = now.getHours();
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${String(hour).padStart(2, "0")}:00 ${ampm}`;
};

const onPlannerInputChange = (hour) => {
  const idSafe = hour.replace(/[: ]/g, '');
  const saveBtn = document.querySelector(`#save-btn-${idSafe}`);
  if (saveBtn) {
    saveBtn.textContent = "Save";
    saveBtn.classList.add("changed");
  }
};

const savePlannerNote = (hour) => {
  const idSafe = hour.replace(/[: ]/g, '');
  const inputEl = document.querySelector(`#planner-note-${idSafe}`);
  const saveBtn = document.querySelector(`#save-btn-${idSafe}`);
  
  if (inputEl && saveBtn) {
    const value = inputEl.value.trim();
    plannerNotes[hour] = value;
    localStorage.setItem("prod_planner", JSON.stringify(plannerNotes));

    saveBtn.textContent = "Saved";
    saveBtn.classList.remove("changed");

    updateDashboardBadges();
  }
};

// ── POMODORO FOCUS TIMER MODULE ───────────────────────────────
const updatePomoDisplay = () => {
  const mins = Math.floor(pomoSeconds / 60);
  const secs = pomoSeconds % 60;
  pomoDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  pomoCardBadge.textContent = pomoIsRunning ? "Active" : "Ready";
};

const setPomoDuration = (mins, mode) => {
  // Reset active presets classes
  const presets = document.querySelectorAll(".pomo-preset-btn");
  presets.forEach(p => p.classList.remove("active-preset"));

  // Highlight selected preset
  const eventTarget = window.event ? window.event.target : null;
  if (eventTarget) {
    eventTarget.classList.add("active-preset");
  }

  // Clear running timer
  clearInterval(pomoTimer);
  pomoIsRunning = false;
  pomoMode = mode;
  pomoSeconds = mins * 60;
  
  pomoLabel.textContent = `${mode.toUpperCase()} SESSION`;
  
  pomoStartBtn.classList.remove("hidden");
  pomoPauseBtn.classList.add("hidden");

  updatePomoDisplay();
};

const startPomoTimer = () => {
  if (pomoIsRunning) return;
  pomoIsRunning = true;

  pomoStartBtn.classList.add("hidden");
  pomoPauseBtn.classList.remove("hidden");

  pomoTimer = setInterval(() => {
    if (pomoSeconds > 0) {
      pomoSeconds--;
      updatePomoDisplay();
    } else {
      // Time hit zero! Fire Alarm and switch modes
      clearInterval(pomoTimer);
      pomoIsRunning = false;
      alarmSound.play().catch(() => {});
      
      alert(`${pomoMode.toUpperCase()} Session has ended! Take action.`);
      
      // Auto transition modes
      if (pomoMode === "work") {
        setPomoDuration(5, "break");
      } else {
        setPomoDuration(25, "work");
      }
    }
  }, 1000);
  
  updatePomoDisplay();
};

const pausePomoTimer = () => {
  clearInterval(pomoTimer);
  pomoIsRunning = false;
  pomoStartBtn.classList.remove("hidden");
  pomoPauseBtn.classList.add("hidden");
  updatePomoDisplay();
};

const resetPomoTimer = () => {
  clearInterval(pomoTimer);
  pomoIsRunning = false;
  pomoSeconds = pomoMode === "work" ? 1500 : (pomoMode === "break" ? 300 : 900);
  
  pomoStartBtn.classList.remove("hidden");
  pomoPauseBtn.classList.add("hidden");
  updatePomoDisplay();
};

pomoStartBtn.addEventListener("click", startPomoTimer);
pomoPauseBtn.addEventListener("click", pausePomoTimer);
pomoResetBtn.addEventListener("click", resetPomoTimer);

// ── ESCAPE HTML UTILITY (Prevents XSS Injection) ──────────────
const escapeHTML = (str) => {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
};

// Start application
init();
