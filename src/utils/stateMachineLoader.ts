
import { ScenarioType } from '@/components/ScenarioSelector';

export interface StateMachineState {
  type: 'info' | 'question' | 'decision' | 'verification' | 'action';
  agent?: string;
  customer?: string;
  systemMessage?: string;
  action?: string;
  suggestions?: string[];
  responseOptions?: string[];
  transitions: {
    [option: string]: string;
    default?: string;
  };
}

export interface StateMachine {
  states: {
    [stateName: string]: StateMachineState;
  };
  initialState: string;
}

export type StateData = {
  agent?: string;
  customer?: string;
  systemMessage?: string;
  suggestions?: string[];
  responseOptions?: string[];
  stateType?: string;
  action?: string;
};

// Cache for loaded state machines
const stateMachineCache: Record<string, StateMachine> = {};

// Function to load a state machine for a given scenario
export async function loadStateMachine(scenario: ScenarioType): Promise<StateMachine | null> {
  if (!scenario) return null;
  
  // Return from cache if already loaded
  if (stateMachineCache[scenario]) {
    return stateMachineCache[scenario];
  }
  
  try {
    // Load the JSON file dynamically
    const module = await import(`../data/stateMachines/${scenario}.json`);
    const stateMachine = module.default || module;
    
    // Cache it for future use
    stateMachineCache[scenario] = stateMachine;
    
    return stateMachine;
  } catch (error) {
    console.error(`Failed to load state machine for scenario ${scenario}:`, error);
    
    // Check if we have a fallback in the stateMachines file
    if (scenario === 'verification') {
      return createVerificationStateMachine();
    }
    
    return null;
  }
}

