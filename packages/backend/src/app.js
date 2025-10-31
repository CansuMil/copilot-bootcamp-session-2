const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    completed INTEGER DEFAULT 0,
    due_date TEXT,
    priority TEXT DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some initial data
const initialItems = [
  { name: 'Item 1', description: 'Olympics opening ceremony', completed: 0, due_date: '2026-02-06', priority: 'high' },
  { name: 'Item 2', description: 'Book hotel', completed: 0, due_date: '2025-12-01', priority: 'medium' },
  { name: 'Item 3', description: 'Buy ski tickets', completed: 1, due_date: '2025-11-15', priority: 'low' }
];
const insertStmt = db.prepare('INSERT INTO items (name, description, completed, due_date, priority) VALUES (?, ?, ?, ?, ?)');

initialItems.forEach(item => {
  insertStmt.run(item.name, item.description, item.completed, item.due_date, item.priority);
});

console.log('In-memory database initialized with sample data');

// API Routes
app.get('/api/items', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const { name, description = '', completed = 0, due_date = null, priority = 'medium' } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const result = insertStmt.run(name, description, completed ? 1 : 0, due_date, priority);
    const id = result.lastInsertRowid;

    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});
// Update task completion, description, due date, and priority
app.put('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, completed, due_date, priority } = req.body;
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }
    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const updateStmt = db.prepare(`
      UPDATE items SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        completed = COALESCE(?, completed),
        due_date = COALESCE(?, due_date),
        priority = COALESCE(?, priority)
      WHERE id = ?
    `);
    updateStmt.run(
      name,
      description,
      typeof completed === 'undefined' ? undefined : (completed ? 1 : 0),
      due_date,
      priority,
      id
    );
    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM items WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Item deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { app, db, insertStmt };