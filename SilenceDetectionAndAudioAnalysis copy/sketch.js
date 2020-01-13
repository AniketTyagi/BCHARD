var audioBars = [];
var audioVelocity = [];
var audioAcceleration = [];
var nullP = [];
var mic;
var fft;
var rot = 0;
var audioAverage = [];
var audioAverage = 0;
var audioSpikes = [];
var silenceBegin = 0, silenceEnd = 0, silenceToggle = true;
var globalThreshHold = 0.1;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  for(var i = 0; i < 100; i++) {
    audioBars[i] = [0, 0];
    audioAverage[i] = [0];
  }
  
  fft = new p5.FFT();
  mic = new p5.AudioIn();
  mic.start();
}

function draw() {
  background(0);
  audioAverage = mean(audioBars);
  renderAudioBars();
  renderAudioDerivative();
  renderAudioSecondDerivative();
  renderSpikes();
  renderMeanLine();
  renderDerivativeMeanLine();
  renderSecondDerivativeMeanLine();
  renderTimeLine();
  renderStats();
  renderCopyRight();
}

function renderCopyRight() {
  fill(255);
  strokeWeight(1);
  text("BC HARD: Basic Cyclical Human Audial Recognition Diagnositics", width / 2, 20);
  text("Aniket Tyagi Software 2019 - 2020", width / 2, 40)
}

function renderStats() {
  var audioCopy = [];
  for(var i = 0; i < audioBars.length; i++) {
    audioCopy[i] -= (height / 2);
  }
  fill(255);
  strokeWeight(1);
  text("Current Stats:", 20, 20);
  text("Average Decibel: " + abs(mean(audioCopy)), 20, 40);
  text("Average Decibel/Time: " + (-mean(audioVelocity)), 20, 60);
  text("Average Decibel/Time^2: " + (mean(audioAcceleration)), 20, 80);
  text("Decibel/Time^2 Standard Deviation: " + standardDeviation(audioAcceleration), 20, 100)
}

function sigmoid(input, mean, percentile) {
  return 40 / (1 + exp(-100*(input - mean * (1 + percentile))));
}

function renderTimeLine() {
  for(var i = 0; i < audioSpikes.length; i++) {
    stroke(100, 30, 200);
    strokeWeight(4);
    line(xpos, height/4, xpos2, height/4);
    var xpos = map(audioSpikes[i][0], 0, millis()/1000, width/4, 3 * width / 4);
    var xpos2 = map(audioSpikes[i][1], 0, millis()/1000, width/4, 3 * width / 4);
    if(mouseX > xpos && mouseX < xpos2 && mouseY > height/4.1 && mouseY < height/3.9) {
      fill(255);
      stroke(255);
      strokeWeight(1);
      text("Start Time: " + audioSpikes[i][0] + "s; Duration: " + (audioSpikes[i][1] - audioSpikes[i][0]) + "s", mouseX, mouseY - 5)
    }
  }
  stroke(255);
  strokeWeight(1);
  line(width/4, height/3.8, width/4, height/4);
  fill(255);
  text("0", width/4, height/3.5);
  text(round(millis() / 1000), 2.99*width/4, height/3.5);
  line(3 * width/4, height/3.8, 3*width/4, height/4);
  line(width/4, height/3.8, 3 * width / 4, height / 3.8);
}

function renderSpikes() {
  var barWidth = 6;
  var level = 200 * mic.getLevel();
  var spectrum = fft.analyze();
  var theta = rot;
  var dTheta = 2 * Math.PI / audioBars.length;
  var average = 0;
  var threshMod = 0.99;
  rot -=  1 * PI / 180;
  var sum = 0, net = 0, mean = 0;
  var newSet = [];
  var standardDev = standardDeviation(audioAcceleration);
  for(var i = 0; i < audioAcceleration.length; i++) {  
    sum += audioAcceleration[i];
  }
  mean = sum / audioAcceleration.length;
  for(var i = 1; i < audioAcceleration.length - 1; i++) {
    stroke(40, 30, 200);
    strokeWeight(1);
    fill(0);
    if((audioAcceleration[i] - mean) / standardDev > 1 && audioAcceleration[i] > 3) {  
      ellipse(width / 2 - (audioAcceleration.length / 2 * (barWidth * 1.5)) + (i * barWidth * 1.5), 20+height/3, 5, 5);
    } 
  }
  for(var i = 0; i < audioBars.length; i++) {
    stroke(100, 30, 200);
    strokeWeight(1);
    fill(0);
    if(abs(audioBars[i][0] - height/2) > globalThreshHold) {  
      ellipse(width / 2 - (audioBars.length / 2 * (barWidth * 1.5)) + (i * barWidth * 1.5), height/3, 5, 5);
    }
  }
  if(silenceToggle == false && abs(audioBars[audioBars.length - 1][0] - height/2) > globalThreshHold) {
    silenceEnd = millis();
    if((silenceEnd - silenceBegin) / 1000 > 0.75) {  
      audioSpikes[audioSpikes.length] = [silenceBegin / 1000, silenceEnd/1000];
    }
    silenceToggle = true;
  }
  if(silenceToggle == true && abs(audioBars[audioBars.length - 1][0] - height/2) < globalThreshHold) {
    silenceBegin = millis();
    silenceToggle = false;
  }
}

