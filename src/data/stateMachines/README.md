
# Call Center Simulator - State Machine Documentation

## Overview

This directory contains the state machine definitions that power the call center simulation scenarios. Each JSON file defines a different customer interaction scenario that call center agents can practice.

## State Machine Structure

Each state machine follows this basic structure:

```json
{
  "id": "scenario-name",
  "initial": "start",
  "states": {
    "start": {
      "meta": {
        "customerText": "Customer's initial message",
        "agentOptions": ["Option 1", "Option 2"]
      },
      "on": {
        "RESPONSE_1": "next_state_1",
        "RESPONSE_2": "next_state_2"
      }
    },
    "next_state_1": {
      // State definition
    }
  }
}
```

## Key Components

### State Machine Properties

- **id**: Unique identifier for the scenario
- **initial**: The starting state of the conversation
- **states**: Object containing all possible states in the conversation

### State Properties

- **meta**: Contains display information for the state
  - **customerText**: What the customer says in this state
  - **agentOptions**: Available responses for the agent
  - **validation**: (Optional) Customer information that needs verification
- **on**: Defines transitions to other states based on agent responses

## Creating New Scenarios

To create a new scenario:

1. Create a new JSON file in this directory
2. Define the state machine structure following the format above
3. Register the scenario in `src/data/stateMachines.ts`

## Best Practices

- Use descriptive state names that reflect the conversation context
- Provide multiple response options with varying outcomes
- Create branches that reflect realistic customer interactions
- Include validation states where appropriate for sensitive information
- Add appropriate customer context to help agents respond correctly

## Available Scenarios

- **testscenario**: Basic test scenario for development
- **scenario2**: Alternative test scenario with different flow
- **physioCoverage**: Customer inquiring about physiotherapy coverage
- **customerPhysioCoverage**: Similar coverage questions from a different perspective
- **verification**: Identity verification process
- **bankDetails**: Banking information management
- **paymentReminder**: Payment follow-up conversations
- **insurancePackage**: Insurance plan inquiries
- **accountHistory**: Account history review
- **physioTherapy**: Physiotherapy appointment scheduling

## Visualization

The application includes a visualization tool that renders state machines as interactive diagrams, helping to understand the conversation flow and decision points.
