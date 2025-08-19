// MAWI LATIN TO CYRILLIC - Content Script
// Author: Ayoub Alarjani (MAWI MAN)
// Website: https://www.mawiman.com/

(function() {
    'use strict';
    
    // Cyrillic character detection regex
    const CYRILLIC_REGEX = /[\u0400-\u04FF]/g;
    
    // Track processed elements to avoid duplicate processing
    const processedElements = new WeakSet();
    
    // Tooltip element for warnings
    let warningTooltip = null;
    
    // Extension settings
    let settings = {
        mawi_extension_enabled: true,
        mawi_highlight_enabled: true,
        mawi_warning_enabled: true
    };
    
    /**
     * Check if text contains Cyrillic characters
     */
    function containsCyrillic(text) {
        return CYRILLIC_REGEX.test(text);
    }
    
    /**
     * Highlight Cyrillic characters in text
     */
    function highlightCyrillicInText(text) {
        return text.replace(CYRILLIC_REGEX, '<span class="mawi-cyrillic-highlight">$&</span>');
    }
    
    /**
     * Create warning tooltip
     */
    function createWarningTooltip() {
        if (warningTooltip) return warningTooltip;
        
        warningTooltip = document.createElement('div');
        warningTooltip.className = 'mawi-warning-tooltip';
        warningTooltip.textContent = '⚠️ Cyrillic characters detected!';
        document.body.appendChild(warningTooltip);
        
        return warningTooltip;
    }
    
    /**
     * Show warning tooltip near element
     */
    function showWarningTooltip(element) {
        const tooltip = createWarningTooltip();
        const rect = element.getBoundingClientRect();
        
        tooltip.style.left = (rect.left + window.scrollX) + 'px';
        tooltip.style.top = (rect.top + window.scrollY - 35) + 'px';
        tooltip.classList.add('show');
        
        // Hide tooltip after 3 seconds
        setTimeout(() => {
            tooltip.classList.remove('show');
        }, 3000);
    }

    /**
     * Create confirmation modal for Cyrillic links
     */
    function createCyrillicLinkModal(url) {
        // Remove existing modal if any
        const existingModal = document.getElementById('mawi-cyrillic-link-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'mawi-cyrillic-link-modal';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
        `;

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 90%;
            text-align: center;
            position: relative;
        `;

        // Create warning icon
        const warningIcon = document.createElement('div');
        warningIcon.style.cssText = `
            font-size: 48px;
            color: #ff6b35;
            margin-bottom: 20px;
        `;
        warningIcon.textContent = '⚠️';

        // Create title
        const title = document.createElement('h2');
        title.style.cssText = `
            color: #333;
            margin: 0 0 15px 0;
            font-size: 24px;
            font-weight: bold;
        `;
        title.textContent = 'تحذير أمني';

        // Create message
        const message = document.createElement('p');
        message.style.cssText = `
            color: #666;
            margin: 0 0 20px 0;
            font-size: 16px;
            line-height: 1.5;
        `;
        message.innerHTML = `هذا الرابط يحتوي على أحرف سيريلية وقد يكون احتياليًا أو عملية اختراق.<br><br><strong>الرابط:</strong> ${url.substring(0, 60)}${url.length > 60 ? '...' : ''}`;

        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 25px;
        `;

        // Create "Don't Care" button
        const dontCareBtn = document.createElement('button');
        dontCareBtn.style.cssText = `
            background: #ff6b35;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.3s;
        `;
        dontCareBtn.textContent = 'لا أهتم';
        dontCareBtn.onmouseover = () => dontCareBtn.style.backgroundColor = '#e55a2b';
        dontCareBtn.onmouseout = () => dontCareBtn.style.backgroundColor = '#ff6b35';

        // Create "Close" button
        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            background: #6c757d;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.3s;
        `;
        closeBtn.textContent = 'إغلاق';
        closeBtn.onmouseover = () => closeBtn.style.backgroundColor = '#5a6268';
        closeBtn.onmouseout = () => closeBtn.style.backgroundColor = '#6c757d';

        // Add event listeners
        dontCareBtn.addEventListener('click', () => {
            modalOverlay.remove();
            window.open(url, '_blank');
        });

        closeBtn.addEventListener('click', () => {
            modalOverlay.remove();
        });

        // Close modal when clicking overlay
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
            }
        });

        // Assemble modal
        buttonContainer.appendChild(dontCareBtn);
        buttonContainer.appendChild(closeBtn);
        modalContent.appendChild(warningIcon);
        modalContent.appendChild(title);
        modalContent.appendChild(message);
        modalContent.appendChild(buttonContainer);
        modalOverlay.appendChild(modalContent);

        // Add to page
        document.body.appendChild(modalOverlay);

        return modalOverlay;
    }

    /**
     * Handle link clicks to check for Cyrillic characters
     */
    function handleLinkClick(event) {
        if (!settings.mawi_extension_enabled || !settings.mawi_warning_enabled) {
            return;
        }

        const link = event.target.closest('a');
        if (!link || !link.href) {
            return;
        }

        // Check if the URL contains Cyrillic characters
        if (containsCyrillic(link.href)) {
            event.preventDefault();
            event.stopPropagation();
            createCyrillicLinkModal(link.href);
        }
    }
    
    /**
     * Process text input elements for Cyrillic detection
     */
    function processInputElement(element) {
        if (processedElements.has(element)) return;
        if (!settings.mawi_extension_enabled) return;
        
        processedElements.add(element);
        
        // Add input event listener
        element.addEventListener('input', function() {
            if (!settings.mawi_extension_enabled) return;
            
            const value = this.value;
            
            if (containsCyrillic(value)) {
                // Add warning styling if warnings are enabled
                if (settings.mawi_warning_enabled) {
                    this.classList.add('mawi-cyrillic-input-warning');
                    showWarningTooltip(this);
                }
                
                // Log warning to console
                console.warn('MAWI Extension: Cyrillic characters detected in input field:', {
                    element: this.tagName,
                    id: this.id || 'no-id',
                    class: this.className || 'no-class',
                    placeholder: this.placeholder || 'no-placeholder',
                    value: this.value.substring(0, 50) + (this.value.length > 50 ? '...' : '')
                });
            } else {
                // Remove warning styling
                this.classList.remove('mawi-cyrillic-input-warning');
            }
        });
        
        // Check initial value
        if (element.value && containsCyrillic(element.value) && settings.mawi_warning_enabled) {
            element.classList.add('mawi-cyrillic-input-warning');
            showWarningTooltip(element);
        }
    }
    
    /**
     * Process text content for Cyrillic highlighting
     */
    function processTextContent(element) {
        if (processedElements.has(element)) return;
        if (!settings.mawi_extension_enabled || !settings.mawi_highlight_enabled) return;
        
        // Skip elements with input/form elements or script/style tags
        if (element.querySelector('input, textarea, script, style, select, button')) return;
        
        const text = element.textContent;
        if (!text || !containsCyrillic(text)) return;
        
        // Skip elements that might cause layout issues
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.position === 'fixed' || computedStyle.position === 'absolute') return;
        if (computedStyle.display === 'flex' || computedStyle.display === 'grid') return;
        
        // Skip if text is too long to avoid performance issues
        if (text.length > 200) return;
        
        // Skip if element has many children (complex structure)
        if (element.children.length > 5) return;
        
        processedElements.add(element);
        
        // For elements with no children, directly highlight
        if (element.children.length === 0) {
            element.innerHTML = highlightCyrillicInText(text);
        } else {
            // For elements with few children, process text nodes only
            processTextNodes(element);
        }
    }
    
    /**
     * Process text nodes within an element
     */
    function processTextNodes(element) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip text nodes inside input, script, style elements
                    const parent = node.parentElement;
                    if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' || 
                                  parent.tagName === 'INPUT' || parent.tagName === 'TEXTAREA')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return containsCyrillic(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            }
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        // Process each text node
        textNodes.forEach(textNode => {
            const highlightedText = highlightCyrillicInText(textNode.textContent);
            if (highlightedText !== textNode.textContent) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = highlightedText;
                
                // Replace text node with highlighted content
                const fragment = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
                textNode.parentNode.replaceChild(fragment, textNode);
            }
        });
    }
    
    /**
     * Scan page for input elements and text content
     */
    function scanPage() {
        if (!settings.mawi_extension_enabled) return;
        
        // Process input elements
        const inputElements = document.querySelectorAll('input[type="text"], input[type="search"], input[type="email"], input[type="url"], textarea');
        inputElements.forEach(processInputElement);
        
        // Process text content (excluding script, style, and input elements) - only if highlighting is enabled
        if (settings.mawi_highlight_enabled) {
            const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, td, th, li, a');
            textElements.forEach(element => {
                // Skip if element contains input fields or is too large
                if (element.querySelector('input, textarea, script, style') || element.textContent.length > 200) {
                    return;
                }
                processTextContent(element);
            });
        }
        
        // Add link click protection if warnings are enabled
        if (settings.mawi_warning_enabled) {
            setupLinkProtection();
        }
    }
    
    /**
     * Setup link click protection
     */
    function setupLinkProtection() {
        // Remove existing listener if any
        document.removeEventListener('click', handleLinkClick, true);
        
        // Add new listener
        document.addEventListener('click', handleLinkClick, true);
    }
    
    /**
     * Load settings from storage
     */
    function loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                mawi_extension_enabled: true,
                mawi_highlight_enabled: true,
                mawi_warning_enabled: true
            }, (result) => {
                settings = result;
                resolve(settings);
            });
        });
    }
    
    /**
     * Remove all highlighting and warnings from the page
     */
    function removeAllHighlighting() {
        // Remove all Cyrillic highlights
        const highlights = document.querySelectorAll('.mawi-cyrillic-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
        
        // Remove all input warnings
        const warningInputs = document.querySelectorAll('.mawi-cyrillic-input-warning');
        warningInputs.forEach(input => {
            input.classList.remove('mawi-cyrillic-input-warning');
        });
        
        // Hide tooltip
        if (warningTooltip) {
            warningTooltip.style.display = 'none';
        }
        
        // Remove link protection
        document.removeEventListener('click', handleLinkClick, true);
        
        // Remove any existing modal
        const existingModal = document.getElementById('mawi-cyrillic-link-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Clear processed elements to allow re-processing
        processedElements.clear = function() {
            // WeakSet doesn't have clear method, so we create a new one
        };
    }
    
    /**
     * Listen for settings changes
     */
    function setupSettingsListener() {
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'sync') {
                let settingsChanged = false;
                
                if (changes.mawi_extension_enabled) {
                    settings.mawi_extension_enabled = changes.mawi_extension_enabled.newValue;
                    settingsChanged = true;
                }
                
                if (changes.mawi_highlight_enabled) {
                    settings.mawi_highlight_enabled = changes.mawi_highlight_enabled.newValue;
                    settingsChanged = true;
                }
                
                if (changes.mawi_warning_enabled) {
                    settings.mawi_warning_enabled = changes.mawi_warning_enabled.newValue;
                    settingsChanged = true;
                }
                
                if (settingsChanged) {
                    console.log('MAWI Extension: Settings updated', settings);
                    
                    // If extension is disabled, remove all highlighting and link protection
                    if (!settings.mawi_extension_enabled) {
                        removeAllHighlighting();
                        document.removeEventListener('click', handleLinkClick, true);
                    } else {
                        // If highlighting is disabled, remove highlights
                        if (!settings.mawi_highlight_enabled) {
                            const highlights = document.querySelectorAll('.mawi-cyrillic-highlight');
                            highlights.forEach(highlight => {
                                const parent = highlight.parentNode;
                                parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
                                parent.normalize();
                            });
                        }
                        
                        // If warnings are disabled, remove warning styles and link protection
                        if (!settings.mawi_warning_enabled) {
                            const warningInputs = document.querySelectorAll('.mawi-cyrillic-input-warning');
                            warningInputs.forEach(input => {
                                input.classList.remove('mawi-cyrillic-input-warning');
                            });
                            if (warningTooltip) {
                                warningTooltip.style.display = 'none';
                            }
                            // Remove link protection
                            document.removeEventListener('click', handleLinkClick, true);
                            // Remove any existing modal
                            const existingModal = document.getElementById('mawi-cyrillic-link-modal');
                            if (existingModal) {
                                existingModal.remove();
                            }
                        } else {
                            // If warnings are enabled, setup link protection
                            setupLinkProtection();
                        }
                        
                        // Re-scan the page with new settings
                        scanPage();
                    }
                }
            }
        });
    }
    
    /**
     * Initialize the extension
     */
    async function init() {
        // Load settings first
        await loadSettings();
        
        // Setup settings listener
        setupSettingsListener();
        
        // Only proceed if extension is enabled
        if (!settings.mawi_extension_enabled) {
            console.log('MAWI LATIN TO CYRILLIC Extension: Disabled');
            return;
        }
        
        // Initial scan
        scanPage();
        
        // Set up mutation observer for dynamic content
        const observer = new MutationObserver(function(mutations) {
            if (!settings.mawi_extension_enabled) return;
            
            let shouldScan = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any added nodes are relevant
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            shouldScan = true;
                            break;
                        }
                    }
                }
            });
            
            if (shouldScan) {
                // Debounce scanning to avoid excessive calls
                setTimeout(scanPage, 100);
            }
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('MAWI LATIN TO CYRILLIC Extension: Initialized and monitoring for Cyrillic characters');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also initialize on page load to catch any late-loading content
    window.addEventListener('load', scanPage);
    
})();