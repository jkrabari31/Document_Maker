/**
 * Gujarati Speech-to-Text Engine (Web Speech API)
 * Utilizes built-in Google Gujarati neural speech model (gu-IN)
 */

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
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
  const recognition = new SpeechRecognitionClass();

  recognition.lang = lang;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let isExplicitlyStopped = false;

  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript.trim() && onResult) {
      onResult(finalTranscript.trim());
    }

    if (onInterim) {
      onInterim(interimTranscript);
    }
  };

  recognition.onerror = (event) => {
    let message = 'વોઇસ ઓળખવામાં ભૂલ આવી.';
    if (event.error === 'not-allowed') {
      message = 'કૃપા કરીને બ્રાઉઝરમાં માઇક્રોફોનની પરવાનગી આપો (Allow Microphone).';
    } else if (event.error === 'network') {
      message = 'ઇન્ટરનેટ કનેક્શન તપાસો (Network required for voice engine).';
    } else if (event.error === 'no-speech') {
      // User paused, no need to show alert
      return;
    }

    if (onError) {
      onError({ error: event.error, message });
    }
  };

  recognition.onend = () => {
    if (onEnd) {
      onEnd({ isExplicitlyStopped });
    }
  };

  return {
    start: () => {
      isExplicitlyStopped = false;
      try {
        recognition.start();
      } catch (e) {
        console.warn('SpeechRecognition start error:', e);
      }
    },
    stop: () => {
      isExplicitlyStopped = true;
      try {
        recognition.stop();
      } catch (e) {}
    },
    abort: () => {
      isExplicitlyStopped = true;
      try {
        recognition.abort();
      } catch (e) {}
    }
  };
}
