import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Login from './Login';
import { I18nextProvider } from "react-i18next";
import i18n from "../utils/i18n";


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
  const renderLayout = () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </I18nextProvider>
    );
  };
  const getInputsAndButton = () => {
    const usernameInput = screen.getByLabelText(i18n.t("username"));
    const passwordInput = screen.getByLabelText(i18n.t("password"));
    const loginButton = screen.getByTestId('login-submit');
    return { usernameInput, passwordInput, loginButton };
  };

  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  
  afterAll(() => {
    console.error.mockRestore();
  });

  it('should log in successfully', async () => {
    renderLayout();
    const {usernameInput, passwordInput, loginButton} = getInputsAndButton();

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
    renderLayout();
  
    const {usernameInput, passwordInput, loginButton} = getInputsAndButton();
  
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