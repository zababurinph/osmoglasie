//@formatter:off

'use strict';
var tempoConst = 60,
      parts = ["soprano1L", "soprano2L", "altL", "tenor1L", "tenor2L", "baritonL", "basL"],
      vol = 70,
      qs = (sel) => document.querySelector(sel),
      qa = (sel) => document.querySelectorAll(sel);

var song = "",
    songID = "",
    toneKey = "tone65",
    tone = 65,
    golosa = [true, true, true, true, true, true, true],
    velocity = [70, 70, 70, 70, 70, 70, 70],
    activePage = 'glases',
    activeChapter = '',
    pageName = '';

window.addEventListener("load", e => {
  // alert(CryptoJS.MD5('fermata' + 'ztd'))
  qs('#' + toneKey).classList.add("keyChoise");
  activeChapter = Object.keys(data[activePage])[0]
  choosePage(activePage);
})

window.addEventListener("resize", e => {
  if (document.documentElement.clientWidth > 820) qs('#mobileMenu').classList.remove("active");
}, true)

qs('#checkbox_navbar').addEventListener('change', e => {
  qs('body').classList.toggle('add-font')
})

function generateTemplatePage(id) {
  var inner = '<h3>Выберите раздел:</h3><div class="flex">';

  Object.keys(data[id]).map(i => inner += '<div class="btn" onclick="chooseChapter(`' + i + '`)" id="' + i + '">' + data[id][i].name + '</div>')
  inner += '</div><h3>Выберите мелодию:</h3><div id="templateMelody" class="flex">';
  inner += generateTemplateChapter(Object.keys(data[id])[0]);
  inner += '</div><h3 id="textMelodyShort"></h3>';

  qs('#template').innerHTML = inner;
}

function generateTemplateChapter(id) {
  var inner = '';
  Object.keys(data[activePage][id]).map(i => {
    if (i !== 'name') inner += '<div class="btn" onclick="chooseSong(`' + i + '`)" id="' + i + '">' + data[activePage][id][i][7] + '</div>';
  });
  return inner;
}

var resetVolume = (id) => qs('#' + id).value = vol;
var resetTempo = (id) => qs('#' + id).value = -5;

var changeActiveParts = (parts, value) =>
  value ? parts.map((part) => {
        qs('#' + part.slice(0, -1) + "Div").classList.remove("off");
        qs('#' + part.slice(0, -1)).checked = true;
      }) : parts.map((part) => {
        qs('#' + part.slice(0, -1) + "Div").classList.add("off");
        qs('#' + part.slice(0, -1)).checked = false;
      });

function choosePage(id) {
  resetMidiPlayer();
  qs('#template').innerHTML = '';
  qs('#wrongPassword').style.display = 'none';
  qs('#mobileMenu').classList.remove("active");
  qa('.' + activePage).forEach(e => e.classList.remove('keyChoise'));
  qa('.' + id).forEach(e => e.classList.add('keyChoise'));

  activePage = id;

  if (id === 'favorite') {
    pageName = 'Избранное';
    qs('#bodyDiv').style.display = 'none';
    qs('#password').style.display = 'flex';
    qa('.favorite').forEach(e => e.classList.add('keyChoise'));
  } else {
    qs('#password').style.display = 'none';
    qs('#bodyDiv').style.display = 'block';
    generateTemplatePage(id);
    activeChapter = Object.keys(data[id])[0];
    pageName = qs('#' + activeChapter).textContent;
    chooseChapter(activeChapter);
    qs('#' + songID).classList.add("keyChoise");
  }
}

function chooseChapter(id) {
  console.log(id);
  resetMidiPlayer();
  qs('#' + activeChapter).classList.remove("keyChoise");
  qs('#' + id).classList.add("keyChoise");

  qs('#templateMelody').innerHTML = generateTemplateChapter(id);

  pageName = qs('#' + id).textContent;
  activeChapter = id;
  var newSongID = Object.keys(data[activePage][id])[1];

  qs('#' + newSongID).classList.add("keyChoise");
  changeSong(newSongID, id, activePage);
}

function chooseSong(id) {
  console.log(id);
  resetMidiPlayer();
  qs('#' + songID).classList.remove("keyChoise");
  qs('#' + id).classList.add("keyChoise");
  changeSong(id, activeChapter, activePage);
}

function changeSong(melodyID, chapterID, pageID) {
  qs('#textMelody').innerHTML = data[pageID][chapterID][melodyID][6];
  qs('#textMelodyShort').innerHTML = data[pageID][chapterID][melodyID][5];
  changeActiveParts(parts, false);
  changeActiveParts(data[pageID][chapterID][melodyID][0], true);
  song = makeShortMelody(data[pageID][chapterID][melodyID][1], data[pageID][chapterID][melodyID][2]);
  qs('#player_short').src = song;
  songID = melodyID;
}

