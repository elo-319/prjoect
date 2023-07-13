let gl, program;
let vertexCount = 12;
let modelViewMatrix;
let points = [];
let divisionCount = 5;

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
}

let material = {
    'ambient': [1.0, 1.0, 0.7, 1.0],
    'diffuse': [1.0, 1.0, 1.0, 1.0],
    'specular': [1.0, 1.0, 1.0, 1.0],

    'shininess': 20.0,
}

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

    let vertices = [
        0.0, 0.0, -1.0, 1,
        0.0, 0.942809, 0.333333, 1,
        -0.816497, -0.471405, 0.333333, 1,
        0.816497, -0.471405, 0.333333, 1,
    ];


    let a = vertices.slice(0, 4);
    let b = vertices.slice(4, 8);
    let c = vertices.slice(8, 12);
    let d = vertices.slice(12, 16);

    drawTetrahedron(a, b, c, d, divisionCount);

    let ambient = getAmbient();

    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition,4,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vPosition);

    let diffuseBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, diffuseBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(diffuseVals), gl.STATIC_DRAW);

    let vDiffuse = gl.getAttribLocation(program, 'diffuse');
    gl.vertexAttribPointer(vDiffuse,4,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vDiffuse);

    let specularBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, specularBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(specularVals), gl.STATIC_DRAW);

    let vSpecular = gl.getAttribLocation(program, 'specular');
    gl.vertexAttribPointer(vSpecular,4,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vSpecular);


    gl.uniform4fv(gl.getUniformLocation(program, 'ambient'), ambient);

    modelViewMatrix = gl.getUniformLocation(program, 'modelViewMatrix');

    render();
};


function render() { 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mvm = lookAt(eye, at, up);

    gl.uniformMatrix4fv(modelViewMatrix, false,
    flatten(mvm));

    gl.drawArrays(gl.TRIANGLES, 0, points.length)

    // requestAnimationFrame(render);
}


function drawTetrahedron(a, b, c, d, divisionCount) {
    drawTriangle(b, d, c, divisionCount);
    drawTriangle(a, d, c, divisionCount);
    drawTriangle(b, a, c, divisionCount);
    drawTriangle(b, a, d, divisionCount);
}

function drawTriangle(a, b, c, divisionCount) {

    if (divisionCount === 0) {
        points.push(a);
        points.push(b);
        points.push(c);

        diffuseVals.push(getDiffuse(a));
        diffuseVals.push(getDiffuse(b));
        diffuseVals.push(getDiffuse(c));

        specularVals.push(getSpecular(a));
        specularVals.push(getSpecular(b));
        specularVals.push(getSpecular(c));

        return;
    }

    let ab = normalize(mix(a, b, 0.5), true);
    let ac = normalize(mix(a, c, 0.5), true);
    let bc = normalize(mix(b, c, 0.5), true);

    drawTriangle(a, ab, ac, divisionCount-1);
    drawTriangle(ab, b, bc, divisionCount-1);
    drawTriangle(ab, bc, ac, divisionCount-1);
    drawTriangle(ac, bc, c, divisionCount-1);
}


function getAmbient() {
    return getProd('ambient');
}

function getDiffuse(vertex) {
    let normal = getNormal(vertex);
    let diffuseProd = getProd('diffuse');

    // let v = add(a, add(b, c));
    // v = scale(1/3, v);
    // let lightPos = subtract(light['location'], v); 

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
    }
    else {
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