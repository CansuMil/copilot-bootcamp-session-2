/**
 * Validates if a task name is valid (non-empty after trimming)
 */
export const isValidTaskName = (name) => {
  return typeof name === 'string' && name.trim().length > 0;
};

/**
 * Formats a date string for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

/**
 * Gets the priority label with appropriate styling
 */
export const getPriorityLabel = (priority) => {
  const labels = {
    high: { text: 'High', color: '#e63946' },
    medium: { text: 'Medium', color: '#ff9800' },
    low: { text: 'Low', color: '#5ac8fa' },
  };
  return labels[priority] || labels.medium;
};

/**
 * Checks if a task is overdue
 */
export const isOverdue = (dueDate, completed) => {
  if (!dueDate || completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

/**
 * Sorts tasks by priority and due date
 */
export const sortTasks = (tasks, sortBy = 'due_date') => {
  const tasksCopy = [...tasks];
  
  if (sortBy === 'priority') {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return tasksCopy.sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
  
  if (sortBy === 'due_date') {
    return tasksCopy.sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }
  
  return tasksCopy;
};

/**
 * Filters tasks by completion status
 */
export const filterTasksByStatus = (tasks, status) => {
  if (status === 'all') return tasks;
  if (status === 'completed') return tasks.filter(task => task.completed);
  if (status === 'incomplete') return tasks.filter(task => !task.completed);
  return tasks;
};
