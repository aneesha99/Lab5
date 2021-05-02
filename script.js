// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
let input = document.getElementById('image-input');
const canvas = document.getElementById('user-image');
const context = canvas.getContext('2d');
const clearButton = document.querySelector("[type='reset']");
const readText = document.querySelector("[type='button']");
const submitButton = document.querySelector("[type='submit']");
const form = document.getElementById("generate-meme");
const formTextUp = document.getElementById('text-top');
const formTextDown = document.getElementById('text-bottom');
// Speech stuff
var synth = window.speechSynthesis;
var voiceSelect = document.getElementById('voice-selection');
var inputTxt = document.querySelectorAll("[type='text']");
var volumeRange = document.querySelector("[type='range']");
var volumeIcon = document.querySelector("[src = 'icons/volume-level-3.svg']");
//var concatenatedText = inputTxt[0].value + " " + inputTxt[1].value;
/* var pitch = document.querySelector('#pitch');
var pitchValue = document.querySelector('.pitch-value');
var rate = document.querySelector('#rate');
var rateValue = document.querySelector('.rate-value'); */

var voices = [];

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
    // Clear the canvas context
    context.clearRect(0, 0, canvas.width, canvas.height);
    // TODO: Toggle relevant buttons
    // Fill canvas with black
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    // Draw image onto canvas
    let dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
    context.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);
});

input.addEventListener('change', () => {
    // load in the selected image into the Image object (img) src attribute
    const file = input.files[0];
    img.src = URL.createObjectURL(file);
    // set the image alt attribute by extracting the image file name from the file path
    img.alt = file.name;
});

clearButton.addEventListener('click', () => {
    // Clear image and text
    context.clearRect(0, 0, canvas.width, canvas.height);
    formTextUp.value = '';
    formTextDown.value = '';
    // Toggle relevant buttons
    readText.disabled = true;
    clearButton.disabled = true;
});

form.addEventListener('submit', (event) => {
    // function handleForm(event) { event.preventDefault(); }
    // form.addEventListener('submit', handleForm);
    event.preventDefault();
    context.font = "50px Georgia";
    // Create text with white fill and black borders
    context.fillStyle = "white";
    context.strokeStyle = "black";
    context.fillText(formTextUp.value, canvas.width / 2.8, 50);
    context.strokeText(formTextUp.value, canvas.width / 2.8, 50);
    context.fillText(formTextDown.value, canvas.width / 2.8, 380);
    context.strokeText(formTextDown.value, canvas.width / 2.8, 380);
    readText.disabled = false;
    clearButton.disabled = false;
});

readText.addEventListener('click', (event) => {
    event.preventDefault();
    var concatenatedText = inputTxt[0].value + " " + inputTxt[1].value;
    speak(concatenatedText);

    //inputTxt.blur();
});

/**
 * Function to speak meme generated text
 */
function speak(concatenatedText) {
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    if (concatenatedText.value !== '') {
        var utterThis = new SpeechSynthesisUtterance(concatenatedText);
        utterThis.onend = function(event) {
            console.log('SpeechSynthesisUtterance.onend');
        }
        utterThis.onerror = function(event) {
            console.error('SpeechSynthesisUtterance.onerror');
        }
        var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
        for (let i = 0; i < voices.length; i++) {
            if (voices[i].name === selectedOption) {
                utterThis.voice = voices[i];
                break;
            }
        }
        utterThis.volume = volumeRange.value / 100;
        synth.speak(utterThis);
    }
}

/**
 * Function to change the volume icons depending on the volume ranges
 */
volumeRange.addEventListener('input', () => {
    var vol = volumeRange.value;
    if (vol == 0) {
        volumeIcon.src = "icons/volume-level-0.svg";
    } else if (vol <= 33) {
        volumeIcon.src = "icons/volume-level-1.svg";
    } else if (vol <= 66) {
        volumeIcon.src = "icons/volume-level-2.svg";
    } else if (vol <= 100) {
        volumeIcon.src = "icons/volume-level-3.svg";
    }
});

/**
 * Function to populate the drop down selector of different voices to read
 * meme text
 */
function populateVoiceList() {
    voices = synth.getVoices().sort(function(a, b) {
        const aname = a.name.toUpperCase(),
            bname = b.name.toUpperCase();
        if (aname < bname) return -1;
        else if (aname == bname) return 0;
        else return +1;
    });
    var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
    voiceSelect.innerHTML = '';
    for (let i = 0; i < voices.length; i++) {
        var option = document.createElement('option');
        option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

        if (voices[i].default) {
            option.textContent += ' -- DEFAULT';
        }

        option.setAttribute('data-lang', voices[i].lang);
        option.setAttribute('data-name', voices[i].name);
        voiceSelect.appendChild(option);
    }
    voiceSelect.selectedIndex = selectedIndex;
}
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}
voiceSelect.disabled = false;


/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
    let aspectRatio, height, width, startX, startY;

    // Get the aspect ratio, used so the picture always fits inside the canvas
    aspectRatio = imageWidth / imageHeight;

    // If the apsect ratio is less than 1 it's a verical image
    if (aspectRatio < 1) {
        // Height is the max possible given the canvas
        height = canvasHeight;
        // Width is then proportional given the height and aspect ratio
        width = canvasHeight * aspectRatio;
        // Start the Y at the top since it's max height, but center the width
        startY = 0;
        startX = (canvasWidth - width) / 2;
        // This is for horizontal images now
    } else {
        // Width is the maximum width possible given the canvas
        width = canvasWidth;
        // Height is then proportional given the width and aspect ratio
        height = canvasWidth / aspectRatio;
        // Start the X at the very left since it's max width, but center the height
        startX = 0;
        startY = (canvasHeight - height) / 2;
    }

    return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}