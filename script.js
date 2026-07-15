// ═══════════════════════════════════════════════════════════════
// PRODUCTIVITY DASHBOARD — script.js
// Simplified beginner-level code
// Keeps all functionalities 100% identical
// ═══════════════════════════════════════════════════════════════

// ── DOM SELECTORS ─────────────────────────────────────────────
var timeDisplay = document.getElementById("live-time");
var dateDisplay = document.getElementById("live-date");
var themeBtn = document.getElementById("theme-toggle-btn");
var bgOverlay = document.getElementById("dynamic-bg-overlay");

// Weather selectors
var weatherLoading = document.getElementById("weather-loading");
var weatherContent = document.getElementById("weather-content");
var weatherIcon = document.getElementById("weather-icon");
var weatherTemp = document.getElementById("weather-temp");
var weatherCity = document.getElementById("weather-city");
var weatherDesc = document.getElementById("weather-desc");

// Todo selectors
var todoInput = document.getElementById("todo-input");
var todoAddBtn = document.getElementById("add-task-btn");
var todoList = document.getElementById("todo-list-container");
var todoCardBadge = document.getElementById("todo-badge");

// Goals selectors
var goalsInput = document.getElementById("goals-input");
var goalsAddBtn = document.getElementById("add-goal-btn");
var goalsList = document.getElementById("goals-list-container");
var goalsCardBadge = document.getElementById("goals-badge");
var goalsProgressText = document.getElementById("goals-progress-text");
var goalsPercentage = document.getElementById("goals-percentage");
var goalsProgressBar = document.getElementById("goals-progress-bar");

// Planner selectors
var plannerSlots = document.getElementById("planner-slots-container");
var plannerCardBadge = document.getElementById("planner-badge");

// Pomodoro selectors
var pomoDisplay = document.getElementById("pomo-display");
var pomoLabel = document.getElementById("pomo-status-label");
var pomoStartBtn = document.getElementById("pomo-start-btn");
var pomoPauseBtn = document.getElementById("pomo-pause-btn");
var pomoResetBtn = document.getElementById("pomo-reset-btn");
var pomoCardBadge = document.getElementById("pomo-badge");
var alarmSound = document.getElementById("alarm-sound");

// Quotes selectors
var quoteText = document.getElementById("quote-text");
var quoteAuthor = document.getElementById("quote-author");
var quoteNewBtn = document.getElementById("new-quote-btn");

// ── GLOBAL STATE ──────────────────────────────────────────────
var tasks = [];
var goals = [];
var plannerNotes = {}; // Keys: '08:00 AM', '09:00 AM', etc.

// Pomodoro state
var pomoTimer = null;
var pomoSeconds = 1500; // 25 mins default (25 * 60)
var pomoMode = "work"; // 'work', 'break', 'longBreak'
var pomoIsRunning = false;

