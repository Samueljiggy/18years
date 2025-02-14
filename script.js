// Check if the browser supports getUserMedia
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream) {
      // Create an audio context and an analyser
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 512; // Lower size for a quicker response
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Threshold settings for a very strong blow:
      const blowThreshold = 120;      // Only a very hard breeze will turn off the candle
      const warningThreshold = 100;   // Triggers a "failed" blow animation if not strong enough
      let candleBlown = false;
      let lastFailed = 0;
      const failedCooldown = 1000; // 1-second cooldown for failed animations

      // Continuously analyze audio data
      function detectBlow() {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;

        // If a strong blow is detected, fade out the candle flame
        if (average >= blowThreshold && !candleBlown) {
          candleBlown = true;
          const flameEl = document.querySelector('.flame');
          flameEl.classList.add('off');
          console.log('Candle blown out!');

          // Trigger a faster page transition
          setTimeout(() => {
            document.body.classList.add('page-transition');
          }, 700); // Reduced delay

          // Redirect after a shorter overall delay
          setTimeout(() => {
            window.location.href = "newpage.html"; // Replace with your target page
          }, 500);
        }
        // If the blow is detected but isn't strong enough
        else if (average >= warningThreshold && average < blowThreshold && !candleBlown) {
          const now = Date.now();
          if (now - lastFailed > failedCooldown) {
            lastFailed = now;
            const flameEl = document.querySelector('.flame');
            flameEl.classList.add('failed');
            console.log('Blow detected but not strong enough.');
            // Remove the "failed" animation class after 500ms
            setTimeout(() => {
              flameEl.classList.remove('failed');
            }, 500);
          }
        }
        requestAnimationFrame(detectBlow);
      }
      detectBlow();
    })
    .catch(function(err) {
      console.log('Microphone access denied or error occurred:', err);
    });
} else {
  console.log('getUserMedia is not supported in this browser.');
}
