
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

// Bank details state machine
export const bankDetailsStateMachine: StateMachine = {
  start: {
    agent: "Guten Tag, wie kann ich Ihnen mit Ihren Bankdaten helfen?",
    customer: "Hallo, ich möchte meine Bankverbindung ändern, da ich zu einer neuen Bank gewechselt bin.",
    nextState: "identify_customer",
    stateType: "info"
  },
  identify_customer: {
    agent: "Natürlich kann ich Ihnen dabei helfen. Zu Ihrer Sicherheit muss ich zunächst Ihre Identität bestätigen. Können Sie mir bitte Ihren Namen und Ihr Geburtsdatum nennen?",
    customer: "Mein Name ist Max Hoffmann, geboren am 15. Juni 1982.",
    nextState: "verify_identity",
    stateType: "verification",
    systemMessage: "Bitte verifizieren Sie die Identität des Kunden vor der Änderung von Bankdaten."
  },
  verify_identity: {
    agent: "Vielen Dank. Können Sie mir bitte auch Ihre Kundennummer oder die letzten vier Ziffern Ihres Kontos nennen?",
    customer: "Meine Kundennummer ist 78901234.",
    nextState: "identity_confirmed",
    stateType: "verification",
    action: "prüfeKundenidentität",
    systemMessage: "Überprüfen Sie die Kundendaten im System."
  },
  identity_confirmed: {
    agent: "Vielen Dank, Herr Hoffmann. Ich habe Ihr Konto gefunden und Ihre Identität bestätigt. Welche neue Bankverbindung möchten Sie hinterlegen?",
    customer: "Ich bin zur Commerzbank gewechselt. Meine neue IBAN ist DE89370400440532013000.",
    nextState: "collect_bank_info",
    stateType: "info",
    systemMessage: "Kunde wurde erfolgreich identifiziert. Sie können mit der Änderung der Bankdaten fortfahren."
  },
  collect_bank_info: {
    agent: "Ich habe folgende IBAN notiert: DE89370400440532013000. Ist das korrekt? Und können Sie mir bitte auch den Namen der Bank bestätigen?",
    customer: "Ja, die IBAN ist korrekt. Die Bank ist die Commerzbank.",
    nextState: "confirm_changes",
    stateType: "verification",
    action: "prüfeIBAN",
    systemMessage: "IBAN-Format ist gültig. Vergleichen Sie mit den bisherigen Bankdaten."
  },
  confirm_changes: {
    agent: "Danke für die Informationen. Ich habe die Änderung vorbereitet. Ihre Bankverbindung wird von Deutsche Bank zu Commerzbank mit der IBAN DE89370400440532013000 geändert. Möchten Sie diese Änderung bestätigen?",
    suggestions: ["Ja, Änderung bestätigen", "Nein, abbrechen"],
    nextState: "process_changes",
    stateType: "decision",
    systemMessage: "Bitten Sie um Bestätigung, bevor Sie die Änderung der Bankdaten vornehmen."
  },
  process_changes: {
    agent: "Ich habe die Änderung Ihrer Bankverbindung vorgenommen. Die neue Verbindung wird ab dem nächsten Abrechnungszyklus wirksam. Möchten Sie eine Bestätigung per E-Mail erhalten?",
    suggestions: ["Ja, bitte per E-Mail", "Nein, danke"],
    nextState: "finalize",
    stateType: "decision",
    action: "aktualisiereKontodaten",
    systemMessage: "Die Bankdaten wurden erfolgreich aktualisiert. Bieten Sie eine Bestätigung per E-Mail an."
  },
  finalize: {
    agent: "Perfekt, ich habe die Bestätigung an die bei uns hinterlegte E-Mail-Adresse gesendet. Die Änderung Ihrer Bankverbindung wurde erfolgreich durchgeführt. Gibt es noch etwas, wobei ich Ihnen helfen kann?",
    nextState: "end",
    stateType: "question",
    systemMessage: "Der Vorgang ist abgeschlossen. Fragen Sie, ob der Kunde weitere Anliegen hat."
  },
  end: {
    agent: "Vielen Dank für Ihren Anruf, Herr Hoffmann. Ich wünsche Ihnen einen schönen Tag!",
    stateType: "info",
    systemMessage: "Gespräch kann beendet werden. Kein weiterer Handlungsbedarf."
  }
};

