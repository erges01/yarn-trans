// src/offscreen.ts
import { YARN_GPT_KEY, YARN_GPT_URL } from './config.js'; // We won't use these, but keep the import so TS doesn't break

let recorder: MediaRecorder | null = null;
let isRecording = false;

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'INIT_STREAM') {
        startEchoTest(message.streamId);
    } else if (message.type === 'STOP_STREAM') {
        stopRecording();
    }
});

async function startEchoTest(streamId: string) {
    console.log("🚀 Starting ECHO TEST...");

    try {
        // 1. Capture the Tab Audio
        const media = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    chromeMediaSourceId: streamId
                }
            } as any,
            video: false
        });

        // 2. Setup Recorder
        const options = { mimeType: 'audio/webm;codecs=opus', bitsPerSecond: 16000 };
        recorder = new MediaRecorder(media, options);
        isRecording = true;

        // 3. When we get a chunk of audio, PLAY IT IMMEDIATELY
        recorder.ondataavailable = async (e) => {
            if (e.data.size > 0 && isRecording) {
                console.log(`🎤 Captured ${e.data.size} bytes. Playing back...`);
                await playAudio(e.data);
            }
        };

        recorder.start();
        
        // 4. Force a loop every 3 seconds so we hear chunks
        loopRecording();

    } catch (err) {
        chrome.runtime.sendMessage({ type: 'DEBUG_LOG', msg: `Capture Error: ${err}` });
    }
}

function loopRecording() {
    if (!recorder || !isRecording) return;
    setTimeout(() => {
        if (recorder && recorder.state === "recording") {
            recorder.stop(); // Stop triggers 'ondataavailable', which plays the sound
            setTimeout(() => {
                if (isRecording && recorder) {
                    recorder.start(); 
                    loopRecording(); 
                }
            }, 100);
        }
    }, 3000); // You will hear the audio repeat every 3 seconds
}

async function playAudio(blob: Blob) {
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    await audio.play();
}

function stopRecording() {
    isRecording = false;
    if (recorder) {
        recorder.stop();
        recorder = null;
    }
    console.log("🛑 Stopped.");
}