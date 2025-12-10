// Unlock audio on first touch/click
document.addEventListener("click", async () => {
    if (Tone.context.state !== "running") {
        await Tone.context.resume();
        console.log("AudioContext resumed");
    }
}, { once: true });


// ------------------
// Test beep
// ------------------
document.getElementById("test-audio").addEventListener("click", async () => {
    await Tone.start();
    let synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease("C4", "8n");
});


// Synth for intervals
const synth = new Tone.Synth().toDestination();

// Interval data
const INTERVALS = {
    "Minor 2nd": 1,
    "Major 2nd": 2,
    "Minor 3rd": 3,
    "Major 3rd": 4,
    "Perfect 4th": 5,
    "Tritone": 6,
    "Perfect 5th": 7,
    "Minor 6th": 8,
    "Major 6th": 9,
    "Minor 7th": 10,
    "Major 7th": 11,
    "Octave": 12
};

const NOTES = ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"];

let currentInterval = null;
let score = 0;


// Create interval choice buttons
function createButtons() {
    const container = document.getElementById("buttons");
    container.innerHTML = "";

    Object.keys(INTERVALS).forEach(intervalName => {
        let btn = document.createElement("button");
        btn.textContent = intervalName;
        btn.className = "choice";
        btn.addEventListener("click", () => checkAnswer(intervalName));
        container.appendChild(btn);
    });
}
createButtons();


// Play interval
document.getElementById("play-interval").addEventListener("click", async () => {
    await Tone.start();

    let rootIndex = Math.floor(Math.random() * NOTES.length);
    let rootNote = NOTES[rootIndex];

    let intervalNames = Object.keys(INTERVALS);
    currentInterval = intervalNames[Math.floor(Math.random() * intervalNames.length)];

    let semitones = INTERVALS[currentInterval];
    let secondNote = NOTES[(rootIndex + semitones) % NOTES.length];

    console.log("Interval:", currentInterval, rootNote, secondNote);

    synth.triggerAttackRelease(rootNote, "8n");
    setTimeout(() => {
        synth.triggerAttackRelease(secondNote, "8n");
    }, 600);

    document.getElementById("result").textContent = "";
});


// Evaluate answer
function checkAnswer(guess) {
    const result = document.getElementById("result");

    if (guess === currentInterval) {
        result.textContent = "Correct!";
        result.style.color = "green";
        score++;
    } else {
        result.textContent = "Incorrect — it was: " + currentInterval;
        result.style.color = "red";
    }

    document.getElementById("score").textContent = "Score: " + score;
}