// Create a default verification state machine if none exists
function createVerificationStateMachine(): StateMachine {
  return {
    initialState: "start",
    states: {
      "start": {
        type: "info",
        agent: "Guten Tag, ich bin Ihr Kundenbetreuer. Sie haben uns wegen einer Sicherheitsbenachrichtigung kontaktiert. Wie kann ich Ihnen helfen?",
        customer: "Hallo, ich habe eine E-Mail bekommen, dass jemand versucht hat, sich von einem anderen Land aus in meinen Account einzuloggen.",
        systemMessage: "Der Kunde hat eine Verdachtsmeldung erhalten. Überprüfen Sie die Identität.",
        transitions: {
          default: "identity_check"
        }
      },
      "identity_check": {
        type: "verification",
        agent: "Aus Sicherheitsgründen müsste ich Ihre Identität überprüfen. Könnten Sie mir bitte Ihren vollständigen Namen und Ihr Geburtsdatum mitteilen?",
        responseOptions: [
          "Mein Name ist Michael Schmidt und ich wurde am 15. März 1985 geboren.",
          "Ich möchte meine persönlichen Daten nicht am Telefon nennen.",
          "Können Sie mir zuerst beweisen, dass Sie wirklich von meiner Bank sind?"
        ],
        transitions: {
          "Mein Name ist Michael Schmidt und ich wurde am 15. März 1985 geboren.": "confirm_identity",
          "Ich möchte meine persönlichen Daten nicht am Telefon nennen.": "explain_verification",
          "Können Sie mir zuerst beweisen, dass Sie wirklich von meiner Bank sind?": "prove_identity",
          default: "confirm_identity"
        }
      },
      "explain_verification": {
        type: "info",
        agent: "Ich verstehe Ihre Bedenken. Zur Verifizierung können Sie auch unser Online-Banking nutzen oder persönlich in eine Filiale kommen. Alternativ kann ich Ihnen auch nur die letzten vier Stellen Ihrer Kontonummer bestätigen, wenn Sie diese nennen möchten.",
        customer: "In Ordnung, die letzten vier Stellen meiner Kontonummer sind 4321.",
        transitions: {
          default: "confirm_identity"
        }
      },
      "prove_identity": {
        type: "verification",
        agent: "Das ist eine berechtigte Frage. Ich kann Ihnen die letzten vier Stellen Ihrer Kontonummer nennen, wenn Sie mir Ihren vollständigen Namen mitteilen.",
        customer: "Mein Name ist Michael Schmidt.",
        transitions: {
          default: "bank_provides_proof"
        }
      },
      "bank_provides_proof": {
        type: "verification",
        agent: "Vielen Dank, Herr Schmidt. Die letzten vier Stellen Ihrer Kontonummer lauten 4321. Ist das korrekt?",
        responseOptions: [
          "Ja, das ist korrekt.",
          "Nein, das ist nicht korrekt."
        ],
        transitions: {
          "Ja, das ist korrekt.": "confirm_identity",
          "Nein, das ist nicht korrekt.": "verification_failed",
          default: "confirm_identity"
        }
      },
      "verification_failed": {
        type: "info",
        agent: "Es tut mir leid, es scheint ein Problem mit der Identitätsüberprüfung zu geben. Ich empfehle Ihnen, unsere Hotline unter der offiziellen Nummer auf Ihrer Bankkarte anzurufen oder persönlich in eine Filiale zu kommen.",
        transitions: {
          default: "end"
        }
      },
      "confirm_identity": {
        type: "verification",
        agent: "Vielen Dank, Herr Schmidt. Könnten Sie mir bitte auch die letzten vier Ziffern Ihrer Kontonummer nennen?",
        responseOptions: [
          "Ja, das ist 4321.",
          "Ich bin mir nicht sicher.",
          "Ich habe meine Kontonummer nicht zur Hand."
        ],
        systemMessage: "Identität bestätigt mit 89% Konfidenz.",
        transitions: {
          "Ja, das ist 4321.": "explain_issue",
          default: "verification_incomplete"
        }
      },
      "verification_incomplete": {
        type: "info",
        agent: "Ich verstehe. Zur Sicherheit empfehle ich Ihnen, sich mit Ihren Kontodetails bei uns zu melden. Sie können entweder später zurückrufen oder unsere Online-Banking-Plattform für sichere Kommunikation nutzen.",
        transitions: {
          default: "end"
        }
      },
      "explain_issue": {
        type: "info",
        agent: "Danke für die Bestätigung. Ich sehe hier den versuchten Login aus dem Ausland. Können Sie mir sagen, ob Sie kürzlich im Ausland waren oder Ihren Account von einem anderen Standort aus genutzt haben?",
        responseOptions: [
          "Nein, ich war nicht im Ausland und habe meinen Account nur von zu Hause aus genutzt.",
          "Ja, ich war kürzlich auf Geschäftsreise.",
          "Mein Familienmitglied könnte auf mein Konto zugegriffen haben."
        ],
        transitions: {
          "Nein, ich war nicht im Ausland und habe meinen Account nur von zu Hause aus genutzt.": "secure_account",
          "Ja, ich war kürzlich auf Geschäftsreise.": "confirm_legitimate_access",
          "Mein Familienmitglied könnte auf mein Konto zugegriffen haben.": "explain_sharing_risks",
          default: "secure_account"
        }
      },
      "confirm_legitimate_access": {
        type: "info",
        agent: "Danke für die Information. Es könnte sein, dass der Zugriff von Ihrer Geschäftsreise stammt. Zur Sicherheit empfehle ich dennoch, Ihr Passwort zu ändern. Möchten Sie das jetzt tun?",
        transitions: {
          default: "setup_security"
        }
      },
      "explain_sharing_risks": {
        type: "info",
        agent: "Ich verstehe. Das Teilen von Kontodaten mit Familienmitgliedern kann Sicherheitsrisiken mit sich bringen. Ich empfehle, separate Zugänge einzurichten. Möchten Sie mehr Informationen dazu?",
        transitions: {
          default: "secure_account"
        }
      },
      "secure_account": {
        type: "decision",
        agent: "In diesem Fall empfehle ich, Ihr Passwort sofort zu ändern und die Zwei-Faktor-Authentifizierung zu aktivieren. Was möchten Sie tun?",
        responseOptions: [
          "Ich möchte mein Passwort ändern.",
          "Ich möchte die Zwei-Faktor-Authentifizierung aktivieren.",
          "Ich möchte beides machen."
        ],
        suggestions: [
          "Ich helfe Ihnen, Ihr Passwort zu ändern.",
          "Lassen Sie mich Ihnen erklären, wie die Zwei-Faktor-Authentifizierung funktioniert.",
          "Ich kann beide Sicherheitsmaßnahmen für Sie einrichten."
        ],
        transitions: {
          "Ich möchte mein Passwort ändern.": "password_change",
          "Ich möchte die Zwei-Faktor-Authentifizierung aktivieren.": "explain_2fa",
          "Ich möchte beides machen.": "setup_security",
          default: "setup_security"
        }
      },
      "password_change": {
        type: "action",
        agent: "Um Ihr Passwort zu ändern, sende ich Ihnen einen Link per E-Mail. Bitte klicken Sie auf den Link und folgen Sie den Anweisungen. Ist das in Ordnung?",
        responseOptions: [
          "Ja, das ist in Ordnung. Danke.",
          "Ich würde lieber sofort am Telefon mein Passwort ändern.",
          "Könnten Sie mir den Link per SMS senden?"
        ],
        action: "Passwort-Reset-Link senden",
        transitions: {
          "Ja, das ist in Ordnung. Danke.": "explain_2fa",
          default: "password_alternative"
        }
      },
      "password_alternative": {
        type: "info",
        agent: "Aus Sicherheitsgründen können wir Passwörter nicht am Telefon ändern. Ich kann Ihnen den Link jedoch per SMS an Ihre hinterlegte Mobilnummer senden. Möchten Sie das?",
        transitions: {
          default: "explain_2fa"
        }
      },
      "explain_2fa": {
        type: "info",
        agent: "Die Zwei-Faktor-Authentifizierung erhöht die Sicherheit Ihres Kontos, indem sie bei jedem Login einen zusätzlichen Bestätigungscode verlangt. Diesen erhalten Sie per SMS oder über eine Authenticator-App auf Ihrem Smartphone.",
        responseOptions: [
          "Das klingt gut. Ich möchte das einrichten.",
          "Ist das kompliziert zu nutzen?",
          "Ich bin mir nicht sicher, ob ich das brauche."
        ],
        transitions: {
          "Das klingt gut. Ich möchte das einrichten.": "setup_2fa",
          "Ist das kompliziert zu nutzen?": "explain_2fa_ease",
          "Ich bin mir nicht sicher, ob ich das brauche.": "convince_2fa",
          default: "setup_2fa"
        }
      },
      "explain_2fa_ease": {
        type: "info",
        agent: "Die Nutzung ist sehr einfach. Bei jedem Login erhalten Sie einen kurzen Code, den Sie zusätzlich zu Ihrem Passwort eingeben. Das dauert nur wenige Sekunden, erhöht aber die Sicherheit erheblich.",
        transitions: {
          default: "setup_2fa"
        }
      },
      "convince_2fa": {
        type: "info",
        agent: "Angesichts des verdächtigen Zugriffsversuchs auf Ihr Konto würde die 2FA Ihnen eine zusätzliche Sicherheitsebene bieten. Selbst wenn jemand Ihr Passwort kennt, kann er ohne Ihren Bestätigungscode nicht auf Ihr Konto zugreifen.",
        transitions: {
          default: "setup_2fa"
        }
      },
      "setup_2fa": {
        type: "action",
        agent: "Ich schicke Ihnen eine Anleitung zur Einrichtung der Zwei-Faktor-Authentifizierung per E-Mail. Möchten Sie lieber SMS-Codes oder eine Authenticator-App verwenden?",
        responseOptions: [
          "Ich würde gerne die Authenticator-App verwenden.",
          "SMS-Codes wären für mich einfacher.",
          "Welche Option ist sicherer?"
        ],
        action: "2FA-Einrichtungsanleitung senden",
        transitions: {
          "Ich würde gerne die Authenticator-App verwenden.": "conclusion",
          "SMS-Codes wären für mich einfacher.": "conclusion",
          "Welche Option ist sicherer?": "explain_security_options",
          default: "conclusion"
        }
      },
      "explain_security_options": {
        type: "info",
        agent: "Eine Authenticator-App ist generell sicherer, da sie nicht von SMS-Übertragung abhängt, die theoretisch abgefangen werden könnte. Die App funktioniert auch ohne Mobilfunknetz, benötigt aber ein Smartphone.",
        transitions: {
          default: "setup_2fa_final"
        }
      },
      "setup_2fa_final": {
        type: "action",
        agent: "Welche Option bevorzugen Sie nun für die Zwei-Faktor-Authentifizierung?",
        responseOptions: [
          "Ich entscheide mich für die Authenticator-App.",
          "Ich bleibe bei SMS-Codes."
        ],
        transitions: {
          "Ich entscheide mich für die Authenticator-App.": "conclusion",
          "Ich bleibe bei SMS-Codes.": "conclusion",
          default: "conclusion"
        }
      },
      "setup_security": {
        type: "action",
        agent: "Ich werde jetzt beide Sicherheitsmaßnahmen für Sie einrichten. Zunächst sende ich Ihnen einen Link zum Zurücksetzen Ihres Passworts. Anschließend erhalten Sie eine Anleitung zur Einrichtung der Zwei-Faktor-Authentifizierung.",
        responseOptions: [
          "Perfekt, vielen Dank für Ihre Hilfe.",
          "Wie lange wird das dauern?",
          "Kann ich dabei Unterstützung bekommen?"
        ],
        action: "Sicherheitseinrichtung initiieren",
        transitions: {
          "Perfekt, vielen Dank für Ihre Hilfe.": "conclusion",
          "Wie lange wird das dauern?": "explain_timing",
          "Kann ich dabei Unterstützung bekommen?": "offer_support",
          default: "conclusion"
        }
      },
      "explain_timing": {
        type: "info",
        agent: "Das Zurücksetzen des Passworts dauert nur wenige Minuten, sobald Sie den Link erhalten haben. Die Einrichtung der 2FA dauert etwa 5-10 Minuten, je nachdem, ob Sie die App installieren müssen oder SMS verwenden.",
        transitions: {
          default: "conclusion"
        }
      },
      "offer_support": {
        type: "info",
        agent: "Selbstverständlich! Die E-Mail enthält eine detaillierte Schritt-für-Schritt-Anleitung. Sollten Sie dennoch Hilfe benötigen, können Sie jederzeit unseren Support kontaktieren, der Sie durch den Prozess führen wird.",
        transitions: {
          default: "conclusion"
        }
      },
      "conclusion": {
        type: "info",
        agent: "Gerne geschehen. Sobald Sie diese Sicherheitsmaßnahmen eingerichtet haben, sollte Ihr Konto gut geschützt sein. Haben Sie noch weitere Fragen zur Sicherheit Ihres Kontos?",
        responseOptions: [
          "Nein, das war alles. Vielen Dank für Ihre Hilfe!",
          "Ja, wie kann ich meine Login-Aktivitäten überwachen?",
          "Sollte ich auch meine anderen Online-Konten überprüfen?"
        ],
        systemMessage: "Sicherheitsproblem erfolgreich behoben.",
        transitions: {
          "Nein, das war alles. Vielen Dank für Ihre Hilfe!": "end",
          "Ja, wie kann ich meine Login-Aktivitäten überwachen?": "explain_monitoring",
          "Sollte ich auch meine anderen Online-Konten überprüfen?": "advise_other_accounts",
          default: "end"
        }
      },
      "explain_monitoring": {
        type: "info",
        agent: "Sie können Ihre Login-Aktivitäten im Sicherheitsbereich Ihres Online-Bankings einsehen. Dort werden alle Zugriffe mit Zeit, Datum und IP-Adresse aufgelistet. Sie können auch Benachrichtigungen für jeden Login aktivieren.",
        transitions: {
          default: "end"
        }
      },
      "advise_other_accounts": {
        type: "info",
        agent: "Das wäre definitiv ratsam, besonders wenn Sie dasselbe oder ein ähnliches Passwort für mehrere Dienste verwenden. Ändern Sie am besten die Passwörter für alle wichtigen Konten und aktivieren Sie überall, wo möglich, die Zwei-Faktor-Authentifizierung.",
        transitions: {
          default: "end"
        }
      },
      "end": {
        type: "info",
        agent: "Es freut mich, dass ich Ihnen helfen konnte. Sollten Sie in Zukunft weitere Fragen haben, zögern Sie nicht, sich wieder an uns zu wenden. Einen schönen Tag noch!",
        responseOptions: [
          "Danke, Ihnen auch einen schönen Tag!",
          "Auf Wiederhören."
        ],
        systemMessage: "Gespräch erfolgreich abgeschlossen.",
        transitions: {}
      }
    }
  };
}

