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
  responseOptions?: string[];
  productOptions?: string[];
  contractOptions?: string[];
  requiresVerification?: boolean;
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
    agent: "Alles klar, Herr Keller, ich habe Ihr Profil gefunden. Haben Sie die Versicherungsnummer?",
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
    agent: "Vielen Dank, Herr Hoffmann. Ich habe Ihr Konto gefunden und Ihre Identität bestätigt. Wie kann ich Ihnen heute helfen?",
    responseOptions: [
      "Bankverbindung ändern", 
      "product_info:Premium Health Insurance", 
      "product_info:Home Insurance Plus", 
      "cancel_contract:Insurance",
      "Über andere Produkte informieren"
    ],
    nextState: "determine_request",
    stateType: "info",
    systemMessage: "Kunde wurde erfolgreich identifiziert. Sie können verschiedene Services anbieten."
  },
  determine_request: {
    agent: "Was möchten Sie heute tun?",
    responseOptions: [
      "Bankverbindung ändern", 
      "product_info:Premium Health Insurance", 
      "product_info:Home Insurance Plus", 
      "cancel_contract:Insurance",
      "Über andere Produkte informieren"
    ],
    stateType: "decision",
    systemMessage: "Bieten Sie verschiedene Services an."
  },
  collect_bank_info: {
    agent: "Welche neue Bankverbindung möchten Sie hinterlegen?",
    customer: "Ich bin zur Commerzbank gewechselt. Meine neue IBAN ist DE89370400440532013000.",
    nextState: "confirm_changes",
    stateType: "verification",
    action: "prüfeIBAN",
    systemMessage: "IBAN-Format ist gültig. Vergleichen Sie mit den bisherigen Bankdaten."
  },
  confirm_changes: {
    agent: "Danke für die Informationen. Ich habe die Änderung vorbereitet. Ihre Bankverbindung wird von Deutsche Bank zu Commerzbank mit der IBAN DE89370400440532013000 geändert. Möchten Sie diese Änderung best��tigen?",
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
  show_product_info: {
    agent: "Hier sind die Informationen zu unserem gewählten Produkt. Sie finden alle Details in der Produktübersicht und im Video. Haben Sie dazu weitere Fragen?",
    responseOptions: ["Ich hätte Fragen zur Deckung", "Wie hoch sind die monatlichen Kosten?", "Wie kann ich das Produkt bestellen?"],
    stateType: "info",
    systemMessage: "Zeigen Sie Produktinformationen und Video an."
  },
  show_contracts_for_cancellation: {
    agent: "Um Ihren Vertrag zu kündigen, benötige ich zunächst weitere Details. Welchen Vertrag genau möchten Sie kündigen? Ich sehe mehrere aktive Verträge in Ihrem Konto.",
    responseOptions: ["Health Insurance Basic", "Home Insurance Premium", "Car Insurance Full Coverage"],
    stateType: "decision",
    requiresVerification: true,
    systemMessage: "Eine Vertragskündigung erfordert eine zusätzliche Verifizierung. Bitte verifizieren Sie die Kundenidentität bevor Sie fortfahren."
  },
  process_cancellation: {
    agent: "Bevor ich die Kündigung einleiten kann, benötige ich eine Bestätigung Ihrer Identität. Können Sie mir bitte Ihre Versicherungsnummer und aktuelle Adresse nennen?",
    nextState: "verify_for_cancellation",
    stateType: "verification",
    requiresVerification: true,
    systemMessage: "Vertragskündigung erfordert eine zusätzliche Verifizierung der Versicherungsnummer und Adresse."
  },
  verify_for_cancellation: {
    agent: "Vielen Dank für die Bestätigung. Ich habe die Kündigung Ihres Vertrages eingeleitet. Sie erhalten in Kürze eine schriftliche Bestätigung per E-Mail und Post. Ihr Vertrag endet zum nächstmöglichen Zeitpunkt gemäß den Vertragsbedingungen. Ist das in Ordnung?",
    responseOptions: ["Ja, danke", "Wann genau endet der Vertrag?", "Fallen Stornogebühren an?"],
    nextState: "finalize",
    stateType: "verification",
    systemMessage: "Die Kündigung wurde eingeleitet. Informieren Sie den Kunden über die nächsten Schritte."
  },
  finalize: {
    agent: "Gibt es noch etwas, wobei ich Ihnen helfen kann?",
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

// Account History state machine
export const accountHistoryStateMachine: StateMachine = {
  start: {
    agent: "Guten Tag, wie kann ich Ihnen helfen?",
    customer: "Hallo, ich möchte gerne meine Kontoaktivitäten der letzten Monate überprüfen.",
    nextState: "identify_customer",
    stateType: "info"
  },
  identify_customer: {
    agent: "Natürlich kann ich Ihnen dabei helfen. Zu Ihrer Sicherheit muss ich zunächst Ihre Identität bestätigen. Können Sie mir bitte Ihren Namen und Ihr Geburtsdatum nennen?",
    customer: "Mein Name ist Laura Becker, geboren am 21. September 1979.",
    nextState: "verify_identity",
    stateType: "verification",
    systemMessage: "Bitte verifizieren Sie die Identität der Kundin vor dem Zugriff auf Kontodaten."
  },
  verify_identity: {
    agent: "Vielen Dank. Können Sie mir bitte auch Ihre Kundennummer oder die letzten vier Ziffern Ihres Kontos nennen?",
    customer: "Die letzten vier Ziffern meines Kontos sind 4321.",
    nextState: "identity_confirmed",
    stateType: "verification",
    action: "prüfeKundenidentität",
    systemMessage: "Überprüfen Sie die Kundendaten im System."
  },
  identity_confirmed: {
    agent: "Vielen Dank, Frau Becker. Ich habe Ihr Konto gefunden und Ihre Identität bestätigt. Für welchen Zeitraum möchten Sie Ihre Kontoaktivitäten überprüfen?",
    customer: "Ich interessiere mich besonders für die Transaktionen der letzten drei Monate.",
    nextState: "specify_timeframe",
    stateType: "info",
    systemMessage: "Kundin wurde erfolgreich identifiziert. Sie können mit der Kontoüberprüfung fortfahren."
  },
  specify_timeframe: {
    agent: "Ich zeige Ihnen die Transaktionen der letzten drei Monate an. Möchten Sie nach bestimmten Transaktionen filtern oder alle sehen?",
    customer: "Ich möchte zunächst alle sehen, aber ich suche besonders nach einer bestimmten Transaktion von letzter Woche, die ich nicht erkenne.",
    nextState: "show_transactions",
    stateType: "question",
    systemMessage: "Zeigen Sie der Kundin eine Übersicht der Kontobewegungen der letzten drei Monate."
  },
  show_transactions: {
    agent: "Ich habe die Transaktionen der letzten drei Monate für Sie aufbereitet. Ich sehe hier mehrere Transaktionen aus der letzten Woche. Können Sie mir mehr Details zu der unbekannten Transaktion geben?",
    customer: "Es handelt sich um eine Zahlung an einen Online Shop GmbH für 79,99 € vom letzten Dienstag.",
    nextState: "identify_transaction",
    stateType: "info",
    action: "zeigeKontotransaktionen",
    systemMessage: "Überprüfen Sie die genannte Transaktion in den Kontobewegungen."
  },
  identify_transaction: {
    agent: "Ich habe die Transaktion gefunden. Es handelt sich um eine Zahlung an 'Top Online Shop GmbH' vom 14. April über 79,99 €. Diese Zahlung wurde über Ihre hinterlegte Kreditkarte abgewickelt. Erkennen Sie diese Transaktion jetzt?",
    customer: "Ah, jetzt erinnere ich mich. Das war eine Bestellung für Kleidung. Vielen Dank für die Information.",
    nextState: "offer_additional_help",
    stateType: "info",
    systemMessage: "Die Kundin hat die Transaktion identifiziert. Bieten Sie weitere Unterstützung an."
  },
  offer_additional_help: {
    agent: "Gerne. Gibt es etwas anderes bezüglich Ihrer Kontoaktivitäten, wobei ich Ihnen helfen kann?",
    suggestions: ["Kontoauszug senden", "Transaktionsdetails erklären", "Benachrichtigungen einrichten"],
    customer: "Könnten Sie mir vielleicht einen Kontoauszug für diesen Zeitraum per E-Mail zusenden?",
    nextState: "send_statement",
    stateType: "decision",
    systemMessage: "Die Kundin wünscht einen Kontoauszug. Bereiten Sie den Versand vor."
  },
  send_statement: {
    agent: "Selbstverständlich. Ich werde Ihnen einen digitalen Kontoauszug der letzten drei Monate an Ihre hinterlegte E-Mail-Adresse zusenden. Möchten Sie eine Bestätigung, sobald der Auszug versendet wurde?",
    customer: "Ja, das wäre hilfreich. Vielen Dank für Ihre Hilfe!",
    nextState: "finish",
    stateType: "question",
    action: "sendeKontoauszug",
    systemMessage: "Bereiten Sie den Versand des Kontoauszugs vor und informieren Sie die Kundin."
  },
  finish: {
    agent: "Der Kontoauszug wurde soeben an Ihre E-Mail-Adresse gesendet. Sie sollten ihn in Kürze erhalten. Kann ich Ihnen mit etwas anderem behilflich sein?",
    customer: "Nein, das war alles. Vielen Dank für Ihre Hilfe.",
    nextState: "end",
    stateType: "question",
    systemMessage: "Die Anfrage wurde erfolgreich bearbeitet."
  },
  end: {
    agent: "Vielen Dank für Ihren Anruf, Frau Becker. Sollten Sie weitere Fragen haben, stehen wir Ihnen jederzeit zur Verfügung. Einen schönen Tag noch!",
    stateType: "info",
    systemMessage: "Gespräch kann beendet werden. Kein weiterer Handlungsbedarf."
  }
};

// Payment Reminder state machine
export const paymentReminderStateMachine: StateMachine = {
  start: {
    agent: "Guten Tag, wie kann ich Ihnen helfen?",
    customer: "Guten Tag, ich habe eine Zahlungserinnerung bekommen, obwohl ich den Betrag bereits überwiesen habe.",
    nextState: "identify_customer",
    stateType: "info"
  },
  identify_customer: {
    agent: "Das tut mir leid zu hören. Ich helfe Ihnen gerne bei der Klärung. Darf ich zunächst nach Ihrem Namen und Ihrer Kundennummer fragen?",
    customer: "Ich heiße Sophia Klein und meine Kundennummer ist KD-789456.",
    nextState: "verify_identity",
    stateType: "verification",
    systemMessage: "Bitte verifizieren Sie die Identität der Kundin."
  },
  verify_identity: {
    agent: "Vielen Dank, Frau Klein. Zur Sicherheit benötige ich noch Ihr Geburtsdatum.",
    customer: "Mein Geburtsdatum ist der 5. März 1990.",
    nextState: "identity_confirmed",
    stateType: "verification",
    action: "prüfeKundenidentität",
    systemMessage: "Überprüfen Sie die Kundendaten im System."
  },
  identity_confirmed: {
    agent: "Danke für die Bestätigung. Ich sehe hier, dass Sie eine Zahlungserinnerung über 250€ erhalten haben. Wann haben Sie die Zahlung getätigt?",
    customer: "Ich habe den Betrag bereits am 15. April überwiesen.",
    nextState: "payment_details",
    stateType: "info",
    systemMessage: "Kundin wurde erfolgreich identifiziert. Sie können mit der Überprüfung der Zahlung fortfahren."
  },
  payment_details: {
    agent: "Verstanden. Können Sie mir bitte mitteilen, von welchem Konto Sie die Überweisung getätigt haben und welche Referenznummer Sie verwendet haben?",
    customer: "Die Überweisung erfolgte von meinem Girokonto bei der Sparkasse. Die Referenznummer auf der Rechnung war KD-789456.",
    nextState: "check_payment",
    stateType: "info",
    systemMessage: "Sammeln Sie alle relevanten Zahlungsdetails für die Überprüfung."
  },
  check_payment: {
    agent: "Vielen Dank für diese Informationen. Ich werde jetzt in unserem System nachsehen, ob die Zahlung eingegangen ist. Einen Moment bitte.",
    customer: "Ja, danke. Ich warte.",
    nextState: "payment_found",
    stateType: "info",
    action: "prüfeZahlungseingang",
    systemMessage: "Überprüfen Sie den Zahlungseingang im System."
  },
  payment_found: {
    agent: "Ich kann tatsächlich eine Zahlung von Ihnen über 250€ vom 15. April in unserem System sehen. Die Zahlung wurde korrekt verbucht, aber es scheint, dass die Zahlungserinnerung automatisch vor der Verbuchung Ihrer Zahlung generiert wurde.",
    customer: "Das ist gut zu wissen. Muss ich jetzt etwas unternehmen?",
    nextState: "resolve_issue",
    stateType: "info",
    systemMessage: "Die Zahlung wurde im System gefunden. Klären Sie das weitere Vorgehen."
  },
  resolve_issue: {
    agent: "Nein, Sie müssen nichts weiter unternehmen. Ich habe die Zahlungserinnerung in unserem System als erledigt markiert. Sie können die Mahnung ignorieren. Entschuldigen Sie bitte die Unannehmlichkeiten.",
    suggestions: ["Bestätigung per E-Mail senden", "Kulanzgutschrift anbieten", "Zahlungsbestätigung erklären"],
    customer: "Alles klar, vielen Dank für die Klärung.",
    nextState: "offer_confirmation",
    stateType: "decision",
    action: "markiereZahlungAlsErledigt",
    systemMessage: "Das Problem wurde gelöst. Bieten Sie eine Bestätigung an."
  },
  offer_confirmation: {
    agent: "Gerne. Möchten Sie eine schriftliche Bestätigung per E-Mail erhalten, dass die Angelegenheit erledigt ist?",
    customer: "Ja, das wäre sehr hilfreich. Danke.",
    nextState: "send_confirmation",
    stateType: "question",
    systemMessage: "Bieten Sie der Kundin eine schriftliche Bestätigung an."
  },
  send_confirmation: {
    agent: "Ich werde Ihnen sofort eine Bestätigung an Ihre hinterlegte E-Mail-Adresse senden. Sie sollte in den nächsten Minuten bei Ihnen eingehen.",
    customer: "Perfekt, vielen Dank für Ihre Hilfe.",
    nextState: "finish",
    stateType: "info",
    action: "sendeBestätigung",
    systemMessage: "Senden Sie eine E-Mail-Bestätigung an die Kundin."
  },
  finish: {
    agent: "Sehr gerne. Gibt es noch etwas anderes, womit ich Ihnen helfen kann?",
    customer: "Nein, das war alles. Vielen Dank für die schnelle Lösung.",
    nextState: "end",
    stateType: "question",
    systemMessage: "Die Anfrage wurde erfolgreich bearbeitet."
  },
  end: {
    agent: "Gerne geschehen, Frau Klein. Vielen Dank für Ihren Anruf und entschuldigen Sie nochmals die Unannehmlichkeiten mit der Zahlungserinnerung. Einen schönen Tag noch!",
    stateType: "info",
    systemMessage: "Gespräch kann beendet werden. Kein weiterer Handlungsbedarf."
  }
};

// Insurance Package state machine with enhanced product options and cancellation flow
export const insurancePackageStateMachine: StateMachine = {
  start: {
    agent: "Guten Tag, wie kann ich Ihnen helfen?",
    customer: "Hallo, ich war bisher in der studentischen Krankenversicherung, aber jetzt beginne ich meinen ersten Job und brauche ein neues Versicherungspaket.",
    nextState: "identify_customer",
    stateType: "info"
  },
  identify_customer: {
    agent: "Herzlichen Glückwunsch zum Berufseinstieg! Ich helfe Ihnen gerne bei der Auswahl eines passenden Versicherungspakets. Darf ich zunächst nach Ihrem Namen und Ihrer Versicherungsnummer fragen?",
    customer: "Mein Name ist Jonas Schwarz und meine Versicherungsnummer ist VS-67890123.",
    nextState: "verify_identity",
    stateType: "verification",
    systemMessage: "Bitte verifizieren Sie die Identität des Kunden.",
    requiresVerification: true
  },
  verify_identity: {
    agent: "Vielen Dank, Herr Schwarz. Zur Sicherheit benötige ich noch Ihr Geburtsdatum und Ihre Adresse.",
    customer: "Ich wurde am 12. Juni 1997 geboren und wohne in der Hauptstraße 45, 10117 Berlin.",
    nextState: "identity_confirmed",
    stateType: "verification",
    action: "prüfeKundenidentität",
    systemMessage: "Überprüfen Sie die Kundendaten im System.",
    requiresVerification: true
  },
  identity_confirmed: {
    agent: "Danke für die Bestätigung. Ich sehe, dass Sie bisher in unserer Studentenversicherung waren. Wie kann ich Ihnen heute helfen?",
    responseOptions: [
      "Neues Versicherungspaket abschließen", 
      "product_info:Premium Health Insurance", 
      "product_info:Home Insurance Plus", 
      "cancel_contract:Student Insurance",
      "Über andere Produkte informieren"
    ],
    nextState: "determine_request",
    stateType: "info",
    systemMessage: "Kunde wurde erfolgreich identifiziert. Sie können mit der Beratung fortfahren."
  },
  determine_request: {
    agent: "Was möchten Sie heute tun?",
    responseOptions: [
      "Neues Versicherungspaket abschließen", 
      "product_info:Premium Health Insurance", 
      "product_info:Home Insurance Plus", 
      "cancel_contract:Student Insurance",
      "Über andere Produkte informieren"
    ],
    stateType: "decision",
    systemMessage: "Bieten Sie verschiedene Services an."
  },
  collect_requirements: {
    agent: "Verstanden. Haben Sie besondere Bedürfnisse oder Wünsche für Ihre neue Krankenversicherung? Zum Beispiel zusätzliche Leistungen für Zahnbehandlung, Brille oder besondere Therapien?",
    customer: "Ja, ich interessiere mich für einen umfassenden Schutz mit Zusatzleistungen für Zahnbehandlung und Brille.",
    nextState: "suggest_package",
    stateType: "question",
    systemMessage: "Erfassen Sie die speziellen Anforderungen des Kunden für ein passendes Angebot."
  },
  suggest_package: {
    agent: "Basierend auf Ihren Angaben würde ich Ihnen unser 'Premium Plus'-Paket empfehlen. Es enthält eine umfassende Grundversicherung sowie Zusatzleistungen für Zahnbehandlungen bis zu 80% und eine Brillenzuzahlung von bis zu 200€ alle zwei Jahre. Der monatliche Beitrag läge bei etwa 350€.",
    responseOptions: ["Mehr über Premium Plus erfahren", "Günstigere Alternative?", "Details zu Zahnleistungen", "Auslandsschutz erklären"],
    nextState: "explain_starter_offer",
    stateType: "decision",
    systemMessage: "Präsentieren Sie das empfohlene Versicherungspaket und bereiten Sie sich auf Folgefragen vor."
  },
  show_product_info: {
    agent: "Hier sind die Informationen zu unserem gewählten Produkt. Sie finden alle Details in der Produktübersicht und im Video. Haben Sie dazu weitere Fragen?",
    responseOptions: ["Ich hätte Fragen zur Deckung", "Wie hoch sind die monatlichen Kosten?", "Wie kann ich das Produkt bestellen?"],
    stateType: "info",
    systemMessage: "Zeigen Sie Produktinformationen und Video an."
  },
  show_contracts_for_cancellation: {
    agent: "Um Ihren Vertrag zu kündigen, benötige ich zunächst weitere Details. Welchen Vertrag genau möchten Sie kündigen? Ich sehe mehrere aktive Verträge in Ihrem Konto.",
    responseOptions: ["Student Health Insurance", "Dorm Insurance", "Travel Insurance Basic"],
    stateType: "decision",
    requiresVerification: true,
    systemMessage: "Eine Vertragskündigung erfordert eine zusätzliche Verifizierung. Bitte verifizieren Sie die Kundenidentität bevor Sie fortfahren."
  },
  process_cancellation: {
    agent: "Bevor ich die Kündigung einleiten kann, benötige ich eine Bestätigung Ihrer Identität. Können Sie mir bitte Ihre vollständige Versicherungsnummer und aktuelle Adresse nennen?",
    nextState: "verify_for_cancellation",
    stateType: "verification",
    requiresVerification: true,
    systemMessage: "Vertragskündigung erfordert eine zusätzliche Verifizierung der Versicherungsnummer und Adresse."
  },
  verify_for_cancellation: {
    agent: "Vielen Dank für die Bestätigung. Ich habe die Kündigung Ihres Vertrages eingeleitet. Sie erhalten in Kürze eine schriftliche Bestätigung per E-Mail und Post. Ihr Vertrag endet zum nächstmöglichen Zeitpunkt gemäß den Vertragsbedingungen. Ist das in Ordnung?",
    responseOptions: ["Ja, danke", "Wann genau endet der Vertrag?", "Fallen Stornogebühren an?"],
    nextState: "finalize",
    stateType: "verification",
    systemMessage: "Die Kündigung wurde eingeleitet. Informieren Sie den Kunden über die nächsten Schritte."
  },
  explain_starter_offer: {
    agent: "In der Tat haben wir ein spezielles Angebot für Berufseinsteiger wie Sie. In den ersten 12 Monaten erhalten Sie 15% Rabatt auf den monatlichen Beitrag, was den Preis auf etwa 298€ pro Monat senkt. Zudem können Sie in den ersten 6 Monaten kostenlos zwischen verschiedenen Zusatzleistungen wechseln, um das für Sie passende Paket zu finden.",
    customer: "Diese Option klingt interessant. Können Sie mir weitere Details zusenden?",
    nextState: "send_information",
    stateType: "info",
    systemMessage: "Erklären Sie die besonderen Konditionen für Berufseinsteiger."
  },
  send_information: {
    agent: "Selbstverständlich. Ich werde Ihnen gerne alle Informationen zum 'Premium Plus'-Paket mit dem Berufseinsteiger-Rabatt per E-Mail zusenden. Möchten Sie auch einen persönlichen Beratungstermin vereinbaren, um alle Details zu besprechen?",
    suggestions: ["Ja, Termin vereinbaren", "Nur E-Mail-Info", "Telefonische Nachberatung"],
    nextState: "schedule_appointment",
    stateType: "decision",
    action: "sendeInfomaterial",
    systemMessage: "Bereiten Sie den Versand der Informationsunterlagen vor."
  },
  schedule_appointment: {
    agent: "Wunderbar, ich kann Ihnen gerne bei der Terminvereinbarung helfen. Wir haben folgende Termine verfügbar: Montag 10-12 Uhr, Dienstag 14-16 Uhr oder Freitag 9-11 Uhr. Welcher Termin wäre für Sie am besten?",
    customer: "Der Dienstag um 15 Uhr würde mir gut passen.",
    nextState: "confirm_appointment",
    stateType: "decision",
    suggestions: ["Termin bestätigen", "Anderen Termin vorschlagen", "Lieber telefonische Beratung"],
    systemMessage: "Erfassen Sie den gewünschten Beratungstermin des Kunden."
  },
  confirm_appointment: {
    agent: "Ich habe den Termin für Dienstag, 15 Uhr, für Sie eingetragen. Unser Versicherungsberater Herr Müller wird Sie in unserem Büro in der Hauptstraße 20 empfangen. Möchten Sie eine Erinnerungs-SMS am Tag vor dem Termin erhalten?",
    customer: "Ja, das wäre hilfreich. Vielen Dank.",
    nextState: "appointment_confirmed",
    stateType: "decision",
    suggestions: ["SMS-Erinnerung einrichten", "E-Mail-Erinnerung einrichten", "Keine Erinnerung nötig"],
    action: "terminEintragen",
    systemMessage: "Bestätigen Sie den Beratungstermin und bieten Sie eine Erinnerungsoption an."
  },
  appointment_confirmed: {
    agent: "Perfekt, ich habe die SMS-Erinnerung für Sie eingerichtet. Sie erhalten alle Details auch noch per E-Mail. Haben Sie noch weitere Fragen zum Versicherungspaket oder zum Termin?",
    customer: "Nein, das war alles. Vielen Dank für Ihre Hilfe.",
    nextState: "conclusion",
    stateType: "question",
    systemMessage: "Der Termin wurde erfolgreich vereinbart. Fragen Sie, ob es noch weitere Anliegen gibt."
  },
  conclusion: {
    agent: "Gerne geschehen. Wir freuen uns auf Ihren Besuch am Dienstag. Sollten Sie vorab noch Fragen haben, können Sie uns jederzeit kontaktieren. Einen schönen Tag noch!",
    customer: "Vielen Dank, Ihnen auch einen schönen Tag!",
    nextState: "end",
    stateType: "info",
    systemMessage: "Das Gespräch kann abgeschlossen werden."
  },
  end: {
    agent: "Auf Wiederhören.",
    stateType: "info",
    systemMessage: "Gespräch beendet."
  }
};
