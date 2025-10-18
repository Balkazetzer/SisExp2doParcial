// ====================
// CONFIGURACIÓN
// ====================

const culpablesPosibles = ["Sofía", "Iris", "Ana Cecy", "Diana", "Andrea"];
const locacionesPosibles = ["Baños", "Dirección", "Patio de juegos", "Salón de clases", "Escaleras"];
const armasPosibles = ["Cutter", "Pastillas abortivas", "Bastón", "Pastillas para dormir", "Ganchito"];

// Rutas a los sprites e imágenes
const spritePaths = {
    "Sofía": "assets/sofia.png",
    "Iris": "assets/iris.png",
    "Ana Cecy": "assets/anac.png",
    "Diana": "assets/diana.png",
    "Andrea": "assets/andrea.png"
};

const scenePaths = {
    "Baños": "assets/banyos.jpg",
    "Dirección": "assets/direcc.jpg",
    "Patio de juegos": "assets/patio.jpg",
    "Salón de clases": "assets/aula.jpg",
    "Escaleras": "assets/escalera.jpg"
};

// ====================
// VARIABLES
// ====================
let casoReal = null;
let currentTurn = 1;
let maxTurns = 10;
let alumnaInterrogada = null;
let camaraUsada = false;
let mochilasRevisadas = [];
let armasDescartadas = [];
let armaAsesina = null;

// ====================
// ELEMENTOS DOM
// ====================
const output = document.getElementById('output');
const turnDisplay = document.getElementById('current-turn');
const sceneImage = document.getElementById('scene-image');
const studentImage = document.getElementById('student-image');
const miniStudentImage = document.getElementById('mini-student-image');

// ====================
// FUNCIONES DEL JUEGO
// ====================
function startGame() {
    casoReal = {
        culpable: random(culpablesPosibles),
        locacion: random(locacionesPosibles),
        arma: random(armasPosibles)
    };
    armaAsesina = casoReal.arma;
    currentTurn = 1;
    mochilasRevisadas = [];
    armasDescartadas = [];
    alumnaInterrogada = null;
    camaraUsada = false;

    document.getElementById('intro').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    output.textContent = "La partida ha comenzado. Interroga a una alumna para iniciar.";
    updateTurn();
}

function updateTurn() {
    turnDisplay.textContent = currentTurn;
}

function random(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function appendOutput(text) {
    output.textContent += "\n" + text;
    output.scrollTop = output.scrollHeight;
}

// ----- Interrogatorio -----
function showInterrogation() {
    document.getElementById('input-area').innerHTML = `
        <select id="alumna-select">
            <option value="">Selecciona alumna</option>
            ${culpablesPosibles.map(a => `<option value="${a}">${a}</option>`).join('')}
        </select>
        <button onclick="interrogate()">Interrogar</button>
        <button onclick="backToActions()">Cancelar</button>
    `;
    toggleInputs(true);
}

function interrogate() {
    const alumna = document.getElementById('alumna-select').value;
    if (!alumna) { appendOutput("Selecciona una alumna válida."); return; }

    alumnaInterrogada = alumna;
    camaraUsada = false;

    // Mostrar sprite de alumna
    studentImage.src = spritePaths[alumna];
    studentImage.classList.remove('hidden');
    sceneImage.classList.add('hidden');
    miniStudentImage.classList.add('hidden');

    appendOutput(`${alumna} fue interrogada. Su actitud parece ${["nerviosa", "tranquila", "evasiva"][Math.floor(Math.random()*3)]}.`);
    nextTurn();
    backToActions();
}

// ----- Revisar cámaras -----
function showCameras() {
    if (!alumnaInterrogada) {
        alert("Primero debes interrogar a una alumna.");
        return;
    }
    if (camaraUsada) {
        appendOutput("Ya revisaste una cámara para esta alumna. Interroga a otra antes de revisar otra cámara.");
        return;
    }

    document.getElementById('input-area').innerHTML = `
        <select id="locacion-cam-select">
            <option value="">Selecciona locación</option>
            ${locacionesPosibles.map(l => `<option value="${l}">${l}</option>`).join('')}
        </select>
        <button onclick="checkCamera()">Revisar</button>
        <button onclick="backToActions()">Cancelar</button>
    `;
    toggleInputs(true);
}

function checkCamera() {
    const loc = document.getElementById('locacion-cam-select').value;
    if (!loc) { appendOutput("Selecciona una locación válida."); return; }

    sceneImage.src = scenePaths[loc];
    sceneImage.classList.remove('hidden');

    miniStudentImage.src = spritePaths[alumnaInterrogada];
    miniStudentImage.classList.remove('hidden');

    camaraUsada = true;
    appendOutput(`Revisas la cámara en ${loc}. Se observa a ${alumnaInterrogada} cerca del área.`);

    nextTurn();
    backToActions();
}

// ----- Revisar mochilas -----
function checkBackpacks() {
    if (mochilasRevisadas.length >= armasPosibles.length - 1) {
        appendOutput("Ya revisaste todas las mochilas posibles. No hay más armas descartables.");
        return;
    }

    const disponibles = armasPosibles.filter(a => a !== armaAsesina && !armasDescartadas.includes(a));
    if (disponibles.length === 0) {
        appendOutput("Ya no hay más objetos por revisar.");
        return;
    }

    const encontrada = random(disponibles);
    mochilasRevisadas.push(encontrada);
    armasDescartadas.push(encontrada);
    appendOutput(`Revisas una mochila y encuentras ${encontrada}.`);

    nextTurn();
}

// ----- Veredicto -----
function showVerdict() {
    document.getElementById('game').classList.add('hidden');
    document.getElementById('verdict-area').classList.remove('hidden');
}

function submitVerdict() {
    const culpable = document.getElementById('culpable-select').value;
    const loc = document.getElementById('locacion-select').value;
    const arma = document.getElementById('arma-select').value;

    if (!culpable || !loc || !arma) {
        alert("Selecciona todas las opciones.");
        return;
    }

    const correcto = (culpable === casoReal.culpable && loc === casoReal.locacion && arma === casoReal.arma);
    endGame(correcto, correcto ? "¡Has resuelto el caso!" : "Veredicto incorrecto.");
}

// ----- Gestión de interfaz -----
function backToActions() {
    toggleInputs(false);
}

function toggleInputs(show) {
    document.getElementById('input-area').classList.toggle('hidden', !show);
    document.getElementById('actions').classList.toggle('hidden', show);
}

function nextTurn() {
    currentTurn++;
    updateTurn();
    if (currentTurn > maxTurns) {
        appendOutput("¡Turnos agotados! Da tu veredicto.");
        showVerdict();
    }
}

function exitGame() {
    endGame(false, "Has salido del juego.");
}

function endGame(win, msg) {
    document.getElementById('game').classList.add('hidden');
    document.getElementById('verdict-area').classList.add('hidden');
    document.getElementById('end-game').classList.remove('hidden');
    document.getElementById('end-title').textContent = win ? "¡Ganaste!" : "Juego Terminado";
    document.getElementById('end-message').textContent = msg;
}

function restartGame() {
    location.reload();
}
