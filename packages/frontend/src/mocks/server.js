import { rest } from 'msw';
import { setupServer } from 'msw/node';

let items = [];
let idCounter = 1;

export const handlers = [
  // GET /api/items
  rest.get('/api/items', (req, res, ctx) => {
    const normalized = items.map(item => ({
      ...item,
      due_date: item.due_date || item.dueDate || '',
      dueDate: item.dueDate || item.due_date || '',
    }));
    return res(
      ctx.status(200),
      ctx.json(normalized)
    );
  }),
  
  // POST /api/items
  rest.post('/api/items', async (req, res, ctx) => {
    const body = await req.json();
    const dueDate = body.due_date || body.dueDate || '';
    const newItem = {
      id: idCounter++,
      name: body.name,
      description: body.description || '',
      due_date: dueDate,
      dueDate: dueDate,
      priority: body.priority || 'medium',
      completed: false,
      created_at: new Date().toISOString(),
    };
    items.push(newItem);
    return res(
      ctx.status(201),
      ctx.json(newItem)
    );
  }),

  // PUT /api/items/:id
  rest.put('/api/items/:id', async (req, res, ctx) => {
    const id = parseInt(req.params.id, 10);
    const body = await req.json();
    const item = items.find(t => t.id === id);
    if (!item) return res(ctx.status(404), ctx.json({ error: 'Not found' }));
    
    if (body.due_date || body.dueDate) {
      const dueDate = body.due_date || body.dueDate;
      item.due_date = dueDate;
      item.dueDate = dueDate;
    }
    Object.assign(item, body);
    if (typeof item.completed !== 'boolean') {
      item.completed = !!item.completed;
    }
    return res(ctx.status(200), ctx.json(item));
  }),
  
  // DELETE /api/items/:id
  rest.delete('/api/items/:id', (req, res, ctx) => {
    const id = parseInt(req.params.id, 10);
    items = items.filter(t => t.id !== id);
    return res(ctx.status(200), ctx.json({ message: 'Item deleted successfully', id }));
  }),
];export const server = setupServer(...handlers);

export const resetItems = () => {
  items = [];
  idCounter = 1;
};