function chooseTone(value, id) {
  qs('#' + toneKey).classList.remove("keyChoise");
  qs('#' + id).classList.add("keyChoise");
  toneKey = id;
  tone = value;
}

function generateSong() {
  golosa = ["soprano1", "soprano2", "alt", "tenor1", "tenor2", "bariton", "bas"].map((id) => qs('#' + id).checked);

  if (golosa.every(g => g === false)) {
    window.alert('Невозможно сгенерировать мелодию: не выбрана ни одна партия')
  } else {
    velocity = ["soprano1Vol", "soprano2Vol", "altVol", "tenor1Vol", "tenor2Vol", "baritonVol", "basVol"].map((id) => qs('#' + id).value);

    console.log(golosa);
    console.log(velocity);

    song = makeMelody(data[activePage][activeChapter][songID][3], data[activePage][activeChapter][songID][4])

    qs('#trackName').innerHTML = pageName + ' "' + qs('#' + songID).textContent + '" в транспонировании  ' + qs('#' + toneKey).textContent + ' в темпе ' + (Number(qs('#tempo').value) + 11);
    qs('#songDiv').classList.remove("off");
    qs('#player').src = song;
  }
}

function rotateArray(arr) {
  var newArr = [];
  arr[0].map((note) => newArr.push([]));
  arr.map((part, n) => part.map((note, i) => newArr[i].push(note)));
  return newArr;
}

function makeShortMelody(melodyData, tempoData) {
  tempoData = tempoData.map((str) => str.map((t) => t * tempoConst));
  var volume = Array(melodyData.length).fill(70);
  return makeMidi(melodyData, tempoData, volume);
}

function makeMelody(melodyData, tempoData) {
  var delta = 65 - tone,
    melody = [],
    temp = [],
    volume = [],
    tempo = Math.abs(qs('#tempo').value) * tempoConst / 3;

  golosa.map((g, i) => {
    if (g) {
      melody.push(melodyData[i].map((note) => (note !== 0 ? note - delta : 0)));
      temp.push(tempoData[i].map((t) => t * tempo));
      volume.push(Number(velocity[i]));
    }
  });
  return makeMidi(melody, temp, volume);
}

function makeMidi(melody, temp, volume) {
  var file = new Midi.File();
  var tracks = [];

  melody.map((part) => tracks.push(new Midi.Track()));
  melody = rotateArray(melody);

  console.log(melody);

  melody.map((chord, i) => {
    chord.forEach((note, part) => {
      if (note !== 0 && part < chord.length - 1) {
        var partsWithSameNote = chord.map((n, j) => (note === n ? j : "")).filter(String);
        if (partsWithSameNote.length > 1) {
          var volumesOfParts = partsWithSameNote.map((ind) => volume[ind]);
          var partWithMaxVolume =
            partsWithSameNote[
              volumesOfParts.indexOf(Math.max.apply(null, volumesOfParts))
            ];
          partsWithSameNote.map((index) =>
            index !== partWithMaxVolume ? (chord[index] = 0) : 0
          );
        }
      }
    });
    chord.map((note, part) =>
      tracks[part].addNote(0, note, temp[part][i], 0, volume[part])
    );
  });
  console.log(melody);

  tracks.map((t) => file.addTrack(t));
  return "data:audio/midi;base64," + btoa(file.toBytes());
}

var openMenu = () => qs('#mobileMenu').classList.toggle("active")

function generateTemplateFavorite(id) {
  qs('#password').style.display = 'flex';
  qs('#wrongPassword').style.display = 'none';

  activeChapter = id;

  var inner = '';
  inner += '<h3>Выберите мелодию:</h3><div id="templateMelody" class="flex">';
  inner += generateTemplateChapter(id);
  inner += '</div><h3 id="textMelodyShort"></h3>';
  qs('#template').innerHTML = inner;

  var newSongID = Object.keys(data[activePage][id])[0];

  qs('#' + newSongID).classList.add("keyChoise");
  changeSong(newSongID, activeChapter, activePage);
  qs('#bodyDiv').style.display = 'block';
}

function openPage() {
  var k = CryptoJS.MD5(qs('#inputPassword').value + key);

  if (k == key1) generateTemplateFavorite('pstgu');
  else if (k == key2) generateTemplateFavorite('fermata');
  else {
    qs('#bodyDiv').style.display = 'none';
    qs('#template').innerHTML = '';
    qs('#wrongPassword').style.display = 'block';
  }
}

function resetMidiPlayer() {
  qs('#trackName').innerHTML = 'Track';
  qs('#player').src = '';
  qs('#player_short').src = '';
  qs('#songDiv').classList.add('off');
}