// Fallback Quote Database (Used if Fetch fails or offline)
var quotesDatabase = [
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
function init() {
  loadLocalStorage();
  updateTimeAndDate();
  updateBackgroundGradient();
  initTheme();
  fetchWeather();
  fetchQuote();

  // Run updateTimeAndDate every 1000 milliseconds (1 second)
  setInterval(updateTimeAndDate, 1000);
  // Run updateBackgroundGradient every 60000 milliseconds (1 minute)
  setInterval(updateBackgroundGradient, 60000);

  // Render all views on start
  renderTasks();
  renderGoals();
  renderPlanner();
  updatePomoDisplay();
}

// ── LOCAL STORAGE HELPERS ─────────────────────────────────────
function loadLocalStorage() {
  // Load tasks
  try {
    var savedTasks = localStorage.getItem("prod_tasks");
    if (savedTasks) {
      tasks = JSON.parse(savedTasks);
    } else {
      tasks = [];
    }
  } catch (error) {
    tasks = [];
  }

  // Load goals
  try {
    var savedGoals = localStorage.getItem("prod_goals");
    if (savedGoals) {
      goals = JSON.parse(savedGoals);
    } else {
      goals = [];
    }
  } catch (error) {
    goals = [];
  }

  // Load planner notes
  try {
    var savedPlanner = localStorage.getItem("prod_planner");
    if (savedPlanner) {
      plannerNotes = JSON.parse(savedPlanner);
    } else {
      plannerNotes = {
        "08:00 AM": "", "09:00 AM": "", "10:00 AM": "", "11:00 AM": "",
        "12:00 PM": "", "01:00 PM": "", "02:00 PM": "", "03:00 PM": "",
        "04:00 PM": "", "05:00 PM": "", "06:00 PM": "", "07:00 PM": "",
        "08:00 PM": ""
      };
    }
  } catch (error) {
    plannerNotes = {
      "08:00 AM": "", "09:00 AM": "", "10:00 AM": "", "11:00 AM": "",
      "12:00 PM": "", "01:00 PM": "", "02:00 PM": "", "03:00 PM": "",
      "04:00 PM": "", "05:00 PM": "", "06:00 PM": "", "07:00 PM": "",
      "08:00 PM": ""
    };
  }
}

function saveTasks() {
  localStorage.setItem("prod_tasks", JSON.stringify(tasks));
  renderTasks();
}

function saveGoals() {
  localStorage.setItem("prod_goals", JSON.stringify(goals));
  renderGoals();
}

// ── NAVIGATION CONTROLLERS ────────────────────────────────────
function openFeature(viewName) {
  // Hide the dashboard home view
  var dashboard = document.getElementById("dashboard-view");
  dashboard.classList.remove("active-view");
  dashboard.classList.add("hidden-view");

  // Hide all other feature views
  var views = document.getElementsByClassName("feature-view");
  for (var i = 0; i < views.length; i++) {
    views[i].classList.remove("active-view");
    views[i].classList.add("hidden-view");
  }

  // Show the requested active view
  var targetView = document.getElementById(viewName + "-view");
  if (targetView) {
    targetView.classList.remove("hidden-view");
    targetView.classList.add("active-view");
  }
}

function goHome() {
  // Hide all feature views
  var views = document.getElementsByClassName("feature-view");
  for (var i = 0; i < views.length; i++) {
    views[i].classList.remove("active-view");
    views[i].classList.add("hidden-view");
  }

  // Show the dashboard home view
  var dashboard = document.getElementById("dashboard-view");
  dashboard.classList.remove("hidden-view");
  dashboard.classList.add("active-view");

  // Update badges on the cards
  updateDashboardBadges();
}

function updateDashboardBadges() {
  // 1. Update Todo Badge: Count tasks that are not completed
  var pendingCount = 0;
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].completed === false) {
      pendingCount = pendingCount + 1;
    }
  }
  
  var taskWord = "tasks";
  if (pendingCount === 1) {
    taskWord = "task";
  }
  todoCardBadge.textContent = pendingCount + " " + taskWord;

  // 2. Update Goals Badge: Count completed goals and total goals
  var completedGoals = 0;
  for (var j = 0; j < goals.length; j++) {
    if (goals[j].completed === true) {
      completedGoals = completedGoals + 1;
    }
  }
  goalsCardBadge.textContent = completedGoals + " of " + goals.length + " done";

  // 3. Update Planner Badge: Count hours that have plans scheduled
  var activeSlots = 0;
  var keys = Object.keys(plannerNotes);
  for (var k = 0; k < keys.length; k++) {
    var hourKey = keys[k];
    var noteText = plannerNotes[hourKey];
    if (noteText && noteText.trim() !== "") {
      activeSlots = activeSlots + 1;
    }
  }

  if (activeSlots > 0) {
    var blockWord = "blocks";
    if (activeSlots === 1) {
      blockWord = "block";
    }
    plannerCardBadge.textContent = activeSlots + " " + blockWord;
  } else {
    plannerCardBadge.textContent = "Empty";
  }
}

// ── LIVE DATE & TIME ──────────────────────────────────────────
function updateTimeAndDate() {
  var now = new Date();
  
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var seconds = now.getSeconds();
  
  // Set AM or PM
  var ampm = "AM";
  if (hours >= 12) {
    ampm = "PM";
  }
  
  // Convert to 12-hour format
  hours = hours % 12;
  if (hours === 0) {
    hours = 12;
  }
  
  // Pad with leading zeros for single digits
  var formattedHours = hours;
  if (hours < 10) {
    formattedHours = "0" + hours;
  }
  
  var formattedMinutes = minutes;
  if (minutes < 10) {
    formattedMinutes = "0" + minutes;
  }
  
  var formattedSeconds = seconds;
  if (seconds < 10) {
    formattedSeconds = "0" + seconds;
  }
  
  var formattedTime = formattedHours + ":" + formattedMinutes + ":" + formattedSeconds + " " + ampm;
  timeDisplay.textContent = formattedTime;

  // Format Date (e.g. Monday, January 1, 2026)
  var options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  dateDisplay.textContent = now.toLocaleDateString("en-US", options);
}

