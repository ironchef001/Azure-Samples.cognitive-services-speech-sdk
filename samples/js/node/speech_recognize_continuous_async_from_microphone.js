const sdk = require("microsoft-cognitiveservices-speech-sdk");
const readline = require("readline");

function speech_recognize_continuous_async_from_microphone() {
    // Provide your speech subscription key and region using environment variables
    const subscriptionKey = process.env.SPEECH_KEY;
    const serviceRegion = process.env.SPEECH_REGION;

    // Create the speech configuration
    const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);

    // The default language is "en-us".
    const speechRecognizer = new sdk.SpeechRecognizer(speechConfig);

    let done = false;

    const recognizingCb = (evt) => {
        console.log('RECOGNIZING:', new Date(), evt.result.text);
    };

    const recognizedCb = (evt) => {
        console.log('RECOGNIZED:', evt);
    };

    const stopCb = (evt) => {
        console.log('CLOSING on', evt);
        done = true;
    };

    // Connect callbacks to the events fired by the speech recognizer
    speechRecognizer.recognizing = recognizingCb;
    speechRecognizer.recognized = recognizedCb;
    speechRecognizer.sessionStopped = stopCb;
    speechRecognizer.canceled = stopCb;

    // Perform recognition. `startContinuousRecognitionAsync` asynchronously initiates continuous recognition operation.
    // Other tasks can be performed on this thread while recognition starts.
    // Wait on `resultPromise` to know when initialization is done.
    // Call `stopContinuousRecognitionAsync` to stop recognition.
    const resultPromise = speechRecognizer.startContinuousRecognitionAsync();

    resultPromise.then(() => {
        console.log('Continuous Recognition is now running, say something.');
    }).catch((error) => {
        console.error('Error starting continuous recognition:', error);
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', (input) => {
        if (input.toLowerCase() === 'stop') {
            console.log('Stopping async recognition.');
            speechRecognizer.stopContinuousRecognitionAsync();
            rl.close();
        }
    });

    rl.on('close', () => {
        console.log('Recognition stopped, main thread can exit now.');
    });
}

// Call the function to start continuous speech recognition from the microphone
speech_recognize_continuous_async_from_microphone();
