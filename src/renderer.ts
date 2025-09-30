/**
 * Voice Transcriber - Renderer Process
 * This file handles the UI interactions and microphone recording
 */

import './index.css';

// Global variables
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let isRecording = false;
let apiKeySet = false;

// DOM elements
const apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
const saveApiKeyBtn = document.getElementById('saveApiKey') as HTMLButtonElement;
const recordBtn = document.getElementById('recordBtn') as HTMLButtonElement;
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;
const transcriptionTextarea = document.getElementById('transcription') as HTMLTextAreaElement;
const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement;

// Utility functions
function updateStatus(message: string, className?: string) {
  statusDiv.textContent = message;
  statusDiv.className = 'status';
  if (className) {
    statusDiv.classList.add(className);
  }
}

function updateRecordButton(recording: boolean) {
  const recordIcon = recordBtn.querySelector('.record-icon') as HTMLSpanElement;
  const recordText = recordBtn.querySelector('.record-text') as HTMLSpanElement;
  
  if (recording) {
    recordIcon.textContent = '⏸️';
    recordText.textContent = 'Recording...';
    recordBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    recordIcon.textContent = '🎤';
    recordText.textContent = 'Start Recording';
    recordBtn.disabled = !apiKeySet;
    stopBtn.disabled = true;
  }
}

// Audio recording functions
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      } 
    });
    
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
      await processAudio(audioBlob);
      
      // Stop all tracks to release microphone
      stream.getTracks().forEach(track => track.stop());
    };
    
    mediaRecorder.start();
    isRecording = true;
    updateRecordButton(true);
    updateStatus('Recording... Click "Stop Recording" when finished', 'recording');
    
  } catch (error) {
    console.error('Error starting recording:', error);
    updateStatus('Error: Could not access microphone. Please check permissions.');
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    updateRecordButton(false);
    updateStatus('Processing audio...', 'processing');
  }
}

async function processAudio(audioBlob: Blob) {
  try {
    // Convert blob to ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Save audio file via IPC
    const saveResult = await window.electronAPI.saveAudioFile(arrayBuffer);
    
    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Failed to save audio file');
    }
    
    // Transcribe audio via IPC
    const transcribeResult = await window.electronAPI.transcribeAudio(saveResult.filePath!);
    
    if (!transcribeResult.success) {
      throw new Error(transcribeResult.error || 'Failed to transcribe audio');
    }
    
    // Display transcription
    transcriptionTextarea.value = transcribeResult.data || '';
    copyBtn.disabled = false;
    updateStatus('Transcription completed successfully!');
    
    // Auto-copy to clipboard
    await copyToClipboard();
    
  } catch (error) {
    console.error('Error processing audio:', error);
    updateStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
}

// API Key management
async function saveApiKey() {
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    updateStatus('Please enter your OpenAI API key');
    return;
  }
  
  try {
    saveApiKeyBtn.disabled = true;
    saveApiKeyBtn.textContent = 'Saving...';
    
    const result = await window.electronAPI.saveApiKey(apiKey);
    
    if (result.success) {
      apiKeySet = true;
      recordBtn.disabled = false;
      updateStatus('API key saved successfully! You can now start recording.');
      
      // Hide the API key for security
      apiKeyInput.type = 'password';
      saveApiKeyBtn.textContent = 'Update Key';
    } else {
      throw new Error(result.error || 'Failed to save API key');
    }
  } catch (error) {
    console.error('Error saving API key:', error);
    updateStatus(`Error: ${error instanceof Error ? error.message : 'Failed to save API key'}`);
  } finally {
    saveApiKeyBtn.disabled = false;
    if (!apiKeySet) {
      saveApiKeyBtn.textContent = 'Save Key';
    }
  }
}

// Clipboard functionality
async function copyToClipboard() {
  const text = transcriptionTextarea.value.trim();
  
  if (!text) {
    updateStatus('No text to copy');
    return;
  }
  
  try {
    const result = await window.electronAPI.copyToClipboard(text);
    
    if (result.success) {
      // Visual feedback
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✅ Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    } else {
      throw new Error(result.error || 'Failed to copy to clipboard');
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    updateStatus(`Error: ${error instanceof Error ? error.message : 'Failed to copy to clipboard'}`);
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // API Key events
  saveApiKeyBtn.addEventListener('click', saveApiKey);
  apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveApiKey();
    }
  });
  
  // Recording events
  recordBtn.addEventListener('click', startRecording);
  stopBtn.addEventListener('click', stopRecording);
  
  // Clipboard events
  copyBtn.addEventListener('click', copyToClipboard);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R to start/stop recording
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      if (isRecording) {
        stopRecording();
      } else if (apiKeySet) {
        startRecording();
      }
    }
    
    // Ctrl/Cmd + C to copy (when transcription textarea is focused)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === transcriptionTextarea) {
      e.preventDefault();
      copyToClipboard();
    }
  });
  
  console.log('🎤 Voice Transcriber initialized');
});
