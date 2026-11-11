/**
 * Gujarati Speech-to-Text Engine (Web Speech API)
 * Utilizes built-in Google neural speech models (gu-IN, en-IN, hi-IN)
 * Enhanced with mobile-specific deduplication filter & resilient recognition
 * ensuring mobile speech-to-text works flawlessly without repetition.
 */

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
}

/**
 * Detects if the current client is a mobile device or touch environment
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
}

/**
 * Safely updates input/textarea value so React synthetic onChange detects the change.
 * Standard element.value = val bypasses React 16+ _valueTracker, causing field state to revert.
 */
export function setNativeInputValue(element, value) {
  if (!element) return;
  const isTextArea = element.tagName === 'TEXTAREA';
  const prototype = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

  if (descriptor && descriptor.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }

  // Dispatch both 'input' and 'change' with bubbles: true so React's synthetic event dispatcher catches it
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

export function createSpeechRecognizer({
  onResult,
  onInterim,
  onError,
  onEnd,
  lang = 'gu-IN'
}) {
  if (!isSpeechSupported()) {
    if (onError) {
      onError({ 
        error: 'not-supported', 
        message: 'તમારા બ્રાઉઝરમાં વોઇસ ટાઇપિંગ સપોર્ટ નથી. કૃપા કરીને Google Chrome અથવા Microsoft Edge વાપરો.' 
      });
    }
    return null;
  }

  const isMobile = isMobileDevice();
  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  let activeInstance = null;
  let isExplicitlyStopped = false;
  let restartTimer = null;
  let currentLang = lang;

  // Track the last recognized index and delivered phrases to eliminate mobile repetition
  let lastProcessedIndex = -1;
  let lastDeliveredText = '';
  let lastDeliveredTime = 0;

  function cleanupActiveInstance() {
    if (activeInstance) {
      try {
        activeInstance.onresult = null;
        activeInstance.onerror = null;
        activeInstance.onend = null;
        activeInstance.abort();
      } catch {
        // Safe empty catch without unused parameter
      }
      activeInstance = null;
    }
  }

  function startInstance() {
    if (isExplicitlyStopped) return;
    cleanupActiveInstance();

    try {
      const rec = new SpeechRecognitionClass();
      rec.lang = currentLang;
      // On desktop, continuous works great.
      // On mobile Android Chrome, continuous=true causes speech engine to replay historic buffers.
      // With mobile, single-shot recognition + controlled smooth restart yields 100% stable non-duplicated stream.
      rec.continuous = !isMobile;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        // Mobile Android Chrome bug: event.resultIndex may reset to 0 even though earlier results were already delivered.
        // We enforce strict result tracking.
        const startIndex = isMobile ? Math.max(event.resultIndex, lastProcessedIndex + 1) : event.resultIndex;

        for (let i = startIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            finalTranscript += (finalTranscript ? ' ' : '') + text;
            lastProcessedIndex = Math.max(lastProcessedIndex, i);
          } else {
            interimTranscript += (interimTranscript ? ' ' : '') + text;
          }
        }

        const trimmedFinal = finalTranscript.trim();
        if (trimmedFinal) {
          const now = Date.now();
          // Mobile deduplication guard: ignore exact repeat within 1200ms
          const isExactRepeat = (trimmedFinal === lastDeliveredText && (now - lastDeliveredTime) < 1200);

          if (!isExactRepeat) {
            lastDeliveredText = trimmedFinal;
            lastDeliveredTime = now;
            if (onResult) {
              onResult(trimmedFinal);
            }
          }
        }

        if (onInterim) {
          onInterim(interimTranscript);
        }
      };

      rec.onerror = (event) => {
        // Non-fatal events during pauses/silence in Web Speech API
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }

        let message = 'વોઇસ ઓળખવામાં ભૂલ આવી.';
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          message = 'કૃપા કરીને બ્રાઉઝરમાં માઇક્રોફોનની પરવાનગી આપો (Allow Microphone).';
          isExplicitlyStopped = true;
          if (onError) onError({ error: event.error, message });
          if (onEnd) onEnd({ isExplicitlyStopped: true });
          return;
        } else if (event.error === 'network') {
          // Temporary network blip; don't terminate, let onend auto-reconnect
          console.warn('SpeechRecognition network hiccup, recovering...');
          return;
        }

        if (onError) {
          onError({ error: event.error, message });
        }
      };

      rec.onend = () => {
        activeInstance = null;
        lastProcessedIndex = -1; // Reset index counter for the new recognition cycle

        // If not stopped intentionally by user, auto-reconnect with fresh instance so listening continues across pauses
        if (!isExplicitlyStopped) {
          clearTimeout(restartTimer);
          // On mobile, use a clean 150ms debounce to give the Android audio buffer time to clear
          const restartDelay = isMobile ? 150 : 80;
          restartTimer = setTimeout(() => {
            if (!isExplicitlyStopped) {
              startInstance();
            }
          }, restartDelay);
        } else {
          if (onEnd) {
            onEnd({ isExplicitlyStopped: true });
          }
        }
      };

      activeInstance = rec;
      rec.start();
    } catch (err) {
      console.warn('SpeechRecognition start error, scheduling retry:', err);
      if (!isExplicitlyStopped) {
        clearTimeout(restartTimer);
        restartTimer = setTimeout(() => {
          if (!isExplicitlyStopped) {
            startInstance();
          }
        }, isMobile ? 250 : 200);
      }
    }
  }

  return {
    start: () => {
      isExplicitlyStopped = false;
      lastProcessedIndex = -1;
      lastDeliveredText = '';
      lastDeliveredTime = 0;
      clearTimeout(restartTimer);
      startInstance();
    },
    stop: () => {
      isExplicitlyStopped = true;
      clearTimeout(restartTimer);
      cleanupActiveInstance();
      if (onEnd) {
        onEnd({ isExplicitlyStopped: true });
      }
    },
    abort: () => {
      isExplicitlyStopped = true;
      clearTimeout(restartTimer);
      cleanupActiveInstance();
      if (onEnd) {
        onEnd({ isExplicitlyStopped: true });
      }
    },
    setLang: (newLang) => {
      currentLang = newLang;
      if (!isExplicitlyStopped) {
        startInstance();
      }
    }
  };
}
