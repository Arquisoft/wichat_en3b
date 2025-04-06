import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import axios from '../api/axios';
import MockAdapter from 'axios-mock-adapter';
import AddUser from './AddUser';

const mockAxios = new MockAdapter(axios);

describe('AddUser component', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('should add user successfully', async () => {
    render(
      <MemoryRouter>
        <AddUser />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const addUserButton = screen.getByRole('button', { name: /Add User/i });

    mockAxios.onPost("/adduser").reply(200);

    fireEvent.change(usernameInput, { target: { value: 'TestUser1' } });
    fireEvent.change(passwordInput, { target: { value: 'TestPassword1!' } });

    fireEvent.click(addUserButton);

    await waitFor(() => {
      expect(screen.getByText(/User added successfully/i)).toBeInTheDocument();
    });
  });

  it('should handle error when adding user', async () => {
    render(
      <MemoryRouter>
        <AddUser />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const addUserButton = screen.getByRole('button', { name: /Add User/i });

    mockAxios.onPost("/adduser").reply(500, { error: 'Internal Server Error' });

    fireEvent.change(usernameInput, { target: { value: 'TestUser1' } });
    fireEvent.change(passwordInput, { target: { value: 'TestPassword1!' } });

    fireEvent.click(addUserButton);

    await waitFor(() => {
      expect(
        screen.getByText((content, node) => content.includes('Internal Server Error'))
      ).toBeInTheDocument();
    });
  });
});
