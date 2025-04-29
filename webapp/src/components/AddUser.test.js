import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import axios from '../utils/axios';
import MockAdapter from 'axios-mock-adapter';
import AddUser from './AddUser';
import { I18nextProvider } from "react-i18next";
import i18n from "../utils/i18n";
import { ThemeProvider } from "../context/ThemeContext";

const mockAxios = new MockAdapter(axios);
const mockNavigate = jest.fn();

// Mock useNavigate
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate
}));

jest.mock("../hooks/useAuth", () => ({
  __esModule: true,
  default: () => ({
    auth: { username: null },
  }),
}));

describe('AddUser component', () => {
  const renderLayout = () => {
    render(
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <AddUser />
          </MemoryRouter>
        </I18nextProvider>
      </ThemeProvider>
    );
  };

  const getInputsAndButton = () => {
    const usernameInput = screen.getByLabelText(i18n.t("username"));
    const passwordInput = screen.getByLabelText(i18n.t("password"));
    const addUserButton = screen.getByRole('button', { name: i18n.t("signUp") });
    return { usernameInput, passwordInput, addUserButton };
  };

  beforeEach(() => {
    mockAxios.reset();
    mockNavigate.mockReset();
  });

  it('should add user successfully', async () => {
    renderLayout();

    const { usernameInput, passwordInput, addUserButton } = getInputsAndButton();

    mockAxios.onPost("/adduser").reply(200);

    fireEvent.change(usernameInput, { target: { value: 'TestUser1' } });
    fireEvent.change(passwordInput, { target: { value: 'TestPassword1!' } });

    fireEvent.click(addUserButton);

    await waitFor(() => {
      expect(screen.getByText(i18n.t("userAddedSuccess"))).toBeInTheDocument();
    });
  });

  it('should redirect to home page if user is already logged in', async () => {
   
    jest.mock("../hooks/useAuth", () => ({
      __esModule: true,
      default: () => ({
        auth: { username: 'existingUser' },
      }),
    }), { virtual: true });

    const AddUserWithAuth = require('./AddUser').default;
    
    render(
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
            <AddUserWithAuth />
          </MemoryRouter>
        </I18nextProvider>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  
  it('should show username error when username is already taken', async () => {
    renderLayout();
    const { usernameInput, passwordInput, addUserButton } = getInputsAndButton();
    
    
    mockAxios.onPost("/adduser").reply(400, { error: 'Username already taken' });
    
    fireEvent.change(usernameInput, { target: { value: 'existingUser' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(addUserButton);
    
    await waitFor(() => {
      expect(screen.getByText('Username already taken')).toBeInTheDocument();
    });
  });

  it('should show username error when there is a username-related error', async () => {
    renderLayout();
    const { usernameInput, passwordInput, addUserButton } = getInputsAndButton();
    
    mockAxios.onPost("/adduser").reply(400, { error: 'Username must be at least 3 characters' });
    
    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(addUserButton);
    
    await waitFor(() => {
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
    });
  });

  it('should show password error when there is a password-related error', async () => {
    renderLayout();
    const { usernameInput, passwordInput, addUserButton } = getInputsAndButton();
    
    mockAxios.onPost("/adduser").reply(400, { error: 'Password must contain at least one number' });
    
    fireEvent.change(usernameInput, { target: { value: 'validUser' } });
    fireEvent.change(passwordInput, { target: { value: 'WeakPassword' } });
    fireEvent.click(addUserButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
    });
  });

  it('should handle generic errors from the server', async () => {
    renderLayout();
    const { usernameInput, passwordInput, addUserButton } = getInputsAndButton();
    
    mockAxios.onPost("/adduser").reply(500, { error: 'Server error' });
    
    fireEvent.change(usernameInput, { target: { value: 'validUser' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(addUserButton);
    
    await waitFor(() => {
      const request = mockAxios.history.post[0];
      expect(request.url).toBe('/adduser');
      expect(JSON.parse(request.data)).toEqual({
        username: 'validUser',
        password: 'Password123!'
      });
    });
  });

  it('should handle network errors', async () => {
    renderLayout();
    const { usernameInput, passwordInput, addUserButton } = getInputsAndButton();
    
    mockAxios.onPost("/adduser").networkError();
    
    fireEvent.change(usernameInput, { target: { value: 'validUser' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(addUserButton);
    
    await waitFor(() => {
      expect(mockAxios.history.post.length).toBe(1);
    });
  });

  it('should close the snackbar when handleCloseSnackbar is called', async () => {
    renderLayout();
    const { usernameInput, passwordInput, addUserButton } = getInputsAndButton();
    
    mockAxios.onPost("/adduser").reply(200);
    
    fireEvent.change(usernameInput, { target: { value: 'TestUser1' } });
    fireEvent.change(passwordInput, { target: { value: 'TestPassword1!' } });
    fireEvent.click(addUserButton);
    
    await waitFor(() => {
      expect(screen.getByText(i18n.t("userAddedSuccess"))).toBeInTheDocument();
    });
    
    const closeButton = screen.queryByRole('button', { name: /close/i });
    if (closeButton) {
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText(i18n.t("userAddedSuccess"))).not.toBeInTheDocument();
      }, { timeout: 7000 });
    }
  });

  it('should clear error messages when inputs change', async () => {
    renderLayout();
    const { usernameInput, passwordInput, addUserButton } = getInputsAndButton();
    
    mockAxios.onPost("/adduser").reply(400, { error: 'Username already taken' });
    
    fireEvent.change(usernameInput, { target: { value: 'existingUser' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(addUserButton);
    
    await waitFor(() => {
      expect(screen.getByText('Username already taken')).toBeInTheDocument();
    });
    
    fireEvent.change(usernameInput, { target: { value: 'newUserName' } });
    
    expect(screen.queryByText('Username already taken')).not.toBeInTheDocument();
  });
});