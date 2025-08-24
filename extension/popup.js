// extension/popup.js
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const dashboardBtn = document.getElementById('dashboardBtn');

let mediaRecorder;
let audioChunks = [];
let capturedStream;
let audioContext;
let tabInfo = {}; // To store the tab's title and icon

startBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const targetTab = tabs[0];
        if (!targetTab.url || targetTab.url.startsWith('chrome://')) {
            return alert('Cannot record on protected pages.');
        }
        
        // --- NEW: Store the tab info ---
        tabInfo = {
            title: targetTab.title,
            favIconUrl: targetTab.favIconUrl
        };
        // --------------------------------

        chrome.tabCapture.capture({ audio: true }, (stream) => {
            if (chrome.runtime.lastError || !stream) {
                return alert(`Error: ${chrome.runtime.lastError.message}`);
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
                sendAudioToServer(audioBlob);
                capturedStream.getTracks().forEach(track => track.stop());
                if(audioContext) audioContext.close();
            };
            
            mediaRecorder.start();
            
            startBtn.disabled = true;
            stopBtn.disabled = false;
            startBtn.textContent = "Recording...";
        });
    });
});

stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        startBtn.disabled = false;
        stopBtn.disabled = true;
        startBtn.textContent = "Start Recording";
    }
});

if (dashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'dashboard.html' });
    });
}

function sendAudioToServer(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'interview-audio.webm');
    // --- NEW: Add the stored tab info to the form data ---
    formData.append('videoTitle', tabInfo.title);
    formData.append('videoThumbnailUrl', tabInfo.favIconUrl);
    // ----------------------------------------------------
    
    fetch('http://localhost:4000/api/process-audio', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) return response.json().then(err => Promise.reject(err));
        return response.json();
    })
    .then(data => {
        console.log('✅ Full analysis received:', data);
        alert(`Analysis Complete!`);
    })
    .catch(error => {
        console.error('❌ Error sending audio:', error);
        alert(`An error occurred: ${error.error || 'Could not connect to server.'}`);
    });
}