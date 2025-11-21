// Updated code to keep text pinned to bottom-left corner with proportional scaling and scale face markers
// Added variables for easy modification of color, stroke width, dot size, and font size

let faceapi;
let detections = [];

let video;
let canvas;

// Adjustable parameters
let boxColor = [0, 255, 0];
let dotColor = [0, 255, 0];
let baseBoxStroke = 11.5; // base stroke width
let baseDotSize = 8.5; // base dot size
let baseFontSize = 30; // base font size

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.id("canvas");
  canvas.style("outline", "none");

  video = createCapture(VIDEO);
  video.id("video");
  video.size(windowWidth, windowHeight);
  video.hide();

  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: true,
    minConfidence: 0.1
  };

  faceapi = ml5.faceApi(video, faceOptions, faceReady);
}

function faceReady() {
  faceapi.detect(gotFaces);
}

function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }

  detections = result;

  clear();
  noStroke();

  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  drawBoxs(detections);
  drawLandmarks(detections);
  pop();

  drawExpressionsScaled(detections);

  faceapi.detect(gotFaces);
}

function drawBoxs(detections) {
  const s = height / 1000; // scale factor
  if (detections.length > 0) {
    for (let f = 0; f < detections.length; f++) {
      let { _x, _y, _width, _height } = detections[f].alignedRect._box;
      stroke(...boxColor);
      strokeWeight(baseBoxStroke * s); // scale stroke width
      noFill();
      rect(_x, _y, _width, _height);
    }
  }
}

function drawLandmarks(detections) {
  const s = height / 1000; // scale factor
  if (detections.length > 0) {
    for (let f = 0; f < detections.length; f++) {
      let points = detections[f].landmarks.positions;
      for (let i = 0; i < points.length; i++) {
        stroke(...dotColor);
        strokeWeight(baseDotSize * s); // scale point size
        point(points[i]._x, points[i]._y);
      }
    }
  }
}

function drawExpressionsScaled(detections) {
  let neutral, happy, angry, sad, disgusted, surprised, fearful;

  if (detections.length > 0) {
    ({ neutral, happy, angry, sad, disgusted, surprised, fearful } = detections[0].expressions);
  } else {
    neutral = happy = angry = sad = disgusted = surprised = fearful = 0;
  }

  const scaleFactor = height / 1000;
  const baseTextSize = baseFontSize * scaleFactor;
  const textYSpace = 29 * scaleFactor;
  const padding = 50 * scaleFactor;

  const x = padding;
  const yStart = height - padding - (180 * scaleFactor);

  textFont("Helvetica Neue");
  textSize(baseTextSize);
  noStroke();
  fill(...boxColor);

  text(`neutral:        ${nf(neutral * 100, 2, 2)}%`, x, yStart);
  text(`happy:         ${nf(happy * 100, 2, 2)}%`, x, yStart + textYSpace);
  text(`angry:          ${nf(angry * 100, 2, 2)}%`, x, yStart + textYSpace * 2);
  text(`sad:             ${nf(sad * 100, 2, 2)}%`, x, yStart + textYSpace * 3);
  text(`disgusted:   ${nf(disgusted * 100, 2, 2)}%`, x, yStart + textYSpace * 4);
  text(`surprised:    ${nf(surprised * 100, 2, 2)}%`, x, yStart + textYSpace * 5);
  text(`fearful:         ${nf(fearful * 100, 2, 2)}%`, x, yStart + textYSpace * 6);
}

function mousePressed() {
  if (!fullscreen()) {
    fullscreen(true);
    resizeCanvas(windowWidth, windowHeight);
    video.size(windowWidth, windowHeight);
  } else {
    fullscreen(false);
    resizeCanvas(windowWidth, windowHeight);
    video.size(windowWidth, windowHeight);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(windowWidth, windowHeight);
}