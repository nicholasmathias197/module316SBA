

//TODO Cache at least one element using selectElementById.
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const emptyMessage = document.getElementById('empty-message');
const taskCount = document.getElementById('task-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const descriptionTextarea = document.getElementById('task-description');
const descCount = document.getElementById('desc-count');
const taskTemplate = document.getElementById('task-template');
const titleInput = document.getElementById('task-title');

//TODO Cache at least one element using querySelector or querySelectorAll.
const filterButtons = document.querySelectorAll('.filter-btn');
const addTaskBtn = document.querySelector('#add-task-btn');

// Task data storage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let editTaskId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    init();
});

function init() {
    // Set minimum date for due date input to today
    const dueDateInput = document.getElementById('task-due');
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.min = today;
    
    // Add sample tasks if empty
    if (tasks.length === 0) {
        tasks = [
            {
                id: '1',
                title: 'Welcome to Task Manager',
                description: 'This is your first task. Try marking it as complete!',
                priority: 'high',
                dueDate: today,
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Add more tasks',
                description: 'Use the form above to add more tasks',
                priority: 'medium',
                dueDate: '',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                title: 'Learn JavaScript',
                description: 'Practice DOM manipulation and event handling',
                priority: 'high',
                dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 7 days from now
                completed: true,
                createdAt: new Date().toISOString()
            }
        ];
        saveTasks();
    }
    
    renderTasks();
    updateTaskCount();
    updateDescriptionCharCount();
    setupEventListeners();
    
    //TODO Use at least two Browser Object Model (BOM) properties or methods.
    // BOM 1: Get screen width
    console.log('Screen width:', window.innerWidth, 'px');
    
    // BOM 2: Get user agent
    console.log('User agent:', navigator.userAgent);
}

// Setup all event listeners
function setupEventListeners() {
    // Event Listener 1: Form submission 
    if (taskForm) {
        taskForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Event Listener 2: Filter buttons 
    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                handleFilterClick(this);
            });
        });
    }
    
    // Clear completed tasks
    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    }
    
    // Description character count
    if (descriptionTextarea) {
        descriptionTextarea.addEventListener('input', updateDescriptionCharCount);
    }
    
    // Real-time form validation
    if (titleInput) {
        titleInput.addEventListener('input', validateTitle);
    }
    
    // BOM: Save tasks before page unload
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    });
}

// Form submission handler 
function handleFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submitted');
    
    if (!validateForm()) {
        console.log('Form validation failed');
        return;
    }
    
    const formData = new FormData(taskForm);
    const title = formData.get('title');
    const description = formData.get('description');
    const priority = formData.get('priority');
    const dueDate = formData.get('dueDate');
    
    console.log('Creating task with:', { title, description, priority, dueDate });
    
    if (editTaskId) {
        // Update existing task
        const taskIndex = tasks.findIndex(t => t.id === editTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title: title,
                description: description,
                priority: priority,
                dueDate: dueDate
            };
            
            // Update submit button text back to "Add Task"
            if (addTaskBtn) {
                addTaskBtn.textContent = '➕ Add Task';
            }
            editTaskId = null;
            showNotification('Task updated successfully!', 'success');
        }
    } else {
        // Create new task
        const task = {
            id: Date.now().toString(),
            title: title,
            description: description,
            priority: priority,
            dueDate: dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(task);
        showNotification('Task added successfully!', 'success');
    }
    
    saveTasks();
    renderTasks();
    updateTaskCount();
    
    // Reset form
    if (taskForm) {
        taskForm.reset();
    }
    
    updateDescriptionCharCount();
    
    // Reset validation state
    if (titleInput) {
        const formGroup = titleInput.parentElement;
        if (formGroup) {
            formGroup.classList.remove('success');
        }
    }
    
    // Reset date to today
    const dueDateInput = document.getElementById('task-due');
    if (dueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.value = '';
        dueDateInput.min = today;
    }
    
    return false;
}

