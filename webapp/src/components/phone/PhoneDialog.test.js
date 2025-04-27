import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhoneDialog from './PhoneDialog';
import FriendChat from './FriendChat';

// Mock material UI components and icons
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    useTheme: () => ({
      palette: {
        primary: { main: '#1976d2', contrastText: '#fff' },
        text: { primary: '#000', secondary: '#666' },
        background: { default: '#fff', paper: '#f5f5f5' },
        grey: { 300: '#e0e0e0' },
        surface: { main: '#fff' },
      },
      shadows: Array(25).fill('none'),
    }),
  };
});

jest.mock('@mui/icons-material/Wifi', () => () => <div data-testid="wifi-icon" />);
jest.mock('@mui/icons-material/SignalCellularAlt', () => () => <div data-testid="signal-icon" />);
jest.mock('@mui/icons-material/BatteryFull', () => () => <div data-testid="battery-icon" />);
jest.mock('@mui/icons-material/Close', () => () => <div data-testid="close-icon" />);
jest.mock('@mui/icons-material/Search', () => () => <div data-testid="search-icon" />);

// Mock FriendChat component
jest.mock('./FriendChat', () => jest.fn(() => <div data-testid="friend-chat">FriendChat Component</div>));

// Mock the image
jest.mock('../photos/lockedPic.png', () => 'locked-screen-image.png');

describe('PhoneDialog Component', () => {
  const mockOnClose = jest.fn();
  const mockChatKey = 'test-chat-key';
  const mockRoundData = {
    mainTopic: 'Test Topic',
    itemWithImage: { name: 'Test Item' }
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    FriendChat.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test('renders locked screen initially', () => {
    render(
      <PhoneDialog 
        onClose={mockOnClose} 
        chatKey={mockChatKey} 
        roundData={mockRoundData} 
      />
    );
    
    // Check for locked screen elements
    expect(screen.getByText('Your phone is locked now')).toBeInTheDocument();
    expect(screen.getByText(/Tap the button below to unlock/)).toBeInTheDocument();
    expect(screen.getByText('Press here to unlock')).toBeInTheDocument();
    expect(screen.getByAltText('Locked Screen')).toBeInTheDocument();
  });

  test('shows status bar with icons and time', () => {
    render(
      <PhoneDialog 
        onClose={mockOnClose} 
        chatKey={mockChatKey} 
        roundData={mockRoundData} 
      />
    );
    
    expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();
    expect(screen.getByTestId('signal-icon')).toBeInTheDocument();
    expect(screen.getByTestId('battery-icon')).toBeInTheDocument();
    
    // Check that time is displayed (format might vary)
    const timeRegex = /\d{1,2}:\d{2}/;
    const timeElement = screen.getByText(timeRegex);
    expect(timeElement).toBeInTheDocument();
  });

  test('unlocks to contacts view when unlock button is clicked', () => {
    render(
      <PhoneDialog 
        onClose={mockOnClose} 
        chatKey={mockChatKey} 
        roundData={mockRoundData} 
      />
    );
    
    const unlockButton = screen.getByText('Press here to unlock');
    fireEvent.click(unlockButton);
    
    // Check that we're in contacts view
    expect(screen.getByPlaceholderText(/Search \d+ contacts/)).toBeInTheDocument();
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    
    // Check that at least some contacts are rendered
    expect(screen.getByText('Fernando Alonso')).toBeInTheDocument();
    expect(screen.getByText('F1 driver')).toBeInTheDocument();
  });

  test('locks screen when close button is clicked in contacts view', () => {
    render(
      <PhoneDialog 
        onClose={mockOnClose} 
        chatKey={mockChatKey} 
        roundData={mockRoundData} 
      />
    );
    
    // First unlock
    const unlockButton = screen.getByText('Press here to unlock');
    fireEvent.click(unlockButton);
    
    // Then lock again
    const closeButton = screen.getByTestId('close-icon').closest('button');
    fireEvent.click(closeButton);
    
    // Check we're back to locked screen
    expect(screen.getByText('Your phone is locked now')).toBeInTheDocument();
  });


  test('returns to contacts view when chat is ended', async () => {
    render(
      <PhoneDialog 
        onClose={mockOnClose} 
        chatKey={mockChatKey} 
        roundData={mockRoundData} 
      />
    );
    
    // Unlock and navigate to chat
    const unlockButton = screen.getByText('Press here to unlock');
    fireEvent.click(unlockButton);
    
    const contact = screen.getByText('Picasso').closest('div[role="button"]') || 
                    screen.getByText('Picasso').closest('div');
    fireEvent.click(contact);
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Get the onEndChat prop that was passed to FriendChat
    const { onEndChat } = FriendChat.mock.calls[0][0];
    
    // Call onEndChat to simulate ending the chat
    act(() => {
      onEndChat();
    });
    
    // Should be back in contacts view
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search \d+ contacts/)).toBeInTheDocument();
    });
  });

  test('updates time display every minute', () => {
    jest.spyOn(global.Date.prototype, 'toLocaleTimeString').mockImplementation(() => '10:30');
    
    render(
      <PhoneDialog 
        onClose={mockOnClose} 
        chatKey={mockChatKey} 
        roundData={mockRoundData} 
      />
    );
    
    expect(screen.getByText('10:30')).toBeInTheDocument();
    
    // Change the mock time and advance timer
    jest.spyOn(global.Date.prototype, 'toLocaleTimeString').mockImplementation(() => '10:31');
    
    act(() => {
      jest.advanceTimersByTime(60000); // Advance by one minute
    });
    
    expect(screen.getByText('10:31')).toBeInTheDocument();
  });
  
});