// GIGA PET – Sibil the cat
// Sections:
//   1. Start-up
//   2. Variables
//   3. Button functions
//   4. Checking and showing stats
//   5. Pet comments
//   6. Purr sound


// 1. START-UP

// Runs once the page has loaded, so the buttons exist before they're used
$(function() {

  // Show starting stats
  checkAndUpdatePetInfoInHtml();

  // Connect each button to its function
  $('.treat-button').click(clickedTreatButton);
  $('.play-button').click(clickedPlayButton);
  $('.exercise-button').click(clickedExerciseButton);
  $('.sleep-button').click(clickedSleepButton);
  $('.mute-button').click(clickedMuteButton);
});


// 2. VARIABLES

// Pet stats
// energy goes up with Sleep, down with Play and Exercise
var pet_info = {
  name: "Sibil",
  weight: 12,
  happiness: 50,
  energy: 50
};

// Min and max for each stat
var minWeight = 3;
var maxWeight = 50;
var minHappiness = 0;
var maxHappiness = 100;
var minEnergy = 0;
var maxEnergy = 100;

// Energy used by Play and Exercise (less than this = too tired)
var energyCost = 15;

// Comments for each action, one is picked at random
var petComments = {
  treat: ["MMMmmmmmm", "NOM NOM NOM NOM"],
  play: ["meow.", "*HISS*"],
  exercise: ["YOU DON'T KNOW ME SON", "LIGHTWEIGHT"],
  sleep: ["Zzz…", "ZZZzzzzz.."],
  weightMin: ["I don't feel so good..."],
  weightMax: ["I'm stuffed"],
  happinessMax: ["I can get used to this"],
  tooTired: ["Too tired… hit the hay"]
};

// Max speech bubbles on screen
var maxMessages = 5;


// 3. BUTTON FUNCTIONS

// Treat: happiness up, weight up, starts purring
function clickedTreatButton() {
  pet_info.happiness = pet_info.happiness + 10;
  pet_info.weight = pet_info.weight + 3;

  // Fix stats past their limits, update the page
  // limitMessage = special comment if a limit was hit, "" if not
  var limitMessage = checkAndUpdatePetInfoInHtml();

  // Show the limit comment if there is one, otherwise a treat comment
  if (limitMessage !== "") {
    showPetComment(limitMessage);
  } else {
    showPetComment("treat");
  }

  startPurring();
}

// Play: happiness up, weight down, uses energy, starts purring
function clickedPlayButton() {
  // Too tired, so nothing changes
  if (pet_info.energy < energyCost) {
    showPetComment("tooTired");
    return;
  }

  pet_info.happiness = pet_info.happiness + 15;
  pet_info.weight = pet_info.weight - 1;
  pet_info.energy = pet_info.energy - energyCost;

  var limitMessage = checkAndUpdatePetInfoInHtml();

  if (limitMessage !== "") {
    showPetComment(limitMessage);
  } else {
    showPetComment("play");
  }

  startPurring();
}

// Exercise: happiness down, weight down, uses energy, no purring
function clickedExerciseButton() {
  // Too tired, so nothing changes
  if (pet_info.energy < energyCost) {
    showPetComment("tooTired");
    return;
  }

  pet_info.happiness = pet_info.happiness - 10;
  pet_info.weight = pet_info.weight - 3;
  pet_info.energy = pet_info.energy - energyCost;

  var limitMessage = checkAndUpdatePetInfoInHtml();

  if (limitMessage !== "") {
    showPetComment(limitMessage);
  } else {
    showPetComment("exercise");
  }
}

// Sleep: happiness up a little, energy up, weight same, starts purring
function clickedSleepButton() {
  pet_info.happiness = pet_info.happiness + 5;
  pet_info.energy = pet_info.energy + 30;

  var limitMessage = checkAndUpdatePetInfoInHtml();

  if (limitMessage !== "") {
    showPetComment(limitMessage);
  } else {
    showPetComment("sleep");
  }

  startPurring();
}

// Mute: turns the purr sound off and on
function clickedMuteButton() {
  if (isMuted === false) {
    // Turn sound off
    isMuted = true;
    purrSound.pause();
    $('.mute-button').text("Unmute purring");
  } else {
    // Turn sound on
    isMuted = false;
    $('.mute-button').text("Mute purring");
  }
}


// 4. CHECKING AND SHOWING STATS

// Runs after every button press:
// fixes stats, updates the page, stops purring if happiness is too low
// Returns the limit comment, or "" if no limit was hit
function checkAndUpdatePetInfoInHtml() {
  var limitMessage = checkWeightAndHappinessBeforeUpdating();
  updatePetInfoInHtml();
  stopPurringIfUnhappy();
  return limitMessage;
}