// Verification state machine
export const verificationStateMachine: StateMachine = {
  start: {
    agent: "Guten Tag, wie kann ich Ihnen helfen?",
    customer: "Guten Tag, ich habe eine E-Mail über einen verdächtigen Login-Versuch auf meinem Konto erhalten und muss meine Identität bestätigen.",
    nextState: "gather_basic_info",
    stateType: "info"
  },
  gather_basic_info: {
    agent: "Das kann ich gerne für Sie überprüfen. Um Ihre Identität zu bestätigen, benötige ich einige persönliche Informationen. Können Sie mir bitte Ihren vollständigen Namen mitteilen?",
    customer: "Mein Name ist Emma Wagner.",
    nextState: "request_dob",
    stateType: "verification",
    systemMessage: "Beginnen Sie mit der Identitätsprüfung. Fragen Sie nach grundlegenden Informationen."
  },
  request_dob: {
    agent: "Vielen Dank, Frau Wagner. Könnten Sie mir bitte auch Ihr Geburtsdatum nennen?",
    customer: "Ich wurde am 15. März 1985 geboren.",
    nextState: "request_address",
    stateType: "verification",
    action: "prüfeNameUndGeburtsdatum",
    systemMessage: "Überprüfen Sie Name und Geburtsdatum im System."
  },
  request_address: {
    agent: "Danke. Um Ihre Identität vollständig zu bestätigen, benötige ich noch Ihre aktuelle Adresse.",
    customer: "Meine Adresse ist Hauptstraße 123 in 10115 Berlin.",
    nextState: "request_last_transaction",
    stateType: "verification",
    systemMessage: "Die Grunddaten wurden bestätigt. Fahren Sie mit zusätzlichen Sicherheitsfragen fort."
  },
  request_last_transaction: {
    agent: "Vielen Dank. Als zusätzliche Sicherheitsmaßnahme: Können Sie mir die letzten vier Ziffern Ihres Kontos oder den Betrag Ihrer letzten Transaktion nennen?",
    customer: "Die letzten vier Ziffern meines Kontos sind 4321.",
    nextState: "verification_complete",
    stateType: "verification",
    action: "überprüfeKontoinformationen",
    systemMessage: "Prüfen Sie die Kontoinformationen zur endgültigen Bestätigung."
  },
  verification_complete: {
    agent: "Perfekt, ich konnte Ihre Identität erfolgreich bestätigen. Der Login-Versuch, über den Sie informiert wurden, war tatsächlich verdächtig und kam nicht von Ihren üblichen Geräten. Möchten Sie Ihr Passwort zurücksetzen und die Zwei-Faktor-Authentifizierung aktivieren?",
    suggestions: ["Passwort zurücksetzen", "2FA aktivieren", "Beides"],
    stateType: "decision",
    systemMessage: "Die Identitätsprüfung war erfolgreich. Bieten Sie Sicherheitsmaßnahmen an."
  },
  reset_password: {
    agent: "Ich habe den Passwort-Reset-Prozess für Sie eingeleitet. Sie erhalten in Kürze eine E-Mail mit einem Link zum Zurücksetzen Ihres Passworts. Bitte wählen Sie ein starkes, einzigartiges Passwort. Möchten Sie auch die Zwei-Faktor-Authentifizierung einrichten?",
    suggestions: ["Ja, 2FA aktivieren", "Nein, später"],
    nextState: "setup_2fa",
    stateType: "decision",
    action: "sendePasswortReset",
    systemMessage: "Der Passwort-Reset wurde initiiert. Bieten Sie die Einrichtung der 2FA an."
  },
  setup_2fa: {
    agent: "Ausgezeichnet. Ich habe die Aktivierung der Zwei-Faktor-Authentifizierung für Ihr Konto vorbereitet. Sie erhalten bei Ihrem nächsten Login einen Verifizierungscode per SMS oder über die Authenticator-App. Dies bietet zusätzlichen Schutz für Ihr Konto. Haben Sie noch Fragen zur Sicherheit Ihres Kontos?",
    suggestions: ["Weitere Sicherheitstipps", "Keine weiteren Fragen"],
    nextState: "finalize",
    stateType: "decision",
    action: "aktiviere2FA",
    systemMessage: "Die 2FA wurde erfolgreich aktiviert. Bieten Sie zusätzliche Sicherheitsinformationen an."
  },
  finalize: {
    agent: "Ich freue mich, dass wir Ihr Konto zusätzlich absichern konnten. Ihr Konto ist nun geschützt und Sie erhalten Benachrichtigungen bei verdächtigen Aktivitäten. Gibt es noch etwas anderes, womit ich Ihnen helfen kann?",
    nextState: "end",
    stateType: "question",
    systemMessage: "Alle Sicherheitsmaßnahmen wurden implementiert. Fragen Sie nach weiteren Anliegen."
  },
  end: {
    agent: "Vielen Dank für Ihren Anruf, Frau Wagner. Die Sicherheit Ihres Kontos ist wiederhergestellt. Bei weiteren Fragen stehen wir Ihnen jederzeit zur Verfügung. Einen schönen Tag noch!",
    stateType: "info",
    systemMessage: "Gespräch kann beendet werden. Kein weiterer Handlungsbedarf."
  }
};

// Map from scenario type to state machine
export const stateMachines: Record<string, StateMachine> = {
  'physioTherapy': physioStateMachine,
  'bankDetails': bankDetailsStateMachine,
  'verification': verificationStateMachine,
  // Add more state machines as they are created
};

export const scenarioInitialStates: Record<string, string> = {
  'physioTherapy': 'start',
  'bankDetails': 'start',
  'verification': 'start',
  'accountHistory': 'start',
  'paymentReminder': 'start',
  'insurancePackage': 'start'
};

