let gl, program;
let modelViewMatrix;

let viewChange = 'p';

let points = [];
let colors = [];
let normal = [];

let sun, planet, planet2, planet3;

let theta = 0;
let factorOfZoom = 0.25;

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
}

let sunMaterial = {
  'ambient': [1.0, 0.5, 0.0, 1.0], // Orange ambient color
  'diffuse': [1.0, 0.5, 0.0, 1.0], // Orange diffuse color
  'specular': [1.0, 1.0, 1.0, 1.0], // White specular color
  'shininess': 20.0,
};

// Material properties for planet
let planetMaterial = {
  'ambient': [0.0, 0.5, 1.0, 1.0], // Blue ambient color
  'diffuse': [0.0, 0.5, 1.0, 1.0], // Blue diffuse color
  'specular': [1.0, 1.0, 1.0, 1.0], // White specular color
  'shininess': 20.0,
};

// Material properties for planet2
let planet2Material = {
  'ambient': [0.8, 0.2, 0.5, 1.0], // Purple ambient color
  'diffuse': [0.8, 0.2, 0.5, 1.0], // Purple diffuse color
  'specular': [1.0, 1.0, 1.0, 1.0], // White specular color
  'shininess': 20.0,
};

// Material properties for planet3
let planet3Material = {
  'ambient': [0.5, 1.0, 0.0, 1.0], // Green ambient color
  'diffuse': [0.5, 1.0, 0.0, 1.0], // Green diffuse color
  'specular': [1.0, 1.0, 1.0, 1.0], // White specular color
  'shininess': 20.0,
};



onload = () => {
  let canvas = document.getElementById("webgl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert('No webgl for you');
    return;
  }

  program = initShaders(gl, 'sun-vertex-shader', 'sun-fragment-shader');
  
  gl.useProgram(program);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0, 0, 0, 1);

  
  sun = sphere(5);
  sun.scale(0.5, 0.5, 0.5);
  sun.translate(0, 0, 0);

  sun.material = sunMaterial;

  planet = sphere(5);
  planet.scale(0.15, 0.15, 0.15);
  planet.translate(0.7, 0, 0);

  
  planet.orbitRadius = 1.5;    
  planet.orbitSpeed = 0.00002;   
  planet.rotationSpeed = 0.003; 
  planet.axisTilt = [1, 0, 0];

  
  planet.material = planetMaterial;

  planet2 = sphere(5);
  planet2.scale(0.25, 0.25, 0.25);
  planet2.translate(1.2, 0, 0);
  
  planet2.orbitRadius = 3;
  planet2.orbitSpeed = 0.0003;
  planet2.rotationSpeed = 0.02;
  planet2.axisTilt = [1, 0, 0];

  planet2.material = planet2Material;

  planet3 = sphere(5);
  planet3.scale(0.35, 0.35, 0.35);
  planet3.translate(-2, 0, 0);
  
  planet3.orbitRadius = -4;
  planet3.orbitSpeed = 0.000099;
  planet3.rotationSpeed = 0.006;
  planet3.axisTilt = [1, 0, 0];

  planet3.material = planet3Material;
  

  points = sun.TriangleVertices;
  points = points.concat(planet.TriangleVertices);
  points = points.concat(planet2.TriangleVertices);
  points = points.concat(planet3.TriangleVertices);

 


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

//   // Set the ambient color for each planet
// let planetAmbientLoc = gl.getUniformLocation(program, 'planetAmbient');
// gl.uniform4fv(planetAmbientLoc, planetMaterial.ambient);

// let planet2AmbientLoc = gl.getUniformLocation(program, 'planet2Ambient');
// gl.uniform4fv(planet2AmbientLoc, planet2Material.ambient);