// Keeps each stat between its min and maxX
// Returns "weightMin", "weightMax", "happinessMax", or ""
function checkWeightAndHappinessBeforeUpdating() {
  // Set to true when a limit is hit
  var reachedWeightMin = false;
  var reachedWeightMax = false;
  var reachedHappinessMax = false;

  // Weight
  if (pet_info.weight <= minWeight) {
    pet_info.weight = minWeight;
    reachedWeightMin = true;
  }
  if (pet_info.weight >= maxWeight) {
    pet_info.weight = maxWeight;
    reachedWeightMax = true;
  }

  // Happiness
  if (pet_info.happiness < minHappiness) {
    pet_info.happiness = minHappiness;
  }
  if (pet_info.happiness >= maxHappiness) {
    pet_info.happiness = maxHappiness;
    reachedHappinessMax = true;
  }

  // Energy
  if (pet_info.energy < minEnergy) {
    pet_info.energy = minEnergy;
  }
  if (pet_info.energy > maxEnergy) {
    pet_info.energy = maxEnergy;
  }

  // Pick the limit comment (checked in this order)
  if (reachedWeightMin === true) {
    return "weightMin";
  } else if (reachedWeightMax === true) {
    return "weightMax";
  } else if (reachedHappinessMax === true) {
    return "happinessMax";
  } else {
    return "";
  }
}

// Shows stats on the page and updates mood effects
function updatePetInfoInHtml() {
  $('.name').text(pet_info.name);
  $('.weight').text(pet_info.weight);
  $('.happiness').text(pet_info.happiness);
  $('.energy').text(pet_info.energy);

  // jQuery method 2: .toggleClass(className, state)
  // https://api.jquery.com/toggleClass/
  // Adds or removes a CSS class.
  // state true = add the class, state false = remove it.
  // Same as: if (state) { addClass } else { removeClass }
  // Each line checks a stat and turns a mood class on or off.
  // style.css turns each class into an effect:
  //   happy  (happiness 70+)  = picture bounces
  //   sad    (happiness 20-)  = picture goes gray and droops
  //   chubby (weight 40+)     = picture stretches wider
  //   hungry (weight 8-)      = dashed box around Weight
  // Runs after every button press, so classes turn off again when stats go back to normal.
  $('.pet-image').toggleClass('happy', pet_info.happiness >= 70);
  $('.pet-image').toggleClass('sad', pet_info.happiness <= 20);
  $('.pet-image').toggleClass('chubby', pet_info.weight >= 40);
  $('.weight-stat').toggleClass('hungry', pet_info.weight <= 8);
}


// 5. PET COMMENTS

// Shows a random comment of the given type as a speech bubble
function showPetComment(commentType) {
  var choices = petComments[commentType];

  // Random index: Math.random() is 0 to just under 1,
  // times the list length, rounded down with Math.floor()
  var randomIndex = Math.floor(Math.random() * choices.length);
  var comment = choices[randomIndex];

  // jQuery method 1: .append(content)
  // https://api.jquery.com/append/
  // Adds content to the end of an element, after what's already inside.
  // Pet comments have to show on the page (no console.log() or alert()).
  // Each button press creates a new <div class="pet-bubble"> with the comment
  // and adds it to the end of .pet-messages.
  // Newest bubble always ends up at the bottom, like a chat.
  $('.pet-messages').append('<div class="pet-bubble">' + comment + '</div>');

  // Too many bubbles, remove the oldest (first) one
  var allBubbles = $('.pet-messages .pet-bubble');
  if (allBubbles.length > maxMessages) {
    allBubbles.first().remove();
  }
}


// 6. PURR SOUND
// Treat, Play and Sleep start purring (happiness 50+)
// Higher happiness = faster purring
// Below 50 happiness, purring stops
// Mute silences it but the timing keeps going

var purrSound = new Audio('audio/purr.mp3');

// true when muted
var isMuted = false;

// true while purring
var isPurring = false;

// Timer for the next purr (kept so it can be cancelled)
var purrTimer = null;

// Lowest happiness that purrs
var purrMinHappiness = 50;

// Purr speed in ms (1000 ms = 1 second)
// Happiness 100 = every 1200 ms, plus 20 ms for each point below 100
// 100 = 1200 ms, 90 = 1400 ms, 75 = 1700 ms, 50 = 2200 ms
var purrFastest = 1200;
var purrSlowerPerPoint = 20;

// Time to wait before the next purr, based on happiness
function getPurrDelay() {
  var pointsBelowMax = maxHappiness - pet_info.happiness;
  var delay = purrFastest + (pointsBelowMax * purrSlowerPerPoint);
  return delay;
}

// Plays the purr from the start, unless muted
function playPurr() {
  if (isMuted === false) {
    purrSound.currentTime = 0; // rewind
    purrSound.play();
  }
}

// Plays a purr, then sets a timer to run again
function purrLoop() {
  // Last purr still playing, check again in 50 ms (no cut-offs or skips)
  if (purrSound.paused === false) {
    purrTimer = setTimeout(purrLoop, 50);
    return;
  }

  playPurr();

  // Delay is recalculated each time so the speed follows happiness
  purrTimer = setTimeout(purrLoop, getPurrDelay());
}

// Starts purring (from Treat, Play and Sleep)
function startPurring() {
  // Stop any loop already running so there's only ever one
  stopPurring();

  if (pet_info.happiness >= purrMinHappiness) {
    isPurring = true;
    purrLoop();
  }
}

// Stops purring (a purr already playing finishes on its own)
function stopPurring() {
  clearTimeout(purrTimer);
  purrTimer = null;
  isPurring = false;
}

// Stops purring if happiness drops below 50
function stopPurringIfUnhappy() {
  if (isPurring === true && pet_info.happiness < purrMinHappiness) {
    stopPurring();
  }
}
