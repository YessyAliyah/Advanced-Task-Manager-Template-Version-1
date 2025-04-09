/**
 * Advanced Task Manager - Core Functionality
 * Handles all task operations, UI updates, and data persistence
 */

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const themeToggle = document.getElementById('theme-toggle');
const addTaskBtn = document.getElementById('add-task-btn');
const formTitle = document.getElementById('form-title');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const taskPrioritySelect = document.getElementById('task-priority');
const taskCategoryInput = document.getElementById('task-category');
const taskDueInput = document.getElementById('task-due');
const filterButtons = document.querySelectorAll('.filter-btn');

// State management
let tasks = [];
let currentTaskId = null;
let currentFilter = 'all';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    setupEventListeners();
    checkThemePreference();
});

// Load tasks from localStorage
function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks based on current filter
function renderTasks() {
    taskList.innerHTML = '';

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'completed') return task.completed;
        if (currentFilter === 'active') return !task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>No tasks found</p>
            </div>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.id = task.id;
        taskElement.innerHTML = `
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                <div class="task-meta">
                    ${task.category ? `<span class="task-category">${task.category}</span>` : ''}
                    ${task.due ? `<span class="task-due"><i class="far fa-calendar-alt"></i> ${formatDate(task.due)}</span>` : ''}
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn edit-btn" title="Edit task"><i class="fas fa-edit"></i></button>
                <button class="action-btn complete-btn" title="${task.completed ? 'Mark active' : 'Complete task'}">
                    <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                </button>
                <button class="action-btn delete-btn" title="Delete task"><i class="fas fa-trash"></i></button>
            </div>
        `;
        taskList.appendChild(taskElement);
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Form submission
    taskForm.addEventListener('submit', handleFormSubmit);

    // Add task button
    addTaskBtn.addEventListener('click', () => {
        currentTaskId = null;
        formTitle.textContent = 'Add New Task';
        taskForm.reset();
        taskForm.style.display = 'block';
    });

    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // Task list event delegation
    taskList.addEventListener('click', handleTaskActions);
}

// Handle task actions (edit, complete, delete)
function handleTaskActions(e) {
    const taskElement = e.target.closest('.task-item');
    if (!taskElement) return;

    const taskId = taskElement.dataset.id;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (e.target.closest('.edit-btn')) {
        // Edit task
        currentTaskId = taskId;
        formTitle.textContent = 'Edit Task';
        taskTitleInput.value = task.title;
        taskDescInput.value = task.description || '';
        taskPrioritySelect.value = task.priority;
        taskCategoryInput.value = task.category || '';
        taskDueInput.value = task.due || '';
        taskForm.style.display = 'block';
    } else if (e.target.closest('.complete-btn')) {
        // Toggle complete status
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    } else if (e.target.closest('.delete-btn')) {
        // Delete task
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
        }
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    const taskData = {
        id: currentTaskId || generateId(),
        title: taskTitleInput.value.trim(),
        description: taskDescInput.value.trim(),
        priority: taskPrioritySelect.value,
        category: taskCategoryInput.value.trim(),
        due: taskDueInput.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    if (!taskData.title) {
        alert('Task title is required');
        return;
    }

    if (currentTaskId) {
        // Update existing task
        const index = tasks.findIndex(t => t.id === currentTaskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...taskData };
        }
    } else {
        // Add new task
        tasks.push(taskData);
    }

    saveTasks();
    renderTasks();
    taskForm.style.display = 'none';
}

// Theme management
function checkThemePreference() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeToggle) themeToggle.checked = true;
    }
}

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Helper functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Export for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadTasks,
        saveTasks,
        renderTasks,
        toggleTheme
    };
}