function renderSecondDerivativeMeanLine() {
  var barWidth = 6;
  stroke(255);
  strokeWeight(1);
  fill(0)
  var sum = 0, net = 0, mean = 0;
  for(var i = 0; i < audioAcceleration.length; i++) {  
    if(audioAcceleration[i] > 0) {
      sum += audioAcceleration[i]
      net += 1;
    }
  }
  mean = sum / net;
  line(width/2 - (audioBars.length/2 * (barWidth * 1.5)), height/1.15 + mean, width / 2 - (audioBars.length / 2 * (barWidth * 1.5)) + ((audioBars.length - 1) * barWidth * 1.5), height/1.15 + mean);
}

function renderDerivativeMeanLine() {
  var barWidth = 6;
  stroke(255);
  strokeWeight(1);
  fill(0);
  line(width/2 - (audioBars.length/2 * (barWidth * 1.5)), height/1.5 + mean(audioVelocity), width / 2 - (audioBars.length / 2 * (barWidth * 1.5)) + ((audioBars.length - 1) * barWidth * 1.5), height/1.5 + mean(audioVelocity));
}

function renderMeanLine() {
  var barWidth = 6;
  stroke(255);
  strokeWeight(1);
  fill(0);
  line(width/2 - (audioBars.length/2 * (barWidth * 1.5)), mean(audioBars), width / 2 - (audioBars.length / 2 * (barWidth * 1.5)) + ((audioBars.length - 1) * barWidth * 1.5), mean(audioBars));
}

function renderAudioSecondDerivative() {
  var barWidth = 6;
  var level = 200 * mic.getLevel();
  var spectrum = fft.analyze();
  var theta = rot;
  var dTheta = 2 * Math.PI / audioBars.length;
  var average = 0;
  var threshMod = 0.99;
  rot -=  1 * PI / 180;
  
  for(var i = 1; i < audioVelocity.length - 1; i++) {
    stroke(40 + 2.5 * audioBars[i][1], 30 + audioBars[i][1], 200);
    strokeWeight(barWidth);
    fill(25, 100, audioBars[audioBars.length - 1][1]);
    
    line(width / 2 - (audioVelocity.length / 2 * (barWidth * 1.5)) + (i * barWidth * 1.5), height/1.15, width / 2 - (audioVelocity.length / 2 * (barWidth * 1.5)) + (i * barWidth * 1.5), (audioVelocity[i] - audioVelocity[i-1])+height/1.15);
    audioAcceleration[i-1] = audioVelocity[i] - audioVelocity[i-1];
  } 
}

function renderAudioDerivative() {
  var barWidth = 6;
  var level = 200 * mic.getLevel();
  var spectrum = fft.analyze();
  var theta = rot;
  var dTheta = 2 * Math.PI / audioBars.length;
  var average = 0;
  var threshMod = 0.99;
  rot -=  1 * PI / 180;
  
  for(var i = 0; i < audioBars.length; i++) {
    average += audioBars[i][0];
  }
  average /= audioBars.length;
  
  for(var i = 1; i < audioBars.length - 1; i++) {
    stroke(40 + 2.5 * audioBars[i][1], 30 + audioBars[i][1], 200);
    strokeWeight(barWidth);
    fill(25, 100, audioBars[audioBars.length - 1][1]);
    
    line(width / 2 - (audioBars.length / 2 * (barWidth * 1.5)) + (i * barWidth * 1.5), height/1.5, width / 2 - (audioBars.length / 2 * (barWidth * 1.5)) + (i * barWidth * 1.5), (audioBars[i][0] - audioBars[i-1][0])+height/1.5);
    audioVelocity[i - 1] = audioBars[i][0] - audioBars[i-1][0];
  }
}

function renderAudioBars() {
  var barWidth = 6;
  var level = 200 * mic.getLevel();
  var spectrum = fft.analyze();
  var theta = rot;
  var dTheta = 2 * Math.PI / audioBars.length;
  var average = 0;
  var threshMod = 0.99;
  rot -=  1 * PI / 180;
  
  for(var i = 0; i < audioBars.length; i++) {
    average += audioBars[i][0];
  }
  average /= audioBars.length;
  
  for(var i = 0; i < audioBars.length - 1; i++) {
    
    theta += dTheta;
    audioBars[i][0] = audioBars[i + 1][0];
    audioBars[i][1] = audioBars[i + 1][1];
    audioAverage[i] = audioAverage[i + 1];
    
    stroke(40 + 2.5 * audioBars[i][1], 30 + audioBars[i][1], 200);
    strokeWeight(barWidth);
    fill(25, 100, audioBars[audioBars.length - 1][1]);
    
    line(width / 2 - (audioBars.length / 2 * (barWidth * 1.5)) + (i * barWidth * 1.5), height/2, width / 2 - (audioBars.length / 2 * (barWidth * 1.5)) + (i * barWidth * 1.5), audioBars[i][0]);
    line(width / 2 - (audioBars.length / 2 * (barWidth * 1.5)) + (i * barWidth * 1.5), height/3, width / 2 - (audioBars.length / 2 * (barWidth * 1.5)) + (i * barWidth * 1.5), audioAverage[i] - height/2 + height/3);
  }
  audioBars[audioBars.length - 1][0] = height / 2 - level;
  audioBars[audioBars.length - 1][1] = 10 + level;
  audioAverage[audioAverage.length - 1] = audioAverage;
}

function mean(array) {
  var sum = 0;
  for(var i = 0; i < array.length; i++) {
    if(array[i][0] != null) {  
      sum += array[i][0];
    } else {
      sum += array[i];
    }
  }
  return sum / array.length;
}

function standardDeviation(array) {
  var average = mean(array);
  var sum = 0;
  for(var i = 0; i < array.length; i++) {
    sum += pow(array[i] - average, 2);
  }
  return sqrt(sum / array.length);
}
