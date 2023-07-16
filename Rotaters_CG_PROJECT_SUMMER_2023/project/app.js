// Just added program2 2nd shaders for planet 1, but was not able to finish it in time
let gl, program1, program2;
let modelViewMatrix;

// when we rotate or give orbits to rotate around sun, planetes disappeared at back
// so we had pers view to ger far and near values. in addition  team added orthogonal.
let viewChange = 'p';

let points = [];
let colors = [];
let normal = [];


let sun, planet, planet2, planet3;

//theta for rotation
//zoom factor that how much u zoom in 1 push
let theta = 0;
let factorOfZoom = 0.25;

let eye = [0, 0, 1];
let at = [0, 0, 0];
let up = [0, 1, 0];

let diffuseVals = [];
let specularVals = [];

// lights RGB values
let light = {
  'ambient': [1.0, 0.5, 0.0, 1.0],
  'diffuse': [1.0, 1.0, 1.0, 1.0],
  'specular': [1.0, 1.0, 1.0, 1.0],

  'location': [0.0, 1.0, 0.0, 0.0],
};

// which RGB values would be reflected on object
let material = {
  'ambient': [1.0, 1.0, 0.7, 1.0],
  'diffuse': [1.0, 1.0, 1.0, 1.0],
  'specular': [1.0, 1.0, 1.0, 1.0],

  'shininess': 20.0,
}

// different materials for planets, when we add them to different shaders we can get different colors and ligthning on them
let sunMaterial = {
  'ambient': [1.0, 0.5, 0.0, 1.0], 
  'diffuse': [1.0, 0.5, 0.0, 1.0], 
  'specular': [1.0, 1.0, 1.0, 1.0], 
  'shininess': 20.0,
};

// Material  for planet
let planetMaterial = {
  'ambient': [0.0, 0.5, 1.0, 1.0], 
  'diffuse': [0.0, 0.5, 1.0, 1.0], 
  'specular': [1.0, 1.0, 1.0, 1.0], 
  'shininess': 20.0,
};

// Material  for planet2
let planet2Material = {
  'ambient': [0.8, 0.2, 0.5, 1.0], 
  'diffuse': [0.8, 0.2, 0.5, 1.0], 
  'specular': [1.0, 1.0, 1.0, 1.0], 
  'shininess': 20.0,
};

