function formatTwoDigits(number) {
  return number.toString().padStart(2, '0');
}

const backgroundProgress = document.querySelector(".time");
const minutes = document.querySelector('#minutes');
const seconds = document.querySelector('#seconds');
const skipButton = document.getElementById('skipbtn')
const focusButton = document.getElementById('focus')
const shortBreakButton = document.getElementById('shortb')
const longBreakButton = document.getElementById('longb')
const startPauseButton = document.getElementById('start-pause');
const pomoCountText = document.getElementById('count')
const modeText = document.getElementById('mode')
let alarmaudio
let backgroundaudio
let isfromskip


let pomoSettings ;
if(localStorage.settings != null){
    pomoSettings = JSON.parse(localStorage.settings)
}else{
    pomoSettings = {
      focus :25,
      shortBreak :5,
      longBreak :15,
      BreakAutoStart :false , 
      numberOfShortBreaks :4,
      alarmSound : 'Default',
      backgroundSound : 'None'

    };
    localStorage.setItem('settings' , JSON.stringify(pomoSettings))

}



changeAnimationDuration(pomoSettings.focus *60)
minutes.innerHTML = pomoSettings.focus

let totalSeconds = Number(minutes.innerHTML) * 60 + Number(seconds.innerHTML);
let timer;
let isRunning = false;
let currentMode = 'focus';
let pomoCount = 0;


focusButton.addEventListener('click', function() {
  setMode('focus', pomoSettings.focus, 0, 'linear-gradient(to right, rgba(111, 184, 111, 0.568) 50%, transparent 51%)' , 'Focus time!!');
});

shortBreakButton.addEventListener('click', function() {
  setMode('short break', pomoSettings.shortBreak, 0, 'linear-gradient(to right, rgba(111, 163, 184, 0.568) 50%, transparent 51%)' , 'Break time! Stay Close');
});

longBreakButton.addEventListener('click', function() {
  setMode('long break', pomoSettings.longBreak, 0, 'linear-gradient(to right, rgba(145, 111, 184, 0.568) 50%, transparent 51%)' , `Break time! You're "Focus champion"`);
});

function setMode(mode, mins, secs, animationColor , textmode , fromSettings) {
  document.documentElement.style.setProperty('--animation-color', animationColor);
  currentMode = mode;
  updateActiveButton();
  minutes.innerHTML = formatTwoDigits(mins);
  seconds.innerHTML = formatTwoDigits(secs);
  modeText.innerHTML = textmode
  totalSeconds = mins * 60 + secs;
  updateDisplay();
  changeAnimationDuration(totalSeconds);
  clearInterval(timer);
  isRunning = true;
  toggleTimer();
  resetAnimation();
  if(pomoSettings.BreakAutoStart){
    if(!fromSettings){
      startPauseButton.click()
    }
    
  }
  
  
}

function updateCountText(){
  pomoCountText.innerHTML = `#${pomoCount+1}`
}

function updateActiveButton() {
  focusButton.classList.toggle('active', currentMode === 'focus');
  shortBreakButton.classList.toggle('active', currentMode === 'short break');
  longBreakButton.classList.toggle('active', currentMode === 'long break');
}

function changeAnimationDuration(duration) {
  document.documentElement.style.setProperty('--animation-duration', `${duration}s`);
}

function resetAnimation() {
  
  backgroundProgress.classList.remove('animate');
  backgroundProgress.classList.add('reset');

  void backgroundProgress.offsetWidth;
  backgroundProgress.classList.remove('reset'); 
  backgroundProgress.classList.add('animate');
}

function updateDisplay() {
  let minutesCount = Math.floor(totalSeconds / 60);
  let secondsCount = totalSeconds % 60;
  minutes.innerHTML = formatTwoDigits(minutesCount);
  seconds.innerHTML = formatTwoDigits(secondsCount);
}

function startTimer() {
  timer = setInterval(function() {
    if (totalSeconds <= 0) {
      clearInterval(timer);
      handleTimerEnd();
      return;
    }
    totalSeconds--;
    updateDisplay();
  }, 1000);
}

