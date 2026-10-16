/**
 * Gujarati Speech-to-Text Engine (Web Speech API)
 * Utilizes built-in Google neural speech models (gu-IN, en-IN, hi-IN)
 * Features resilient fresh-instance auto-reconnect, continuous listening across pauses,
 * and zero-drop speech handling.
 */

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
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

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  let activeInstance = null;
  let isExplicitlyStopped = false;
  let restartTimer = null;
  let currentLang = lang;

  function cleanupActiveInstance() {
    if (activeInstance) {
      try {
        activeInstance.onresult = null;
        activeInstance.onerror = null;
        activeInstance.onend = null;
        activeInstance.abort();
      } catch (e) {}
      activeInstance = null;
    }
  }

  function startInstance() {
    if (isExplicitlyStopped) return;
    cleanupActiveInstance();

    try {
      const rec = new SpeechRecognitionClass();
      rec.lang = currentLang;
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            finalTranscript += text;
          } else {
            interimTranscript += text;
          }
        }

        if (finalTranscript.trim() && onResult) {
          onResult(finalTranscript.trim());
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
        // If not stopped intentionally by user, auto-reconnect with fresh instance so listening continues across pauses
        if (!isExplicitlyStopped) {
          clearTimeout(restartTimer);
          restartTimer = setTimeout(() => {
            if (!isExplicitlyStopped) {
              startInstance();
            }
          }, 80);
        } else {
          if (onEnd) {
            onEnd({ isExplicitlyStopped: true });
          }
        }
      };

      activeInstance = rec;
      rec.start();
    } catch (e) {
      console.warn('SpeechRecognition start error, scheduling retry:', e);
      if (!isExplicitlyStopped) {
        clearTimeout(restartTimer);
        restartTimer = setTimeout(() => {
          if (!isExplicitlyStopped) {
            startInstance();
          }
        }, 200);
      }
    }
  }

  return {
    start: () => {
      isExplicitlyStopped = false;
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
        // Restart with new language
        startInstance();
      }
    }
  };
}