// ── DYNAMIC GRADIENT BACKGROUND ───────────────────────────────
function updateBackgroundGradient() {
  var hour = new Date().getHours();
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
}

// ── THEME INTERACTIVE SYSTEM ──────────────────────────────────
function initTheme() {
  var savedTheme = localStorage.getItem("prod_theme");
  if (!savedTheme) {
    savedTheme = "light";
  }
  
  if (savedTheme === "dark") {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
    themeBtn.innerHTML = '<span class="btn-icon">🌙</span><span class="btn-text">Dark Mode</span>';
  } else {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
    themeBtn.innerHTML = '<span class="btn-icon">☀️</span><span class="btn-text">Light Mode</span>';
  }
  updateDashboardBadges();
}

themeBtn.addEventListener("click", function() {
  if (document.body.classList.contains("light-theme")) {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
    themeBtn.innerHTML = '<span class="btn-icon">🌙</span><span class="btn-text">Dark Mode</span>';
    localStorage.setItem("prod_theme", "dark");
  } else {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
    themeBtn.innerHTML = '<span class="btn-icon">☀️</span><span class="btn-text">Light Mode</span>';
    localStorage.setItem("prod_theme", "light");
  }
});

// ── WEATHER INTEGRATION (Open-Meteo & Geolocation) ─────────────
function fetchWeather() {
  weatherLoading.textContent = "Loading weather...";
  weatherLoading.classList.remove("hidden");
  weatherContent.classList.add("hidden");

  // Try standard browser geolocation first
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        
        // Fetch city details using ipwho.is
        fetch("https://ipwho.is/")
          .then(function(res) {
            return res.json();
          })
          .then(function(data) {
            var city = "My Location";
            if (data && data.success && data.city) {
              city = data.city;
            }
            callMeteoAPI(lat, lon, city);
          })
          .catch(function() {
            callMeteoAPI(lat, lon, "My Location");
          });
      },
      function() {
        // Fallback to IP geolocation if GPS fails
        fetchIPWeather();
      },
      { timeout: 5000 }
    );
  } else {
    // Fallback if browser doesn't support geolocation
    fetchIPWeather();
  }
}

function fetchIPWeather() {
  fetch("https://ipwho.is/")
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      if (data && data.success) {
        callMeteoAPI(data.latitude, data.longitude, data.city || "Local Area");
      } else {
        callMeteoAPI(40.7128, -74.0060, "New York");
      }
    })
    .catch(function() {
      callMeteoAPI(40.7128, -74.0060, "New York");
    });
}

function callMeteoAPI(lat, lon, city) {
  fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current_weather=true")
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      if (data && data.current_weather) {
        var temp = parseFloat(data.current_weather.temperature).toFixed(1);
        var code = data.current_weather.weathercode;
        var weatherInfo = mapWeatherCode(code);
        
        weatherTemp.textContent = temp + "°C";
        weatherCity.textContent = city;
        weatherIcon.textContent = weatherInfo.icon;
        weatherDesc.textContent = weatherInfo.text;

        weatherLoading.classList.add("hidden");
        weatherContent.classList.remove("hidden");
      } else {
        showWeatherError();
      }
    })
    .catch(function() {
      showWeatherError();
    });
}

function showWeatherError() {
  weatherLoading.textContent = "Weather unavailable";
}

function mapWeatherCode(code) {
  if (code === 0) {
    return { icon: "☀️", text: "Clear Sky" };
  }
  if (code >= 1 && code <= 3) {
    return { icon: "⛅", text: "Partly Cloudy" };
  }
  if (code >= 45 && code <= 48) {
    return { icon: "🌫️", text: "Foggy" };
  }
  if (code >= 51 && code <= 55) {
    return { icon: "🌧️", text: "Drizzle" };
  }
  if (code >= 61 && code <= 65) {
    return { icon: "🌧️", text: "Rainy" };
  }
  if (code >= 71 && code <= 77) {
    return { icon: "❄️", text: "Snowy" };
  }
  if (code >= 80 && code <= 82) {
    return { icon: "🌧️", text: "Showers" };
  }
  if (code >= 95) {
    return { icon: "⛈️", text: "Thunderstorm" };
  }
  return { icon: "🌡️", text: "Normal" };
}

