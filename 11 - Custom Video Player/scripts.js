/* get elements */
const player = document.querySelector('.player');
const playerViewer = player.querySelector('.viewer');
const playButton = player.querySelector('.toggle');
// selecting attributes need []
const skipButtons = player.querySelectorAll('[data-skip]');
const sliders = player.querySelectorAll('.player__slider');
const progress = player.querySelector('.progress');
const progressBar = player.querySelector('.progress__filled');

/* functions and flags */
let modifyingSlider = false;
let movingProgress = false;

// https://www.w3schools.com/tags/ref_av_dom.asp for html video properties

function togglePlayPause() {
    // paused returns whether the audio/video is paused or not
    // (there is no flag for playing)
    if (playerViewer.paused) {
        playerViewer.play();
    } else {
        playerViewer.pause();
    }
}

/*
This function togglePlayButton is not inside togglePlayPause
since there may be other ways to make the video play or pause
other than the ones listened (like using console directly)
 */
function togglePlayButton() {
    playButton.textContent = playerViewer.paused ? '►' : '❚❚';
}

function skipButtonClicked() {
    // dataset contains all custom data with data- as prefix attached to the html element
    // use .to access attributes (like playButton.title)
    const skipAmount = this.dataset.skip;

    playerViewer.currentTime += parseFloat(skipAmount);
}

function sliding() {
    const propertyToBeChanged = this.name;
    playerViewer[propertyToBeChanged] = this.value;
}

function updateProgressBar() {
    const progressPercent = playerViewer.currentTime / playerViewer.duration * 100;
    progressBar.style.flexBasis = `${progressPercent}%`;
}

function updateVideo(e) {
    // offsetX = offset from left for that event,
    // offsetWidth = total offset for the progress bar
    playerViewer.currentTime = e.offsetX / progress.offsetWidth * playerViewer.duration;
}

/* Hook up event listeners */

// play and pause
playerViewer.addEventListener('click', togglePlayPause);
playButton.addEventListener('click', togglePlayPause);
playerViewer.addEventListener('pause', togglePlayButton);
playerViewer.addEventListener('play', togglePlayButton);

// update the progress bar whenever the video change (not when paused)
playerViewer.addEventListener('timeupdate', updateProgressBar);
progress.addEventListener('mousemove', (e) => movingProgress && updateVideo(e));
progress.addEventListener('mousedown', () => movingProgress = true);
progress.addEventListener('mouseup', () => movingProgress = false);
progress.addEventListener('click', updateVideo);

// skipping
skipButtons.forEach(skipButton => {
    skipButton.addEventListener('click', skipButtonClicked);
});

// volume and playback speed
sliders.forEach(slide => {
    slide.addEventListener('click', sliding);
    // if modifying slider is true, run sliding(), otherwise return false
    // (takes advantage of lazy evaluation)
    slide.addEventListener('mousemove', () => modifyingSlider && sliding());
    slide.addEventListener('mousedown', () => modifyingSlider = true);
    slide.addEventListener('mouseup', () => modifyingSlider = false);
});