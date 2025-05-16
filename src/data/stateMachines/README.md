
# Call Center Simulator - State Machine Documentation

## Overview

This directory contains the state machine definitions that power the call center simulation scenarios. Each JSON file represents a different customer interaction scenario that call center agents can practice with. The simulator uses these state machines to create interactive conversation flows with branching paths and dynamic responses.

## Current State Machine Files

Currently, the system has three main state machine files:

1. **studiumabschluss-case.json**: Scenario for handling insurance adjustments after a student completes their studies.
2. **leistungsabdeckung-physio.json**: Scenario for explaining physiotherapy coverage details.
3. **mahnung-trotz-zahlung.json**: Scenario for dealing with payment reminders sent after a payment was already made.

## State Machine Structure

Each state machine follows this standardized structure:

```json
{
  "id": "scenario-unique-id",
  "initial": "start",
  "states": {
    "start": {
      "meta": {
        "systemMessage": "Call initiated with customer.",
        "agentText": "Initial agent greeting message",
        "responseOptions": ["Option 1", "Option 2"]
      },
      "on": {
        "START_CALL": "next_state_id",
        "Option 1": "state_for_option_1",
        "Option 2": "state_for_option_2",
        "DEFAULT": "fallback_state"
      }
    },
    "next_state_id": {
      "meta": {
        "customerText": "What the customer says in this state",
        "responseOptions": ["Response option 1", "Response option 2"],
        "module": { /* Optional module configuration */ }
      },
      "on": {
        "Response option 1": "following_state_1",
        "Response option 2": "following_state_2",
        "DEFAULT": "default_next_state"
      }
    },
    "end_call": {
      "meta": {
        "agentText": "Call closing message",
        "module": {
          /* Typically a NACHBEARBEITUNG module for call summary */
        }
      }
    }
  }
}
```

## Key Components

### State Machine Properties

- **id**: Unique identifier for the scenario
- **initial**: The starting state of the conversation (usually "start")
- **states**: Object containing all possible states in the conversation

### State Properties

- **meta**: Contains display information and context for the state:
  - **systemMessage**: Background information or context (often used in the first state)
  - **agentText**: What the agent says in this state
  - **customerText**: What the customer says in this state
  - **responseOptions**: Available responses for the agent to choose from
  - **module**: Configuration for interactive modules that appear in the conversation

- **on**: Defines transitions to other states based on agent responses
  - Maps response text to the next state ID
  - **DEFAULT**: Optional fallback for when no specific mapping exists

## Modules Integration

State machines can include interactive modules at various states. These enhance the conversation with interactive elements:

### Module Types

```json
"module": {
  "id": "module-unique-id",
  "title": "Module Title",
  "type": "MODULE_TYPE",
  "data": { /* Module-specific configuration */ }
}
```

- **NACHBEARBEITUNG**: Typically used at the end of a call to summarize key points
  ```json
  "module": {
    "id": "nachbearbeitung-id",
    "title": "Nachbearbeitung",
    "type": "NACHBEARBEITUNG",
    "data": {
      "isInline": true,
      "points": [
        "Key point 1",
        "Key point 2",
        "Key point 3"
      ],
      "summary": "Comprehensive summary of the call conversation and resolution"
    }
  }
  ```

- **VERIFICATION**: Used for identity verification
  ```json
  "module": {
    "id": "verification-module-id",
    "title": "Identity Verification",
    "type": "VERIFICATION",
    "data": {
      "isInline": true,
      "fields": [
        {"label": "Field Name", "value": "Expected Value", "system": "System Value", "isRequired": true}
      ],
      "title": "Verification Process"
    }
  }
  ```

- **INFORMATION_TABLE**: Presents tabular information for decision-making
  ```json
  "module": {
    "id": "info-table-id",
    "title": "Information Table Title",
    "type": "INFORMATION_TABLE",
    "data": {
      "description": "Table description",
      "tableTitle": "Table Title",
      "franchiseOptions": [
        {"description": "Option description", "coverage": "Coverage details"},
        {"amount": 300, "premium": 250} // For franchise tables
      ],
      "buttonText": "Button Text"
    }
  }
  ```

- **INSURANCE_MODEL**: Displays insurance model selection options
  ```json
  "module": {
    "id": "insurance-model-id",
    "title": "Insurance Models",
    "type": "INSURANCE_MODEL",
    "data": {
      "models": [
        {
          "id": "model-id",
          "title": "Model Title",
          "description": "Model description",
          "priceRange": "Price information"
        }
      ],
      "buttonText": "Selection Button Text"
    }
  }
  ```

## Conversation Flow Best Practices

1. **Start State Configuration**: 
   - Always include `"systemMessage"` for call context
   - Provide multiple `"responseOptions"` for the agent
   - Include a `START_CALL` transition

2. **Identity Verification**:
   - Include an early state for verifying customer identity
   - This should lead back to the main issue discussion

3. **Customer Issue Exploration**:
   - Allow the agent to ask clarifying questions
   - Provide relevant customer context
   - Use appropriate transitions based on the agent's approach

4. **Information Presentation**:
   - Use modules for complex information
   - Keep conversational text clear and concise
   - Ensure transitions logically follow from the presented information

5. **Resolution and Closing**:
   - Always include a clear resolution path
   - End with a NACHBEARBEITUNG module for call summary
   - Provide options for follow-up actions when appropriate

## Creating New State Machines

To create a new scenario:

1. Create a new JSON file in this directory following the standard format
2. Choose a meaningful ID for your scenario
3. Define the complete conversation flow with appropriate states
4. Add any necessary interactive modules
5. Register the new scenario in two places:
   - `src/data/stateMachines.ts`: Add to the exported stateMachines object
   - `src/utils/stateMachineLoader.ts`: Add to the scenarioFileMap

## File Naming Conventions

- Use kebab-case for file names (e.g., `scenario-name.json`)
- The file name should match the scenario ID but with hyphens
- Example: For scenario ID "customerIssue", name the file `customer-issue.json`

## Tips for Effective State Machines

- **Descriptive State Names**: Use names that reflect the context (e.g., `verify_identity`, `payment_check`)
- **Multiple Paths**: Provide meaningful branching options to reflect different agent approaches
- **Realistic Conversations**: Include customer reactions that reflect real-world scenarios
- **Progressive Disclosure**: Reveal information gradually as the conversation progresses
- **Error Handling**: Include DEFAULT transitions for unexpected agent responses
- **Module Integration**: Use interactive modules at appropriate points in the conversation
- **Keep States Focused**: Each state should represent one clear step in the conversation
- **Consistent Structure**: Follow the established format throughout the file
