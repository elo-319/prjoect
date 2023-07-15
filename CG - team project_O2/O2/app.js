let gl, program;
let modelViewMatrix;

let viewChange = 'p';

let points = [];
let colors = [ 
  0, 0, 0,
  0, 0, 1,
  0, 1, 0,
  0, 1, 1,
  1, 0, 0,
  1, 0, 1,
  1, 1, 0,
  1, 1, 1,
];
let normal = [];

let sun, planet, planet2, planet3;

let theta = 0;
let factorOfZoom = 0.3;

let eye = [0, 0, 1];
let at = [0, 0, 0];
let up = [0, 1, 0];

let diffuseVals = [];
let specularVals = [];

let light = {
  'ambient': [1.0, 1.0, 0.0, 1.0],
  'diffuse': [1.0, 1.0, 1.0, 1.0],
  'specular': [1.0, 1.0, 1.0, 1.0],

  'location': [0.0, 1.0, 0.0, 0.0],
};

let material = {
  'ambient': [1.0, 1.0, 0.7, 1.0],
  'diffuse': [1.0, 1.0, 1.0, 1.0],
  'specular': [1.0, 1.0, 1.0, 1.0],

  'shininess': 20.0,
};

onload = () => {
  let canvas = document.getElementById("webgl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert('No webgl for you');
    return;
  }

  program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0, 0, 0, 0.5);

  
  sun = sphere(5);
  sun.scale(0.5, 0.5, 0.5);
  sun.translate(0, 0, 0);

  planet = sphere(5);
  planet.scale(0.15, 0.15, 0.15);
  planet.translate(0.7, 0, 0);

  planet2 = sphere(5);
  planet2.scale(0.25, 0.25, 0.25);
  planet2.translate(1.2, 0, 0);

  planet3 = sphere(5);
  planet3.scale(0.35, 0.35, 0.35);
  planet3.translate(2, 0, 0);
  

  points = sun.TriangleVertices;
  points = points.concat(planet.TriangleVertices);
  points = points.concat(planet2.TriangleVertices);
  points = points.concat(planet3.TriangleVertices);

 

  let ambient = getAmbient();

  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  let diffuseBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, diffuseBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(diffuseVals), gl.STATIC_DRAW);

  let vDiffuse = gl.getAttribLocation(program, 'diffuse');
  gl.vertexAttribPointer(vDiffuse, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vDiffuse);

  let specularBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, specularBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(specularVals), gl.STATIC_DRAW);

  let vSpecular = gl.getAttribLocation(program, 'specular');
  gl.vertexAttribPointer(vSpecular, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vSpecular);

  let cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  let vColor = gl.getAttribLocation(program, 'vColor');
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  gl.uniform4fv(gl.getUniformLocation(program, 'ambient'), ambient);

  modelViewMatrix = gl.getUniformLocation(program, 'modelViewMatrix');

  document.addEventListener('keydown', handleKeyDown);

  render();
};

let DifferentViews = 'a';

// Here key events added
function handleKeyDown(event) {
  if (event.key === 'd') {
    DifferentViews = 'd';
    rotateCameraClockwise();
  } else if (event.key === 'a') {
    DifferentViews = 'a';
    rotateCameraCounterClockwise();
  } else if (event.key === 'q') {
    DifferentViews = 'q';
    rotateCameraClockwise();
  } else if (event.key === 'e') {
    DifferentViews = 'e';
    rotateCameraCounterClockwise();
  } else if (event.key === 'z') {
    DifferentViews = 'z';
    rotateCameraClockwise();
  } else if (event.key === 'c') {
    DifferentViews = 'c';
    rotateCameraCounterClockwise();
  } else if (event.key === 'w') {
    zoomIn();
  } else if (event.key === 's') {
    zoomOut();
  } else if (event.key === 'ArrowUp') {
    moveCameraUp();
  } else if (event.key === 'ArrowLeft') {
    moveCameraLeft();
  } else if (event.key === 'ArrowDown') {
    moveCameraDown();
  } else if (event.key === 'ArrowRight') {
    moveCameraRight();
  } else if (event.key === 'o') {
    viewChange = 'o';
    render();
  } else if (event.key === 'p') {
    viewChange = 'p';
    render();
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
  gl.disable(gl.CULL_FACE);


  let mvm;
  let rotationfactor = []; // Rotation factor for rotation with multiplying mvm

  if (DifferentViews === 'a' || DifferentViews === 'd') {
    mvm = lookAt(eye, at, up);
    rotationfactor = [0, 1, 0];
  } else if (DifferentViews === 'q' || DifferentViews === 'e') {
    mvm = lookAt(eye, at, up);
    rotationfactor = [1, 0, 0];
  } else if (DifferentViews === 'z' || DifferentViews === 'c') {
    mvm = lookAt(eye, at, up);
    rotationfactor = [0, 0, 1];
  }

  let aspect = gl.canvas.width / gl.canvas.height;
  let fov = 50;
  let left = -2.0; 
  let right = 2.0;
  let bottom = -2.0;
  let top = 2.0;
  let near = 0.1;
  let far = 100.0;
  let projMatrix; 

  if(viewChange === 'o'){

    // mat for ortho

       projMatrix = ortho(left, right, bottom, top, near, far); 

  } else if(viewChange === 'p') {

    // mat for pers

       projMatrix = perspective(fov, aspect, near, far);
  }


  mvm = mult(projMatrix, mvm);
  mvm = mult(mvm, rotate(theta, rotationfactor));
  mvm = mult(mvm, scalem(factorOfZoom, factorOfZoom, factorOfZoom));
  
  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mvm));

  gl.drawArrays(gl.TRIANGLES, 0, points.length);

  requestAnimationFrame(render);
}

function getAmbient() {
  return getProd('ambient');
}

function getDiffuse(vertex) {
  let normal = getNormal(vertex);
  let diffuseProd = getProd('diffuse');

  let d = Math.max(dot(normal, light['location']), 0);
  let diffuse = scale(d, diffuseProd);

  return diffuse;
}

function getSpecular(vertex) {
  let normal = getNormal(vertex);
  let specularProd = getProd('specular');
  let viewVector = subtract(changeFourthDim(eye, 1), vertex);
  let half = normalize(add(viewVector, light['location']));
  let d = dot(half, normal);

  let specular;

  if (d > 0.0) {
    specular = Math.pow(d, material['shininess']);
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
