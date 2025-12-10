// Unlock Audio on first click
document.body.addEventListener("click", async () => {
  if (Tone.context.state !== "running") {
    await Tone.start();
  }
}, { once: true });

/* ---------------- PIANO INTERVAL TRAINER ---------------- */

const intervals = [
  { name: "Minor 2nd", semitones: 1 },
  { name: "Major 2nd", semitones: 2 },
  { name: "Minor 3rd", semitones: 3 },
  { name: "Major 3rd", semitones: 4 },
  { name: "Perfect 4th", semitones: 5 },
  { name: "Tritone", semitones: 6 },
  { name: "Perfect 5th", semitones: 7 }
];

const piano = new Tone.Synth().toDestination();
let intervalAnswer;

document.getElementById("play-interval").onclick = () => {
  const root = 60 + Math.floor(Math.random() * 12); // random MIDI
  const intObj = intervals[Math.floor(Math.random() * intervals.length)];
  intervalAnswer = intObj.name;

  piano.triggerAttackRelease(Tone.Frequency(root, "midi"), "8n");
  piano.triggerAttackRelease(Tone.Frequency(root + intObj.semitones, "midi"), "8n", "+0.5");
};

const intervalButtonsDiv = document.getElementById("interval-buttons");
intervals.forEach(i => {
  const btn = document.createElement("button");
  btn.textContent = i.name;
  btn.onclick = () => {
    document.getElementById("interval-result").textContent =
      i.name === intervalAnswer ? "Correct!" : `Nope! It was ${intervalAnswer}`;
  };
  intervalButtonsDiv.appendChild(btn);
});

/* ---------------- GUITAR POWER CHORD TRAINER ---------------- */

const guitar = new Tone.MonoSynth().toDestination();
const chords = [
  { name: "5th Chord", interval: 7 },
  { name: "4th Chord", interval: 5 },
  { name: "Minor 6", interval: 8 }
];

let chordAnswer;

document.getElementById("play-chord").onclick = () => {
  const root = 40 + Math.floor(Math.random() * 12);
  const ch = chords[Math.floor(Math.random() * chords.length)];
  chordAnswer = ch.name;

  guitar.triggerAttackRelease(Tone.Frequency(root, "midi"), "8n");
  guitar.triggerAttackRelease(Tone.Frequency(root + ch.interval, "midi"), "8n", "+0.1");
};

const chordButtonsDiv = document.getElementById("chord-buttons");
chords.forEach(c => {
  const btn = document.createElement("button");
  btn.textContent = c.name;
  btn.onclick = () => {
    document.getElementById("chord-result").textContent =
      c.name === chordAnswer ? "Correct!" : `Nope! It was ${chordAnswer}`;
  };
  chordButtonsDiv.appendChild(btn);
});

/* ---------------- DRUM TEMPO TRAINER ---------------- */

const drum = new Tone.MembraneSynth().toDestination();
let tempoAnswer;

document.getElementById("play-tempo").onclick = () => {
  tempoAnswer = [60, 80, 100, 120][Math.floor(Math.random() * 4)];

  const now = Tone.now();
  for (let i = 0; i < 4; i++) {
    drum.triggerAttackRelease("C2", "8n", now + i * (60 / tempoAnswer));
  }
};

const tempos = [60, 80, 100, 120];
const tempoButtonsDiv = document.getElementById("tempo-buttons");

tempos.forEach(t => {
  const btn = document.createElement("button");
  btn.textContent = t + " BPM";
  btn.onclick = () => {
    document.getElementById("tempo-result").textContent =
      t === tempoAnswer ? "Correct!" : `Nope! It was ${tempoAnswer} BPM`;
  };
  tempoButtonsDiv.appendChild(btn);
});
