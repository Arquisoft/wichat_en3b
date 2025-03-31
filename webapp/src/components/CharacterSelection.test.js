import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacterSelection from './CharacterSelection';
import { green, blue, purple, red } from '@mui/material/colors';

describe('CharacterSelection Component', () => {
  const mockOnSelectCharacter = jest.fn();

  beforeEach(() => {
    mockOnSelectCharacter.mockClear();
  });

  it('renders all character cards with correct information', () => {
    render(<CharacterSelection onSelectCharacter={mockOnSelectCharacter} />);
    
    // Check that all characters are rendered
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('Casey')).toBeInTheDocument();
    expect(screen.getByText('Taylor')).toBeInTheDocument();
    expect(screen.getByText('Dave')).toBeInTheDocument();
    
    // Check confidence percentages
    expect(screen.getByText('Confidence: 80%')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 60%')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 40%')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 20%')).toBeInTheDocument();
    
    // Check prices
    expect(screen.getByText('Price: 1000🪙')).toBeInTheDocument();
    expect(screen.getByText('Price: 750🪙')).toBeInTheDocument();
    expect(screen.getByText('Price: 500🪙')).toBeInTheDocument();
    expect(screen.getByText('Price: 350🪙')).toBeInTheDocument();
  });

  it('renders the correct grid layout', () => {
    const { container } = render(<CharacterSelection onSelectCharacter={mockOnSelectCharacter} />);
    const gridBox = container.firstChild;
    
    // Check grid styles
    expect(gridBox).toHaveStyle('display: grid');
    expect(gridBox).toHaveStyle('grid-template-columns: repeat(2, 1fr)');
    expect(gridBox).toHaveStyle('gap: 24px'); // MUI's theme.spacing(3) = 24px
  });

  it('calls onSelectCharacter with correct character when button is clicked', () => {
    render(<CharacterSelection onSelectCharacter={mockOnSelectCharacter} />);
    
    // Click each button and verify the callback
    const characters = [
      { name: "Alex", confidence: 0.8, price: 1000, color: green[400] },
      { name: "Casey", confidence: 0.6, price: 750, color: blue[400] },
      { name: "Taylor", confidence: 0.4, price: 500, color: purple[400] },
      { name: "Dave", confidence: 0.2, price: 350, color: red[400] },
    ];
    
    characters.forEach(character => {
      const button = screen.getByRole('button', { name: `Select ${character.name}` });
      fireEvent.click(button);
      expect(mockOnSelectCharacter).toHaveBeenCalledWith(character);
      mockOnSelectCharacter.mockClear();
    });
  });

  it('applies correct styling to cards and buttons', () => {
    render(<CharacterSelection onSelectCharacter={mockOnSelectCharacter} />);
    
    // Check card colors
    const alexCard = screen.getByText('Alex').closest('.MuiCard-root');
    expect(alexCard).toHaveStyle(`background-color: ${green[400]}`);
    
    const caseyCard = screen.getByText('Casey').closest('.MuiCard-root');
    expect(caseyCard).toHaveStyle(`background-color: ${blue[400]}`);
    
    // Check button styling
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveStyle('color: white');
      expect(button).toHaveStyle('border-color: white');
      expect(button).toHaveStyle('font-weight: bold');
    });
  });

  it('renders the correct number of cards', () => {
    render(<CharacterSelection onSelectCharacter={mockOnSelectCharacter} />);
    const cards = screen.getAllByTestId('character-card');
    expect(cards).toHaveLength(4);
  });
});