// DOM elements
const apiKeyInput = document.getElementById('apiKeyInput');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const keySavedMessage = document.getElementById('keySavedMessage');
const journalEntry = document.getElementById('journalEntry');
const submitEntryBtn = document.getElementById('submitEntryBtn');
const formError = document.getElementById('formError');
const loadingIndicator = document.getElementById('loadingIndicator');
const timeline = document.getElementById('timeline');
const noEntriesMessage = document.getElementById('noEntriesMessage');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const clearBtn = document.getElementById('clearBtn');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  const savedKey = localStorage.getItem('openai_api_key');
  if (savedKey) {
    apiKeyInput.value = savedKey;
  }

  loadJournalEntries();

  saveKeyBtn.addEventListener('click', saveApiKey);
  submitEntryBtn.addEventListener('click', submitJournalEntry);
  exportBtn.addEventListener('click', exportEntries);
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', importEntries);
  clearBtn.addEventListener('click', confirmClearEntries);
});

function saveApiKey() {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    showError('Please enter an API key');
    return;
  }

  localStorage.setItem('openai_api_key', apiKey);
  showTemporaryMessage(keySavedMessage, 'API key saved successfully!');
}

async function submitJournalEntry() {
  const entryText = journalEntry.value.trim();
  if (!entryText) {
    showError('Please write something in your journal entry');
    return;
  }

  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    showError('Please enter and save your OpenAI API key');
    return;
  }

  submitEntryBtn.disabled = true;
  loadingIndicator.classList.remove('hidden');
  formError.classList.add('hidden');

  try {
    const { summary, mood } = await analyzeJournalEntry(entryText, apiKey);

    const newEntry = {
      id: Date.now(),
      text: entryText,
      summary,
      mood,
      createdAt: new Date().toISOString()
    };

    saveEntry(newEntry);
    journalEntry.value = '';
    loadJournalEntries();
  } catch (error) {
    console.error('Error:', error);
    showError(error.message);
  } finally {
    submitEntryBtn.disabled = false;
    loadingIndicator.classList.add('hidden');
  }
}

async function analyzeJournalEntry(text, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes journal entries. For the input journal text, return a JSON object in the following format:

{
  "summary": "[1-2 sentence summary]",
  "mood": "[happy, sad, neutral, anxious, excited, angry, calm]"
}

Only output valid JSON. Do not include any extra commentary or explanation.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to analyze journal entry');
  }

  const data = await response.json();
  const analysis = data.choices[0].message.content;

  let parsed;
  try {
    parsed = JSON.parse(analysis);
  } catch (e) {
    console.error('Raw AI response:', analysis);
    throw new Error('Could not parse JSON response from AI');
  }

  if (!parsed.summary || !parsed.mood) {
    throw new Error('Missing summary or mood in AI response');
  }

  return {
    summary: parsed.summary.trim(),
    mood: parsed.mood.trim().toLowerCase()
  };
}

function saveEntry(entry) {
  const entries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
  entries.unshift(entry);
  localStorage.setItem('journal_entries', JSON.stringify(entries));
}

function loadJournalEntries() {
  const entries = JSON.parse(localStorage.getItem('journal_entries') || '[]');

  if (entries.length === 0) {
    noEntriesMessage.classList.remove('hidden');
    timeline.innerHTML = '';
    return;
  }

  noEntriesMessage.classList.add('hidden');
  timeline.innerHTML = '';

  entries.forEach(entry => {
    const entryElement = createEntryElement(entry);
    timeline.appendChild(entryElement);
  });
}

function createEntryElement(entry) {
  const entryElement = document.createElement('div');
  entryElement.className = 'timeline-item';

  const date = new Date(entry.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  entryElement.innerHTML = `
    <div class="timeline-date">
      ${formattedDate}
      <button class="delete-entry" data-id="${entry.id}" title="Delete entry">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
    <div class="timeline-content">
      <div class="mood-badge mood-${entry.mood}">${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}</div>
      <p class="entry-text">${escapeHtml(entry.text)}</p>
      <p class="entry-summary"><strong>AI Analysis:</strong> ${escapeHtml(entry.summary)}</p>
    </div>
  `;

  const deleteBtn = entryElement.querySelector('.delete-entry');
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteEntry(entry.id);
  });

  return entryElement;
}

function deleteEntry(id) {
  if (!confirm('Are you sure you want to delete this entry?')) return;

  const entries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
  const filteredEntries = entries.filter(entry => entry.id !== id);
  localStorage.setItem('journal_entries', JSON.stringify(filteredEntries));
  loadJournalEntries();
}

function exportEntries() {
  const entries = JSON.parse(localStorage.getItem('journal_entries') || '[]');
  if (entries.length === 0) {
    alert('No entries to export');
    return;
  }

  const dataStr = JSON.stringify(entries, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  const exportName = `journal-entries-${new Date().toISOString().slice(0, 10)}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportName);
  linkElement.click();
}

function importEntries(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!confirm('Importing will replace all current entries. Continue?')) {
    importFile.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedEntries = JSON.parse(e.target.result);
      if (!Array.isArray(importedEntries)) {
        throw new Error('Invalid file format');
      }

      localStorage.setItem('journal_entries', JSON.stringify(importedEntries));
      loadJournalEntries();
      showTemporaryMessage(keySavedMessage, 'Entries imported successfully!');
    } catch (error) {
      console.error('Error importing entries:', error);
      showError('Failed to import entries. Invalid file format.');
    }
    importFile.value = '';
  };
  reader.readAsText(file);
}

function confirmClearEntries() {
  if (!confirm('Are you sure you want to delete ALL journal entries? This cannot be undone.')) return;

  localStorage.removeItem('journal_entries');
  loadJournalEntries();
  showTemporaryMessage(keySavedMessage, 'All entries have been deleted');
}

// Helper functions
function showError(message) {
  formError.textContent = message;
  formError.classList.remove('hidden');
  formError.scrollIntoView({ behavior: 'smooth' });
}

function showTemporaryMessage(element, message) {
  element.textContent = message;
  element.classList.remove('hidden');
  setTimeout(() => element.classList.add('hidden'), 3000);
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