function handleTimerEnd(isskip) {
  //stop timer
  if(alarmaudio){
    alarmaudio.pause()
  }
  if(!isskip){
    alarmaudio = new Audio(`sounds/${pomoSettings.alarmSound}.mp3`);
    alarmaudio.play();
  }
  isfromskip = false
  // Calculate time spent

  switch(currentMode){
    case 'focus' :
        originalSeconds = pomoSettings.focus *60
        break
    case 'short break' :
        originalSeconds = pomoSettings.shortBreak *60
        break
    case 'long break' : 
        originalSeconds = pomoSettings.longBreak *60
        break

  }



  const timeSpent = originalSeconds - totalSeconds;

  // Save time spent
  saveTime(currentMode, timeSpent);
  
  if (currentMode === 'focus') {
    pomoCount++;
    if (pomoCount == pomoSettings.numberOfShortBreaks) {
      setMode('long break', pomoSettings.longBreak, 0, 'linear-gradient(to right, rgba(145, 111, 184, 0.568) 50%, transparent 51%)' , `Break time! You're "Focus champion"`);
    } else {
      setMode('short break', pomoSettings.shortBreak, 0, 'linear-gradient(to right, rgba(111, 163, 184, 0.568) 50%, transparent 51%)' , 'Break time! Stay Close');
    }
  } else if(currentMode == 'short break') {
    setMode('focus', pomoSettings.focus, 0, 'linear-gradient(to right, rgba(111, 184, 111, 0.568) 50%, transparent 51%)' , 'Focus time!!');
    updateCountText();
  } else if(currentMode == 'long break') {
    setMode('focus', pomoSettings.focus, 0, 'linear-gradient(to right, rgba(111, 184, 111, 0.568) 50%, transparent 51%)' , 'Focus time!!');
    pomoCount = 0
    updateCountText()
  }
}

function toggleTimer() {
  if (isRunning) {
    clearInterval(timer);
    startPauseButton.style.backgroundColor = 'rgba(91, 130, 156, 0.39)';
    startPauseButton.innerText = 'Start';
    backgroundProgress.classList.remove('animate');
    backgroundProgress.classList.add('paused');
  } else {
    startTimer();
    startPauseButton.style.backgroundColor = 'rgba(209, 93, 64, 0.712)';
    startPauseButton.innerText = 'Pause';
    backgroundProgress.classList.add('animate');
    backgroundProgress.classList.remove('paused');
  }
  isRunning = !isRunning;
}

startPauseButton.addEventListener('click', toggleTimer);

skipButton.addEventListener('click', function() {
  clearInterval(timer);
  isfromskip=true
  handleTimerEnd(isfromskip);
});

updateDisplay();

const focusInput = document.getElementById('focus-input')
const shortBreakInput = document.getElementById('shortb-input')
const longBreakInput = document.getElementById('longb-input')
const autoBreakStartChekbox = document.getElementById('break-auto-checkbox')
const shortBreaksNumInput = document.getElementById('shortb-number-input')


function showCurrentSettings(){
  pomoSettings = JSON.parse(localStorage.settings)
  focusInput.value = pomoSettings.focus
  shortBreakInput.value = pomoSettings.shortBreak
  longBreakInput.value = pomoSettings.longBreak
  autoBreakStartChekbox.checked = pomoSettings.BreakAutoStart
  shortBreaksNumInput.value = pomoSettings.numberOfShortBreaks
  console.log(autoBreakStartChekbox.checked)

}
const settingsButton = document.getElementById('settings')
const favDialog = document.getElementById('favDialog');
settingsButton.addEventListener('click', () => {
  showCurrentSettings()

  favDialog.showModal();
  if(isRunning){
    startPauseButton.click()

  }
  alarmSoundButton.innerHTML = `${pomoSettings.alarmSound} ▾`
  backgroundSoundButton.innerHTML = `${pomoSettings.backgroundSound} ▾`

  
});