// Material  for planet3
let planet3Material = {
  'ambient': [0.5, 1.0, 0.0, 1.0], 
  'diffuse': [0.5, 1.0, 0.0, 1.0],
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
  program1 = initShaders( gl, "vertex-shader", "fragment-shader" );
  
  

  gl.useProgram(program1);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0, 0, 0, 1);

  // used geometry to draw sun  sphere
  sun = sphere(5);
  sun.scale(0.5, 0.5, 0.5);
  sun.translate(0, 0, 0);

  //tried to have its materials in different way
  sun.material = sunMaterial;

  planet = sphere(5);
  planet.scale(0.15, 0.15, 0.15);
  planet.translate(0.7, 0, 0);

  // these ones are importat
  // we get radious of orbit
  // speed of orbit
  // in which axis it will change, I mean move
  // you can see in render() how team used them and calculations to rotate them
  planet.radiusOrbit = 1.5;    
  planet.speedOfOrbits = 0.0002;   
  planet.speedOfRotations = 0.003; 
  planet.ChangesOfAxes = [1, 0, 0];

  
  planet.material = planetMaterial;

  planet2 = sphere(5);
  planet2.scale(0.25, 0.25, 0.25);
  planet2.translate(1.2, 0, 0);
  

  planet2.radiusOrbit = 3;
  planet2.speedOfOrbits = 0.0005;
  planet2.speedOfRotations = 0.02;
  planet2.ChangesOfAxes = [1, 0, 0];

  planet2.material = planet2Material;

  planet3 = sphere(5);
  planet3.scale(0.35, 0.35, 0.35);
  planet3.translate(-2, 0, 0);
  
  planet3.radiusOrbit = -4;
  planet3.speedOfOrbits = 0.000099;
  planet3.speedOfRotations = 0.006;
  planet3.ChangesOfAxes = [1, 0, 0];

  planet3.material = planet3Material;
  

  points = sun.TriangleVertices;
  points = points.concat(planet.TriangleVertices);
  points = points.concat(planet2.TriangleVertices);
  points = points.concat(planet3.TriangleVertices);

 

  // just buffers to store vals in shaders 
  // color buffers were add for colors then realized not need for it
  // materials properties were enough for colors

  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program1, 'vPosition');
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  let diffuseBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, diffuseBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(diffuseVals), gl.STATIC_DRAW);

  let vDiffuse = gl.getAttribLocation(program1, 'diffuse');
  gl.vertexAttribPointer(vDiffuse, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vDiffuse);

  let specularBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, specularBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(specularVals), gl.STATIC_DRAW);

  let vSpecular = gl.getAttribLocation(program1, 'specular');
  gl.vertexAttribPointer(vSpecular, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vSpecular);

  let cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  let vColor = gl.getAttribLocation(program1, 'vColor');
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  // this part is  interesting team tried to have second shader and use it for second planet. 
  // due to so many bugs and lack of time we failed to do it for colors



  // program2 = initShaders( gl, "vertex-shader2", "fragment-shader2" );

  // gl.useProgram(program2);

  // let vBuffer2 = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
  // gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  // let vPosition2 = gl.getAttribLocation(program2, 'vPosition');
  // gl.vertexAttribPointer(vPosition2, 4, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(vPosition2);

  // let vDiffuse2 = gl.getAttribLocation(program2, 'diffuse');
  // gl.vertexAttribPointer(vDiffuse2, 4, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(vDiffuse2);

  // let vSpecular2 = gl.getAttribLocation(program2, 'specular');
  // gl.vertexAttribPointer(vSpecular2, 4, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(vSpecular2);

  // let vColor2 = gl.getAttribLocation(program2, 'vColor');
  // gl.vertexAttribPointer(vColor2, 3, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(vColor2);

  


  // we just had different ambient with using different materials
  // we can get different ambient colors here due to materials * lights
  // P means planet, P2 is planet 2, P3 is planet 3.

  let ambient = getAmbient();
  gl.uniform4fv(gl.getUniformLocation(program1, 'ambient'), ambient);

  // planet 1 color

  let ambientP = getAmbientP();
  gl.uniform4fv(gl.getUniformLocation(program1, 'ambientP'), ambientP);

  // planet 2 color
  
  let ambientP2 = getAmbientP2();
  gl.uniform4fv(gl.getUniformLocation(program1, 'ambientP2'), ambientP2);

  // planet 3 color
  
  let ambientP3 = getAmbientP3();
  gl.uniform4fv(gl.getUniformLocation(program1, 'ambientP3'), ambientP3);

  modelViewMatrix = gl.getUniformLocation(program1, 'modelViewMatrix');

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

//these move functions are for arrows to move camera

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

// just for rotation around system

function rotateCameraClockwise() {
  theta -= 11; // Rotation angle
}

function rotateCameraCounterClockwise() {
  theta += 11;
}

// zoom out in of camera

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

  // here we used interesting technique
  // we can rotate not in only x
  // we can also rotate in x, y, z  values
  // so we can see them from left top right where we want
  // with  help of this we can walk free in space

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

  // no specific things just variables to ger near far for not losing object  in back
  // also variables for orthogonal.

  let aspect = gl.canvas.width / gl.canvas.height;
  let fov = 50;
  let left = -2.0; 
  let right = 2.0;
  let bottom = -2.0;
  let top = 2.0;
  let near = 0.1;
  let far = 100.0;
  let projMatrix; 

  //just added to se in pers and ortho view just in case

  if(viewChange === 'o'){

    // mat for ortho

       projMatrix = ortho(left, right, bottom, top, near, far); 

  } else if(viewChange === 'p') {

    // mat for pers

       projMatrix = perspective(fov, aspect, near, far);
  }


  // how we rotate and zoom with calculation of matrixs and factors
  mvm = mult(projMatrix, mvm);
  mvm = mult(mvm, rotate(theta, rotationfactor));
  mvm = mult(mvm, scalem(factorOfZoom, factorOfZoom, factorOfZoom));
  
    // render the sun
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mvm));
    gl.drawArrays(gl.TRIANGLES, 0, sun.TriangleVertices.length);
  
    let timeOfNow = new Date().getTime();

