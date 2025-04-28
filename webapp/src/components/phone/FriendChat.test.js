import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FriendChat from './FriendChat';
import useAxios from '../../hooks/useAxios';
import useTheme from '../../hooks/useTheme';
import CloseIcon from "@mui/icons-material/Close";

// Mock the hooks and components
jest.mock('../../hooks/useAxios');
jest.mock('../../hooks/useTheme');
jest.mock('@mui/icons-material/Close', () => () => <div data-testid="close-icon">Close</div>);
jest.mock('react-simple-typewriter', () => ({
  Typewriter: ({ words }) => <span>{words[0]}</span>,
}));

describe('FriendChat Component', () => {
  const mockAxios = {
    post: jest.fn()
  };
  
  const mockTheme = {
    theme: {
      palette: {
        background: { paper: '#fff', default: '#f5f5f5' },
        divider: '#e0e0e0',
        text: { primary: '#000' },
        primary: { main: '#1976d2' },
        action: { hover: '#f0f0f0' }
      },
      shadows: ['none', '0px 2px 1px -1px rgba(0,0,0,0.2)']
    }
  };

  const mockSelectedContact = {
    name: 'Test Contact',
    mainTopic: 'Geography'
  };

  const mockRoundData = {
    mainTopic: 'World Capitals',
    itemWithImage: { name: 'Paris' }
  };

  const mockOnEndChat = jest.fn();

  beforeEach(() => {
    useAxios.mockReturnValue(mockAxios);
    useTheme.mockReturnValue(mockTheme);
    mockAxios.post.mockResolvedValue({ data: { answer: 'This is a test response' } });
    localStorage.setItem('llmModel', 'mistral');
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders with selected contact name', () => {
    render(
      <FriendChat 
        selectedContact={mockSelectedContact} 
        roundData={mockRoundData} 
        onEndChat={mockOnEndChat} 
      />
    );
    
    expect(screen.getByText('Test Contact')).toBeInTheDocument();
  });

  test('displays close button that calls onEndChat when clicked', () => {
    render(
      <FriendChat 
        selectedContact={mockSelectedContact} 
        roundData={mockRoundData} 
        onEndChat={mockOnEndChat} 
      />
    );
    
    // Find close button by test ID instead of role and name
    const closeButton = screen.getByTestId('close-icon').closest('button');
    fireEvent.click(closeButton);
    
    expect(mockOnEndChat).toHaveBeenCalledTimes(1);
  });

  test('sends a message when the Send button is clicked', async () => {
    render(
      <FriendChat 
        selectedContact={mockSelectedContact} 
        roundData={mockRoundData} 
        onEndChat={mockOnEndChat} 
      />
    );
    
    const input = screen.getByPlaceholderText('Ask for a hint...');
    userEvent.type(input, 'Is it London?');
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    
    // Check if user message appears
    await waitFor(() => {
      expect(screen.getByText('Is it London?')).toBeInTheDocument();
    });
    
  });

  test('sends a message when Enter key is pressed', async () => {
    render(
      <FriendChat 
        selectedContact={mockSelectedContact} 
        roundData={mockRoundData} 
        onEndChat={mockOnEndChat} 
      />
    );
    
    const input = screen.getByPlaceholderText('Ask for a hint...');
    userEvent.type(input, 'Is it Paris?{enter}');
    
    
    await waitFor(() => {
      expect(screen.getByText('Is it Paris?')).toBeInTheDocument();
    });
  });
  
  test('does not send empty messages', () => {
    render(
      <FriendChat 
        selectedContact={mockSelectedContact} 
        roundData={mockRoundData} 
        onEndChat={mockOnEndChat} 
      />
    );
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);
    
    expect(mockAxios.post).not.toHaveBeenCalled();
  });
  
  test('constructs the correct prompt based on contact and round data', async () => {
    render(
      <FriendChat 
        selectedContact={mockSelectedContact} 
        roundData={mockRoundData} 
        onEndChat={mockOnEndChat} 
      />
    );
    
    const input = screen.getByPlaceholderText('Ask for a hint...');
    userEvent.type(input, 'Give me a hint{enter}');
    
    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/askllm',
        expect.objectContaining({
          question: expect.any(String),
          model: 'mistral',
          prompt: expect.stringContaining('You are acting as Test Contact')
        })
      );
      
      // Verify prompt contains required information
      const calledPrompt = mockAxios.post.mock.calls[0][1].prompt;
      expect(calledPrompt).toContain('You know about: Geography');
      expect(calledPrompt).toContain('The topic now is: World Capitals');
      expect(calledPrompt).toContain('The correct answer is: Paris');
    });
  });
  
  test('handles API errors gracefully', async () => {
    mockAxios.post.mockRejectedValueOnce(new Error('API Error'));
    
    render(
      <FriendChat 
        selectedContact={mockSelectedContact} 
        roundData={mockRoundData} 
        onEndChat={mockOnEndChat} 
      />
    );
    
    const input = screen.getByPlaceholderText('Ask for a hint...');
    userEvent.type(input, 'Test message{enter}');
    
    await waitFor(() => {
      expect(screen.getByText('An unexpected error has occurred.')).toBeInTheDocument();
    });
  });
  
  test('uses default LLM model when none is stored in localStorage', async () => {
    localStorage.removeItem('llmModel');
    
    render(
      <FriendChat 
        selectedContact={mockSelectedContact} 
        roundData={mockRoundData} 
        onEndChat={mockOnEndChat} 
      />
    );
    
    const input = screen.getByPlaceholderText('Ask for a hint...');
    userEvent.type(input, 'Test message{enter}');
    
    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/askllm',
        expect.objectContaining({
          model: 'mistral'
        })
      );
    });
  });
});