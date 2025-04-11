// src/components/__tests__/Welcome.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { MemoryRouter } from 'react-router';
import Welcome from './Welcome';
import { ThemeProvider } from '../context/ThemeContext';

// Mock axios to prevent real API calls
jest.mock('axios', () => {
  const mockAxios = {
    create: jest.fn(() => mockAxios),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    },
  };
  return mockAxios;
});


// Mock AuthContext if needed
jest.mock('../hooks/useAuth', () => ({
  __esModule: true,
  default: () => ({
    auth: { accessToken: 'fake-token' }, // Simulate a logged-in user
    setAuth: jest.fn(),
  }),
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterAll(() => {
  console.error.mockRestore();
});

describe('Welcome Component', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear previous mocks before each test
  });

  it('fetches and displays the generated welcome message', async () => {
    // Simulate a successful API response with authentication
    axios.post.mockResolvedValue({
      data: { answer: "Hey Guest! Get ready for some fun. Press start!" },
      headers: { Authorization: "Bearer fake-token" }
    });

    // Render the component inside a MemoryRouter to handle <NavLink>
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Welcome />
        </MemoryRouter>
      </ThemeProvider>
    );

    // Wait for the generated message to appear in the document
    await waitFor(() => {
      expect(screen.getByText(/Hey Guest!/i)).toBeInTheDocument();
    });

    // Verify that the "Start the fun" button is rendered
    const button = screen.getByRole('button', { name: /Start the fun/i });
    expect(button).toBeInTheDocument();

    // Check that the button contains the correct link to /gametopic
    expect(screen.getByRole('link')).toHaveAttribute('href', '/gametopic');
  });

  it('handles API call failure gracefully', async () => {
    // Simulate an API failure
    axios.post.mockRejectedValue(new Error('API Error'));

    // Render the component
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Welcome />
        </MemoryRouter>
      </ThemeProvider>
    );

    // Ensure that no welcome message is displayed if the API call fails
    await waitFor(() => {
      expect(screen.queryByText(/Get ready for some fun/i)).not.toBeInTheDocument();
    });
  });
});
