// Centralized UI translations for the introduction flow
// Document content is translated via the translate-document edge function;
// this file only covers static UI strings.

export type SupportedLanguage = "sv" | "en" | "pl" | "es";

export const ALL_SUPPORTED_LANGUAGES: SupportedLanguage[] = ["sv", "en", "pl", "es"];

const translations: Record<string, Record<SupportedLanguage, string>> = {
  // Header / phase labels
  "phase.language": { sv: "Välj språk", en: "Select language", pl: "Wybierz język", es: "Seleccionar idioma" },
  "phase.consent": { sv: "Samtycke", en: "Consent", pl: "Zgoda", es: "Consentimiento" },
  "phase.info": { sv: "Informationsblock", en: "Information", pl: "Informacje", es: "Información" },
  "phase.documents": { sv: "Dokument {current} av {total}", en: "Document {current} of {total}", pl: "Dokument {current} z {total}", es: "Documento {current} de {total}" },
  "phase.questions": { sv: "Kontrollfråga {current} av {total}", en: "Question {current} of {total}", pl: "Pytanie {current} z {total}", es: "Pregunta {current} de {total}" },
  "phase.register": { sv: "Registrera dig", en: "Register", pl: "Rejestracja", es: "Registro" },
  "phase.signature": { sv: "Digital signering", en: "Digital signature", pl: "Podpis cyfrowy", es: "Firma digital" },
  "phase.done": { sv: "Registrering klar", en: "Registration complete", pl: "Rejestracja zakończona", es: "Registro completado" },

  // Language selection
  "language.select": { sv: "Välj språk / Select language", en: "Select language", pl: "Wybierz język", es: "Seleccionar idioma" },

  // Info phase
  "info.title": { sv: "Projektinformation", en: "Project information", pl: "Informacje o projekcie", es: "Información del proyecto" },
  "info.confirm": { sv: "Jag har läst informationen", en: "I have read the information", pl: "Przeczytałem informacje", es: "He leído la información" },

  // Documents phase
  "doc.smartView": { sv: "Smart vy", en: "Smart view", pl: "Widok inteligentny", es: "Vista inteligente" },
  "doc.original": { sv: "Original", en: "Original", pl: "Oryginał", es: "Original" },
  "doc.viewOriginal": { sv: "Visa original", en: "View original", pl: "Zobacz oryginał", es: "Ver original" },
  "doc.confirmRead": { sv: "Bekräfta att jag läst", en: "Confirm that I have read", pl: "Potwierdzam przeczytanie", es: "Confirmo que he leído" },
  "doc.scrollHint": { sv: "Scrolla igenom hela dokumentet för att bekräfta läsning", en: "Scroll through the entire document to confirm reading", pl: "Przewiń cały dokument, aby potwierdzić przeczytanie", es: "Desplácese por todo el documento para confirmar la lectura" },
  "doc.searchPlaceholder": { sv: "Sök i dokument...", en: "Search document...", pl: "Szukaj w dokumencie...", es: "Buscar en documento..." },
  "doc.noText": { sv: "Ingen text tillgänglig.", en: "No text available.", pl: "Brak tekstu.", es: "Sin texto disponible." },
  "doc.generatingSmartView": { sv: "Smart vy genereras...", en: "Generating smart view...", pl: "Generowanie widoku...", es: "Generando vista inteligente..." },
  "doc.generatingWait": { sv: "Detta kan ta några sekunder", en: "This may take a few seconds", pl: "To może potrwać kilka sekund", es: "Esto puede tardar unos segundos" },
  "doc.extractionFailed": { sv: "Texten kunde inte extraheras", en: "Text could not be extracted", pl: "Nie udało się wyodrębnić tekstu", es: "No se pudo extraer el texto" },
  "doc.openOriginal": { sv: "Öppna originaldokumentet istället", en: "Open the original document instead", pl: "Otwórz oryginalny dokument", es: "Abra el documento original" },

  // Translation indicator
  "translate.translating": { sv: "Översätter till {lang}...", en: "Translating to {lang}...", pl: "Tłumaczenie na {lang}...", es: "Traduciendo a {lang}..." },
  "translate.autoTranslated": { sv: "Automatiskt översatt", en: "Automatically translated", pl: "Automatycznie przetłumaczono", es: "Traducido automáticamente" },
  "translate.fallback": { sv: "Dokumentet visas på originalspråket (svenska)", en: "Document displayed in original language (Swedish)", pl: "Dokument wyświetlany w oryginalnym języku (szwedzki)", es: "Documento mostrado en idioma original (sueco)" },

  // Document category badges
  "cat.arbetsmiljoplan": { sv: "KMA-Plan", en: "KMA Plan", pl: "Plan KMA", es: "Plan KMA" },
  "cat.ordningsregler": { sv: "Ordningsregler", en: "Rules & regulations", pl: "Zasady porządkowe", es: "Normas de orden" },
  "cat.skyddsorganisation": { sv: "Skyddsorganisation", en: "Safety organization", pl: "Organizacja bezpieczeństwa", es: "Organización de seguridad" },
  "cat.kontaktlista": { sv: "Kontaktlista", en: "Contact list", pl: "Lista kontaktów", es: "Lista de contactos" },
  "cat.checklista_nodlage": { sv: "Checklista nödläge", en: "Emergency checklist", pl: "Lista kontrolna sytuacji awaryjnych", es: "Lista de verificación de emergencias" },
  "cat.nodsituation": { sv: "Nödsituation", en: "Emergency", pl: "Sytuacja awaryjna", es: "Emergencia" },
  "cat.apd_plan": { sv: "APD-plan", en: "APD plan", pl: "Plan APD", es: "Plan APD" },

  // Questions phase
  "question.title": { sv: "Kontrollfråga", en: "Control question", pl: "Pytanie kontrolne", es: "Pregunta de control" },
  "question.answer": { sv: "Svara", en: "Answer", pl: "Odpowiedz", es: "Responder" },
  "question.correct": { sv: "Rätt svar!", en: "Correct!", pl: "Poprawna odpowiedź!", es: "¡Correcto!" },
  "question.wrong": { sv: "Fel svar! Försök igen.", en: "Wrong answer! Try again.", pl: "Błędna odpowiedź! Spróbuj ponownie.", es: "¡Respuesta incorrecta! Inténtalo de nuevo." },
  "question.wrongHint": { sv: "Läs igenom dokumentet igen och försök på nytt.", en: "Read through the document again and try again.", pl: "Przeczytaj dokument ponownie i spróbuj jeszcze raz.", es: "Lee el documento de nuevo e inténtalo otra vez." },
  "question.backToDocument": { sv: "Gå tillbaka till dokumentet", en: "Go back to document", pl: "Wróć do dokumentu", es: "Volver al documento" },
  "question.true": { sv: "Ja", en: "Yes", pl: "Tak", es: "Sí" },
  "question.false": { sv: "Nej", en: "No", pl: "Nie", es: "No" },

  // Register phase
  "register.title": { sv: "Registrera dig", en: "Register", pl: "Zarejestruj się", es: "Regístrate" },
  "register.name": { sv: "Namn", en: "Name", pl: "Imię i nazwisko", es: "Nombre" },
  "register.namePlaceholder": { sv: "Ditt fullständiga namn", en: "Your full name", pl: "Twoje pełne imię i nazwisko", es: "Tu nombre completo" },
  "register.company": { sv: "Företag", en: "Company", pl: "Firma", es: "Empresa" },
  "register.companyPlaceholder": { sv: "Ditt företag", en: "Your company", pl: "Twoja firma", es: "Tu empresa" },
  "register.phone": { sv: "Telefon", en: "Phone", pl: "Telefon", es: "Teléfono" },
  "register.phoneOptional": { sv: "valfri", en: "optional", pl: "opcjonalnie", es: "opcional" },
  "register.phonePlaceholder": { sv: "Ditt telefonnummer", en: "Your phone number", pl: "Twój numer telefonu", es: "Tu número de teléfono" },
  "register.continue": { sv: "Fortsätt till signering", en: "Continue to signing", pl: "Przejdź do podpisu", es: "Continuar a la firma" },
  "register.loading": { sv: "Registrerar...", en: "Registering...", pl: "Rejestrowanie...", es: "Registrando..." },

  // Signature phase
  "signature.title": { sv: "Digital signering", en: "Digital signature", pl: "Podpis cyfrowy", es: "Firma digital" },
  "signature.sign": { sv: "Signera", en: "Sign", pl: "Podpisz", es: "Firmar" },
  "signature.signing": { sv: "Signerar...", en: "Signing...", pl: "Podpisywanie...", es: "Firmando..." },
  "signature.drawFirst": { sv: "Rita din signatur först", en: "Draw your signature first", pl: "Najpierw narysuj swój podpis", es: "Primero dibuja tu firma" },
  "signature.complete": { sv: "Signering slutförd!", en: "Signing complete!", pl: "Podpisano pomyślnie!", es: "¡Firma completada!" },

  // OTP verification
  "otp.verifyTitle": { sv: "Verifiera telefonnummer", en: "Verify phone number", pl: "Zweryfikuj numer telefonu", es: "Verificar número de teléfono" },
  "otp.codeSent": { sv: "Vi skickar en kod till ditt telefonnummer", en: "We send a code to your phone number", pl: "Wysyłamy kod na Twój numer telefonu", es: "Enviamos un código a tu número de teléfono" },
  "otp.sendCode": { sv: "Skicka kod", en: "Send code", pl: "Wyślij kod", es: "Enviar código" },
  "otp.sending": { sv: "Skickar...", en: "Sending...", pl: "Wysyłanie...", es: "Enviando..." },
  "otp.enterCode": { sv: "Ange kod", en: "Enter code", pl: "Wprowadź kod", es: "Ingresa el código" },
  "otp.verify": { sv: "Verifiera", en: "Verify", pl: "Weryfikuj", es: "Verificar" },
  "otp.verifying": { sv: "Verifierar...", en: "Verifying...", pl: "Weryfikacja...", es: "Verificando..." },
  "otp.changePhone": { sv: "Ändra telefonnummer", en: "Change phone number", pl: "Zmień numer telefonu", es: "Cambiar número de teléfono" },
  "otp.wrongCode": { sv: "Felaktig kod", en: "Incorrect code", pl: "Nieprawidłowy kod", es: "Código incorrecto" },
  "otp.phoneTooShort": { sv: "Telefonnummer måste vara minst 10 siffror", en: "Phone number must be at least 10 digits", pl: "Numer telefonu musi mieć co najmniej 10 cyfr", es: "El número de teléfono debe tener al menos 10 dígitos" },
  "otp.sendFailed": { sv: "Kunde inte skicka kod", en: "Could not send code", pl: "Nie można wysłać kodu", es: "No se pudo enviar el código" },
  "otp.verified": { sv: "Verifierat telefonnummer", en: "Verified phone number", pl: "Zweryfikowany numer telefonu", es: "Número de teléfono verificado" },

  // Done phase
  "done.previewTitle": { sv: "Förhandsvisning klar!", en: "Preview complete!", pl: "Podgląd zakończony!", es: "¡Vista previa completada!" },
  "done.title": { sv: "Tack för att du tagit del av dokumenten", en: "Thank you for reviewing the documents", pl: "Dziękujemy za zapoznanie się z dokumentami", es: "Gracias por revisar los documentos" },
  "done.previewSubtitle": { sv: "Ingen data sparades. Du kan stänga denna flik.", en: "No data was saved. You can close this tab.", pl: "Żadne dane nie zostały zapisane. Możesz zamknąć tę kartę.", es: "No se guardaron datos. Puedes cerrar esta pestaña." },
  "done.subtitle": { sv: "{name} – din signering har registrerats.", en: "{name} – your signature has been registered.", pl: "{name} – Twój podpis został zarejestrowany.", es: "{name} – tu firma ha sido registrada." },
  "done.count": { sv: "{count} person har registrerats på denna enhet", en: "{count} person registered on this device", pl: "{count} osoba zarejestrowana na tym urządzeniu", es: "{count} persona registrada en este dispositivo" },
  "done.countPlural": { sv: "{count} personer har registrerats på denna enhet", en: "{count} people registered on this device", pl: "{count} osób zarejestrowanych na tym urządzeniu", es: "{count} personas registradas en este dispositivo" },
  "done.nextPerson": { sv: "Registrera nästa person", en: "Register next person", pl: "Zarejestruj następną osobę", es: "Registrar siguiente persona" },
  "done.viewDocuments": { sv: "Visa dokument", en: "View documents", pl: "Zobacz dokumenty", es: "Ver documentos" },
  "done.finish": { sv: "Avsluta", en: "Finish", pl: "Zakończ", es: "Finalizar" },

  // Preview banner
  "preview.banner": { sv: "Förhandsvisning – inga signeringar sparas", en: "Preview – no signatures are saved", pl: "Podgląd – podpisy nie są zapisywane", es: "Vista previa – no se guardan firmas" },

  // Misc
  "noContactsMatch": { sv: "Inga kontakter matchar sökningen.", en: "No contacts match the search.", pl: "Brak pasujących kontaktów.", es: "No hay contactos que coincidan." },
  "noCrisesMatch": { sv: "Inga kriser matchar sökningen.", en: "No crises match the search.", pl: "Brak pasujących kryzysów.", es: "No hay crisis que coincidan." },

  // Admin invitation
  "invite.title": { sv: "Bjud in administratör", en: "Invite administrator", pl: "Zaproś administratora", es: "Invitar administrador" },
  "invite.send": { sv: "Skicka inbjudan", en: "Send invitation", pl: "Wyślij zaproszenie", es: "Enviar invitación" },
  "invite.sent": { sv: "Inbjudan skickad", en: "Invitation sent", pl: "Zaproszenie wysłane", es: "Invitación enviada" },
  "invite.accept": { sv: "Acceptera inbjudan", en: "Accept invitation", pl: "Akceptuj zaproszenie", es: "Aceptar invitación" },
  "invite.enterPassword": { sv: "Ange ditt nya lösenord", en: "Enter your new password", pl: "Wprowadź nowe hasło", es: "Ingrese su nueva contraseña" },
  "invite.invalid": { sv: "Ogiltig inbjudan", en: "Invalid invitation", pl: "Niepoprawne zaproszenie", es: "Invitación inválida" },
  "invite.createAccount": { sv: "Skapa konto", en: "Create account", pl: "Utwórz konto", es: "Crear cuenta" },

  // Consent phase
  "consent.title": { sv: "Samtycke till databehandling", en: "Consent to data processing", pl: "Zgoda na przetwarzanie danych", es: "Consentimiento para el tratamiento de datos" },
  "consent.dataCollected": { sv: "Vilka uppgifter samlar vi in?", en: "What data do we collect?", pl: "Jakie dane zbieramy?", es: "¿Qué datos recopilamos?" },
  "consent.dataCollectedText": { sv: "Namn, telefonnummer, e-postadress (om angiven), signatur, samt information om vilka dokument du läst och besvarat.", en: "Name, phone number, email address (if provided), signature, and information about which documents you have read and answered.", pl: "Imię i nazwisko, numer telefonu, adres e-mail (jeśli podany), podpis oraz informacje o dokumentach, które przeczytałeś i na które odpowiedziałeś.", es: "Nombre, número de teléfono, dirección de correo electrónico (si se proporciona), firma e información sobre los documentos que has leído y respondido." },
  "consent.retention": { sv: "Hur länge sparas uppgifterna?", en: "How long is data retained?", pl: "Jak długo przechowywane są dane?", es: "¿Cuánto tiempo se conservan los datos?" },
  "consent.retentionText": { sv: "Uppgifter sparas i 2 år efter projektets slutdatum eller enligt gällande lagkrav.", en: "Data is retained for 2 years after the project end date or according to applicable law.", pl: "Dane są przechowywane przez 2 lata po zakończeniu projektu lub zgodnie z obowiązującymi przepisami.", es: "Los datos se conservan durante 2 años después de la fecha de finalización del proyecto o de acuerdo con la legislación aplicable." },
  "consent.controller": { sv: "Personuppgiftsansvarig", en: "Data controller", pl: "Administrator danych", es: "Responsable del tratamiento" },
  "consent.controllerText": { sv: "Digital Arbetstavla AB, 556123-4567, Byggvägen 1, 111 22 Stockholm", en: "Digital Arbetstavla AB, 556123-4567, Byggvägen 1, 111 22 Stockholm", pl: "Digital Arbetstavla AB, 556123-4567, Byggvägen 1, 111 22 Stockholm", es: "Digital Arbetstavla AB, 556123-4567, Byggvägen 1, 111 22 Stockholm" },
  "consent.rights": { sv: "Dina rättigheter", en: "Your rights", pl: "Twoje prawa", es: "Tus derechos" },
  "consent.rightsText": { sv: "Du har rätt att få tillgång till, rätta eller radera dina personuppgifter. Kontakta oss för att utöva dina rättigheter.", en: "You have the right to access, correct or delete your personal data. Contact us to exercise your rights.", pl: "Masz prawo do dostępu, sprostowania lub usunięcia swoich danych osobowych. Skontaktuj się z nami, aby skorzystać z swoich praw.", es: "Tienes derecho a acceder, corregir o eliminar tus datos personales. Contáctanos para ejercer tus derechos." },
  "consent.privacyPolicy": { sv: "Fullständig integritetspolicy", en: "Full privacy policy", pl: "Pełna polityka prywatności", es: "Política de privacidad completa" },
  "consent.privacyPolicyLink": { sv: "Läs vår fullständiga integritetspolicy", en: "Read our full privacy policy", pl: "Przeczytaj naszą pełną politykę prywatności", es: "Lee nuestra política de privacidad completa" },
  "consent.acceptTerms": { sv: "Jag samtycker till att mina uppgifter behandlas enligt ovan", en: "I consent to my data being processed as described above", pl: "Wyrażam zgodę na przetwarzanie moich danych zgodnie z powyższym", es: "Consiento el tratamiento de mis datos como se describe anteriormente" },
  "consent.accept": { sv: "Jag samtycker", en: "I consent", pl: "Wyrażam zgodę", es: "Consiento" },
  "consent.decline": { sv: "Jag samtycker inte", en: "I do not consent", pl: "Nie wyrażam zgody", es: "No consiento" },
};

/**
 * Get a translated string. Supports {placeholder} interpolation.
 */
export function t(key: string, lang: SupportedLanguage = "sv", params?: Record<string, string | number>): string {
  const entry = translations[key];
  let str = entry?.[lang] ?? entry?.["sv"] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return str;
}

/**
 * Get localized category badge text
 */
export function getCategoryLabel(category: string, lang: SupportedLanguage): string {
  const key = `cat.${category}`;
  return t(key, lang) !== key ? t(key, lang) : category;
}