function myFunction1() {
  document.getElementById("alarm-dropdown").classList.toggle("show");
}

window.onclick = function(event) {
  if (!event.target.matches('.dropbtn1')) {
      var dropdowns = document.getElementsByClassName("dropdown-sound-content");
      for (var i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
              openDropdown.classList.remove('show');
          }
      }
  }
}

function myFunction2() {
  document.getElementById("background-dropdown").classList.toggle("show");
}

window.onclick = function(event) {
  if (!event.target.matches('.dropbtn2')) {
      var dropdowns = document.getElementsByClassName("dropdown-background-content");
      for (var i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
              openDropdown.classList.remove('show');
          }
      }
  }
}




const closeSettingsButton = document.getElementById('close-settings')

function applySettings(){
  pomoSettings = JSON.parse(localStorage.settings)
  setMode('focus', pomoSettings.focus, 0, 'linear-gradient(to right, rgba(111, 184, 111, 0.568) 50%, transparent 51%)' , 'Focus time!!', true)
  pomoCount = 0
  updateCountText() 
}


closeSettingsButton.addEventListener('click' , function(){ 

  let newSettings = {
    focus : focusInput.value,
    shortBreak :shortBreakInput.value,
    longBreak : longBreakInput.value,
    BreakAutoStart :autoBreakStartChekbox.checked , 
    numberOfShortBreaks :shortBreaksNumInput.value,
    alarmSound : alarmSoundButton.innerHTML.slice(0,-2),
    backgroundSound: backgroundSoundButton.innerHTML.slice(0,-2)

  }
  if(backgroundSoundButton.innerHTML.slice(0,-2) == 'None'){
    backgroundaudio.pause()
  }

  favDialog.close()
  
  if(JSON.stringify(newSettings) != JSON.stringify(pomoSettings)){

    localStorage.setItem('settings', JSON.stringify(newSettings))
    applySettings()


  }
  


  
})
const resetSettingsButton = document.getElementById('reset-settings')
resetSettingsButton.addEventListener('click', function(){
  focusInput.value = 25
  shortBreakInput.value = 5
  longBreakInput.value = 15
  autoBreakStartChekbox.checked = false
  shortBreaksNumInput.value = 4
  alarmSoundButton.innerHTML = 'Default ▾'
  backgroundSoundButton.innerHTML = 'None ▾'
  

})


const alarmSoundButton = document.getElementById('alarm-soundbtn')
const backgroundSoundButton = document.getElementById('background-soundbtn')
const alarmSoundsList = document.querySelector('.dropdown1')
const backgroundSoundsList = document.querySelector('.dropdown2')
const alarmSounds = document.querySelectorAll('.dropdown1 li')
const backgroundSounds = document.querySelectorAll('.dropdown2 li')



alarmSounds.forEach(ele => {
  ele.addEventListener('click', function(){
    alarmSoundButton.innerHTML = `${ele.innerText} ▾`
    pomoSettings.alarmSound = ele.innerText
    localStorage.setItem('settings' , JSON.stringify(pomoSettings))

    if (alarmaudio) {
      alarmaudio.pause();
    }

    // Create a new Audio object and play the selected sound
    alarmaudio = new Audio(`sounds/${ele.innerText}.mp3`);
    alarmaudio.play();
    alarmSoundsList.classList.remove('hide')
  })

})

backgroundSounds.forEach(ele => {
  ele.addEventListener('click', function(){
    backgroundSoundButton.innerHTML = `${ele.innerText} ▾`
    pomoSettings.backgroundSound = ele.innerText
    localStorage.setItem('settings' , JSON.stringify(pomoSettings))
    if (backgroundaudio) {
      backgroundaudio.pause();
    }

    // Create a new Audio object and play the selected sound
    backgroundaudio = new Audio(`sounds/${ele.innerText}.mp3`);
    backgroundaudio.loop = true
    backgroundaudio.play();
    backgroundSoundsList.classList.remove('hide')
  })

})