// Get the initial state for a scenario
export function getInitialState(machine: StateMachine | null): string {
  return machine?.initialState || 'start';
}

// Get the next state based on the current state and selected option
export function getNextState(
  machine: StateMachine | null,
  currentState: string,
  selectedOption?: string
): string | null {
  if (!machine || !machine.states[currentState]) {
    return null;
  }
  
  const stateData = machine.states[currentState];
  
  // If we have a specific transition for this option, use it
  if (selectedOption && stateData.transitions[selectedOption]) {
    return stateData.transitions[selectedOption];
  }
  
  // Otherwise use the default transition
  if (stateData.transitions.default) {
    return stateData.transitions.default;
  }
  
  return null;
}

// Helper to check if a state has transitions left (if not, it's an end state)
export function hasTransitions(machine: StateMachine | null, state: string): boolean {
  if (!machine || !machine.states[state]) {
    return false;
  }
  
  const transitions = machine.states[state].transitions;
  return Object.keys(transitions).length > 0;
}

// Get the current state data
export function getStateData(
  machine: StateMachine | null, 
  state: string
): StateMachineState | null {
  if (!machine || !machine.states[state]) {
    return null;
  }
  
  return machine.states[state];
}

// Get the raw JSON string for a state machine
export async function getStateMachineJson(scenario: ScenarioType): Promise<string> {
  if (!scenario) return "No scenario selected";
  
  try {
    const machine = await loadStateMachine(scenario);
    return JSON.stringify(machine, null, 2); // Pretty print with 2 spaces
  } catch (error) {
    console.error(`Failed to get state machine JSON for scenario ${scenario}:`, error);
    return `Error loading state machine for ${scenario}`;
  }
}

// Helper to check if a state machine exists for a scenario
export function hasStateMachine(scenario: ScenarioType): boolean {
  if (!scenario) return false;
  try {
    // Try to require the file
    require(`../data/stateMachines/${scenario}.json`);
    return true;
  } catch (error) {
    // If we have a fallback in stateMachines.ts
    return scenario === 'verification';
  }
}
