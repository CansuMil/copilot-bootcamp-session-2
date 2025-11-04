import {
  isValidTaskName,
  formatDate,
  getPriorityLabel,
  isOverdue,
  sortTasks,
  filterTasksByStatus,
} from '../taskHelpers';

describe('taskHelpers', () => {
  describe('isValidTaskName', () => {
    it('should return true for valid task names', () => {
      expect(isValidTaskName('Valid Task')).toBe(true);
      expect(isValidTaskName('A')).toBe(true);
      expect(isValidTaskName('  Task with spaces  ')).toBe(true);
    });

    it('should return false for invalid task names', () => {
      expect(isValidTaskName('')).toBe(false);
      expect(isValidTaskName('   ')).toBe(false);
      expect(isValidTaskName(null)).toBe(false);
      expect(isValidTaskName(undefined)).toBe(false);
      expect(isValidTaskName(123)).toBe(false);
      expect(isValidTaskName({})).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format valid dates correctly', () => {
      const result = formatDate('2026-02-06');
      expect(result).toMatch(/Feb/);
      expect(result).toMatch(/6/);
      expect(result).toMatch(/2026/);
    });

    it('should return empty string for null or undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('invalid-date');
    });
  });

  describe('getPriorityLabel', () => {
    it('should return correct labels for all priorities', () => {
      const high = getPriorityLabel('high');
      expect(high.text).toBe('High');
      expect(high.color).toBe('#e63946');

      const medium = getPriorityLabel('medium');
      expect(medium.text).toBe('Medium');
      expect(medium.color).toBe('#ff9800');

      const low = getPriorityLabel('low');
      expect(low.text).toBe('Low');
      expect(low.color).toBe('#5ac8fa');
    });

    it('should return medium as default for unknown priorities', () => {
      const result = getPriorityLabel('unknown');
      expect(result.text).toBe('Medium');
      expect(result.color).toBe('#ff9800');
    });
  });

  describe('isOverdue', () => {
    it('should return true for overdue tasks', () => {
      const pastDate = '2020-01-01';
      expect(isOverdue(pastDate, false)).toBe(true);
    });

    it('should return false for future tasks', () => {
      const futureDate = '2030-01-01';
      expect(isOverdue(futureDate, false)).toBe(false);
    });

    it('should return false for completed tasks', () => {
      const pastDate = '2020-01-01';
      expect(isOverdue(pastDate, true)).toBe(false);
    });

    it('should return false for tasks without due date', () => {
      expect(isOverdue(null, false)).toBe(false);
      expect(isOverdue(undefined, false)).toBe(false);
      expect(isOverdue('', false)).toBe(false);
    });

    it('should handle today as not overdue', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(isOverdue(today, false)).toBe(false);
    });
  });

  describe('sortTasks', () => {
    const tasks = [
      { id: 1, name: 'Task 1', priority: 'low', due_date: '2026-03-01' },
      { id: 2, name: 'Task 2', priority: 'high', due_date: '2026-01-01' },
      { id: 3, name: 'Task 3', priority: 'medium', due_date: '2026-02-01' },
      { id: 4, name: 'Task 4', priority: 'high', due_date: null },
    ];

    it('should sort by due date by default', () => {
      const sorted = sortTasks(tasks);
      expect(sorted[0].id).toBe(2); // 2026-01-01
      expect(sorted[1].id).toBe(3); // 2026-02-01
      expect(sorted[2].id).toBe(1); // 2026-03-01
      expect(sorted[3].id).toBe(4); // null (should be last)
    });

    it('should sort by priority', () => {
      const sorted = sortTasks(tasks, 'priority');
      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('high');
      expect(sorted[2].priority).toBe('medium');
      expect(sorted[3].priority).toBe('low');
    });

    it('should not mutate original array', () => {
      const original = [...tasks];
      sortTasks(tasks, 'priority');
      expect(tasks).toEqual(original);
    });

    it('should handle empty array', () => {
      const sorted = sortTasks([]);
      expect(sorted).toEqual([]);
    });
  });

  describe('filterTasksByStatus', () => {
    const tasks = [
      { id: 1, name: 'Task 1', completed: false },
      { id: 2, name: 'Task 2', completed: true },
      { id: 3, name: 'Task 3', completed: false },
      { id: 4, name: 'Task 4', completed: true },
    ];

    it('should return all tasks when status is "all"', () => {
      const filtered = filterTasksByStatus(tasks, 'all');
      expect(filtered).toHaveLength(4);
    });

    it('should return only completed tasks', () => {
      const filtered = filterTasksByStatus(tasks, 'completed');
      expect(filtered).toHaveLength(2);
      expect(filtered.every(task => task.completed)).toBe(true);
    });

    it('should return only incomplete tasks', () => {
      const filtered = filterTasksByStatus(tasks, 'incomplete');
      expect(filtered).toHaveLength(2);
      expect(filtered.every(task => !task.completed)).toBe(true);
    });

    it('should return all tasks for unknown status', () => {
      const filtered = filterTasksByStatus(tasks, 'unknown');
      expect(filtered).toHaveLength(4);
    });

    it('should handle empty array', () => {
      const filtered = filterTasksByStatus([], 'completed');
      expect(filtered).toEqual([]);
    });
  });
});
