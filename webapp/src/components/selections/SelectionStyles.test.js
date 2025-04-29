import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  StyledContainer,
  SectionPaper,
  SectionTitle,
  StyledButton,
  ModeButton,
  TopicButton,
  StyledCard,
  StyledCardContent,
  StyledCardActions,
  ModeTitle,
  ModeDescription
} from './SelectionStyles';

// Mock theme to match expected values in styled components
const theme = createTheme({
  palette: {
    primary: { main: '#2196f3' },
    common: { white: '#ffffff' },
    text: { primary: '#000000', disabled: '#aaaaaa' },
    background: { paper: '#ffffff', default: '#f5f5f5' },
    action: { hover: '#f0f0f0' },
    divider: '#e0e0e0',
    grey: { 300: '#e0e0e0' },
    gradient: {
      main: { right: 'linear-gradient(to right, #2196f3, #9c27b0)', left: 'linear-gradient(to right, #2196f3, #9c27b0)' },
      hover: { right: 'linear-gradient(to right, #1e88e5, #1e88e5)', left: 'linear-gradient(to right, #1e88e5, #1e88e5)' }
    }
  },
  spacing: (factor) => `${0.25 * factor}rem`,
  shape: { borderRadius: 4 },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
  ],
  transitions: {
    create: (props, options) => {
      // Ensure props is treated as an array
      const propsArray = Array.isArray(props) ? props : [props];
      return propsArray.map(prop => `${prop} 0.3s ease`).join(', ');
    },
    duration: { short: 300 }
  }
});

// Wrapper component to provide theme context for all tests
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

// Helper to get style property from a component directly using styled-components
const getStyleProperty = (component, property) => {
  // For components using isSelected prop, check the component's style definition
  if (component.type && component.type.componentStyle) {
    const componentStyle = component.type.componentStyle.rules.join(' ');
    // Check if the style contains the expected property value
    return componentStyle.includes(property);
  }
  return false;
};

// Mock for element.style
// JSDOM doesn't fully support computed styles for complex CSS like gradients
jest.mock('react-dom', () => {
  const original = jest.requireActual('react-dom');
  return {
    ...original,
    createRoot: (container) => {
      return {
        render: (element) => {
          // Here we could apply special style handling
          return original.render(element, container);
        },
        unmount: () => {}
      };
    }
  };
});

