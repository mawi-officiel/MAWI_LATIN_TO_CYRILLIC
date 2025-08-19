// MAWI LATIN TO CYRILLIC - Background Service Worker
// Author: Ayoub Alarjani (MAWI MAN)
// Website: https://www.mawiman.com/

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('MAWI LATIN TO CYRILLIC Extension installed successfully!');
        
        // Set default settings
        chrome.storage.sync.set({
            'mawi_extension_enabled': true,
            'mawi_highlight_enabled': true,
            'mawi_warning_enabled': true,
            'mawi_conversion_mode': 'normal'
        });
        
        // Open welcome page
        chrome.tabs.create({
            url: 'https://mawi-officiel.github.io/MAWI_LATIN_TO_CYRILLIC/'
        });
    } else if (details.reason === 'update') {
        console.log('MAWI LATIN TO CYRILLIC Extension updated to version:', chrome.runtime.getManifest().version);
    }
    
    // Create context menu (moved here to avoid duplicate listeners)
    try {
        chrome.contextMenus.create({
            id: 'mawi-convert-selection',
            title: 'Convert to Cyrillic',
            contexts: ['selection']
        });
    } catch (error) {
        console.log('Context menu already exists or error creating:', error);
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will open the popup, but we can add additional logic here if needed
    console.log('MAWI Extension icon clicked on tab:', tab.url);
});

// Message handling from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getCyrillicCount':
            // Handle requests for Cyrillic character count
            sendResponse({ success: true });
            break;
            
        case 'getSettings':
            // Return current settings
            chrome.storage.sync.get([
                'mawi_extension_enabled',
                'mawi_highlight_enabled', 
                'mawi_warning_enabled',
                'mawi_conversion_mode'
            ], (result) => {
                sendResponse(result);
            });
            return true; // Keep message channel open for async response
            
        case 'updateSettings':
            // Update settings
            chrome.storage.sync.set(request.settings, () => {
                sendResponse({ success: true });
            });
            return true;
            
        case 'cyrillicDetected':
            // Handle Cyrillic detection notifications
            console.log('Cyrillic characters detected on:', sender.tab?.url);
            
            // Update badge to show detection
            chrome.action.setBadgeText({
                text: '!',
                tabId: sender.tab?.id
            });
            
            chrome.action.setBadgeBackgroundColor({
                color: '#e74c3c',
                tabId: sender.tab?.id
            });
            
            sendResponse({ success: true });
            break;
            
        case 'cyrillicCleared':
            // Clear badge when no Cyrillic characters
            chrome.action.setBadgeText({
                text: '',
                tabId: sender.tab?.id
            });
            
            sendResponse({ success: true });
            break;
            
        default:
            sendResponse({ error: 'Unknown action' });
    }
});

// Tab update handler to clear badges on navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        // Clear badge when page starts loading
        chrome.action.setBadgeText({
            text: '',
            tabId: tabId
        });
    }
});



// Context menu click handler
if (chrome.contextMenus && chrome.contextMenus.onClicked) {
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === 'mawi-convert-selection' && info.selectionText) {
            // Send message to content script to convert selected text
            chrome.tabs.sendMessage(tab.id, {
                action: 'convertSelection',
                text: info.selectionText
            }).catch((error) => {
                console.log('Error sending message to content script:', error);
            });
        }
    });
}

console.log('MAWI LATIN TO CYRILLIC Background Service Worker loaded successfully!');