import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  test('renders the Olympics header', async () => {
    render(<App />);
    expect(screen.getByText('Milano Cortina 2026 TODO App')).toBeInTheDocument();
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });
});
