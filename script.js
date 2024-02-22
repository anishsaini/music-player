// this is java script

let progress = document.getElementById("progress");
let song = document.getElementById("song");
let ctRl = document.getElementById("ctRl");
let playlist = document.getElementById("playlist");

song.onloadedmetadata = function () {
  progress.max = song.duration;
  progress.value = song.currentTime;
};
function playpause() {
  if (ctRl.classList.contains("fa-pause")) {
    song.pause();
    ctRl.classList.remove("fa-pause");
    ctRl.classList.add("fa-play");
  } else {
    song.play();
    ctRl.classList.add("fa-pause");
    ctRl.classList.remove("fa-play");
  }
}

if (song.play()) {
  setInterval(() => {
    progress.value = song.currentTime;
  }, 500);
}
progress.onchange = function () {
  song.play();
  song.currentTime = progress.value;
  ctRl.classList.add("fa-pause");
  ctRl.classList.remove("fa-play");
};
