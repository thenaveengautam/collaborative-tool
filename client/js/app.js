// Application State
let currentUser = null;
let currentProject = null;
let projects = [];
let tasks = [];
let users = [];
let comments = [];
let notifications = [];
let socket = null;

// Initialize WebSocket connection
function initializeWebSocket() {
  // Note: In a real implementation, you'd connect to your WebSocket server
  // For this demo, we'll simulate real-time updates

  // Simulate real-time notifications
  setInterval(() => {
    if (Math.random() > 0.95 && currentUser) {
      addNotification("New activity in your projects");
    }
  }, 5000);
}

// Authentication System
function login() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  // Clear previous messages
  hideAuthMessages();

  if (!username || !password) {
    showAuthError("Please enter both username and password");
    return;
  }

  // Add loading state
  const loginBtn = event.target;
  const originalText = loginBtn.textContent;
  loginBtn.innerHTML = '<span class="loading"></span> Signing in...';
  loginBtn.disabled = true;

  // Simulate network delay
  setTimeout(() => {
    // Reset button
    loginBtn.textContent = originalText;
    loginBtn.disabled = false;

    // Check credentials
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      currentUser = user;
      showAuthSuccess(`Welcome back, ${username}!`);

      setTimeout(() => {
        showMainApp();
        initializeWebSocket();
        loadProjects();
        addNotification("Welcome back to ProjectFlow!");
      }, 1000);
    } else if (users.length === 0) {
      // Create first user if no users exist
      const newUser = {
        id: generateId(),
        username: username,
        password: password,
        email: username + "@example.com",
      };
      users.push(newUser);
      currentUser = newUser;

      showAuthSuccess("Account created successfully!");
      setTimeout(() => {
        showMainApp();
        initializeWebSocket();
        loadProjects();
        addNotification("Welcome to ProjectFlow!");
      }, 1000);
    } else {
      showAuthError("Invalid username or password. Please try again.");

      // Shake animation for inputs
      const inputs = [
        document.getElementById("login-username"),
        document.getElementById("login-password"),
      ];
      inputs.forEach((input) => {
        input.style.animation = "shake 0.5s ease-in-out";
        setTimeout(() => {
          input.style.animation = "";
        }, 500);
      });
    }
  }, 800);
}

function signup() {
  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  // Clear previous messages
  hideAuthMessages();

  // Validation
  if (!username || !email || !password) {
    showAuthError("Please fill in all fields");
    return;
  }

  if (username.length < 3) {
    showAuthError("Username must be at least 3 characters long");
    return;
  }

  if (password.length < 6) {
    showAuthError("Password must be at least 6 characters long");
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showAuthError("Please enter a valid email address");
    return;
  }

  if (users.find((u) => u.username === username)) {
    showAuthError(
      "Username already exists. Please choose a different username."
    );
    return;
  }

  if (users.find((u) => u.email === email)) {
    showAuthError("Email already registered. Please use a different email.");
    return;
  }

  // Add loading state
  const signupBtn = event.target;
  const originalText = signupBtn.textContent;
  signupBtn.innerHTML = '<span class="loading"></span> Creating Account...';
  signupBtn.disabled = true;

  // Simulate network delay
  setTimeout(() => {
    // Reset button
    signupBtn.textContent = originalText;
    signupBtn.disabled = false;

    const newUser = {
      id: generateId(),
      username: username,
      email: email,
      password: password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    currentUser = newUser;

    showAuthSuccess(`Account created successfully! Welcome, ${username}!`);

    setTimeout(() => {
      showMainApp();
      initializeWebSocket();
      loadProjects();
      addNotification("Welcome to ProjectFlow!");
    }, 1000);
  }, 1000);
}

function showAuthError(message) {
  const errorDiv = document.getElementById("authError");
  errorDiv.textContent = message;
  errorDiv.classList.add("show");

  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideAuthMessages();
  }, 5000);
}

function showAuthSuccess(message) {
  const successDiv = document.getElementById("authSuccess");
  successDiv.textContent = message;
  successDiv.classList.add("show");
}