// Form validation
function validateForm() {
    if (!titleInput) return false;
    
    const formGroup = titleInput.parentElement;
    const errorMessage = formGroup ? formGroup.querySelector('.error-message') : null;
    
    // Clear previous state
    if (formGroup) {
        formGroup.classList.remove('error', 'success');
    }
    
    if (errorMessage) {
        errorMessage.textContent = '';
    }
    
    // Validate required field
    if (!titleInput.value.trim()) {
        if (formGroup) formGroup.classList.add('error');
        if (errorMessage) errorMessage.textContent = 'Title is required';
        return false;
    }
    
    // Validate min length
    if (titleInput.value.trim().length < 3) {
        if (formGroup) formGroup.classList.add('error');
        if (errorMessage) errorMessage.textContent = 'Title must be at least 3 characters';
        return false;
    }
    
    // Validate max length
    if (titleInput.value.trim().length > 50) {
        if (formGroup) formGroup.classList.add('error');
        if (errorMessage) errorMessage.textContent = 'Title cannot exceed 50 characters';
        return false;
    }
    
    // Success state
    if (formGroup) formGroup.classList.add('success');
    return true;
}

// Real-time title validation
function validateTitle(e) {
    const titleInput = e.target;
    const formGroup = titleInput.parentElement;
    const errorMessage = formGroup.querySelector('.error-message');
    
    formGroup.classList.remove('error', 'success');
    errorMessage.textContent = '';
    
    if (titleInput.value.trim().length === 0) {
        formGroup.classList.add('error');
        errorMessage.textContent = 'Title is required';
    } else if (titleInput.value.trim().length < 3) {
        formGroup.classList.add('error');
        errorMessage.textContent = 'Title must be at least 3 characters';
    } else if (titleInput.value.trim().length > 50) {
        formGroup.classList.add('error');
        errorMessage.textContent = 'Title cannot exceed 50 characters';
    } else {
        formGroup.classList.add('success');
    }
}

// Update description character count
function updateDescriptionCharCount() {
    if (!descriptionTextarea || !descCount) return;
    
    const length = descriptionTextarea.value.length;
    descCount.textContent = length;
    
    const charCountElement = descCount.parentElement;
    if (charCountElement) {
        charCountElement.classList.remove('warning', 'danger');
        
        if (length > 180) {
            charCountElement.classList.add('danger');
        } else if (length > 150) {
            charCountElement.classList.add('warning');
        }
    }
}

// Filter button click handler 
function handleFilterClick(button) {
    console.log('Filter clicked:', button.dataset.filter);
    
    //TODO Iterate over a collection of elements to accomplish some task.
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    button.classList.add('active');
    currentFilter = button.dataset.filter;
    renderTasks();
    updateTaskCount();
}

// Render tasks based on current filter 
function renderTasks() {
    if (!taskList) return;
    
    console.log('Rendering tasks with filter:', currentFilter);
    console.log('Total tasks:', tasks.length);
    
    taskList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });
    
    console.log('Filtered tasks:', filteredTasks.length);
    
    if (filteredTasks.length === 0) {
        if (emptyMessage) {
            emptyMessage.classList.remove('hidden');
        }
    } else {
        if (emptyMessage) {
            emptyMessage.classList.add('hidden');
        }
        
        const fragment = document.createDocumentFragment();
        
        filteredTasks.forEach(task => {
            if (!taskTemplate) return;
            
            const taskElement = taskTemplate.content.cloneNode(true);
            const li = taskElement.querySelector('.task-item');
            
            if (!li) return;
            
            // Set task ID
            li.dataset.id = task.id;
            
            // Set task title
            const titleElement = li.querySelector('.task-title');
            if (titleElement) {
                titleElement.textContent = task.title;
            }
            
            // Set task description
            const descriptionElement = li.querySelector('.task-description');
            if (descriptionElement) {
                if (task.description && task.description.trim()) {
                    descriptionElement.textContent = task.description;
                    descriptionElement.style.display = 'block';
                } else {
                    descriptionElement.style.display = 'none';
                }
            }
            
            // Set priority badge
            const priorityBadge = li.querySelector('.task-priority-badge');
            if (priorityBadge) {
                priorityBadge.textContent = task.priority;
                priorityBadge.className = 'task-priority-badge ' + task.priority;
            }
            
            // Set due date
            const dueDateElement = li.querySelector('.task-due-date');
            if (dueDateElement) {
                if (task.dueDate) {
                    const dueDate = new Date(task.dueDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    dueDate.setHours(0, 0, 0, 0);
                    
                    dueDateElement.textContent = `Due: ${dueDate.toLocaleDateString()}`;
                    
                    if (dueDate < today && !task.completed) {
                        dueDateElement.classList.add('overdue');
                    } else {
                        dueDateElement.classList.remove('overdue');
                    }
                } else {
                    dueDateElement.textContent = 'No due date';
                    dueDateElement.classList.remove('overdue');
                }
            }
            
            // Set completed state
            const completeCheckbox = li.querySelector('.complete-checkbox');
            if (completeCheckbox) {
                completeCheckbox.checked = task.completed;
                
                if (task.completed) {
                    li.classList.add('completed');
                } else {
                    li.classList.remove('completed');
                }
                
                // Add event listener for completion toggle
                completeCheckbox.addEventListener('change', function() {
                    toggleTaskComplete(task.id);
                });
            }
            
            // Add event listeners for edit and delete buttons
            const editBtn = li.querySelector('.btn-edit');
            if (editBtn) {
                editBtn.addEventListener('click', function() {
                    editTask(task.id);
                });
            }
            
            const deleteBtn = li.querySelector('.btn-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    deleteTask(task.id);
                });
            }
            
            fragment.appendChild(li);
        });
        
        taskList.appendChild(fragment);
    }
}