// First planet
let PosOfPlanet = vec3(
  planet.radiusOrbit * Math.cos(planet.speedOfOrbits * timeOfNow), // x position of planet on orbit
  0, // y position is always 0 due to a 2D orbit
  planet.radiusOrbit * Math.sin(planet.speedOfOrbits * timeOfNow) // z position of  planet on  orbit
);
let angleOfRotation = planet.speedOfRotations * timeOfNow; // angle of rotation for  planet
let matrixOfPlanetRotation = rotate(
  angleOfRotation,
  planet.ChangesOfAxes[0],
  planet.ChangesOfAxes[1],
  planet.ChangesOfAxes[2]
); // rotation matrix for  planet
let planetMvm = mult(
  translate(PosOfPlanet[0], PosOfPlanet[1], PosOfPlanet[2]),
  matrixOfPlanetRotation
); // MVM for planet, combining translation and rotation
planetMvm = mult(mvm, planetMvm); // combine the planet's MVM with the overall mvm
gl.uniformMatrix4fv(modelViewMatrix, false, flatten(planetMvm)); // set the uniform model-view matrix in the shader
gl.drawArrays(gl.TRIANGLES, sun.TriangleVertices.length, planet.TriangleVertices.length); // draw the planet

// Second planet
let PosOfPlanet2 = vec3(
  planet2.radiusOrbit * Math.cos(planet2.speedOfOrbits * timeOfNow),
  0,
  planet2.radiusOrbit * Math.sin(planet2.speedOfOrbits * timeOfNow)
);
let angleOfRotation2 = planet2.speedOfRotations * timeOfNow;
let matrixOfPlanetRotation2 = rotate(
  angleOfRotation2,
  planet2.ChangesOfAxes[0],
  planet2.ChangesOfAxes[1],
  planet2.ChangesOfAxes[2]
);
let planetMvm2 = mult(
  translate(PosOfPlanet2[0], PosOfPlanet2[1], PosOfPlanet2[2]),
  matrixOfPlanetRotation2
);
planetMvm2 = mult(mvm, planetMvm2);
gl.uniformMatrix4fv(modelViewMatrix, false, flatten(planetMvm2));
gl.drawArrays(
  gl.TRIANGLES,
  sun.TriangleVertices.length + planet.TriangleVertices.length,
  planet2.TriangleVertices.length
); // draw the second planet

// Third planet
let PosOfPlanet3 = vec3(
  planet3.radiusOrbit * Math.cos(planet3.speedOfOrbits * timeOfNow),
  0,
  planet3.radiusOrbit * Math.sin(planet3.speedOfOrbits * timeOfNow)
);
let angleOfRotation3 = planet3.speedOfRotations * timeOfNow;
let matrixOfPlanetRotation3 = rotate(
  angleOfRotation3,
  planet3.ChangesOfAxes[0],
  planet3.ChangesOfAxes[1],
  planet3.ChangesOfAxes[2]
);
let planetMvm3 = mult(
  translate(PosOfPlanet3[0], PosOfPlanet3[1], PosOfPlanet3[2]),
  matrixOfPlanetRotation3
);
planetMvm3 = mult(mvm, planetMvm3);
gl.uniformMatrix4fv(modelViewMatrix, false, flatten(planetMvm3));
gl.drawArrays(
  gl.TRIANGLES,
  sun.TriangleVertices.length + planet.TriangleVertices.length + planet2.TriangleVertices.length,
  planet3.TriangleVertices.length
); // Draw the third planet

  requestAnimationFrame(render);
}

// here majic happens to get differt color for planets
// we mult light with differen materials of planets
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


// here is just lightening we did with the help of class recording

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

//functions for getAmbient to make our work easy
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
