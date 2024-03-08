document.addEventListener('DOMContentLoaded', function() {
    const tanuki = document.getElementById('tanuki');
    const chatBtn = document.getElementById('chat-btn');
    const statusBtn = document.getElementById('status-btn');
    const foodBtn = document.getElementById('food-btn');
    const learnBtn = document.getElementById('learn-btn');
    const playBtn = document.getElementById('play-btn');
    const msgInput = document.getElementById('msg-input');
    const inputField = document.getElementById('input-field');
    const bubble1 = document.getElementById('bubble1');
    const bubble2 = document.getElementById('bubble2');
    const speechTxt = document.getElementById('text');
    const statusTxt = document.getElementById('status');
    const mouth = document.getElementById('mouth');
    const lips = document.getElementById('lip-below');
    const eyes = document.querySelectorAll('.eye');
    const eyelashes = document.querySelectorAll('.eyelash');
    const closedEyes = document.querySelectorAll('.closeEye');
    const smileEyes = document.querySelectorAll('.smileEye');
    const eyeBrows = document.querySelectorAll('.eyebrow');
    const apple = document.getElementById('apple');
    const leftArms = document.querySelectorAll('.arm-left');
    const rightArms = document.querySelectorAll('.arm-right');
    const leftLegs = document.querySelectorAll('.leg-left');
    const rightLegs = document.querySelectorAll('.leg-right');
    const audio = document.getElementById('audio');
    audio.volume = 0.5;
    let hasSpoken = false;
    let currentStatus = '';
    let status = ['happy', 'sad', 'sleepy', 'hungry'];
    let activeLearning = false;
    let step1 = false;
    let step2 = false;
    let travellingKey = '';
    let weHaveMatch = false;
    const eatingSound = new Audio('images/swallow.mp3');

    // Speech Recognition
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
    var recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Show Text in Bubble
    function showText(text, answerLength) {
        speechTxt.innerHTML = text;
        bubble1.style.opacity = "1";
        setTimeout(() => {
            bubble1.style.opacity = "0";
        }, (answerLength * 1000) / 3);
    }

    // Open Mouth
    let count = 0;
    let interval;

    function toggleMouth(answerLength) {
        mouth.style.display = (mouth.style.display === 'none') ? 'inline' : 'none';
        lips.style.display = (lips.style.display === 'none') ? 'inline' : 'none';
        count++;

        if (count > answerLength) {
            clearInterval(interval);
            mouth.style.display = 'none';
            lips.style.display = 'none';
        }
    }

    // Chat Button
    chatBtn.onclick = () => {
        recognition.start();
        console.log("Ready to receive a color command.");
    };

    recognition.onresult = (event) => {
        const receivedText = event.results[0][0].transcript;
        recognition.stop();

        console.log("Received: " + receivedText);
        handleInput(receivedText);
    };

    function handleInput(msg) {
        if (!activeLearning) {
            parseMsg(msg);
        } else if (activeLearning && step1) {
            parseKeyword(msg);
        } else if (activeLearning && step2) {
            parseAnswer(msg);
        }
    }

    // Speech Synthesis
    function speakThis(msg) {
        const utterance = new SpeechSynthesisUtterance(msg);
        const synth = window.speechSynthesis;
        const voices = synth.getVoices();

        //console.log(voices);

        utterance.pitch = 5;
        utterance.lang = 'en-US';
        //utterance.lang = 'ja-JP';
        utterance.rate = 1; //speed

        speechSynthesis.speak(utterance);

        setTimeout(() => {
            weHaveMatch = false;
        }, 5000);
    }

    // Input Text
    msgInput.onchange = function (event) {
        // parseMsg(this.value);
        handleInput(this.value);
    };

    // Pattern Test
    function patternTest(regex, msg) {
        let result = regex.test(msg);
        return result;
    }

    // JSON Data
    async function callJSONData(msg) {
        const response = await fetch('data/data.json');
        const data = await response.json();
        console.log(data);

        if (data.length !== 0) {
            data.forEach((item, index) => {
                let regex = new RegExp(item.question, 'gi');
                if (patternTest(regex, msg)) {
                    let random = Math.floor(Math.random() * item.answer.length);
                    console.log("found: " + item.answer[random] );

                    let answerLength = (item.answer[random].length) / 2;
                    //let answerLength = (item.answer[random].split(" ").length) * 2.5;

                    count = 0;
                    if (interval) {
                        clearInterval(interval);
                        interval = null;
                    }

                    // Set up a new interval for mouth movements
                    interval = setInterval(() => toggleMouth(answerLength), 120);

                    // Speak and show the text
                    speakThis(item.answer[random]);
                    showText(item.answer[random], answerLength);
                    console.log(answerLength);
                    weHaveMatch = true;
                }
            });
        }
    }

    function callStorageData(msg) {
        console.log("Call storage data: " + msg);
        for (const [key, value] of Object.entries(localStorage)) {
            if (key.substring(0, 4) === 'key-') {
                let regex = new RegExp(key.substring(5), 'gi');
                if (patternTest(regex, msg)) {
                    let answerLength = (value.length) / 2;

                    count = 0;
                    if (interval) {
                        clearInterval(interval);
                        interval = null;
                    }

                    // Set up a new interval for mouth movements
                    interval = setInterval(() => toggleMouth(answerLength), 120);

                    // Speak and show the text
                    speakThis(value);
                    showText(value, answerLength);
                    console.log(answerLength);
                    weHaveMatch = true;
                }
            }
        }
    }

    function parseMsg(msg) {
        msgInput.value = null;
        msg = msg.toLowerCase();

        callJSONData(msg);

        if (!weHaveMatch) {
            callStorageData(msg);
        }
    }

    // Eyes Expression
    function disableEyes() {
        eyes.forEach(function(eye) {
            eye.style.display = 'none';
        });
        eyelashes.forEach(function(eyelash) {
            eyelash.style.display = 'none';
        });
    }

    function activateEyes() {
        eyes.forEach(function(eye) {
            eye.style.display = 'block';
        });
        eyelashes.forEach(function(eyelash) {
            eyelash.style.display = 'block';
        });
    }

    // Happy Expression
    function happy() {
        disableEyes();
        smileEyes.forEach(function(smileEye) {
            smileEye.style.display = 'block';
        });
    }

    function normal() {
        activateEyes();
        smileEyes.forEach(function(smileEye) {
            smileEye.style.display = 'none';
        });
    }
    
    function showHappy() {
        bubble2.classList.toggle('show');
        statusTxt.innerHTML = status[0];
    }

    function hideHappy() {
        bubble2.classList.remove('show');
    }

    function showHappyStatus() {
        happy();
        showHappy();
        setTimeout(() => {
            normal();
            hideHappy();
        }, 3000);
    }

    // Status Button
    statusBtn.addEventListener('click', function() {
        console.log('status');
        bubble2.classList.toggle('show');

        if (!currentStatus) {
            const randomIndex = Math.floor(Math.random() * status.length);
            currentStatus = status[randomIndex];
            statusTxt.innerHTML = currentStatus;
        }

        if (currentStatus === 'happy') {
            happy();
        }

        if (currentStatus === 'sad' || currentStatus === 'hungry') {
            eyeBrows.forEach(function(eyeBrow) {
                eyeBrow.style.display = 'block';
            });
        }

        if (currentStatus === 'sleepy') {
            disableEyes();
            closedEyes.forEach(function(closedEye) {
                closedEye.style.display = 'block';
            });
        }

        setTimeout(() => {
            bubble2.classList.remove('show');
            currentStatus = '';

            normal();

            eyeBrows.forEach(function(eyeBrow) {
                eyeBrow.style.display = 'none';
            });

            closedEyes.forEach(function(closedEye) {
                closedEye.style.display = 'none';
            });

        }, 3000);
    });

    // Food Button
    foodBtn.addEventListener('click', function() {
        console.log('food');
        apple.classList.add('show');
        setTimeout(() => {
            apple.classList.remove('show');
        }, 2500);

        setTimeout(() => {eatingSound.play();}, 3000);

        if (!hasSpoken) {
            hasSpoken = true;
            setTimeout(() => {
                speakThis("It was tasty!");
                showText("It was tasty!", 6);
                count = 0;
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
                interval = setInterval(() => toggleMouth(6), 120);
                hasSpoken = false;
            }, 4500);

            setTimeout(() => {
                showHappyStatus();
            }, 7000);
        } else {
            hasSpoken = false;
        }

        
    });

    // Music Play Button
    playBtn.addEventListener('click', function() {
        console.log('play');
        tanuki.classList.toggle('play');
        leftArms.forEach(function(leftArm) {
            leftArm.classList.toggle('play');
        });
        rightArms.forEach(function(rightArm) {
            rightArm.classList.toggle('play');
        });
        leftLegs.forEach(function(leftLeg) {
            leftLeg.classList.toggle('play');
        });
        rightLegs.forEach(function(rightLeg) {
            rightLeg.classList.toggle('play');
        });

        if (tanuki.classList.contains('play')) {
            audio.play();
        } else {
            audio.pause();
            audio.currentTime = 0;
            clearTimeout(speakTimeout);
        }

        if (!hasSpoken) {
            hasSpoken = true;
            speakTimeout = setTimeout(() => {
                speakThis("I'm having fun!");
                showText("I'm having fun!", 6);
                count = 0;
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
                interval = setInterval(() => toggleMouth(6), 120);
            }, 10000);

            setTimeout(() => {
                showHappyStatus();
            }, 18000);
        } else {
            hasSpoken = false;
        }
    });

    // Lean Button
    learnBtn.addEventListener('click', function() {
        console.log('learn');

        speakThis("What do you wanna teach me?");
        showText("What do you wanna teach me?", 10);
        count = 0;
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        interval = setInterval(() => toggleMouth(10), 120);

        setTimeout(() => {
            activeLearning = true;
            recognition.start();

            step1 = true;
            
        }, 1500);
    });


    function parseKeyword(keyword) {
        recognition.stop();
        console.log("Keyword: " + keyword);
        travellingKey = keyword;

        speakThis("I'm listening");
        showText("I'm listening...", 6);
        count = 0;
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        interval = setInterval(() => toggleMouth(6), 120);
        
        step1 = false;
        msgInput.value = null;
        step2 = true;

        setTimeout(() => {
            recognition.start();
        }, 1000);
    }

    function parseAnswer(answer) {
        console.log("Answer: " + answer);

        localStorage.setItem(`key-${travellingKey.toLowerCase()}`, answer);

        speakThis("I learned about " + travellingKey + "!");
        showText("I learned about " + travellingKey + "!", 10);
        count = 0;
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        interval = setInterval(() => toggleMouth(10), 120);

        msgInput.value = null;
        activeLearning = false;
        step2 = false;
    }

});