// ── MOTIVATION QUOTES ─────────────────────────────────────────
function fetchQuote() {
  quoteText.textContent = "Fetching motivational quote...";
  quoteAuthor.textContent = "";

  // Fetch a random quote with a cb timestamp parameter to prevent caching
  fetch("https://dummyjson.com/quotes/random?cb=" + Date.now())
    .then(function(res) {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then(function(data) {
      if (data && data.quote) {
        quoteText.textContent = data.quote;
        quoteAuthor.textContent = "— " + (data.author || "Unknown");
      } else {
        loadLocalQuote();
      }
    })
    .catch(function() {
      loadLocalQuote();
    });
}

function loadLocalQuote() {
  var index = Math.floor(Math.random() * quotesDatabase.length);
  quoteText.textContent = quotesDatabase[index].text;
  quoteAuthor.textContent = "— " + quotesDatabase[index].author;
}

quoteNewBtn.addEventListener("click", fetchQuote);

// ── TODO LIST MODULE ──────────────────────────────────────────
function renderTasks() {
  todoList.innerHTML = "";
  
  // Copy tasks array to a new list so we don't modify the original array directly
  var sortedTasks = [];
  for (var i = 0; i < tasks.length; i++) {
    sortedTasks.push(tasks[i]);
  }

  // Sort tasks: Important tasks first, then uncompleted tasks first
  sortedTasks.sort(function(a, b) {
    // 1. Completion status comparison
    if (a.completed !== b.completed) {
      if (a.completed === true) {
        return 1; // Put completed tasks at the end
      } else {
        return -1; // Put uncompleted tasks at the beginning
      }
    }
    // 2. Importance status comparison (if completion is same)
    if (a.important !== b.important) {
      if (a.important === true) {
        return -1; // Put important tasks first
      } else {
        return 1; // Put normal tasks last
      }
    }
    return 0;
  });

  for (var j = 0; j < sortedTasks.length; j++) {
    var task = sortedTasks[j];
    
    // Find the original index of this task in our global tasks array
    var originalIndex = -1;
    for (var k = 0; k < tasks.length; k++) {
      if (tasks[k].id === task.id) {
        originalIndex = k;
        break;
      }
    }

    var completedClass = "";
    if (task.completed) {
      completedClass = "task-completed";
    }

    var checkedAttribute = "";
    if (task.completed) {
      checkedAttribute = "checked";
    }

    var priorityBadge = "";
    if (task.important) {
      priorityBadge = '<span class="task-badge badge-priority">HIGH</span>';
    }

    var starClass = "";
    if (task.important) {
      starClass = "starred";
    }

    var itemHTML = 
      '<li class="task-item ' + completedClass + '">' +
        '<div class="task-text-group">' +
          '<input type="checkbox" class="task-checkbox" ' + checkedAttribute + ' onclick="toggleTask(' + originalIndex + ')">' +
          '<span class="task-title">' + escapeHTML(task.title) + '</span>' +
          priorityBadge +
        '</div>' +
        '<div class="item-actions">' +
          '<button class="important-star ' + starClass + '" onclick="togglePriority(' + originalIndex + ')">★</button>' +
          '<button class="btn-icon btn-delete" onclick="deleteTask(' + originalIndex + ')">🗑️</button>' +
        '</div>' +
      '</li>';

    todoList.innerHTML += itemHTML;
  }

  updateDashboardBadges();
}

function addTask() {
  var title = todoInput.value.trim();
  if (title === "") {
    return;
  }

  var newTask = {
    id: Date.now(),
    title: title,
    completed: false,
    important: false
  };

  tasks.push(newTask);
  todoInput.value = "";
  saveTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
}

function togglePriority(index) {
  tasks[index].important = !tasks[index].important;
  saveTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
}

todoAddBtn.addEventListener("click", addTask);
todoInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    addTask();
  }
});