alarmSoundButton.addEventListener('click', function(){
  alarmSoundsList.classList.toggle('hide')
  backgroundSoundsList.classList.remove('hide')
  favDialog.scrollTo({
    top: favDialog.scrollHeight,
    behavior: 'smooth'
  });

})
backgroundSoundButton.addEventListener('click', function(){
  backgroundSoundsList.classList.toggle('hide')
  alarmSoundsList.classList.remove('hide')
  favDialog.scrollTo({
    top: favDialog.scrollHeight,
    behavior: 'smooth'
  });
})

function backgroundSoundPlay() {
  if (backgroundaudio) {
      backgroundaudio.pause();
  }
  backgroundaudio = new Audio(`sounds/${pomoSettings.backgroundSound}.mp3`);
  backgroundaudio.loop = true;
  backgroundaudio.play().catch(error => {
      console.error('Error playing background audio:', error);
      // Set up event listeners to retry playing the audio on user interaction
      document.addEventListener('click', playOnUserInteraction, { once: true });
      document.addEventListener('touchstart', playOnUserInteraction, { once: true });
      document.addEventListener('mousemove', playOnUserInteraction, { once: true });
  });
}

function playOnUserInteraction() {
  backgroundaudio.play().catch(error => {
      console.error('Error playing background audio on user interaction:', error);
  });
  // Remove the event listeners after the first interaction
  document.removeEventListener('click', playOnUserInteraction);
  document.removeEventListener('touchstart', playOnUserInteraction);
  document.removeEventListener('mousemove', playOnUserInteraction);
}

window.addEventListener('load', function() {
  backgroundSoundPlay();
});
function getLocalTimeString() {
  const now = new Date();
  
  // Format the local time as a string in "YYYY-MM-DD HH:mm:ss" format
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
async function saveTime(mode, timeSpent) {
 
    const timestamp = getLocalTimeString();
    console.log(timestamp)
  
    try {
      const response = await fetch('/api/saveTime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode : mode,
          timeSpent,
          timestamp,
        }),
      });
      if (response.ok) {
        console.log('Time data saved successfully');
      } else {
        console.error('Error saving time data');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
}
const tasksGetButton = document.getElementById('get-tasks')
// tasksGetButton.addEventListener('click' , function(){



// })
// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal


// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
tasksGetButton.onclick = function() {
  modal.style.display = "block";
  fetch('/tasks')
  .then(response => response.json())
  .then(tasks => {
      showTasks(tasks);
  })
  .catch(error => {
      console.error('Error fetching tasks:', error);
  });

}
function calculateTimeDifference(startTime, endTime) {
  // Parse the start time and end time
  let [startHour, startMinute] = startTime.split(':').map(Number);
  let [endHour, endMinute] = endTime.split(':').map(Number);

  // Convert the times into minutes since midnight
  let startTotalMinutes = startHour * 60 + startMinute;
  let endTotalMinutes = endHour * 60 + endMinute;

  // Calculate the difference in minutes
  let differenceInMinutes = endTotalMinutes - startTotalMinutes;

  // Handle cases where the end time is before the start time (crossing midnight)
  if (differenceInMinutes < 0) {
      differenceInMinutes += 24 * 60; // add 24 hours' worth of minutes
  }

  // Convert back to hours and minutes
  let diffHours = Math.floor(differenceInMinutes / 60);
  let diffMinutes = differenceInMinutes % 60;

  // Return the result as a string
  return `${diffHours} hours and ${diffMinutes} minutes`;
}
const table = document.getElementById('table')
function showTasks(tasks){
  table.innerHTML = ''
  tasks.forEach(ele => {
    let time = calculateTimeDifference(ele.start, ele.end)
    table.innerHTML += `
    <tr class='row'>
      <td>${ele.task}</td>
      <td>${time}</td>
      <td><button id='${ele.id}'>Complete</button></td>
    </tr>
    `

  })
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}



  