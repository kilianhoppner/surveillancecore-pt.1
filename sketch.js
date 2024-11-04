let faceapi;
let detections = [];

let video;
let canvas;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.id("canvas");
  canvas.style("outline", "none"); // Remove outline around the canvas

  video = createCapture(VIDEO);
  video.id("video");
  video.size(windowWidth, windowHeight);
  video.hide(); // Hide the default video element to avoid double display

  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: true,
    minConfidence: 0.5
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
  noStroke(); // Ensure no stroke around canvas elements

  // Mirror the video and face detection
  push();
  translate(width, 0); // Move to the far side of the canvas
  scale(-1, 1); // Flip horizontally

  image(video, 0, 0, width, height); // Draw the mirrored video

  // Draw mirrored face features
  drawBoxs(detections);
  drawLandmarks(detections);
  pop();

  // Draw non-mirrored expressions text
  drawExpressions(detections, 85, 450, 14);

  faceapi.detect(gotFaces);
}

function drawBoxs(detections) {
  if (detections.length > 0) {
    for (let f = 0; f < detections.length; f++) {
      let {_x, _y, _width, _height} = detections[f].alignedRect._box;
      stroke(2, 245, 31);
      strokeWeight(6.5);
      noFill();
      rect(_x, _y, _width, _height); // Draw detection box
    }
  }
}

function drawLandmarks(detections) {
  if (detections.length > 0) {
    for (let f = 0; f < detections.length; f++) {
      let points = detections[f].landmarks.positions;
      for (let i = 0; i < points.length; i++) {
        stroke(2, 245, 31);
        strokeWeight(3);
        point(points[i]._x, points[i]._y); // Draw face landmarks
      }
    }
  }
}

function drawExpressions(detections, x, y, textYSpace) {
  let neutral, happy, angry, sad, disgusted, surprised, fearful;

  if (detections.length > 0) {
    // If a face is detected, get the actual expression values
    ({neutral, happy, angry, sad, disgusted, surprised, fearful} = detections[0].expressions);
  } else {
    // If no face is detected, set each expression value to 0
    neutral = happy = angry = sad = disgusted = surprised = fearful = 0;
  }

  // Display expressions with consistent format, size, and spacing
  textFont('Helvetica Neue');
  textSize(30);
  noStroke();
  fill(2, 245, 31);
  textYSpace = 29;

  text("neutral:           " + nf(neutral * 100, 2, 2) + "%", x, y);
  text("happy:            " + nf(happy * 100, 2, 2) + "%", x, y + textYSpace);
  text("angry:             " + nf(angry * 100, 2, 2) + "%", x, y + textYSpace * 2);
  text("sad:                " + nf(sad * 100, 2, 2) + "%", x, y + textYSpace * 3);
  text("disgusted:      " + nf(disgusted * 100, 2, 2) + "%", x, y + textYSpace * 4);
  text("surprised:       " + nf(surprised * 100, 2, 2) + "%", x, y + textYSpace * 5);
  text("fearful:            " + nf(fearful * 100, 2, 2) + "%", x, y + textYSpace * 6);
}

function mousePressed() {
  if (!fullscreen()) {
    fullscreen(true); // Enter full screen mode
    resizeCanvas(windowWidth, windowHeight); // Resize canvas to the full window dimensions
    video.size(windowWidth, windowHeight); // Resize video to full screen
  } else {
    fullscreen(false); // Exit full screen mode if clicked again
    resizeCanvas(windowWidth, windowHeight); // Resize canvas to window size when exiting full screen
    video.size(windowWidth, windowHeight); // Resize video back to window size
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(windowWidth, windowHeight); // Adjust video to window size on resize
}