// ── DAILY GOALS MODULE ────────────────────────────────────────
function renderGoals() {
  goalsList.innerHTML = "";

  for (var index = 0; index < goals.length; index++) {
    var goal = goals[index];
    
    var completedClass = "";
    if (goal.completed) {
      completedClass = "goal-completed";
    }

    var checkedAttribute = "";
    if (goal.completed) {
      checkedAttribute = "checked";
    }

    var itemHTML = 
      '<li class="goal-item ' + completedClass + '">' +
        '<div class="goal-text-group">' +
          '<input type="checkbox" class="goal-checkbox" ' + checkedAttribute + ' onclick="toggleGoal(' + index + ')">' +
          '<span class="goal-title">' + escapeHTML(goal.title) + '</span>' +
        '</div>' +
        '<div class="item-actions">' +
          '<button class="btn-icon btn-delete" onclick="deleteGoal(' + index + ')">🗑️</button>' +
        '</div>' +
      '</li>';

    goalsList.innerHTML += itemHTML;
  }

  updateGoalsProgress();
}

function addGoal() {
  var title = goalsInput.value.trim();
  if (title === "") {
    return;
  }

  var newGoal = {
    title: title,
    completed: false
  };

  goals.push(newGoal);
  goalsInput.value = "";
  saveGoals();
}

// Check/uncheck goal
function toggleGoal(index) {
  goals[index].completed = !goals[index].completed;
  saveGoals();
}

// Delete goal
function deleteGoal(index) {
  goals.splice(index, 1);
  saveGoals();
}

function updateGoalsProgress() {
  var total = goals.length;
  
  // Count how many goals are completed
  var completed = 0;
  for (var i = 0; i < goals.length; i++) {
    if (goals[i].completed === true) {
      completed = completed + 1;
    }
  }
  
  goalsProgressText.textContent = completed + " of " + total + " Completed";
  
  // Calculate percentage
  var percentage = 0;
  if (total > 0) {
    percentage = Math.round((completed / total) * 100);
  }
  
  goalsPercentage.textContent = percentage + "%";
  goalsProgressBar.style.width = percentage + "%";

  updateDashboardBadges();
}

goalsAddBtn.addEventListener("click", addGoal);
goalsInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    addGoal();
  }
});

// ── DAILY HOURLY PLANNER MODULE ───────────────────────────────
function renderPlanner() {
  plannerSlots.innerHTML = "";
  
  var hoursKeys = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
    "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
    "08:00 PM"
  ];

  // Get current hour in local format, e.g. "09:00 AM"
  var currentHour = getCurrentHourString();

  for (var i = 0; i < hoursKeys.length; i++) {
    var hour = hoursKeys[i];
    var note = "";
    if (plannerNotes[hour]) {
      note = plannerNotes[hour];
    }
    
    var isCurrent = (hour === currentHour);
    var currentRowClass = "";
    if (isCurrent) {
      currentRowClass = "current-hour-row";
    }

    // Convert time to a safe id by removing colon and space
    var idSafe = hour.replace(":", "").replace(" ", "");

    var itemHTML = 
      '<div class="planner-row ' + currentRowClass + '">' +
        '<span class="planner-time">' + hour + '</span>' +
        '<input type="text" ' +
               'class="planner-note-input" ' +
               'id="planner-note-' + idSafe + '" ' +
               'value="' + escapeHTML(note) + '" ' +
               'placeholder="No plans scheduled..." ' +
               'oninput="onPlannerInputChange(\'' + hour + '\')" ' +
               'onblur="savePlannerNote(\'' + hour + '\')">' +
        '<button class="planner-save-btn" ' +
                'id="save-btn-' + idSafe + '" ' +
                'onclick="savePlannerNote(\'' + hour + '\')">Saved</button>' +
      '</div>';

    plannerSlots.innerHTML += itemHTML;
  }

  updateDashboardBadges();
}

function getCurrentHourString() {
  var now = new Date();
  var hour = now.getHours();
  var ampm = "AM";
  if (hour >= 12) {
    ampm = "PM";
  }
  
  hour = hour % 12;
  if (hour === 0) {
    hour = 12;
  }
  
  // Format hours with a leading zero
  var formattedHour = hour;
  if (hour < 10) {
    formattedHour = "0" + hour;
  }
  
  return formattedHour + ":00 " + ampm;
}

function onPlannerInputChange(hour) {
  var idSafe = hour.replace(":", "").replace(" ", "");
  var saveBtn = document.getElementById("save-btn-" + idSafe);
  if (saveBtn) {
    saveBtn.textContent = "Save";
    saveBtn.classList.add("changed");
  }
}

