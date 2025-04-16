import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsDialog from './SettingsDialog';
import useTheme from '../hooks/useTheme';

// Mock the useTheme hook
jest.mock('../hooks/useTheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock LanguageSelect component
jest.mock('./LanguageSelect', () => () => <div data-testid="language-select">Language Select</div>);

describe('SettingsDialog', () => {
  const mockSelectTheme = jest.fn();

  beforeEach(() => {
    useTheme.mockReturnValue({
      theme: { name: 'light' },
      themes: {
        light: { palette: { primary: { main: "#fff", contrastText: "#000" }, gradient: { main: { right: "#fff" } } } },
        dark: { palette: { primary: { main: "#000", contrastText: "#000" }, gradient: { main: { right: "#000" } } } }
      },
      selectTheme: mockSelectTheme,
    });
  });

  const setup = (props = {}) => {
    const onClose = jest.fn();
    render(<SettingsDialog open={true} onClose={onClose} {...props} />);
    return { onClose };
  };

  const openAdvancedSettings = async () => {
    const advancedSettingsButton = screen.getByRole('button', { name: /advanced settings/i });
    fireEvent.click(advancedSettingsButton);
    await screen.findByText(/LLM Model/i);
  };

  test('renders the dialog with title and all sections', () => {
    setup();

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByTestId('language-select')).toBeInTheDocument();
    expect(screen.getByText(/Theme/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/LLM Model/i)).toBeInTheDocument();
  });

  test('closes dialog when cancel button is clicked', () => {
    const { onClose } = setup();
    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
  });

  test('calls onClose when save is clicked', () => {
    const { onClose } = setup();
    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);
    expect(onClose).toHaveBeenCalled();
  });

  test('allows selecting a theme', () => {
    setup();

    const themeButton = screen.getByRole('button', { name: /select dark theme/i });
    fireEvent.click(themeButton);

    expect(mockSelectTheme).toHaveBeenCalledWith('dark');
  });

  test('allows selecting a LLM model', async () => {
    setup();

    await openAdvancedSettings();

    const modelSelect = screen.getByRole('combobox');
    expect(modelSelect).toHaveTextContent(/mistral/i);
    fireEvent.mouseDown(modelSelect);

    const model2Option = screen.getByRole('option', { name: /qwen/i });
    fireEvent.click(model2Option);

    expect(modelSelect).toHaveTextContent(/qwen/i);
  });

  test('calls onClose when close icon is clicked', () => {
    const { onClose } = setup();
    const closeIcon = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeIcon);
    expect(onClose).toHaveBeenCalled();
  });
});
