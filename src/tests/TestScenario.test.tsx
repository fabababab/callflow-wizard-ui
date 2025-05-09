import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TestScenario from '../pages/TestScenario';
import { loadStateMachine } from '@/utils/stateMachineLoader';

// Mock the necessary dependencies
vi.mock('@/utils/stateMachineLoader', () => ({
  loadStateMachine: vi.fn()
}));

vi.mock('@/hooks/useTranscript', () => ({
  useTranscript: () => ({
    callActive: false,
    handleCall: vi.fn(),
    resetConversation: vi.fn(),
    messages: [],
    currentState: 'start',
    stateData: {},
    handleHangUpCall: vi.fn()
  })
}));

describe('TestScenario Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Mock successful state machine loading
    (loadStateMachine as any).mockResolvedValue({
      id: 'test-scenario',
      initial: 'start',
      states: {
        start: {
          meta: {
            systemMessage: 'Call initiated with customer.',
            agentText: 'Welcome! How can I assist you today?'
          }
        }
      }
    });
  });

  it('should load successfully with initial state', async () => {
    render(<TestScenario />);
    
    // Check if loading state is shown
    expect(screen.getByText(/Loading scenario/i)).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading scenario/i)).not.toBeInTheDocument();
    });
    
    // Verify state machine was loaded
    expect(loadStateMachine).toHaveBeenCalledWith('testscenario');
  });

  it('should handle state machine loading errors', async () => {
    // Mock a loading error
    (loadStateMachine as any).mockRejectedValue(new Error('Failed to load'));
    
    render(<TestScenario />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error Loading Scenario/i)).toBeInTheDocument();
    });
  });

  it('should handle empty or invalid state machine', async () => {
    // Mock an empty state machine
    (loadStateMachine as any).mockResolvedValue({
      id: 'test-scenario',
      initial: 'start',
      states: {}
    });
    
    render(<TestScenario />);
    
    await waitFor(() => {
      expect(screen.getByText(/State machine has no states defined/i)).toBeInTheDocument();
    });
  });

  it('should handle null state machine', async () => {
    // Mock null state machine
    (loadStateMachine as any).mockResolvedValue(null);
    
    render(<TestScenario />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load state machine/i)).toBeInTheDocument();
    });
  });

  it('should disable Start Call button while loading', () => {
    render(<TestScenario />);
    
    const startButton = screen.getByRole('button', { name: /Start Call/i });
    expect(startButton).toBeDisabled();
  });

  it('should enable Start Call button after loading', async () => {
    render(<TestScenario />);
    
    await waitFor(() => {
      const startButton = screen.getByRole('button', { name: /Start Call/i });
      expect(startButton).toBeEnabled();
    });
  });

  // Add more test cases as needed
}); 