// Toggle task completion
function toggleTaskComplete(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
        updateTaskCount();
        
        const task = tasks[taskIndex];
        const status = task.completed ? 'completed' : 'active';
        showNotification(`Task marked as ${status}!`, 'success');
    }
}

// Edit task
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    editTaskId = taskId;
    
    // Populate form with task data
    if (titleInput) titleInput.value = task.title;
    if (descriptionTextarea) descriptionTextarea.value = task.description || '';
    
    const prioritySelect = document.getElementById('task-priority');
    if (prioritySelect) prioritySelect.value = task.priority;
    
    const dueDateInput = document.getElementById('task-due');
    if (dueDateInput) dueDateInput.value = task.dueDate || '';
    
    // Change submit button text
    if (addTaskBtn) {
        addTaskBtn.textContent = '💾 Update Task';
    }
    
    // Scroll to form
    const formSection = document.querySelector('.task-form-section');
    if (formSection) {
        formSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    showNotification('Editing task... Click Update Task to save changes.', 'info');
}

// Delete task
function deleteTask(taskId) {
    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
    if (!taskElement) return;
    
    // Animate removal
    taskElement.style.transform = 'translateX(-100%)';
    taskElement.style.opacity = '0';
    taskElement.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    
    setTimeout(() => {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        updateTaskCount();
        showNotification('Task deleted successfully!', 'error');
    }, 300);
}

// Clear completed tasks
function clearCompletedTasks() {
    const completedCount = tasks.filter(t => t.completed).length;
    
    if (completedCount === 0) {
        showNotification('No completed tasks to clear!', 'info');
        return;
    }
    
    if (confirm(`Are you sure you want to clear ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateTaskCount();
        showNotification(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}!`, 'success');
    }
}

// Update task count
function updateTaskCount() {
    if (!taskCount) return;
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const activeTasks = totalTasks - completedTasks;
    
    let countText;
    if (currentFilter === 'all') {
        countText = `${totalTasks} task${totalTasks !== 1 ? 's' : ''}`;
        if (completedTasks > 0) {
            countText += ` (${completedTasks} completed)`;
        }
    } else if (currentFilter === 'active') {
        countText = `${activeTasks} active task${activeTasks !== 1 ? 's' : ''}`;
    } else {
        countText = `${completedTasks} completed task${completedTasks !== 1 ? 's' : ''}`;
    }
    
    taskCount.textContent = countText;
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Apply styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 300px;
    `;
    
    // Set background color based on type
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .task-item {
        transition: all 0.3s ease;
    }
    
    .notification {
        font-family: inherit;
    }
`;

document.head.appendChild(style);