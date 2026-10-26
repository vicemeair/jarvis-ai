```javascript
const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const messages = document.getElementById("messages");
const voiceButton = document.getElementById("voiceButton");
const statusText = document.getElementById("status");
const core = document.getElementById("core");

const API_URL = "https://jarvis-proxy.emeryroussel38.workers.dev";

let history = [];
let busy = false;

function addMessage(sender, text, className) {
  const message = document.createElement("div");
  message.className = `message ${className}`;

  const label = document.createElement("span");
  label.className = "sender";
  label.textContent = sender;

  const content = document.createElement("div");
  content.textContent = text;

  message.append(label, content);
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 1;
  utterance.pitch = 0.9;

  const voices = window.speechSynthesis.getVoices();
  const frenchVoice = voices.find(v =>
    v.lang.toLowerCase().startsWith("fr")
  );

  if (frenchVoice) utterance.voice = frenchVoice;

  window.speechSynthesis.speak(utterance);
}

async function processMessage(text) {
  const cleanText = text.trim();

  if (!cleanText || busy) return;

  busy = true;
  input.disabled = true;
  statusText.textContent = "Connexion au cerveau de J.A.R.V.I.S...";
  core.classList.add("active");

  addMessage("VOUS", cleanText, "user-message");

  history.push({
    role: "user",
    content: cleanText
  });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: history.slice(-20)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Erreur HTTP ${response.status}`);
    }

    if (!data.reply) {
      throw new Error("Le serveur n'a renvoyé aucune réponse.");
    }

    history.push({
      role: "assistant",
      content: data.reply
    });

    addMessage("J.A.R.V.I.S.", data.reply, "jarvis-message");
    statusText.textContent = "Systèmes opérationnels.";
    speak(data.reply);

  } catch (error) {
    console.error("Erreur J.A.R.V.I.S. :", error);

    addMessage(
      "SYSTÈME",
      "Impossible de contacter mon intelligence artificielle. " +
      "Vérifiez le Worker et sa configuration. Détail : " +
      error.message,
      "jarvis-message"
    );

    statusText.textContent = "Erreur de connexion.";
  } finally {
    busy = false;
    input.disabled = false;
    core.classList.remove("active");
    input.focus();
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const text = input.value;
  if (!text.trim() || busy) return;

  input.value = "";
  processMessage(text);
});

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "fr-FR";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    voiceButton.textContent = "🔴 J'ÉCOUTE...";
    statusText.textContent = "Je vous écoute.";
  };

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    processMessage(transcript);
  };

  recognition.onerror = event => {
    statusText.textContent =
      "Micro indisponible : " + event.error;
  };

  recognition.onend = () => {
    voiceButton.textContent = "🎙️ PARLER À J.A.R.V.I.S.";
  };

} else {
  voiceButton.textContent = "🎙️ MICRO INDISPONIBLE";
}

voiceButton.addEventListener("click", () => {
  if (!recognition) {
    statusText.textContent =
      "La reconnaissance vocale n'est pas disponible dans ce navigateur.";
    return;
  }

  try {
    recognition.start();
  } catch (error) {
    statusText.textContent = "Réessayez dans un instant.";
  }
});

console.log("J.A.R.V.I.S. connecté à son interface.");
```
