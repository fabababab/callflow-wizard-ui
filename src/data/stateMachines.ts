
// Define types for state machines
export type StateType = 'info' | 'question' | 'decision' | 'verification';

export type State = {
  agent?: string;
  customer?: string;
  suggestions?: string[];
  nextState?: string;
  stateType?: StateType;
  action?: string;
  systemMessage?: string;
}

export type StateMachine = Record<string, State>;

// Physiotherapy state machine
export const physioStateMachine: StateMachine = {
  start: {
    agent: "Grüezi, mein Name ist Lisa Meier, wie darf ich Ihnen helfen?",
    customer: "Ich möchte wissen, ob die Physiotherapie bei Knieproblemen gedeckt ist...",
    nextState: "authentifizierung",
    stateType: "info"
  },
  authentifizierung: {
    agent: "Darf ich Sie kurz identifizieren? Nennen Sie mir bitte Ihr Geburtsdatum.",
    customer: "14. Mai 1985.",
    nextState: "authentifizierung_plz",
    stateType: "verification",
    action: "prüfeGeburtsdatum",
    systemMessage: "Bitte verifizieren Sie das Geburtsdatum",
  },
  authentifizierung_plz: {
    agent: "Danke. Ihre PLZ bei uns?",
    customer: "8004 Zürich.",
    nextState: "authentifizierung_erfolg",
    stateType: "verification",
    action: "prüfeKundenkonto",
    systemMessage: "Bitte verifizieren Sie die Postleitzahl",
  },
  authentifizierung_failed: {
    agent: "Es tut mir leid, aber ich konnte Ihre Daten nicht in unserem System finden. Könnten Sie bitte nochmals Ihre Versicherungsnummer angeben?",
    customer: "Oh, vielleicht habe ich mich vertan. Meine Versicherungsnummer ist CH-7890-1234.",
    nextState: "authentifizierung_erfolg", // For demo purposes, we'll assume the second attempt works
    stateType: "verification",
    systemMessage: "Kunde konnte nicht identifiziert werden. Bitte fragen Sie nach alternativen Identifikationsdaten.",
  },
  authentifizierung_erfolg: {
    agent: "Alles klar, Herr Keller, ich habe Ihr Profil gefunden. Haben Sie die Versichertennummer?",
    customer: "756.1234.5678.90.",
    nextState: "waehle_leistungserbringer",
    stateType: "verification",
    systemMessage: "Kunde erfolgreich identifiziert. Versicherungsstatus: Premium mit voller Physiotherapie-Abdeckung.",
  },
  waehle_leistungserbringer: {
    agent: "Welchen Physiotherapeuten möchten Sie?",
    customer: "Jana Brunner, Praxis 8004 Zürich.",
    nextState: "pruefe_therapeut",
    stateType: "question",
    systemMessage: "Prüfe Leistungserbringer im System",
  },
  pruefe_therapeut: {
    agent: "Einen Augenblick bitte...",
    nextState: "therapeut_anerkannt",
    stateType: "info",
    action: "prüfeLeistungserbringer",
    systemMessage: "Therapeut Jana Brunner gefunden. Status: Anerkannte Leistungserbringerin."
  },
  therapeut_nicht_anerkannt: {
    agent: "Es tut mir leid, aber Frau Brunner ist keine anerkannte Leistungserbringerin in unserem Netzwerk. Möchten Sie einen anderen Therapeuten wählen oder soll ich Ihnen anerkannte Therapeuten in Ihrer Nähe nennen?",
    suggestions: ["Anderen Therapeuten wählen", "Anerkannte Therapeuten zeigen"],
    stateType: "decision",
    nextState: "therapeuten_vorschlagen",
    systemMessage: "Therapeut nicht anerkannt. Bitte bieten Sie Alternativen an.",
  },
  therapeuten_vorschlagen: {
    agent: "In 8004 Zürich haben wir folgende anerkannte Physiotherapeuten: Dr. Müller (Bahnhofstrasse 10), Praxis Gesundheit (Langstrasse 25) und Physio Plus (Stauffacherstrasse 52).",
    nextState: "waehle_leistungserbringer",
    stateType: "info",
    systemMessage: "Zeige anerkannte Leistungserbringer in PLZ 8004."
  },
  therapeut_anerkannt: {
    agent: "Frau Brunner ist anerkannte Leistungserbringerin.",
    nextState: "verordnung_abfragen",
    stateType: "info",
    systemMessage: "Therapeut anerkannt. Fahren Sie mit Verordnungsdetails fort."
  },
  verordnung_abfragen: {
    agent: "Für Kostendeckung brauchen Sie eine gültige ärztliche Verordnung. Möchten Sie Details?",
    suggestions: ["Ja, bitte", "Nein, danke"],
    stateType: "decision",
    systemMessage: "Fragen Sie, ob der Kunde Details zur Verordnung benötigt."
  },
  details_verordnung: {
    agent: "Die Grundversicherung deckt 9 Sitzungen, Folge-Verordnung möglich. Therapie muss innerhalb 5 Wochen starten.",
    nextState: "abschluss",
    stateType: "info",
    systemMessage: "Ihr Tariftyp Premium+ gewährt zusätzliche 3 Sitzungen, also insgesamt 12 Sitzungen pro Verordnung."
  },
  abschluss: {
    agent: "Okay. Kann ich sonst noch etwas für Sie tun?",
    customer: "Nein.",
    nextState: "ende",
    stateType: "question",
    systemMessage: "Der Kunde scheint zufrieden zu sein. Fragen Sie, ob es weitere Anliegen gibt."
  },
  ende: {
    agent: "Gute Besserung und auf Wiederhören!",
    stateType: "info",
    systemMessage: "Gespräch kann beendet werden. Kein weiterer Handlungsbedarf."
  }
};

// Add state machines for other scenarios as needed
export const scenarioInitialMessages: Record<string, string> = {
  verification: "Hallo, hier spricht Michael Schmidt. Ich muss meine Kontodaten verifizieren.",
  bankDetails: "Hallo, ich möchte meine Bankdaten für mein Konto aktualisieren.",
  accountHistory: "Hallo, ich möchte meine letzten Kontoaktivitäten überprüfen.",
  physioTherapy: "Guten Tag, ich habe eine Frage zur Kostenübernahme für meine Physiotherapie bei Knieproblemen. Werden die Kosten von meiner Versicherung übernommen?",
  paymentReminder: "Hallo, ich habe eine Mahnung erhalten, obwohl ich den Betrag bereits überwiesen habe. Das verstehe ich nicht.",
  insurancePackage: "Guten Tag, ich habe gerade mein Studium abgeschlossen und brauche ein neues Versicherungspaket für Berufstätige."
};
