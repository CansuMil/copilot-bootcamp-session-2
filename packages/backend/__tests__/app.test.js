const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createItem = async (fields = {}) => {
  const defaultFields = {
    name: 'Temp Item to Delete',
    description: 'desc',
    due_date: '2026-12-31',
    priority: 'medium',
    completed: 0
  };
  const response = await request(app)
    .post('/api/items')
    .send({ ...defaultFields, ...fields })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

  // Check if items have the expected structure
  const item = response.body[0];
  expect(item).toHaveProperty('id');
  expect(item).toHaveProperty('name');
  expect(item).toHaveProperty('description');
  expect(item).toHaveProperty('due_date');
  expect(item).toHaveProperty('priority');
  expect(item).toHaveProperty('completed');
  expect(item).toHaveProperty('created_at');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item with all fields', async () => {
      const newItem = {
        name: 'Test Item',
        description: 'Test Desc',
        due_date: '2026-12-31',
        priority: 'high',
        completed: 1
      };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.description).toBe(newItem.description);
      expect(response.body.due_date).toBe(newItem.due_date);
      expect(response.body.priority).toBe(newItem.priority);
      expect(response.body.completed).toBe(1);
      expect(response.body).toHaveProperty('created_at');
    });
  describe('PUT /api/items/:id', () => {
    it('should update an existing item', async () => {
      const item = await createItem({ name: 'To Update', completed: 0 });
      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ name: 'Updated Name', completed: 1, description: 'Updated Desc', due_date: '2027-01-01', priority: 'low' })
        .set('Accept', 'application/json');
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.completed).toBe(1);
      expect(response.body.description).toBe('Updated Desc');
      expect(response.body.due_date).toBe('2027-01-01');
      expect(response.body.priority).toBe('low');
    });

    it('should toggle completion status', async () => {
      const item = await createItem({ completed: 0 });
      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ completed: 1 })
        .set('Accept', 'application/json');
      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(1);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .put('/api/items/999999')
        .send({ name: 'Does Not Exist' })
        .set('Accept', 'application/json');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });
  });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });

    it('should return 400 if name is empty', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item name is required');
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const item = await createItem('Item To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Item deleted successfully', id: item.id });

      const deleteAgain = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).delete('/api/items/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/items/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid item ID is required');
    });
  });
});