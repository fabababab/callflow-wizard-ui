
# Call Center Agent Scenario Documentation

## Overview

This folder contains JSON state machine definitions that power the agent-customer interactions in the call center simulator. As a call center agent (you), you'll receive messages from customers and need to select appropriate responses.

## How Scenarios Work

1. **Agent Perspective**: All scenarios are written from the perspective of a call center agent (you). The customer's messages will be shown, and you'll need to select or type appropriate responses.

2. **State Machine Flow**: Each scenario follows a state machine pattern with:
   - States: Represent different points in the conversation
   - Transitions: Define how to move between states
   - Customer text: What the customer says at each state
   - Agent options: Your available responses 

3. **Sensitive Data Handling**: Some scenarios require verification of sensitive customer data. As an agent, you'll need to validate this information before proceeding.

## Available Scenarios

- **bankDetails**: Customer inquiring about bank account information
- **physioCoverage**: Customer asking about physiotherapy coverage
- **verification**: Identity verification flow
- **accountHistory**: Customer checking account history
- **insurancePackage**: Questions about insurance packages
- **paymentReminder**: Payment reminder conversations
- **physioTherapy**: Physiotherapy appointment and coverage questions
- **customerPhysioCoverage**: Customer physio coverage inquiries

## Using the Simulator

1. Select a scenario from the dropdown
2. Start a test call
3. Review customer messages (shown in the customer bubble)
4. Choose from the suggested agent responses or type your own
5. End the call when the conversation is complete

## Best Practices for Agents

- Always verify customer identity before sharing sensitive information
- Use a professional, helpful tone
- Follow company protocols for data validation
- End calls courteously with a summary and next steps

## Technical Notes

The state machine JSON files follow this basic structure:
```json
{
  "id": "scenario-name",
  "initial": "start",
  "states": {
    "start": {
      "meta": {
        "customerText": "Hello, I need some help with...",
        "agentOptions": ["How can I help you today?", "Let me verify your account first"]
      },
      "on": {
        "RESPONSE_1": "next_state_1",
        "RESPONSE_2": "next_state_2"
      }
    }
  }
}
```
