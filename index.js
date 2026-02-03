// Complete JavaScript for Task Manager

//TODO Cache at least one element using selectElementById.
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const emptyMessage = document.getElementById('empty-message');

//TODO Cache at least one element using querySelector or querySelectorAll.
const filterButtons = document.querySelectorAll('.filter-btn');
const addTaskBtn = document.querySelector('#add-task-btn');

// Task data storage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Initialize the app
function init() {
    renderTasks();
    updateTaskCount();
    setupEventListeners();
    
    // BOM: Check screen size on load
    console.log('Screen width:', window.innerWidth, 'px');
}

// Setup all event listeners
function setupEventListeners() {
    //TODO Register at least two different event listeners and create the associated event handler functions.
    // Form submission
    taskForm.addEventListener('submit', handleFormSubmit);
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => handleFilterClick(btn));
    });
    
    // Clear completed tasks
    document.getElementById('clear-completed').addEventListener('click', clearCompletedTasks);
    
    // Description character count
    document.getElementById('task-description').addEventListener('input', updateDescriptionCharCount);
    
    // Real-time form validation
    const titleInput = document.getElementById('task-title');
    titleInput.addEventListener('input', validateTitle);
    
    //TODO Use at least two Browser Object Model (BOM) properties or methods.
    // BOM: Save tasks before page unload
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    });
}

// Form submission handler
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = new FormData(taskForm);
    const task = {
        id: Date.now().toString(),
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        dueDate: formData.get('dueDate'),
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    updateTaskCount();
    taskForm.reset();
    updateDescriptionCharCount();
}

//TODO include at least one form and/or input with HTML attribute validation
//TODO Include at least one form and/or input with DOM event-based validation.
function validateForm() {
    const titleInput = document.getElementById('task-title');
    const formGroup = titleInput.parentElement;
    const errorMessage = formGroup.querySelector('.error-message');
    
    // Clear previous state
    formGroup.classList.remove('error', 'success');
    errorMessage.textContent = '';
    
    // HTML attribute validation (required, minlength) + DOM validation
    if (!titleInput.value.trim()) {
        formGroup.classList.add('error');
        errorMessage.textContent = 'Title is required';
        return false;
    }
    
    if (titleInput.value.trim().length < 3) {
        formGroup.classList.add('error');
        errorMessage.textContent = 'Title must be at least 3 characters';
        return false;
    }
    
    // Success state
    formGroup.classList.add('success');
    return true;
}

// Real-time title validation
function validateTitle(e) {
    const titleInput = e.target;
    const formGroup = titleInput.parentElement;
    const errorMessage = formGroup.querySelector('.error-message');
    
    if (titleInput.value.trim().length < 3 && titleInput.value.trim().length > 0) {
        formGroup.classList.add('error');
        errorMessage.textContent = 'Title must be at least 3 characters';
    } else {
        formGroup.classList.remove('error');
        errorMessage.textContent = '';
    }
}

// Update description character count
function updateDescriptionCharCount() {
    const description = document.getElementById('task-description');
    const charCount = document.getElementById('desc-count');
    const charCountElement = charCount.parentElement;
    
    const length = description.value.length;
    charCount.textContent = length;
    
    //TODO Modify the style and/or CSS classes of an element in response to user interactions
    charCountElement.classList.remove('warning', 'danger');
    
    if (length > 180) {
        charCountElement.classList.add('danger');
    } else if (length > 150) {
        charCountElement.classList.add('warning');
    }
}

// Filter button click handler
function handleFilterClick(button) {
    //TODO Iterate over a collection of elements to accomplish some task.
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    button.classList.add('active');
    currentFilter = button.dataset.filter;
    renderTasks();
}

