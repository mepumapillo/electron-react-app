// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  saveApiKey: (apiKey: string) => ipcRenderer.invoke('save-api-key', apiKey),
  transcribeAudio: (audioFilePath: string) => ipcRenderer.invoke('transcribe-audio', audioFilePath),
  copyToClipboard: (text: string) => ipcRenderer.invoke('copy-to-clipboard', text),
  saveAudioFile: (audioBuffer: ArrayBuffer) => ipcRenderer.invoke('save-audio-file', audioBuffer),
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      saveApiKey: (apiKey: string) => Promise<{ success: boolean; error?: string }>;
      transcribeAudio: (audioFilePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
      copyToClipboard: (text: string) => Promise<{ success: boolean; error?: string }>;
      saveAudioFile: (audioBuffer: ArrayBuffer) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    };
  }
}