function hideAuthMessages() {
  document.getElementById("authError").classList.remove("show");
  document.getElementById("authSuccess").classList.remove("show");
}

function logout() {
  // Clear user session
  currentUser = null;
  currentProject = null;

  // Clear notifications
  notifications = [];
  updateNotificationBadge();

  // Show logout success message
  showAuthSuccess("You have been successfully logged out. See you next time!");

  // Switch to auth screen
  document.getElementById("auth-screen").style.display = "block";
  document.getElementById("main-app").style.display = "none";

  // Clear all forms and reset to login view
  clearAuthForms();
  showLogin();

  // Reset board state
  document.getElementById("emptyState").style.display = "block";
  document.getElementById("boardView").style.display = "none";
  document.getElementById("board").innerHTML = "";
  document.getElementById("projectList").innerHTML = "";

  // Hide any open modals
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => (modal.style.display = "none"));

  // Auto-hide success message after 3 seconds
  setTimeout(() => {
    hideAuthMessages();
  }, 3000);
}

function showLogin() {
  document.getElementById("login-form").style.display = "block";
  document.getElementById("signup-form").style.display = "none";
  hideAuthMessages();
  clearAuthForms();
}

function showSignup() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
  hideAuthMessages();
  clearAuthForms();
}

function clearAuthForms() {
  document.getElementById("login-username").value = "";
  document.getElementById("login-password").value = "";
  document.getElementById("signup-username").value = "";
  document.getElementById("signup-email").value = "";
  document.getElementById("signup-password").value = "";
}

function showMainApp() {
  document.getElementById("auth-screen").style.display = "none";
  document.getElementById("main-app").style.display = "block";
  document.getElementById("currentUser").textContent = currentUser.username;
}

// Project Management
function showCreateProject() {
  document.getElementById("projectModal").style.display = "block";
}

function createProject() {
  const name = document.getElementById("projectName").value;
  const description = document.getElementById("projectDescription").value;
  const members = document.getElementById("projectMembers").value;

  if (!name) {
    alert("Please enter a project name");
    return;
  }

  const project = {
    id: generateId(),
    name: name,
    description: description,
    members: members ? members.split(",").map((m) => m.trim()) : [],
    owner: currentUser.username,
    createdAt: new Date().toISOString(),
  };

  projects.push(project);
  closeModal("projectModal");
  loadProjects();
  addNotification(`Project "${name}" created successfully`);

  // Clear form
  document.getElementById("projectName").value = "";
  document.getElementById("projectDescription").value = "";
  document.getElementById("projectMembers").value = "";
}

function loadProjects() {
  const projectList = document.getElementById("projectList");
  const userProjects = projects.filter(
    (p) =>
      p.owner === currentUser.username ||
      p.members.includes(currentUser.username)
  );

  projectList.innerHTML = userProjects
    .map(
      (project) => `
                <div class="project-item ${
                  currentProject && currentProject.id === project.id
                    ? "active"
                    : ""
                }" 
                     onclick="selectProject('${project.id}')">
                    <div style="font-weight: 600;">${project.name}</div>
                    <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">
                        ${project.members.length + 1} members
                    </div>
                </div>
            `
    )
    .join("");
}

function selectProject(projectId) {
  currentProject = projects.find((p) => p.id === projectId);
  document.getElementById("emptyState").style.display = "none";
  document.getElementById("boardView").style.display = "block";
  document.getElementById("currentProjectName").textContent =
    currentProject.name;

  loadProjects(); // Update active state
  loadBoard();
}

// Task Management
function showCreateTask() {
  if (!currentProject) {
    alert("Please select a project first");
    return;
  }
  document.getElementById("taskModal").style.display = "block";
}

