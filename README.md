# AI-Powered Journal App

A personal journal application that uses AI to analyze your entries and detect your mood. Works entirely in your browser with no server required.

![App Screenshot](https://via.placeholder.com/800x600/4361ee/ffffff?text=AI+Journal+App+Screenshot)

## Features

- 📝 Write and save journal entries
- 🤖 AI-generated summaries of each entry
- 😊 Mood detection (happy, sad, neutral, anxious, excited, angry, calm)
- 📅 Timeline view of all entries
- 🔒 All data stays in your browser (localStorage)
- 📤 Export/import your entries as JSON
- 🎨 Clean, responsive interface

## How to Use

1. **Save your OpenAI API key** in the app (required for AI analysis)
2. **Write journal entries** - just type and click "Save Entry"
3. **View your timeline** - see all past entries with AI analysis
4. **Export/import** - backup your data or transfer between devices

## Setup

1. Get an OpenAI API key:
   - Sign up at [OpenAI](https://platform.openai.com/)
   - Go to "API keys" and create a new key
   - Add payment method (required even for free trial)

2. Deploy the app:
   - Option 1: Use on any web server (just upload the files)
   - Option 2: Deploy to GitHub Pages (see below)
   - Option 3: Use locally (just open index.html in a browser)

## GitHub Pages Deployment

1. Create a new GitHub repository
2. Upload all four files:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
3. Go to Settings > Pages
4. Select "Deploy from a branch" and choose "main" branch
5. Click "Save"
6. Your app will be live at `https://<username>.github.io/<repository>/`

## Privacy & Security

- 🔐 Your OpenAI API key is stored only in your browser's localStorage
- 📁 Journal entries never leave your device
- ⚠️ For complete privacy, use this app offline (no API key needed unless you want AI analysis)

## Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- OpenAI API key (for AI features)
- Internet connection (only for AI analysis)

## Troubleshooting

**AI analysis not working?**
- Check your OpenAI API key is correct
- Verify you have credits in your OpenAI account
- Ensure you're not blocking the OpenAI API with browser extensions

**Entries disappearing?**
- Browser localStorage is device-specific
- Export your entries regularly as backup
- Try not to clear browser data/cache

**Other issues?**
- Open browser developer tools (F12) and check for errors
- Refresh the page
- Try a different browser
