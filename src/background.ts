// src/background.ts

// ... (keep the listener at the top the same) ...

async function startSystem(tabId: number, language: string) {
    // 1. Create Offscreen if it doesn't exist
    const existing = await chrome.runtime.getContexts({ 
        contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT] 
    });

    if (existing.length === 0) {
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: [chrome.offscreen.Reason.USER_MEDIA],
            justification: 'Live translation'
        });
    }

    // 2. Get Media ID
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tabId });

    // 3. WAIT for the offscreen to be ready (The Fix)
    setTimeout(() => {
        chrome.runtime.sendMessage({
            type: 'INIT_STREAM',
            streamId: streamId,
            language: language
        });
    }, 500); // Waited 500ms (half a second)
}