describe('Styled Components', () => {
  describe('StyledContainer', () => {
    it('renders with correct styles', () => {
      render(
        <TestWrapper>
          <StyledContainer data-testid="container">Content</StyledContainer>
        </TestWrapper>
      );
      
      const container = screen.getByTestId('container');
      const styles = window.getComputedStyle(container);
      
      expect(container).toBeInTheDocument();
      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('column');
      expect(styles.alignItems).toBe('center');
    });
  });

  describe('SectionPaper', () => {
    it('renders with correct styles', () => {
      render(
        <TestWrapper>
          <SectionPaper data-testid="paper">Content</SectionPaper>
        </TestWrapper>
      );
      
      const paper = screen.getByTestId('paper');
      const styles = window.getComputedStyle(paper);
      
      expect(paper).toBeInTheDocument();
      expect(styles.width).toBe('100%');
      expect(styles.borderRadius).toBeTruthy();
      expect(styles.boxShadow).toBeTruthy();
    });
  });

  describe('SectionTitle', () => {
    it('renders with correct styles', () => {
      render(
        <TestWrapper>
          <SectionTitle data-testid="title">Section Title</SectionTitle>
        </TestWrapper>
      );
      
      const title = screen.getByTestId('title');
      const styles = window.getComputedStyle(title);
      
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Section Title');
      expect(styles.fontWeight).toBe('bold');
      expect(styles.textTransform).toBe('uppercase');
      expect(styles.borderBottom).toContain('solid');
    });
  });

  describe('StyledButton', () => {
    it('renders with correct styles', () => {
      render(
        <TestWrapper>
          <StyledButton data-testid="button">Click Me</StyledButton>
        </TestWrapper>
      );
      
      const button = screen.getByTestId('button');
      const styles = window.getComputedStyle(button);
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click Me');
      expect(styles.fontWeight).toBe('bold');
      expect(styles.borderRadius).toBeTruthy();
    });

    it('applies disabled styles when disabled', () => {
      render(
        <TestWrapper>
          <StyledButton data-testid="disabled-button" disabled>Disabled</StyledButton>
        </TestWrapper>
      );
      
      const button = screen.getByTestId('disabled-button');
      
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  describe('ModeButton', () => {
    it('renders with non-selected styles when isSelected is false', () => {
      render(
        <TestWrapper>
          <ModeButton data-testid="mode-button" isSelected={false}>Mode</ModeButton>
        </TestWrapper>
      );
      
      const button = screen.getByTestId('mode-button');
      const styles = window.getComputedStyle(button);
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Mode');
      expect(styles.border).toBeTruthy();
      expect(styles.boxShadow).toBe('none');
    });

    it('renders with selected styles when isSelected is true', () => {
      // In JSDOM, gradients may not be correctly displayed in computed styles
      // So we test the component rendering and props instead
      const { rerender } = render(
        <TestWrapper>
          <ModeButton data-testid="selected-mode-button" isSelected={true}>Selected Mode</ModeButton>
        </TestWrapper>
      );
      
      const button = screen.getByTestId('selected-mode-button');
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Selected Mode');
      
      // Test that the component renders differently with isSelected=false
      rerender(
        <TestWrapper>
          <ModeButton data-testid="selected-mode-button" isSelected={false}>Selected Mode</ModeButton>
        </TestWrapper>
      );
      
      // Visual comparison of selected vs non-selected styles via className
      const nonSelectedClassName = button.className;
      
      rerender(
        <TestWrapper>
          <ModeButton data-testid="selected-mode-button" isSelected={true}>Selected Mode</ModeButton>
        </TestWrapper>
      );
      
      const selectedClassName = button.className;
      
      // The classes should be different when isSelected changes
      expect(selectedClassName).not.toBe(nonSelectedClassName);
    });
  });

  describe('TopicButton', () => {
    it('renders with non-selected styles when isSelected is false', () => {
      render(
        <TestWrapper>
          <TopicButton data-testid="topic-button" isSelected={false}>Topic</TopicButton>
        </TestWrapper>
      );
      
      const button = screen.getByTestId('topic-button');
      const styles = window.getComputedStyle(button);
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Topic');
      expect(styles.textTransform).toBe('none');
      expect(styles.width).toBe('100%');
      expect(styles.height).toBe('100%');
      expect(styles.border).toBeTruthy();
    });

    it('renders with selected styles when isSelected is true', () => {
      const { rerender } = render(
        <TestWrapper>
          <TopicButton data-testid="selected-topic-button" isSelected={true}>Selected Topic</TopicButton>
        </TestWrapper>
      );
      
      const button = screen.getByTestId('selected-topic-button');
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Selected Topic');
      
      // Test that the component renders differently with isSelected=false
      rerender(
        <TestWrapper>
          <TopicButton data-testid="selected-topic-button" isSelected={false}>Selected Topic</TopicButton>
        </TestWrapper>
      );
      
      // Visual comparison of selected vs non-selected styles via className
      const nonSelectedClassName = button.className;
      
      rerender(
        <TestWrapper>
          <TopicButton data-testid="selected-topic-button" isSelected={true}>Selected Topic</TopicButton>
        </TestWrapper>
      );
      
      const selectedClassName = button.className;
      
      // The classes should be different when isSelected changes
      expect(selectedClassName).not.toBe(nonSelectedClassName);
    });

    it('renders with startIcon when provided', () => {
      const StartIcon = () => <span data-testid="start-icon">Icon</span>;
      
      render(
        <TestWrapper>
          <TopicButton 
            data-testid="icon-topic-button" 
            startIcon={<StartIcon />}
            isSelected={false}
          >
            Topic with Icon
          </TopicButton>
        </TestWrapper>
      );
      
      expect(screen.getByTestId('icon-topic-button')).toBeInTheDocument();
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    });
  });

  describe('StyledCard', () => {
    it('renders with correct styles', () => {
      render(
        <TestWrapper>
          <StyledCard data-testid="card">Card Content</StyledCard>
        </TestWrapper>
      );
      
      const card = screen.getByTestId('card');
      const styles = window.getComputedStyle(card);
      
      expect(card).toBeInTheDocument();
      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('column');
      expect(styles.borderRadius).toBeTruthy();
      expect(styles.overflow).toBe('hidden');
      expect(styles.border).toBeTruthy();
    });
  });

  describe('StyledCardContent', () => {
    it('renders with correct styles', () => {
      render(
        <TestWrapper>
          <StyledCardContent data-testid="card-content">Content</StyledCardContent>
        </TestWrapper>
      );
      
      const cardContent = screen.getByTestId('card-content');
      const styles = window.getComputedStyle(cardContent);
      
      expect(cardContent).toBeInTheDocument();
      expect(styles.flexGrow).toBe('1');
      expect(styles.textAlign).toBe('center');
    });
  });

  describe('StyledCardActions', () => {
    it('renders with correct styles', () => {
      render(
        <TestWrapper>
          <StyledCardActions data-testid="card-actions">
            <button>Action 1</button>
            <button>Action 2</button>
          </StyledCardActions>
        </TestWrapper>
      );
      
      const cardActions = screen.getByTestId('card-actions');
      const styles = window.getComputedStyle(cardActions);
      
      expect(cardActions).toBeInTheDocument();
      expect(styles.justifyContent).toBe('center');
      expect(cardActions.children.length).toBe(2);
    });
  });

  describe('ModeTitle', () => {
    it('renders with correct styles', () => {
      render(
        <TestWrapper>
          <ModeTitle data-testid="mode-title">Mode Title</ModeTitle>
        </TestWrapper>
      );
      
      const modeTitle = screen.getByTestId('mode-title');
      const styles = window.getComputedStyle(modeTitle);
      
      expect(modeTitle).toBeInTheDocument();
      expect(modeTitle).toHaveTextContent('Mode Title');
      expect(styles.fontWeight).toBe('bold');
    });
  });

  describe('ModeDescription', () => {
    it('renders with correct styles', () => {
      render(
        <TestWrapper>
          <ModeDescription data-testid="mode-description">This is a description</ModeDescription>
        </TestWrapper>
      );
      
      const modeDescription = screen.getByTestId('mode-description');
      const styles = window.getComputedStyle(modeDescription);
      
      expect(modeDescription).toBeInTheDocument();
      expect(modeDescription).toHaveTextContent('This is a description');
      expect(styles.color).toBe('black');
      expect(styles.textAlign).toBe('justify');
    });
  });

  // Add tests for snapshot comparison if needed
  describe('Snapshot Tests', () => {
    it('matches snapshot for ModeButton in selected state', () => {
      const { container } = render(
        <TestWrapper>
          <ModeButton isSelected={true}>Selected Mode</ModeButton>
        </TestWrapper>
      );
      expect(container).toMatchSnapshot();
    });
    
    it('matches snapshot for ModeButton in non-selected state', () => {
      const { container } = render(
        <TestWrapper>
          <ModeButton isSelected={false}>Non-Selected Mode</ModeButton>
        </TestWrapper>
      );
      expect(container).toMatchSnapshot();
    });
    
    it('matches snapshot for TopicButton in selected state', () => {
      const { container } = render(
        <TestWrapper>
          <TopicButton isSelected={true}>Selected Topic</TopicButton>
        </TestWrapper>
      );
      expect(container).toMatchSnapshot();
    });
    
    it('matches snapshot for TopicButton in non-selected state', () => {
      const { container } = render(
        <TestWrapper>
          <TopicButton isSelected={false}>Non-Selected Topic</TopicButton>
        </TestWrapper>
      );
      expect(container).toMatchSnapshot();
    });
  });
});