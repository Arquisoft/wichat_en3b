import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Login from './Login';
import useAuth from '../../hooks/useAuth';

const mockAxios = new MockAdapter(axios);

jest.mock('../hooks/useAuth', () => ({
  __esModule: true,
  default: () => ({
    setAuth: jest.fn(),
    persist: false,
    setPersist: jest.fn(),
  }),
}));

describe('Login component', () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  
  afterAll(() => {
    console.error.mockRestore();
  });

  it('should log in successfully', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    mockAxios.onPost('/login').reply(200, { accessToken: 'fakeAccessToken' });

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testUser' } });
      fireEvent.change(passwordInput, { target: { value: 'testPassword' } });
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Login successful/i)).toBeInTheDocument();
    });
  });

  it('should handle error when logging in', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  
    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });
  
    mockAxios.onPost('/login').replyOnce(401, { error: 'Unauthorized' });
  
    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });
    fireEvent.click(loginButton);
  
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.some(alert => alert.textContent.toLowerCase().includes('error'))).toBe(true);
    });        
    
  });  
});