function savePlannerNote(hour) {
  var idSafe = hour.replace(":", "").replace(" ", "");
  var inputEl = document.getElementById("planner-note-" + idSafe);
  var saveBtn = document.getElementById("save-btn-" + idSafe);
  
  if (inputEl && saveBtn) {
    var value = inputEl.value.trim();
    plannerNotes[hour] = value;
    localStorage.setItem("prod_planner", JSON.stringify(plannerNotes));

    saveBtn.textContent = "Saved";
    saveBtn.classList.remove("changed");

    updateDashboardBadges();
  }
}

// ── POMODORO FOCUS TIMER MODULE ───────────────────────────────
function updatePomoDisplay() {
  var mins = Math.floor(pomoSeconds / 60);
  var secs = pomoSeconds % 60;
  
  // Pad single numbers with a leading zero
  var formattedMins = mins;
  if (mins < 10) {
    formattedMins = "0" + mins;
  }
  
  var formattedSecs = secs;
  if (secs < 10) {
    formattedSecs = "0" + secs;
  }
  
  pomoDisplay.textContent = formattedMins + ":" + formattedSecs;
  
  if (pomoIsRunning) {
    pomoCardBadge.textContent = "Active";
  } else {
    pomoCardBadge.textContent = "Ready";
  }
}

function setPomoDuration(mins, mode) {
  // Reset all preset buttons active classes
  var presets = document.getElementsByClassName("pomo-preset-btn");
  for (var i = 0; i < presets.length; i++) {
    presets[i].classList.remove("active-preset");
  }

  // Highlight the current preset clicked
  var eventTarget = null;
  if (window.event && window.event.target) {
    eventTarget = window.event.target;
  }
  
  if (eventTarget) {
    eventTarget.classList.add("active-preset");
  }

  // Clear running timer
  clearInterval(pomoTimer);
  pomoIsRunning = false;
  pomoMode = mode;
  pomoSeconds = mins * 60;
  
  pomoLabel.textContent = mode.toUpperCase() + " SESSION";
  
  pomoStartBtn.classList.remove("hidden");
  pomoPauseBtn.classList.add("hidden");

  updatePomoDisplay();
}

function startPomoTimer() {
  if (pomoIsRunning) {
    return;
  }
  pomoIsRunning = true;

  pomoStartBtn.classList.add("hidden");
  pomoPauseBtn.classList.remove("hidden");

  pomoTimer = setInterval(function() {
    if (pomoSeconds > 0) {
      pomoSeconds = pomoSeconds - 1;
      updatePomoDisplay();
    } else {
      // Time hit zero! Stop, play sound, alert, and auto-switch
      clearInterval(pomoTimer);
      pomoIsRunning = false;
      
      try {
        alarmSound.play();
      } catch (error) {
        // Suppress errors if browser blocks sound autoplay
      }
      
      alert(pomoMode.toUpperCase() + " Session has ended! Take action.");
      
      // Auto transition modes
      if (pomoMode === "work") {
        setPomoDuration(5, "break");
      } else {
        setPomoDuration(25, "work");
      }
    }
  }, 1000);
  
  updatePomoDisplay();
}

function pausePomoTimer() {
  clearInterval(pomoTimer);
  pomoIsRunning = false;
  pomoStartBtn.classList.remove("hidden");
  pomoPauseBtn.classList.add("hidden");
  updatePomoDisplay();
}

function resetPomoTimer() {
  clearInterval(pomoTimer);
  pomoIsRunning = false;
  
  if (pomoMode === "work") {
    pomoSeconds = 1500;
  } else if (pomoMode === "break") {
    pomoSeconds = 300;
  } else {
    pomoSeconds = 900;
  }
  
  pomoStartBtn.classList.remove("hidden");
  pomoPauseBtn.classList.add("hidden");
  updatePomoDisplay();
}

pomoStartBtn.addEventListener("click", startPomoTimer);
pomoPauseBtn.addEventListener("click", pausePomoTimer);
pomoResetBtn.addEventListener("click", resetPomoTimer);

// ── ESCAPE HTML UTILITY (Prevents XSS Injection) ──────────────
function escapeHTML(str) {
  if (typeof str !== "string") {
    return str;
  }
  // Replace each special HTML character one by one
  var escaped = str;
  escaped = escaped.replaceAll("&", "&amp;");
  escaped = escaped.replaceAll("<", "&lt;");
  escaped = escaped.replaceAll(">", "&gt;");
  escaped = escaped.replaceAll('"', "&quot;");
  escaped = escaped.replaceAll("'", "&#39;");
  return escaped;
}

// Start application
init();
