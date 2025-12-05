let faceapi;
let detections = [];

let video;
let canvas;

// Adjustable parameters
let boxColor = [0, 255, 0];
let dotColor = [0, 255, 0];
let baseBoxStroke = 12; // base stroke width
let baseDotSize = 7.5; // base dot size
let baseFontSize = 30; // base font size

let drawX = 0, drawY = 0, drawWidth = 0, drawHeight = 0;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.id("canvas");
  canvas.style("outline", "none");

  video = createCapture(VIDEO);
  video.id("video");
  video.hide(); // hide default video element

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

  // Fill full width, maintain aspect ratio
  const videoAspect = video.width / video.height;
  drawWidth = width;
  drawHeight = width / videoAspect;

  // Center vertically
  drawX = 0;
  drawY = (height - drawHeight) / 2;

  // Draw the video
  image(video, drawX, drawY, drawWidth, drawHeight);

  // Draw face boxes and landmarks scaled to the video
  drawBoxs(detections);
  drawLandmarks(detections);
  pop();

  drawExpressionsScaled(detections);

  faceapi.detect(gotFaces);
}

function drawBoxs(detections) {
  if (detections.length > 0) {
    const scaleX = drawWidth / video.width;
    const scaleY = drawHeight / video.height;
    const s = height / 1000; // base scaling for stroke

    for (let f = 0; f < detections.length; f++) {
      let box = detections[f].alignedRect._box;
      stroke(...boxColor);
      strokeWeight(baseBoxStroke * s);
      noFill();
      rect(
        drawX + box._x * scaleX,
        drawY + box._y * scaleY,
        box._width * scaleX,
        box._height * scaleY
      );
    }
  }
}

function drawLandmarks(detections) {
  if (detections.length > 0) {
    const scaleX = drawWidth / video.width;
    const scaleY = drawHeight / video.height;
    const s = height / 1000; // base scaling for dots

    for (let f = 0; f < detections.length; f++) {
      let points = detections[f].landmarks.positions;
      for (let i = 0; i < points.length; i++) {
        stroke(...dotColor);
        strokeWeight(baseDotSize * s);
        point(
          drawX + points[i]._x * scaleX,
          drawY + points[i]._y * scaleY
        );
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
  } else {
    fullscreen(false);
    resizeCanvas(windowWidth, windowHeight);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}