
# Call Center Agent Simulator

## Application Overview

This application is a call center agent simulator designed to train customer service representatives through interactive scenarios. Agents can practice handling different customer situations in a risk-free environment while receiving immediate feedback on their performance.

## Key Features

- **Interactive Conversation Scenarios**: Multiple predefined customer interaction flows
- **Dynamic Response Options**: Realistic agent-customer dialogue options
- **Real-time Feedback**: Immediate evaluation of agent responses
- **Scenario Visualization**: Visual representation of conversation decision trees
- **Comprehensive Documentation**: Help center with FAQs and support resources

## Technology Stack

This application is built with:

- **React**: Frontend library for building the user interface
- **TypeScript**: Type-safe JavaScript for improved code reliability
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **shadcn/ui**: Component library for consistent UI elements
- **State Machines**: JSON-based state machines define conversation flows
- **Vite**: Fast build tool for modern web development

## Application Architecture

The application follows a component-based architecture:

1. **State Machines**: JSON files that define the conversation flows
2. **Agent Interface**: Transcript panel for interacting with simulated customers
3. **Scenario System**: Logic for managing conversation states and transitions
4. **Visualization Tools**: Visual representation of decision trees and conversation flows
5. **Help & Documentation**: Support resources for users

## Available Scenarios

The simulator includes several training scenarios:
- Customer verification flows
- Insurance coverage inquiries
- Payment processing
- Account history review
- Physiotherapy coverage questions
- Bank details management

## Running the Application

```sh
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Development

To create new scenarios, add JSON state machine files to the `src/data/stateMachines` directory and register them in `src/data/stateMachines.ts`.

Each state machine should follow the standard format defined in the documentation found in `src/data/stateMachines/README.md`.

## Deployment

The application can be deployed to any static site hosting service. Build the production version with:

```sh
npm run build
```

## License

This project is proprietary software. All rights reserved.