// Render tasks based on current filter
function renderTasks() {
    taskList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });
    
    if (filteredTasks.length === 0) {
        emptyMessage.classList.remove('hidden');
    } else {
        emptyMessage.classList.add('hidden');
        
        //TODO Use the DocumentFragment interface or HTML templating with the cloneNode method
        const fragment = document.createDocumentFragment();
        
        filteredTasks.forEach(task => {
            //TODO Use the parent-child-sibling relationship to navigate between elements
            const template = document.getElementById('task-template');
            const taskElement = template.content.cloneNode(true);
            const li = taskElement.querySelector('.task-item');
            
            //TODO Modify at least one attribute of an element in response to user interaction.
            li.dataset.id = task.id;
            
            //TODO Modify the HTML or text content of at least one element
            li.querySelector('.task-title').textContent = task.title;
            li.querySelector('.task-description').textContent = task.description || '';
            
            // Priority badge
            const priorityBadge = li.querySelector('.task-priority-badge');
            priorityBadge.textContent = task.priority;
            priorityBadge.classList.add(task.priority);
            
            // Due date
            const dueDateElement = li.querySelector('.task-due-date');
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                dueDateElement.textContent = `Due: ${dueDate.toLocaleDateString()}`;
                
                if (dueDate < today && !task.completed) {
                    dueDateElement.classList.add('overdue');
                }
            } else {
                dueDateElement.textContent = 'No due date';
            }
            
            //TODO Modify the style and/or CSS classes of an element
            if (task.completed) {
                li.classList.add('completed');
                li.querySelector('.complete-checkbox').checked = true;
            }
            
            // Event listeners for task actions
            const completeCheckbox = li.querySelector('.complete-checkbox');
            completeCheckbox.addEventListener('change', () => toggleTaskComplete(task.id));
            
            const editBtn = li.querySelector('.btn-edit');
            editBtn.addEventListener('click', () => editTask(task.id));
            
            const deleteBtn = li.querySelector('.btn-delete');
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            fragment.appendChild(taskElement);
        });
        
        taskList.appendChild(fragment);
    }
}

// Toggle task completion
function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateTaskCount();
    }
}

// Edit task
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    //TODO Create at least one element using createElement
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Edit Task</h3>
            <form id="edit-form">
                <div class="form-group">
                    <label for="edit-title">Title</label>
                    <input type="text" id="edit-title" value="${task.title}" required>
                </div>
                <div class="form-group">
                    <label for="edit-description">Description</label>
                    <textarea id="edit-description">${task.description || ''}</textarea>
                </div>
                <div class="modal-buttons">
                    <button type="button" class="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-save">Save</button>
                </div>
            </form>
        </div>
    `;
    
    //TODO Use appendChild and/or prepend to add new elements to the DOM
    document.body.appendChild(modal);
    
    //TODO Use the parent-child-sibling relationship to navigate between elements
    const editForm = modal.querySelector('#edit-form');
    const cancelBtn = modal.querySelector('.btn-cancel');
    
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = modal.querySelector('#edit-title');
        const descriptionInput = modal.querySelector('#edit-description');
        
        //TODO Modify the HTML or text content of at least one element
        task.title = titleInput.value;
        task.description = descriptionInput.value;
        
        saveTasks();
        renderTasks();
        document.body.removeChild(modal);
    });
    
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Delete task
function deleteTask(taskId) {
    //TODO Use the parent-child-sibling relationship to navigate between elements
    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
    if (taskElement) {
        taskElement.style.transform = 'translateX(-100%)';
        taskElement.style.opacity = '0';
        
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
            updateTaskCount();
        }, 300);
    }
}

// Clear completed tasks
function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    updateTaskCount();
}

// Update task count
function updateTaskCount() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const activeTasks = totalTasks - completedTasks;
    
    let countText = `${totalTasks} task${totalTasks !== 1 ? 's' : ''}`;
    if (completedTasks > 0) {
        countText += ` (${completedTasks} completed)`;
    }
    
    //TODO Modify the HTML or text content of at least one element
    taskCount.textContent = countText;
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add some basic modal styles
const style = document.createElement('style');
style.textContent = `
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        padding: 25px;
        border-radius: 12px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    
    .modal h3 {
        margin-bottom: 15px;
        color: #333;
    }
    
    .modal-buttons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }
    
    .modal-buttons button {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
    }
    
    .btn-cancel {
        background: #e2e8f0;
        color: #666;
    }
    
    .btn-save {
        background: #667eea;
        color: white;
    }
`;

//TODO Use appendChild and/or prepend to add new elements to the DOM
document.head.appendChild(style);