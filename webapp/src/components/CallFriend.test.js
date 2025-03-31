
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CallFriend from './CallFriend';
import CharacterSelection from './CharacterSelection';

// Mock the CharacterSelection component
jest.mock('./CharacterSelection', () => (props) => (
  <div data-testid="character-selection">
    <button onClick={() => props.onSelectCharacter({ name: 'Alex', confidence: 0.8 })}>
      Mock Select Character
    </button>
  </div>
));

describe('CallFriend Component', () => {
  const mockOnClose = jest.fn();
  const correctAnswer = 'Correct Answer';
  const possibleAnswers = ['Correct Answer', 'Wrong Answer 1', 'Wrong Answer 2'];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore();
  });

  it('renders the character selection step when open', () => {
    render(
      <CallFriend
        open={true}
        onClose={mockOnClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );

    expect(screen.getByText('Select a Friend to Call')).toBeInTheDocument();
    expect(screen.getByTestId('character-selection')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <CallFriend
        open={false}
        onClose={mockOnClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );

    expect(screen.queryByText('Select a Friend to Call')).not.toBeInTheDocument();
  });

  it('transitions to call step when character is selected', () => {
    render(
      <CallFriend
        open={true}
        onClose={mockOnClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );

    fireEvent.click(screen.getByText('Mock Select Character'));
    
    expect(screen.getByText(/Calling Alex.../i)).toBeInTheDocument();
    expect(screen.getByText(/I think the answer might be:/i)).toBeInTheDocument();
  });

  it('generates a response with high confidence character', async () => {
    // Mock Math.random to control the answer selection
    jest.spyOn(global.Math, 'random')
      .mockReturnValueOnce(0.1) // For isCorrect check (0.1 < 0.8)
      .mockReturnValueOnce(0.5); // For wrong answer selection

    render(
      <CallFriend
        open={true}
        onClose={mockOnClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );

    fireEvent.click(screen.getByText('Mock Select Character'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText(/I'm pretty sure/i)).toBeInTheDocument();
    expect(screen.getByText(correctAnswer)).toBeInTheDocument();
  });

  it('generates a response with low confidence character', async () => {
    // Mock CharacterSelection to return low confidence character
    jest.mock('./CharacterSelection', () => (props) => (
      <div data-testid="character-selection">
        <button onClick={() => props.onSelectCharacter({ name: 'Dave', confidence: 0.2 })}>
          Mock Select Character
        </button>
      </div>
    ));

    // Mock Math.random to control the answer selection
    jest.spyOn(global.Math, 'random')
      .mockReturnValueOnce(0.4) // For isCorrect check (0.4 > 0.3)
      .mockReturnValueOnce(0.5); // For wrong answer selection

    render(
      <CallFriend
        open={true}
        onClose={mockOnClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );

    fireEvent.click(screen.getByText('Mock Select Character'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText(/I have no idea, but maybe/i)).toBeInTheDocument();
    // Could be correct or wrong answer
    const answerText = screen.getByTestId('friend-answer').textContent;
    expect(possibleAnswers).toContain(answerText);
  });

  it('calls onClose when Hang up button is clicked', async () => {
    render(
      <CallFriend
        open={true}
        onClose={mockOnClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );

    fireEvent.click(screen.getByText('Mock Select Character'));
    fireEvent.click(screen.getByText('Hang up'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('resets state when reopened', async () => {
    const { rerender } = render(
      <CallFriend
        open={true}
        onClose={mockOnClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );

    fireEvent.click(screen.getByText('Mock Select Character'));
    expect(screen.getByText(/Calling Alex.../i)).toBeInTheDocument();

    // Close the dialog
    rerender(
      <CallFriend
        open={false}
        onClose={mockOnClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );

    // Reopen the dialog
    rerender(
      <CallFriend
        open={true}
        onClose={mockOnClose}
        correctAnswer={correctAnswer}
        possibleAnswers={possibleAnswers}
      />
    );

    expect(screen.getByText('Select a Friend to Call')).toBeInTheDocument();
    expect(screen.queryByText(/Calling Alex.../i)).not.toBeInTheDocument();
  });
});