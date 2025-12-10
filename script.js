// Music Ear Trainer v1 — Version C (Piano, Guitar, Drums)
// Works fully client-side using Tone.js
// Paste this into script.js in your GitHub repo.

(async function(){
  // ---------- Simple utilities ----------
  const rand = arr => arr[Math.floor(Math.random()*arr.length)];
  const shuffle = arr => arr.map(a=>[Math.random(),a]).sort((a,b)=>a[0]-b[0]).map(a=>a[1]);
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

  // ---------- DOM ----------
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const panels = Array.from(document.querySelectorAll('.panel'));
  tabs.forEach(t=>{
    t.addEventListener('click', ()=>{
      tabs.forEach(x=>x.classList.remove('active'));
      panels.forEach(p=>p.classList.remove('visible'));
      t.classList.add('active');
      const id = t.dataset.tab;
      document.getElementById(id).classList.add('visible');
    });
  });

  // ---------- Tone / Instruments ----------
  await Tone.start(); // mobile: must be triggered by user gesture, but Tone.start now safe on first interaction
  // Piano-ish: use an FM synth with an envelope
  const pianoSynth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.8 }
  }).toDestination();

  // Pluck/guitar-ish
  const pluck = new Tone.PluckSynth().toDestination();

  // Drums: membrane for kick, noise for snare
  const kick = new Tone.MembraneSynth({pitchDecay:0.05, envelope:{attack:0.001, decay:0.4, sustain:0.01, release:0.4}}).toDestination();
  const snare = new Tone.NoiseSynth({volume:-6, noise:{type:'white'}, envelope:{attack:0.001, decay:0.2, sustain:0}}).toDestination();
  const hihat = new Tone.MetalSynth({frequency:200, envelope:{attack:0.001, decay:0.1, release:0.01}, harmonicity:6}).toDestination();

  // ---------- Pitch helpers ----------
  const PIANO_NOTES = ["C3","D3","E3","F3","G3","A3","B3","C4","D4","E4","F4","G4","A4"];
  const INTERVALS = {
    easy: ["M2","m3","P5"],
    medium: ["m2","M2","m3","M3","P4","P5","m6"],
    hard: ["m2","M2","m3","M3","P4","P5","m6","M6","m7","M7"]
  };

  // Convert interval string to semitone count
  const intervalSemis = {
    'm2':1,'M2':2,'m3':3,'M3':4,'P4':5,'TT':6,'P5':7,'m6':8,'M6':9,'m7':10,'M7':11
  };

  // compute note shifted by semitones (simple helper)
  function transpose(note, semis){
    // note like C4
    const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const match = note.match(/^([A-G]#?)(\d)$/);
    if(!match) return note;
    let [_, name, oct] = match;
    let idx = names.indexOf(name);
    let midi = idx + (parseInt(oct)+1)*12; // midi number rough
    midi += semis;
    let newOct = Math.floor(midi/12)-1;
    let newName = names[(midi%12+12)%12];
    return newName + newOct;
  }

  // ---------- UI elements ----------
  // Piano
  const pianoPlayInterval = document.getElementById('piano-play-interval');
  const pianoPlayChord = document.getElementById('piano-play-chord');
  const pianoPlayInversion = document.getElementById('piano-play-inversion');
  const pianoChoices = document.getElementById('piano-choices');
  const pianoScoreEl = document.getElementById('piano-score');
  const pianoTrialsEl = document.getElementById('piano-trials');
  let pianoScore=0, pianoTrials=0;

  // Guitar
  const guitarPlayPower = document.getElementById('guitar-play-power');
  const guitarPlayInterval = document.getElementById('guitar-play-interval');
  const guitarPlayStrum = document.getElementById('guitar-play-strum');
  const guitarChoices = document.getElementById('guitar-choices');
  const guitarScoreEl = document.getElementById('guitar-score');
  const guitarTrialsEl = document.getElementById('guitar-trials');
  let guitarScore=0, guitarTrials=0;

  // Drums
  const drumPlayTempo = document.getElementById('drum-play-tempo');
  const drumPlaySub = document.getElementById('drum-play-sub');
  const drumPlayRhythm = document.getElementById('drum-play-rhythm');
  const drumChoices = document.getElementById('drum-choices');
  const drumScoreEl = document.getElementById('drum-score');
  const drumTrialsEl = document.getElementById('drum-trials');
  let drumScore=0, drumTrials=0;

  document.getElementById('reset-scores').addEventListener('click', ()=>{
    pianoScore=pianoTrials=guitarScore=guitarTrials=drumScore=drumTrials=0;
    updateScores();
  });

  function updateScores(){
    pianoScoreEl.textContent = pianoScore;
    pianoTrialsEl.textContent = pianoTrials;
    guitarScoreEl.textContent = guitarScore;
    guitarTrialsEl.textContent = guitarTrials;
    drumScoreEl.textContent = drumScore;
    drumTrialsEl.textContent = drumTrials;
  }

  // ---------- Piano: Interval ----------
  pianoPlayInterval.addEventListener('click', async ()=>{
    await Tone.start();
    const diff = document.getElementById('piano-diff').value;
    const possible = INTERVALS[diff];
    const interval = rand(possible);
    // pick a base note so transposed note in range
    const base = rand(PIANO_NOTES.slice(0,8)); // keep in lower range
    const semis = intervalSemis[interval];
    const upper = transpose(base, semis);
    // Play two notes: base then upper
    pianoSynth.triggerAttackRelease(base, "0.6");
    setTimeout(()=> pianoSynth.triggerAttackRelease(upper, "0.6"), 500);

    // Build multiple choice answers
    const choices = shuffle([interval, ...Array.from({length:3}, ()=> rand(INTERVALS.hard))]).slice(0,4);
    renderChoices(pianoChoices, choices, interval, (isCorrect)=>{
      pianoTrials++; if(isCorrect) pianoScore++;
      updateScores();
    });
  });

  // Piano: chord quality (major/minor/dim/aug)
  pianoPlayChord.addEventListener('click', async ()=>{
    await Tone.start();
    const qualities = {
      major: [0,4,7],
      minor: [0,3,7],
      diminished: [0,3,6],
      augmented: [0,4,8]
    };
    const qualityNames = Object.keys(qualities);
    const chosen = rand(qualityNames);
    const semis = qualities[chosen];
    const root = rand(["C3","D3","E3","F3","G3","A3"]);
    const notes = semis.map(s=>transpose(root,s));
    notes.forEach((n,i)=> setTimeout(()=> pianoSynth.triggerAttackRelease(n, "0.9"), i*30));
    const choices = shuffle([chosen, ...shuffle(qualityNames).filter(q=>q!==chosen).slice(0,3)]);
    renderChoices(pianoChoices, choices, chosen, (isCorrect)=>{
      pianoTrials++; if(isCorrect) pianoScore++;
      updateScores();
    });
  });

  // Piano: inversion
  pianoPlayInversion.addEventListener('click', async ()=>{
    await Tone.start();
    const tri = [0,4,7]; // major triad root position semis
    const root = rand(["C3","D3","E3","F3","G3","A3"]);
    const posNotes = tri.map(s=>transpose(root,s));
    const inversions = [
      {label:"Root position", order:posNotes},
      {label:"1st inversion", order:[transpose(root,4), transpose(root,7), transpose(root,12)]},
      {label:"2nd inversion", order:[transpose(root,7), transpose(root,12), transpose(root,16)]}
    ];
    const chosen = rand(inversions);
    chosen.order.forEach((n,i)=> setTimeout(()=> pianoSynth.triggerAttackRelease(n, "0.9"), i*80));
    const choices = shuffle(inversions.map(x=>x.label));
    renderChoices(pianoChoices, choices, chosen.label, (isCorrect)=>{
      pianoTrials++; if(isCorrect) pianoScore++;
      updateScores();
    });
  });

  // ---------- Guitar: power chord (two-note) ----------
  guitarPlayPower.addEventListener('click', async ()=>{
    await Tone.start();
    const powerRoots = ["E2","A2","D3","G3","B3"];
    const root = rand(powerRoots);
    const fifth = transpose(root, 7);
    // play as plucked chord
    pluck.triggerAttackRelease(root, "1");
    setTimeout(()=> pluck.triggerAttackRelease(fifth, "1"), 60);
    const choices = shuffle([root + " (root)", fifth + " (5th)", "Power chord (root+5)", "Major triad"]).slice(0,4);
    // We'll ask user to pick which chord they heard (power chord / major triad / minor triad / single note)
    const correct = "Power chord (root+5)";
    renderChoices(guitarChoices, choices, correct, (isCorrect)=>{
      guitarTrials++; if(isCorrect) guitarScore++;
      updateScores();
    });
  });

  // Guitar: interval using pluck
  guitarPlayInterval.addEventListener('click', async ()=>{
    await Tone.start();
    const ints = INTERVALS.medium;
    const chosen = rand(ints);
    const base = rand(["E3","F3","G3","A3","B2","C3"]);
    const upper = transpose(base, intervalSemis[chosen]);
    pluck.triggerAttackRelease(base, "0.8");
    setTimeout(()=> pluck.triggerAttackRelease(upper, "0.8"), 400);
    const choices = shuffle([chosen, ...shuffle(INTERVALS.hard).slice(0,3)]);
    renderChoices(guitarChoices, choices, chosen, (isCorrect)=>{
      guitarTrials++; if(isCorrect) guitarScore++;
      updateScores();
    });
  });

  // Guitar: strum pattern recognition (down/up combos)
  const STRUM_PATTERNS = {
    "Down - Down - Up - Down": [1,1,0.5,1],
    "Down - Up - Down - Up": [1,0.5,1,0.5],
    "Down - Down - Down - Down": [1,1,1,1],
    "Down - Up - Up - Down": [1,0.5,0.5,1]
  };
  guitarPlayStrum.addEventListener('click', async ()=>{
    await Tone.start();
    const label = rand(Object.keys(STRUM_PATTERNS));
    const beats = STRUM_PATTERNS[label];
    // play per-beat pluck of same root
    const root = "E3";
    let t = 0;
    beats.forEach((dur,i)=> {
      setTimeout(()=> pluck.triggerAttackRelease(root, "0.5"), t);
      t += Math.max(200, dur*200);
    });
    const choices = shuffle(Object.keys(STRUM_PATTERNS));
    renderChoices(guitarChoices, choices, label, (isCorrect)=>{
      guitarTrials++; if(isCorrect) guitarScore++;
      updateScores();
    });
  });

  // ---------- Drums ----------
  // Tempo guessing: play metronome at random tempo
  drumPlayTempo.addEventListener('click', async ()=>{
    await Tone.start();
    const tempo = Math.floor(Math.random()*80)+70; // 70-150
    const clicks = 8;
    // schedule clicks via setTimeout using Tone triggers
    const ms = Math.floor(60000/tempo);
    let i=0;
    const id = setInterval(()=>{
      // accent every 4
      if(i%4===0){ kick.triggerAttackRelease("C2","8n"); } else { snare.triggerAttackRelease("8n"); }
      i++; if(i>=clicks) clearInterval(id);
    }, ms);
    // Create multiple choice options near true tempo
    const opts = shuffle([tempo, tempo+5, tempo-5, tempo+10]).slice(0,4);
    renderChoices(drumChoices, opts.map(x=>`${x} BPM`), `${tempo} BPM`, (isCorrect)=>{
      drumTrials++; if(isCorrect) drumScore++;
      updateScores();
    });
  });

  // Subdivision recognition: quarter / eighth / triplet / sixteenth
  drumPlaySub.addEventListener('click', async ()=>{
    await Tone.start();
    const subs = {
      "Quarter": 1,
      "Eighth": 0.5,
      "Triplet": 2/3,
      "Sixteenth": 0.25
    };
    const label = rand(Object.keys(subs));
    const baseTempo = 90;
    const ms = Math.floor(60000/baseTempo * subs[label]);
    // play 8 hits at that subdivision
    let i=0; const clicks=8;
    const id = setInterval(()=>{
      hihat.triggerAttackRelease("16n");
      i++; if(i>=clicks) clearInterval(id);
    }, ms);
    renderChoices(drumChoices, shuffle(Object.keys(subs)), label, (isCorrect)=>{
      drumTrials++; if(isCorrect) drumScore++;
      updateScores();
    });
  });

  // Rhythm dictation: play a short pattern of kick/snare, ask to pick
  drumPlayRhythm.addEventListener('click', async ()=>{
    await Tone.start();
    const patterns = {
      "Kick - Snare - Kick - Kick": ["K","S","K","K"],
      "Kick - Kick - Snare - Kick": ["K","K","S","K"],
      "Kick - Snare - Kick - Snare": ["K","S","K","S"],
      "Kick - Kick - Kick - Snare": ["K","K","K","S"]
    };
    const label = rand(Object.keys(patterns));
    const pattern = patterns[label];
    let t=0;
    pattern.forEach((p,i)=>{
      setTimeout(()=> {
        if(p==="K") kick.triggerAttackRelease("C2","8n");
        if(p==="S") snare.triggerAttackRelease("8n");
      }, t);
      t += 300;
    });
    renderChoices(drumChoices, shuffle(Object.keys(patterns)), label, (isCorrect)=>{
      drumTrials++; if(isCorrect) drumScore++;
      updateScores();
    });
  });

  // ---------- Generic renderer for multiple-choice ----------
  function clearChoices(node){
    node.innerHTML = '';
  }

  function renderChoices(node, choices, correctValue, callback){
    clearChoices(node);
    choices.forEach(choice=>{
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = String(choice);
      btn.addEventListener('click', ()=>{
        const isCorrect = String(choice) === String(correctValue);
        btn.classList.add(isCorrect ? 'correct' : 'wrong');
        // mark others
        Array.from(node.children).forEach(c=>{
          c.disabled = true;
          if(c.textContent === String(correctValue)) c.classList.add('correct');
        });
        // callback after short delay
        setTimeout(()=> {
          callback(isCorrect);
        }, 600);
      });
      node.appendChild(btn);
    });
  }

  // initial update
  updateScores();

  // Accessibility tip: ensure first user gesture to unlock audio on mobile
  document.body.addEventListener('click', async function unlock(){
    await Tone.start();
    document.body.removeEventListener('click', unlock);
  }, {once:true});

})();
