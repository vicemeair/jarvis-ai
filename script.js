```javascript
const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const messages = document.getElementById("messages");
const voiceButton = document.getElementById("voiceButton");
const statusText = document.getElementById("status");
const core = document.getElementById("core");

// Mémoire locale de la conversation
let history = [];

function addMessage(sender, text, className) {
  const message = document.createElement("div");
  message.className = `message ${className}`;

  const label = document.createElement("span");
  label.className = "sender";
  label.textContent = sender;

  const content = document.createElement("div");
  content.textContent = text;

  message.appendChild(label);
  message.appendChild(content);
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    statusText.textContent = "Synthèse vocale non disponible.";
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 1;
  utterance.pitch = 0.9;

  const voices = window.speechSynthesis.getVoices();
  const frenchVoice = voices.find(voice =>
    voice.lang.toLowerCase().startsWith("fr")
  );

  if (frenchVoice) utterance.voice = frenchVoice;

  window.speechSynthesis.speak(utterance);
}

function replyTo(text) {
  const message = text.toLowerCase().trim();
  let response;

  if (message.includes("bonjour") || message.includes("salut")) {
    response = "Bonjour ! Je suis J.A.R.V.I.S., votre assistant personnel.";
  } else if (message.includes("ton nom") || message.includes("qui es-tu")) {
    response = "Je suis J.A.R.V.I.S., votre assistant personnel expérimental.";
  } else if (message.includes("heure")) {
    response = "Il est " + new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    }) + ".";
  } else if (message.includes("date")) {
    response = "Nous sommes le " + new Date().toLocaleDateString("fr-FR") + ".";
  } else if (message.includes("merci")) {
    response = "Avec plaisir. Je reste à votre disposition.";
  } else if (message.includes("comment ça va")) {
    response = "Tous mes systèmes fonctionnent normalement.";
  } else if (message.includes("aide")) {
    response = "Je peux vous donner l'heure, la date et répondre à quelques commandes simples. Mon intelligence artificielle avancée reste à connecter.";
  } else {
    response = "J'ai bien reçu votre message. Pour le moment, mon intelligence est limitée. La prochaine étape sera de connecter un véritable modèle d'intelligence artificielle.";
  }

  return response;
}

function processMessage(text) {
  const cleanText = text.trim();
  if (!cleanText) return;

  addMessage("VOUS", cleanText, "user-message");
  history.push({ role: "user", content: cleanText });

  statusText.textContent = "Analyse de votre demande...";
  core.classList.add("active");

  const response = replyTo(cleanText);

  setTimeout(() => {
    addMessage("J.A.R.V.I.S.", response, "jarvis-message");
    history.push({ role: "assistant", content: response });

    statusText.textContent = "Systèmes opérationnels.";
    core.classList.remove("active");
    speak(response);
  }, 500);
}

form.addEventListener("submit", event => {
  event.preventDefault();
  processMessage(input.value);
  input.value = "";
});

let recognition = null;
let listening = false;

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "fr-FR";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    listening = true;
    voiceButton.textContent = "🔴 J'ÉCOUTE...";
    statusText.textContent = "Je vous écoute.";
  };

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    processMessage(transcript);
  };

  recognition.onerror = () => {
    statusText.textContent = "Micro indisponible ou écoute interrompue.";
  };

  recognition.onend = () => {
    listening = false;
    voiceButton.textContent = "🎙️ PARLER À J.A.R.V.I.S.";
  };
} else {
  voiceButton.textContent = "🎙️ VOIX NON DISPONIBLE";
}

voiceButton.addEventListener("click", () => {
  if (!recognition) {
    statusText.textContent = "Essayez Chrome et autorisez le micro.";
    return;
  }

  if (listening) {
    recognition.stop();
  } else {
    try {
      recognition.start();
    } catch (error) {
      statusText.textContent = "Veuillez réessayer dans un instant.";
    }
  }
});

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {};
}

console.log("J.A.R.V.I.S. initialisé.");
```

