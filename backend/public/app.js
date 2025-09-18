// app.js - front-end logic
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const liveBox = document.getElementById('liveBox');
const chatArea = document.getElementById('chatArea');
const langSelect = document.getElementById('langSelect');
const mascotSpeak = document.getElementById('mascotSpeak');

let recognition;
let finalTranscript = '';
let voices = [];

// ================= Chat UI =================
function addChat(message, who = 'system', extraClass = '') {
  const div = document.createElement('div');
  div.className = `chat-msg ${who} ${extraClass}`.trim();
  div.innerHTML = message;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// ================= Speech (TTS) =================
function speakText(text, lang) {
  if (!mascotSpeak.checked) return;
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(text);

    // Language mapping
    const langMap = { en: 'en-IN', hi: 'hi-IN', pa: 'pa-IN' };
    u.lang = langMap[lang] || 'en-IN';

    // Load voices
    voices = speechSynthesis.getVoices();

    // Pick specific voice per language
    let selectedVoice = null;
    if (lang === 'en') {
      selectedVoice = voices.find(v => v.name === "Google UK English Female");
    } else if (lang === 'hi' || lang === 'pa') {
      selectedVoice = voices.find(v => v.name === "Google हिन्दी");
    }

    // If fallback needed
    if (!selectedVoice) {
      selectedVoice =
        voices.find(v => v.lang === u.lang) ||
        voices.find(v => v.lang.startsWith(u.lang.split('-')[0])) ||
        voices[0];
    }

    if (selectedVoice) u.voice = selectedVoice;

    // Adjust quality
    u.rate = 0.9;
    u.pitch = 1.0;
    u.volume = 1.0;

    // Speak
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }
}

// ================= Speech Recognition (STT) =================
function setupRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    liveBox.textContent = 'SpeechRecognition not supported in your browser. You can type instead.';
    startBtn.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onresult = (evt) => {
    let interim = '';
    for (let i = evt.resultIndex; i < evt.results.length; ++i) {
      const transcript = evt.results[i][0].transcript;
      if (evt.results[i].isFinal) finalTranscript += transcript + ' ';
      else interim += transcript;
    }
    liveBox.textContent = (finalTranscript + interim).trim();
  };

  recognition.onerror = (e) => {
    console.error('Recognition error', e);
    addChat('<b>System:</b> Speech recognition error. Try again or type.', 'system');
  };

  recognition.onend = () => {
    stopBtn.disabled = true;
    startBtn.disabled = false;
    if (finalTranscript.trim()) submitTranscript(finalTranscript.trim(), langSelect.value);
  };
}

startBtn.addEventListener('click', () => {
  finalTranscript = '';
  liveBox.textContent = '🎤 Listening...';
  recognition.lang = langSelect.value;
  recognition.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
});

stopBtn.addEventListener('click', () => recognition.stop());
clearBtn.addEventListener('click', () => {
  finalTranscript = '';
  liveBox.textContent = '';
  chatArea.innerHTML = ''; // Clear chat
});

// ================= Submit to Backend =================
async function submitTranscript(text, lang) {
  addChat(`<b>You:</b> ${text}`, 'user');
  addChat('<b>System:</b> Analyzing symptoms...', 'system');

  // Map frontend lang to backend
  const langMapBackend = { en: 'English', hi: 'Hindi', pa: 'Punjabi' };
  const backendLang = langMapBackend[lang] || 'English';

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang: backendLang })
    });

    if (!res.ok) throw new Error('Server error');
    const data = await res.json();
    renderAnalysis(data, lang);
  } catch (err) {
    console.error(err);
    addChat('<b>System:</b> Failed to analyze. Try again later.', 'system');
  }
}

// ================= Render Analysis =================
function renderAnalysis(data, lang) {
  const { diagnoses = [], severity = 'low', advice = '', doctors = [] } = data;

  // Clear previous doctor cards
  document.querySelectorAll('.doctor-card').forEach(c => c.remove());

  // Multilingual advice
  const adviceMap = {
    en: advice || (severity === 'low' ? 'Rest, hydrate, and monitor your symptoms.' : 'Please consult a doctor as soon as possible.'),
    hi: advice || (severity === 'low' ? 'आराम करें, हाइड्रेट रहें, और लक्षणों पर नजर रखें।' : 'कृपया जल्द से जल्द डॉक्टर से सलाह लें।'),
    pa: advice || (severity === 'low' ? 'ਆਰਾਮ ਕਰੋ, ਪਾਣੀ ਪੀਓ ਅਤੇ ਲੱਛਣਾਂ \'ਤੇ ਨਜ਼ਰ ਰੱਖੋ।' : 'ਕਿਰਪਾ ਕਰਕੇ ਜਲਦੀ ਤੋਂ ਜਲਦੀ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।')
  };

  let html = `<b>Results (severity: ${severity.toUpperCase()}):</b><br/>`;
  if (diagnoses.length) {
    html += '<ol>';
    diagnoses.slice(0, 3).forEach(d => {
      const label = typeof d === 'string' ? d : d.label; // handle both formats
      html += `<li>${label}</li>`;
    });
    html += '</ol>';
  } else {
    html += '<p>No strong matches found.</p>';
  }
  html += `<div><b>Advice:</b> ${adviceMap[lang] || adviceMap.en}</div>`;
  addChat(html, 'system');

  // TTS
  speakText(
    `Severity: ${severity}. Possible conditions: ${diagnoses.join(', ')}. ${adviceMap[lang] || adviceMap.en}`,
    lang
  );

  if (severity === 'serious' && !doctors.length) fetchDoctors();
  if (doctors && doctors.length) renderDoctors(doctors);
}

// ================= Doctor Suggestions =================
async function fetchDoctors() {
  try {
    const res = await fetch('/api/doctors?q=general');
    if (!res.ok) throw new Error('Doctor service error');
    const doctors = await res.json();
    renderDoctors(doctors);
  } catch (err) {
    console.error(err);
    addChat('<b>System:</b> Could not fetch doctor suggestions.', 'system');
  }
}

function renderDoctors(doctors) {
  addChat('<b>Suggested doctors:</b>', 'system');
  doctors.forEach(doc => {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.innerHTML = `
      <div>
        <b>${doc.name}</b> — ${doc.specialty}<br/>
        ${doc.phone ? 'Contact: ' + doc.phone : ''} <br/>
        <a href="${doc.profile || '#'}" target="_blank">View profile</a>
        <button onclick="bookDoctor('${doc.id}')">Book</button>
        <button onclick="callNumber('${doc.phone}')">Call</button>
      </div>`;
    chatArea.appendChild(card);
  });
}

// ================= Doctor Actions =================
window.bookDoctor = function (docId) {
  alert('Booking flow — integrate with backend using doctor id: ' + docId);
};
window.callNumber = function (phone) {
  if (phone) window.location.href = `tel:${phone}`;
};

// ================= Init =================
setupRecognition();

// Ensure voices are loaded before first use
window.speechSynthesis.onvoiceschanged = () => {
  voices = speechSynthesis.getVoices();
  console.log("Voices loaded:", voices.map(v => v.name + " (" + v.lang + ")"));
};
