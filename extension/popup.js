// MAWI LATIN TO CYRILLIC - Popup Script
// Author: Ayoub Alarjani (MAWI MAN)
// Website: https://www.mawiman.com/

(function() {
    'use strict';
    
    // Language translations
    const translations = {
        en: {
            detectionResults: 'Detection results will appear here...',
            enterText: 'Please enter some text to convert.',
            textConverted: 'Text converted successfully!',
            noTextToCopy: 'No text to copy. Please convert some text first.',
            textCopied: 'Text copied to clipboard!',
            copyFailed: 'Failed to copy text. Please try again.',
            cyrillicDetected: '⚠️ Cyrillic characters detected in input!',
            checkIcon: 'check_circle',
            warningIcon: 'warning'
        },
        ar: {
            detectionResults: 'ستظهر نتائج الكشف هنا...',
            enterText: 'يرجى إدخال نص للتحويل.',
            textConverted: 'تم تحويل النص بنجاح!',
            noTextToCopy: 'لا يوجد نص للنسخ. يرجى تحويل النص أولاً.',
            textCopied: 'تم نسخ النص إلى الحافظة!',
            copyFailed: 'فشل في نسخ النص. يرجى المحاولة مرة أخرى.',
            cyrillicDetected: '⚠️ تم اكتشاف أحرف سيريلية في النص!',
            checkIcon: 'check_circle',
            warningIcon: 'warning'
        }
    };
    
    // Current language
    let currentLanguage = 'en';
    
    // Latin to Cyrillic conversion mappings
    const normalMapping = {
        'a': 'а', 'b': 'б', 'c': 'ц', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х',
        'i': 'и', 'j': 'ј', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п',
        'q': 'к', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'в', 'x': 'х',
        'y': 'у', 'z': 'з',
        'A': 'А', 'B': 'Б', 'C': 'Ц', 'D': 'Д', 'E': 'Е', 'F': 'Ф', 'G': 'Г', 'H': 'Х',
        'I': 'И', 'J': 'Ј', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П',
        'Q': 'К', 'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У', 'V': 'В', 'W': 'В', 'X': 'Х',
        'Y': 'У', 'Z': 'З'
    };
    
    const professionalMapping = {
        'a': 'а', 'c': 'с', 'e': 'е', 'o': 'о', 'p': 'р', 'x': 'х', 'y': 'у',
        'A': 'А', 'B': 'В', 'C': 'С', 'E': 'Е', 'H': 'Н', 'K': 'К', 'M': 'М',
        'O': 'О', 'P': 'Р', 'T': 'Т', 'X': 'Х', 'Y': 'У'
    };
    
    // DOM elements
    let inputText, outputText, convertBtn, copyBtn, statusDiv;
    let detectionToggle, highlightToggle, warningToggle;
    let languageToggle, languageText;
    
    /**
     * Initialize popup
     */
    function init() {
        // Get DOM elements
        inputText = document.getElementById('inputText');
        outputText = document.getElementById('outputText');
        convertBtn = document.getElementById('convertBtn');
        copyBtn = document.getElementById('copyBtn');
        statusDiv = document.getElementById('status');
        
        detectionToggle = document.getElementById('detectionToggle');
        highlightToggle = document.getElementById('highlightToggle');
        warningToggle = document.getElementById('warningToggle');
        
        languageToggle = document.getElementById('languageToggle');
        languageText = document.getElementById('languageText');
        
        // Add event listeners
        convertBtn.addEventListener('click', convertText);
        copyBtn.addEventListener('click', copyToClipboard);
        languageToggle.addEventListener('click', toggleLanguage);
        
        // Toggle event listeners
        detectionToggle.addEventListener('click', () => toggleSetting('mawi_extension_enabled', detectionToggle));
        highlightToggle.addEventListener('click', () => toggleSetting('mawi_highlight_enabled', highlightToggle));
        warningToggle.addEventListener('click', () => toggleSetting('mawi_warning_enabled', warningToggle));
        
        // Input text change listener for real-time Cyrillic detection
        inputText.addEventListener('input', detectCyrillicInInput);
        
        // Load saved settings and language
        loadSettings();
        loadLanguage();
        
        console.log('MAWI Popup initialized');
    }
    
    /**
     * Toggle language between English and Arabic
     */
    function toggleLanguage() {
        currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
        updateLanguage();
        saveLanguage();
    }
    
    /**
     * Update UI language
     */
    function updateLanguage() {
        const body = document.body;
        const isArabic = currentLanguage === 'ar';
        
        // Update HTML attributes
        body.setAttribute('dir', isArabic ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', currentLanguage);
        
        // Update language toggle text
        languageText.textContent = isArabic ? 'English' : 'العربية';
        
        // Update all elements with data attributes
        const elementsWithTranslations = document.querySelectorAll('[data-en], [data-ar]');
        elementsWithTranslations.forEach(element => {
            const key = `data-${currentLanguage}`;
            if (element.hasAttribute(key)) {
                element.textContent = element.getAttribute(key);
            }
        });
        
        // Update placeholders
        const elementsWithPlaceholders = document.querySelectorAll('[data-placeholder-en], [data-placeholder-ar]');
        elementsWithPlaceholders.forEach(element => {
            const key = `data-placeholder-${currentLanguage}`;
            if (element.hasAttribute(key)) {
                element.setAttribute('placeholder', element.getAttribute(key));
            }
        });
        
        // Update detector output if it has default text
        const detectorOutput = document.getElementById('detectorOutput');
        if (detectorOutput && detectorOutput.textContent.includes('Detection results') || detectorOutput.textContent.includes('ستظهر نتائج')) {
            detectorOutput.textContent = translations[currentLanguage].detectionResults;
        }
    }
    
    /**
     * Save language preference
     */
    function saveLanguage() {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.set({ 'mawi_language': currentLanguage });
        }
    }
    
    /**
     * Load language preference
     */
    function loadLanguage() {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get(['mawi_language'], (result) => {
                currentLanguage = result.mawi_language || 'en';
                updateLanguage();
            });
        }
    }
    
    /**
     * Convert text based on selected mode
     */
    function convertText() {
        const text = inputText.value.trim();
        if (!text) {
            showStatus(translations[currentLanguage].enterText, 'warning');
            return;
        }
        
        const mode = document.querySelector('input[name="conversionMode"]:checked').value;
        const mapping = mode === 'normal' ? normalMapping : professionalMapping;
        
        let convertedText = '';
        for (let char of text) {
            convertedText += mapping[char] || char;
        }
        
        outputText.value = convertedText;
        showStatus(translations[currentLanguage].textConverted, 'success');
        
        // Save conversion mode preference
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.set({ 'mawi_conversion_mode': mode });
        }
    }
    
    /**
     * Copy converted text to clipboard
     */
    async function copyToClipboard() {
        const text = outputText.value.trim();
        if (!text) {
            showStatus(translations[currentLanguage].noTextToCopy, 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(text);
            showStatus(translations[currentLanguage].textCopied, 'success');
        } catch (err) {
            console.error('Failed to copy text:', err);
            showStatus(translations[currentLanguage].copyFailed, 'warning');
        }
    }
    
    /**
     * Detect Cyrillic characters in input and highlight them
     */
    function detectCyrillicInInput() {
        const text = inputText.value;
        const cyrillicRegex = /[\u0400-\u04FF]/g;
        
        if (cyrillicRegex.test(text)) {
            inputText.style.borderColor = 'var(--danger-color)';
            inputText.style.backgroundColor = '#fef2f2';
            showStatus(translations[currentLanguage].cyrillicDetected, 'warning');
        } else {
            inputText.style.borderColor = 'var(--border-color)';
            inputText.style.backgroundColor = 'white';
            hideStatus();
        }
    }
    
    /**
     * Show status message
     */
    function showStatus(message, type) {
        const iconName = type === 'success' ? translations[currentLanguage].checkIcon : translations[currentLanguage].warningIcon;
        
        statusDiv.innerHTML = `
            <span class="material-icons" style="font-size: 16px;">${iconName}</span>
            <span>${message}</span>
        `;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'flex';
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(hideStatus, 3000);
        }
    }
    
    /**
     * Hide status message
     */
    function hideStatus() {
        statusDiv.style.display = 'none';
    }
    
    /**
     * Toggle setting and update storage
     */
    function toggleSetting(settingKey, toggleElement) {
        const isActive = toggleElement.classList.contains('active');
        const newValue = !isActive;
        
        // Update UI
        if (newValue) {
            toggleElement.classList.add('active');
        } else {
            toggleElement.classList.remove('active');
        }
        
        // Save to storage
        const settings = {};
        settings[settingKey] = newValue;
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.set(settings, () => {
                console.log(`Setting ${settingKey} updated to:`, newValue);
                
                // Send message to content scripts to update behavior
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'updateSettings',
                            settings: settings
                        }).catch(() => {
                            // Ignore errors if content script is not available
                        });
                    }
                });
            });
        }
    }
    
    /**
     * Load saved settings from storage
     */
    function loadSettings() {
        // Check if chrome.storage is available
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get([
                'mawi_extension_enabled',
                'mawi_highlight_enabled',
                'mawi_warning_enabled',
                'mawi_conversion_mode'
            ], (result) => {
                // Update toggle states
                updateToggleState(detectionToggle, result.mawi_extension_enabled !== false);
                updateToggleState(highlightToggle, result.mawi_highlight_enabled !== false);
                updateToggleState(warningToggle, result.mawi_warning_enabled !== false);
            
            // Update conversion mode
                const mode = result.mawi_conversion_mode || 'normal';
                const modeRadio = document.getElementById(mode + 'Mode');
                if (modeRadio) {
                    modeRadio.checked = true;
                }
            });
        } else {
            // Fallback: set default values if chrome.storage is not available
            updateToggleState(detectionToggle, true);
            updateToggleState(highlightToggle, true);
            updateToggleState(warningToggle, true);
        }
    }
    
    /**
     * Update toggle element state
     */
    function updateToggleState(toggleElement, isActive) {
        if (isActive) {
            toggleElement.classList.add('active');
        } else {
            toggleElement.classList.remove('active');
        }
    }
    
    /**
     * Initialize detector functionality
     */
    function initDetector() {
        const detectorText = document.getElementById('detectorText');
        const detectorOutput = document.getElementById('detectorOutput');
        
        if (detectorText && detectorOutput) {
            detectorText.addEventListener('input', function() {
                const text = this.value;
                
                if (text.trim() === '') {
                    detectorOutput.textContent = translations[currentLanguage].detectionResults;
                    detectorOutput.style.color = 'var(--text-secondary)';
                    return;
                }
                
                // Simple Cyrillic detection function
                function detectCyrillic(text) {
                    return /[\u0400-\u04FF]/.test(text);
                }
                
                // Highlight Cyrillic characters
                function highlightCyrillic(text) {
                    return text.replace(/[\u0400-\u04FF]/g, '<span class="cyrillic-highlight">$&</span>');
                }
                
                if (detectCyrillic(text)) {
                    const highlightedText = highlightCyrillic(text);
                    detectorOutput.innerHTML = highlightedText;
                    detectorOutput.style.color = 'var(--text-primary)';
                    this.style.borderColor = 'var(--danger-color)';
                    this.style.backgroundColor = '#fef2f2';
                } else {
                    detectorOutput.innerHTML = text;
                    detectorOutput.style.color = 'var(--text-primary)';
                    this.style.borderColor = 'var(--success-color)';
                    this.style.backgroundColor = '#f0fdf4';
                }
            });
        }
    }

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            initDetector();
        });
    } else {
        init();
        initDetector();
    }

})();