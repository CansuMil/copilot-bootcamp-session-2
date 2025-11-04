import React, { useState, useEffect } from 'react';
import './App.css';
import { AppBar, Toolbar, Typography, Container, Paper, TextField, Button, List, ListItem, ListItemText, IconButton, CircularProgress, Snackbar, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AcUnitIcon from '@mui/icons-material/AcUnit';


function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newItem,
          description: newDescription,
          due_date: newDueDate,
          priority: newPriority,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const result = await response.json();
      const newData = [...data, result];
      setData(newData);
      setNewItem('');
      setNewDescription('');
      setNewDueDate('');
      setNewPriority('medium');
    } catch (err) {
      setError('Error adding item: ' + err.message);
    }
  };
  const handleToggleComplete = async (item) => {
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !item.completed }),
      });
      if (!response.ok) throw new Error('Failed to update item');
      const updated = await response.json();
      setData(data.map((t) => (t.id === item.id ? updated : t)));
    } catch (err) {
      setError('Error updating item: ' + err.message);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setData(data.filter(item => item.id !== itemId));
      setError(null);
    } catch (err) {
      setError('Error deleting item: ' + err.message);
    }
  };

  return (
    <Box sx={{ background: 'linear-gradient(135deg, #5ac8fa 0%, #f8fafd 100%)', minHeight: '100vh', pb: 4 }}>
      <AppBar position="static" sx={{ background: 'rgba(0,51,102,0.85)', backdropFilter: 'blur(6px)' }}>
        <Toolbar>
          <AcUnitIcon sx={{ mr: 2, color: '#5ac8fa' }} />
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            Milano Cortina 2026 TODO App
          </Typography>
          <EmojiEventsIcon sx={{ color: '#ffd700', mr: 1 }} />
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={6} sx={{ p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.85)', boxShadow: '0 8px 32px 0 rgba(31,38,135,0.15)' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#003366' }}>
            Add New Task
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Enter task name"
              size="small"
              sx={{ background: '#f8fafd', borderRadius: 2 }}
              label="Task Name"
              required
            />
            <TextField
              fullWidth
              variant="outlined"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description"
              size="small"
              sx={{ background: '#f8fafd', borderRadius: 2 }}
              label="Description"
            />
            <TextField
              fullWidth
              variant="outlined"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              type="date"
              size="small"
              sx={{ background: '#f8fafd', borderRadius: 2 }}
              label="Due Date"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              fullWidth
              variant="outlined"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              size="small"
              sx={{ background: '#f8fafd', borderRadius: 2 }}
              label="Priority"
              SelectProps={{ native: true }}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </TextField>
            <Button type="submit" variant="contained" sx={{ background: '#5ac8fa', color: '#003366', fontWeight: 700 }}>
              Add
            </Button>
          </Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#003366' }}>
            Tasks
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : error ? (
            <Snackbar open={!!error} message={error} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} />
          ) : (
            <List>
              {data.length > 0 ? (
                data.map((item, idx) => (
                  <ListItem
                    key={item.id}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(item.id)} sx={{ color: '#e63946' }}>
                        <DeleteIcon />
                      </IconButton>
                    }
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      background: idx % 2 === 0 ? 'rgba(90,200,250,0.08)' : 'rgba(192,192,192,0.08)',
                      boxShadow: '0 2px 8px 0 rgba(0,51,102,0.04)',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <IconButton onClick={() => handleToggleComplete(item)} aria-label="toggle complete" size="small">
                        <EmojiEventsIcon sx={{ color: item.completed ? '#ffd700' : '#c0c0c0', mr: 1 }} />
                      </IconButton>
                      <ListItemText
                        primary={item.name}
                        secondary={
                          <>
                            {item.description && <span>Description: {item.description} <br /></span>}
                            {item.due_date && <span>Due: {item.due_date} <br /></span>}
                            <span>Priority: {item.priority}</span>
                          </>
                        }
                        primaryTypographyProps={{
                          sx: { color: '#003366', fontWeight: 500, textDecoration: item.completed ? 'line-through' : 'none' },
                        }}
                        secondaryTypographyProps={{
                          sx: { color: '#1976d2', fontSize: '0.9em' },
                        }}
                      />
                    </Box>
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ color: '#9e9e9e', textAlign: 'center', mt: 2 }}>No tasks found. Add some!</Typography>
              )}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default App;