# Voice Transcriber

A desktop application for recording audio and transcribing it to text using OpenAI Whisper API. Built with Electron, TypeScript, and modern web technologies.

## Features

- 🎤 **Audio Recording**: High-quality microphone recording with noise suppression
- 🤖 **AI Transcription**: Powered by OpenAI's Whisper model for accurate speech-to-text
- 📋 **Clipboard Integration**: Automatically copies transcribed text to clipboard
- 🔐 **Secure API Key Storage**: Safely stores your OpenAI API key
- ⌨️ **Keyboard Shortcuts**: Quick access with Ctrl/Cmd + R to record
- 🎨 **Modern UI**: Beautiful, responsive interface with gradient design

## Prerequisites

- Node.js (v16 or higher)
- OpenAI API key (get one at [OpenAI Platform](https://platform.openai.com/api-keys))

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. **Start the application:**
   ```bash
   npm start
   ```

2. **Set up your API key:**
   - Enter your OpenAI API key in the input field
   - Click "Save Key" to store it securely

3. **Record and transcribe:**
   - Click "Start Recording" or press `Ctrl/Cmd + R`
   - Speak into your microphone
   - Click "Stop Recording" when finished
   - The transcribed text will appear automatically and be copied to your clipboard

## Keyboard Shortcuts

- `Ctrl/Cmd + R`: Start/Stop recording
- `Ctrl/Cmd + C`: Copy transcription to clipboard (when textarea is focused)

## Building for Production

To package the app for distribution:

```bash
npm run make
```

This will create distributable packages in the `out` directory.

## Technical Details

- **Frontend**: HTML, CSS, TypeScript
- **Backend**: Electron main process with Node.js
- **Audio Processing**: Web Audio API with MediaRecorder
- **AI Service**: OpenAI Whisper API
- **Build System**: Vite + Electron Forge

## Security

- API keys are stored securely in memory only
- Audio files are temporarily saved and automatically deleted after transcription
- No data is stored permanently on disk

## License

MIT License - see LICENSE file for details
