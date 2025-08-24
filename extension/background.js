// extension/background.js
let mediaRecorder;
let audioChunks = [];
let capturedStream;
let isRecording = false;
let audioContext;
let tabInfo = {}; // To store title and icon

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "start") {
        tabInfo = message.tabInfo; // Save tab info when starting
        startRecording(sendResponse);
    } else if (message.action === "stop") {
        stopRecording(sendResponse);
    } else if (message.action === "getState") {
        sendResponse({ isRecording: isRecording });
    }
    return true;
});

function startRecording(sendResponse) {
    isRecording = true;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabCapture.capture({ audio: true }, (stream) => {
            if (chrome.runtime.lastError || !stream) {
                isRecording = false;
                return sendResponse({ success: false, error: chrome.runtime.lastError.message });
            }
            capturedStream = stream;
            audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(audioContext.destination);
            mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunks = [];
            mediaRecorder.ondataavailable = (e) => e.data.size > 0 && audioChunks.push(e.data);
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                sendAudioToServer(audioBlob); // This will now have access to tabInfo
                capturedStream.getTracks().forEach(track => track.stop());
                audioContext.close();
                isRecording = false;
            };
            mediaRecorder.start();
            sendResponse({ success: true });
        });
    });
}

function stopRecording(sendResponse) {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        sendResponse({ success: true });
    } else {
        isRecording = false;
        sendResponse({ success: false, error: "Recorder was not running." });
    }
}

function sendAudioToServer(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'interview-audio.webm');
    // --- NEW: Add title and icon to the form data ---
    formData.append('videoTitle', tabInfo.title);
    formData.append('videoThumbnailUrl', tabInfo.favIconUrl);
    // ---------------------------------------------
    
    fetch('http://localhost:4000/api/process-audio', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => console.log('✅ Full analysis received:', data))
    .catch(error => console.error('❌ Error sending audio:', error));
}