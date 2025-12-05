document.addEventListener('DOMContentLoaded', async () => {
    const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
    const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
    const statusText = document.getElementById('statusText') as HTMLDivElement;
    const langSelect = document.getElementById('language') as HTMLSelectElement;
    
    // Check if running
    const data = await chrome.storage.local.get('isRecording');
    if (data.isRecording) showRunningState();

    startBtn.addEventListener('click', async () => {
        const language = langSelect.value;
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tabs[0]?.id) {
            chrome.runtime.sendMessage({ 
                type: 'START_TRANSLATION', 
                language: language,
                tabId: tabs[0].id 
            });
            showRunningState();
            window.close();
        }
    });

    stopBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'STOP_TRANSLATION' });
        showStoppedState();
    });

    function showRunningState() {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        statusText.innerText = "🔴 Live & Translating...";
        statusText.style.color = "red";
    }

    function showStoppedState() {
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        statusText.innerText = "Ready to connect...";
        statusText.style.color = "#666";
    }
});