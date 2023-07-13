let gl, program;
let vertexCount = 0;
let modelViewMatrix;
let points = [];
let indices = [];
let divisionCount = 9;

let theta = 0;
let factorOfZoom = 0.2;

let eye = [0, 0, 1];
let at = [0, 0, 0];
let up = [0, 1, 0];

let diffuseVals = [];
let specularVals = [];

let light = {
  ambient: [1.0, 1.0, 0.0, 1.0],
  diffuse: [1.0, 1.0, 1.0, 1.0],
  specular: [1.0, 1.0, 1.0, 1.0],
  location: [0.0, 1.0, 0.0, 0.0],
};

let material = {
  ambient: [1.0, 1.0, 0.7, 1.0],
  diffuse: [1.0, 1.0, 1.0, 1.0],
  specular: [1.0, 1.0, 1.0, 1.0],
  shininess: 20.0,
};

onload = () => {
  let canvas = document.getElementById("webgl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("No webgl for you");
    return;
  }

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0, 0, 0, 0.5);
//Elshan: after reading announcement I tried this way to draw sphere
  let radius = 1.0;
  let latitudeBands = 30;
  let longitudeBands = 30;

  for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
    let theta1 = (latNumber * Math.PI) / latitudeBands;
    let sinTheta = Math.sin(theta1);
    let cosTheta = Math.cos(theta1);

    for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
      let theta2 = (longNumber * 2 * Math.PI) / longitudeBands;
      let sinPhi = Math.sin(theta2);
      let cosPhi = Math.cos(theta2);

      let x = cosPhi * sinTheta;
      let y = cosTheta;
      let z = sinPhi * sinTheta;

      points.push(radius * x);
      points.push(radius * y);
      points.push(radius * z);
      points.push(1.0);

      diffuseVals.push(getDiffuse([x, y, z, 1.0]));
      specularVals.push(getSpecular([x, y, z, 1.0]));

      vertexCount++;
    }
  }

  for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
    for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
      let first = latNumber * (longitudeBands + 1) + longNumber;
      let second = first + longitudeBands + 1;

      indices.push(first);
      indices.push(second);
      indices.push(first + 1);

      indices.push(second);
      indices.push(second + 1);
      indices.push(first + 1);
    }
  }

  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  let diffuseBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, diffuseBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diffuseVals), gl.STATIC_DRAW);

  let vDiffuse = gl.getAttribLocation(program, "diffuse");
  gl.vertexAttribPointer(vDiffuse, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vDiffuse);

  let specularBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, specularBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(specularVals), gl.STATIC_DRAW);

  let vSpecular = gl.getAttribLocation(program, "specular");
  gl.vertexAttribPointer(vSpecular, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vSpecular);

  let indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  let ambient = getAmbient();
  gl.uniform4fv(gl.getUniformLocation(program, "ambient"), ambient);

  modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");

  document.addEventListener("keydown", handleKeyDown);

  render();
};

let DifferentViews = "a";

// Here key events added
function handleKeyDown(event) {
  if (event.key === "d") {
    DifferentViews = "d";
    rotateCameraClockwise();
  } else if (event.key === "a") {
    DifferentViews = "a";
    rotateCameraCounterClockwise();
  } else if (event.key === "q") {
    DifferentViews = "q";
    rotateCameraClockwise();
  } else if (event.key === "e") {
    DifferentViews = "e";
    rotateCameraCounterClockwise();
  } else if (event.key === "z") {
    DifferentViews = "z";
    rotateCameraClockwise();
  } else if (event.key === "c") {
    DifferentViews = "c";
    rotateCameraCounterClockwise();
  } else if (event.key === "w") {
    zoomIn();
  } else if (event.key === "s") {
    zoomOut();
  } else if (event.key === "ArrowUp") {
    moveCameraUp();
  } else if (event.key === "ArrowLeft") {
    moveCameraLeft();
  } else if (event.key === "ArrowDown") {
    moveCameraDown();
  } else if (event.key === "ArrowRight") {
    moveCameraRight();
  }
}

function moveCameraUp() {
  eye[1] += 0.1;
  at[1] += 0.1;
}

function moveCameraLeft() {
  eye[0] -= 0.1;
  at[0] -= 0.1;
}

function moveCameraDown() {
  eye[1] -= 0.1;
  at[1] -= 0.1;
}

function moveCameraRight() {
  eye[0] += 0.1;
  at[0] += 0.1;
}

function rotateCameraClockwise() {
  theta -= 11; // Rotation angle
}

function rotateCameraCounterClockwise() {
  theta += 11;
}

function zoomOut() {
  factorOfZoom -= 0.01;
  if (factorOfZoom > 3.0) {
    factorOfZoom = 3.0;
  }
}

function zoomIn() {
  factorOfZoom += 0.01;
  if (factorOfZoom < 0.08) {
    factorOfZoom = 0.08;
  }
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let mvm;
  let rotationfactor = []; // Rotation factor for rotation with multiplying mvm

  if (DifferentViews === "a" || DifferentViews === "d") {
    mvm = lookAt(eye, at, up);
    rotationfactor = [0, 1, 0];
  } else if (DifferentViews === "q" || DifferentViews === "e") {
    mvm = lookAt(eye, at, up);
    rotationfactor = [1, 0, 0];
  } else if (DifferentViews === "z" || DifferentViews === "c") {
    mvm = lookAt(eye, at, up);
    rotationfactor = [0, 0, 1];
  }

  mvm = mult(mvm, rotate(theta, rotationfactor));
  mvm = mult(mvm, scalem(factorOfZoom, factorOfZoom, factorOfZoom));

  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mvm));

  //Elshan: I just wanted to try drawElements
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  //gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

  requestAnimationFrame(render);
}

function getAmbient() {
  return getProd("ambient");
}

function getDiffuse(vertex) {
  let normal = getNormal(vertex);
  let diffuseProd = getProd("diffuse");

  let d = Math.max(dot(normal, light.location), 0);
  let diffuse = scale(d, diffuseProd);

  return diffuse;
}

function getSpecular(vertex) {
  let normal = getNormal(vertex);
  let specularProd = getProd("specular");
  let viewVector = subtract(changeFourthDim(eye, 1), vertex);
  let half = normalize(add(viewVector, light.location));
  let d = dot(half, normal);

  let specular;

  if (d > 0.0) {
    specular = Math.pow(d, material.shininess);
    specular = scale(specular, specularProd);
    specular[3] = 1.0;
  } else {
    specular = [0, 0, 0, 1];
  }

  return specular;
}

function getProd(component) {
  return mult(light[component], material[component]);
}

function changeFourthDim(arr, val) {
  return [arr[0], arr[1], arr[2], val];
}

function getNormal(vertex) {
  return changeFourthDim(vertex, 0);
}