function createTask() {
  if (!currentProject) {
    alert("Please select a project first");
    return;
  }

  const title = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDescription").value;
  const status = document.getElementById("taskStatus").value;
  const priority = document.getElementById("taskPriority").value;
  const assignee = document.getElementById("taskAssignee").value;
  const dueDate = document.getElementById("taskDueDate").value;

  if (!title) {
    alert("Please enter a task title");
    return;
  }

  const task = {
    id: generateId(),
    title: title,
    description: description,
    status: status,
    priority: priority,
    assignee: assignee || currentUser.username,
    dueDate: dueDate,
    projectId: currentProject.id,
    createdBy: currentUser.username,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  closeModal("taskModal");
  loadBoard();
  addNotification(`Task "${title}" created`);

  // Clear form
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskAssignee").value = "";
  document.getElementById("taskDueDate").value = "";
}

function loadBoard() {
  const board = document.getElementById("board");
  const projectTasks = tasks.filter((t) => t.projectId === currentProject.id);

  const columns = {
    todo: { title: "To Do", tasks: [] },
    inprogress: { title: "In Progress", tasks: [] },
    review: { title: "Review", tasks: [] },
    done: { title: "Done", tasks: [] },
  };

  projectTasks.forEach((task) => {
    columns[task.status].tasks.push(task);
  });

  board.innerHTML = Object.keys(columns)
    .map(
      (status) => `
                <div class="column">
                    <div class="column-header">
                        ${columns[status].title}
                        <span class="task-count">${
                          columns[status].tasks.length
                        }</span>
                    </div>
                    ${columns[status].tasks
                      .map(
                        (task) => `
                        <div class="task-card priority-${
                          task.priority
                        }" onclick="showTaskDetail('${task.id}')">
                            <div class="task-title">${task.title}</div>
                            <div style="font-size: 12px; color: #6c757d; margin: 8px 0;">${
                              task.description
                            }</div>
                            <div class="task-meta">
                                <span class="assignee">${task.assignee}</span>
                                ${
                                  task.dueDate
                                    ? `<span>${formatDate(task.dueDate)}</span>`
                                    : ""
                                }
                            </div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `
    )
    .join("");
}

function showTaskDetail(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  document.getElementById("taskDetailTitle").textContent = task.title;
  document.getElementById("taskDetailContent").innerHTML = `
                <div style="margin-bottom: 15px;">
                    <strong>Description:</strong><br>
                    ${task.description || "No description"}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div><strong>Status:</strong> ${task.status}</div>
                    <div><strong>Priority:</strong> ${task.priority}</div>
                    <div><strong>Assignee:</strong> ${task.assignee}</div>
                    <div><strong>Due Date:</strong> ${
                      task.dueDate || "Not set"
                    }</div>
                </div>
                <div style="font-size: 12px; color: #6c757d;">
                    Created by ${task.createdBy} on ${formatDateTime(
    task.createdAt
  )}
                </div>
            `;

  loadTaskComments(taskId);
  document.getElementById("taskDetailModal").style.display = "block";
  document
    .getElementById("taskDetailModal")
    .setAttribute("data-task-id", taskId);
}

function editTask() {
  const taskId = document
    .getElementById("taskDetailModal")
    .getAttribute("data-task-id");
  const task = tasks.find((t) => t.id === taskId);

  // Pre-fill the task form with current values
  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDescription").value = task.description;
  document.getElementById("taskStatus").value = task.status;
  document.getElementById("taskPriority").value = task.priority;
  document.getElementById("taskAssignee").value = task.assignee;
  document.getElementById("taskDueDate").value = task.dueDate;

  closeModal("taskDetailModal");
  document.getElementById("taskModal").style.display = "block";

  // Update the create button to update instead
  const createBtn = document.querySelector(
    '#taskModal button[onclick="createTask()"]'
  );
  createBtn.textContent = "Update Task";
  createBtn.setAttribute("onclick", `updateTask('${taskId}')`);
}

function updateTask(taskId) {
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return;

  const oldStatus = tasks[taskIndex].status;
  const newStatus = document.getElementById("taskStatus").value;

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: document.getElementById("taskTitle").value,
    description: document.getElementById("taskDescription").value,
    status: newStatus,
    priority: document.getElementById("taskPriority").value,
    assignee: document.getElementById("taskAssignee").value,
    dueDate: document.getElementById("taskDueDate").value,
    updatedAt: new Date().toISOString(),
  };

  closeModal("taskModal");
  loadBoard();
  addNotification(`Task "${tasks[taskIndex].title}" updated`);

  // Reset the create button
  const createBtn = document.querySelector(
    '#taskModal button[onclick^="updateTask"]'
  );
  createBtn.textContent = "Create Task";
  createBtn.setAttribute("onclick", "createTask()");

  // Clear form
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskAssignee").value = "";
  document.getElementById("taskDueDate").value = "";

  // Notify status change
  if (oldStatus !== newStatus) {
    addNotification(`Task moved from ${oldStatus} to ${newStatus}`);
  }
}

function deleteTask() {
  const taskId = document
    .getElementById("taskDetailModal")
    .getAttribute("data-task-id");
  const task = tasks.find((t) => t.id === taskId);

  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
    tasks = tasks.filter((t) => t.id !== taskId);
    comments = comments.filter((c) => c.taskId !== taskId);
    closeModal("taskDetailModal");
    loadBoard();
    addNotification(`Task "${task.title}" deleted`);
  }
}

// Comment System
function loadTaskComments(taskId) {
  const taskComments = comments.filter((c) => c.taskId === taskId);
  const commentsContainer = document.getElementById("taskComments");

  commentsContainer.innerHTML = taskComments
    .map(
      (comment) => `
                <div class="comment">
                    <div class="comment-author">${comment.author}</div>
                    <div>${comment.content}</div>
                    <div class="comment-time">${formatDateTime(
                      comment.createdAt
                    )}</div>
                </div>
            `
    )
    .join("");

  if (taskComments.length === 0) {
    commentsContainer.innerHTML =
      '<p style="color: #6c757d; font-style: italic;">No comments yet. Be the first to comment!</p>';
  }
}

function addComment() {
  const taskId = document
    .getElementById("taskDetailModal")
    .getAttribute("data-task-id");
  const content = document.getElementById("newComment").value.trim();

  if (!content) {
    alert("Please enter a comment");
    return;
  }

  const comment = {
    id: generateId(),
    taskId: taskId,
    author: currentUser.username,
    content: content,
    createdAt: new Date().toISOString(),
  };

  comments.push(comment);
  loadTaskComments(taskId);
  document.getElementById("newComment").value = "";

  const task = tasks.find((t) => t.id === taskId);
  addNotification(`New comment on "${task.title}"`);

  // Simulate real-time update for other users
  setTimeout(() => {
    if (Math.random() > 0.7) {
      const responses = [
        "Thanks for the update!",
        "I'll take a look at this.",
        "Good progress on this task.",
        "Let me know if you need help.",
        "Looks good to me!",
      ];

      const simulatedComment = {
        id: generateId(),
        taskId: taskId,
        author: "TeamMate",
        content: responses[Math.floor(Math.random() * responses.length)],
        createdAt: new Date().toISOString(),
      };

      comments.push(simulatedComment);
      if (
        document.getElementById("taskDetailModal").style.display === "block" &&
        document
          .getElementById("taskDetailModal")
          .getAttribute("data-task-id") === taskId
      ) {
        loadTaskComments(taskId);
        addNotification("New reply to your comment");
      }
    }
  }, 2000 + Math.random() * 3000);
}

// Notification System
function addNotification(message) {
  const notification = {
    id: generateId(),
    message: message,
    timestamp: new Date().toISOString(),
    read: false,
  };

  notifications.unshift(notification);
  updateNotificationBadge();

  // Auto-remove after 5 seconds if not clicked
  setTimeout(() => {
    notifications = notifications.filter((n) => n.id !== notification.id);
    updateNotificationBadge();
  }, 10000);
}

function updateNotificationBadge() {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const badge = document.getElementById("notificationBadge");
  badge.textContent = unreadCount;
  badge.style.display = unreadCount > 0 ? "flex" : "none";
}

function showNotifications() {
  const unreadNotifications = notifications.filter((n) => !n.read);
  if (unreadNotifications.length === 0) {
    alert("No new notifications");
    return;
  }

  const notificationText = unreadNotifications
    .map((n) => `• ${n.message} (${formatTime(n.timestamp)})`)
    .join("\n");

  alert(`Recent Notifications:\n\n${notificationText}`);

  // Mark as read
  notifications.forEach((n) => (n.read = true));
  updateNotificationBadge();
}

// Modal Management
function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Close modals when clicking outside
window.onclick = function (event) {
  const modals = document.getElementsByClassName("modal");
  for (let modal of modals) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  }
};

// Utility Functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

function formatDateTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

function formatTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Keyboard Shortcuts
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case "n":
        e.preventDefault();
        if (currentProject) showCreateTask();
        break;
      case "p":
        e.preventDefault();
        showCreateProject();
        break;
    }
  }

  if (e.key === "Escape") {
    // Close any open modals
    const openModals = document.querySelectorAll('.modal[style*="block"]');
    openModals.forEach((modal) => (modal.style.display = "none"));
  }
});

// Drag and Drop functionality (simplified)
function enableDragAndDrop() {
  // This would be implemented with proper drag and drop API
  // For now, tasks can be moved by editing them
}

// Initialize Demo Data
function initializeDemoData() {
  // Create some demo users
  users.push(
    {
      id: "1",
      username: "admin",
      email: "admin@example.com",
      password: "admin",
    },
    {
      id: "2",
      username: "john",
      email: "john@example.com",
      password: "password",
    },
    {
      id: "3",
      username: "jane",
      email: "jane@example.com",
      password: "password",
    }
  );

  // Create demo projects
  projects.push({
    id: "proj1",
    name: "Website Redesign",
    description: "Complete overhaul of company website",
    members: ["john", "jane"],
    owner: "admin",
    createdAt: new Date().toISOString(),
  });

  // Create demo tasks
  tasks.push(
    {
      id: "task1",
      title: "Design new homepage",
      description: "Create wireframes and mockups for the new homepage design",
      status: "inprogress",
      priority: "high",
      assignee: "jane",
      dueDate: "2024-12-01",
      projectId: "proj1",
      createdBy: "admin",
      createdAt: new Date().toISOString(),
    },
    {
      id: "task2",
      title: "Set up development environment",
      description: "Configure local development environment with latest tools",
      status: "done",
      priority: "medium",
      assignee: "john",
      projectId: "proj1",
      createdBy: "admin",
      createdAt: new Date().toISOString(),
    },
    {
      id: "task3",
      title: "Content audit",
      description: "Review and categorize existing website content",
      status: "todo",
      priority: "low",
      assignee: "admin",
      dueDate: "2024-11-30",
      projectId: "proj1",
      createdBy: "admin",
      createdAt: new Date().toISOString(),
    }
  );

  // Create demo comments
  comments.push(
    {
      id: "comment1",
      taskId: "task1",
      author: "admin",
      content:
        "Great work on the initial concepts! The color scheme looks modern.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "comment2",
      taskId: "task1",
      author: "jane",
      content:
        "Thanks! I've incorporated the feedback from the client meeting.",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    }
  );
}

// Real-time simulation
function simulateRealTimeUpdates() {
  setInterval(() => {
    if (Math.random() > 0.98 && currentProject) {
      // Simulate task status changes
      const projectTasks = tasks.filter(
        (t) => t.projectId === currentProject.id
      );
      if (projectTasks.length > 0) {
        const randomTask =
          projectTasks[Math.floor(Math.random() * projectTasks.length)];
        const statuses = ["todo", "inprogress", "review", "done"];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

        if (randomTask.status !== newStatus) {
          randomTask.status = newStatus;
          loadBoard();
          addNotification(`Task "${randomTask.title}" moved to ${newStatus}`);
        }
      }
    }
  }, 5000);
}

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initializeDemoData();
  updateNotificationBadge();

  // Add some helpful tips
  setTimeout(() => {
    addNotification(
      "💡 Use Ctrl+N to create a new task, Ctrl+P for new project"
    );
  }, 1000);

  // Start real-time simulation
  setTimeout(() => {
    simulateRealTimeUpdates();
  }, 3000);
});

// Service Worker for PWA capabilities (in a real app)
if ("serviceWorker" in navigator) {
  // Would register service worker here for offline capabilities
}