// let planet3AmbientLoc = gl.getUniformLocation(program, 'planet3Ambient');
// gl.uniform4fv(planet3AmbientLoc, planet3Material.ambient);
  


  let ambient = getAmbient();
  gl.uniform4fv(gl.getUniformLocation(program, 'ambient'), ambient);

  
  let ambientP = getAmbientP();
  gl.uniform4fv(gl.getUniformLocation(program, 'ambientP'), ambientP);

  
  let ambientP2 = getAmbientP2();
  gl.uniform4fv(gl.getUniformLocation(program, 'ambientP2'), ambientP2);

  
  let ambientP3 = getAmbientP3();
  gl.uniform4fv(gl.getUniformLocation(program, 'ambientP3'), ambientP3);

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
  
    // Render the sun
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mvm));
    gl.drawArrays(gl.TRIANGLES, 0, sun.TriangleVertices.length);
  
    // Render each planet
    let currentTime = new Date().getTime();
  
    // Planet 1
    let planetPosition = vec3(
      planet.orbitRadius * Math.cos(planet.orbitSpeed * currentTime),
      0,
      planet.orbitRadius * Math.sin(planet.orbitSpeed * currentTime)
    );
    let planetRotationAngle = planet.rotationSpeed * currentTime;
    let planetRotationMatrix = rotate(
      planetRotationAngle,
      planet.axisTilt[0],
      planet.axisTilt[1],
      planet.axisTilt[2]
    );
    let planetModelViewMatrix = mult(
      translate(planetPosition[0], planetPosition[1], planetPosition[2]),
      planetRotationMatrix
    );
    planetModelViewMatrix = mult(mvm, planetModelViewMatrix);
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(planetModelViewMatrix));
    gl.drawArrays(gl.TRIANGLES, sun.TriangleVertices.length, planet.TriangleVertices.length);
  
    // Planet 2
    let planet2Position = vec3(
      planet2.orbitRadius * Math.cos(planet2.orbitSpeed * currentTime),
      0,
      planet2.orbitRadius * Math.sin(planet2.orbitSpeed * currentTime)
    );
    let planet2RotationAngle = planet2.rotationSpeed * currentTime;
    let planet2RotationMatrix = rotate(
      planet2RotationAngle,
      planet2.axisTilt[0],
      planet2.axisTilt[1],
      planet2.axisTilt[2]
    );
    let planet2ModelViewMatrix = mult(
      translate(planet2Position[0], planet2Position[1], planet2Position[2]),
      planet2RotationMatrix
    );
    planet2ModelViewMatrix = mult(mvm, planet2ModelViewMatrix);
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(planet2ModelViewMatrix));
    gl.drawArrays(
      gl.TRIANGLES,
      sun.TriangleVertices.length + planet.TriangleVertices.length,
      planet2.TriangleVertices.length
    );
  
    // Planet 3
    let planet3Position = vec3(
      planet3.orbitRadius * Math.cos(planet3.orbitSpeed * currentTime),
      0,
      planet3.orbitRadius * Math.sin(planet3.orbitSpeed * currentTime)
    );
    let planet3RotationAngle = planet3.rotationSpeed * currentTime;
    let planet3RotationMatrix = rotate(
      planet3RotationAngle,
      planet3.axisTilt[0],
      planet3.axisTilt[1],
      planet3.axisTilt[2]
    );
    let planet3ModelViewMatrix = mult(
      translate(planet3Position[0], planet3Position[1], planet3Position[2]),
      planet3RotationMatrix
    );
    planet3ModelViewMatrix = mult(mvm, planet3ModelViewMatrix);
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(planet3ModelViewMatrix));
    gl.drawArrays(
      gl.TRIANGLES,
      sun.TriangleVertices.length +
        planet.TriangleVertices.length +
        planet2.TriangleVertices.length,
      planet3.TriangleVertices.length
    );
  requestAnimationFrame(render);
}

function getAmbient() {
  return getProd('ambient');
}

function getAmbientP() {
  return getProdP('ambient');
}

function getAmbientP2() {
  return getProdP2('ambient');
}

function getAmbientP3() {
  return getProdP3('ambient');
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


function getProdP(component) {
  return mult(light[component], planetMaterial[component]);
}


function getProdP2(component) {
  return mult(light[component], planet2Material[component]);
}


function getProdP3(component) {
  return mult(light[component], planet3Material[component]);
}

function changeFourthDim(arr, val) {
  return [arr[0], arr[1], arr[2], val];
}

function getNormal(vertex) {
  return changeFourthDim(vertex, 0);
}
