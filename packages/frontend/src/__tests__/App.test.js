import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { server, rest } from '../setupTests';

describe('App Component', () => {
  test('renders the Olympics header', async () => {
    render(<App />);
    expect(screen.getByText('Milano Cortina 2026 TODO App')).toBeInTheDocument();
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });
});