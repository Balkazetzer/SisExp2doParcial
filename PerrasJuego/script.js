const culpablesPosibles = ["Sofía", "Iris", "Ana Cecy", "Diana", "Andrea"];
const locacionesPosibles = ["Baños", "Dirección", "Patio de juegos", "Salón de clases", "Escaleras"];
const armasPosibles = ["Cutter", "Pastillas abortivas", "Bastón", "Pastillas para dormir", "Ganchito"];

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

const staticScene = "assets/ruido.jpg";

let casoReal, currentTurn = 1, maxTurns = 10;
let alumnaInterrogada = null;
let coartadaActual = null;
let mochilasRevisadas = [];
let armasDescartadas = [];

const output = document.getElementById('output');
const turnDisplay = document.getElementById('current-turn');
const sceneImage = document.getElementById('scene-image');
const studentImage = document.getElementById('student-image');
const miniStudentImage = document.getElementById('mini-student-image');

function startGame() {
    casoReal = {
        culpable: random(culpablesPosibles),
        locacion: random(locacionesPosibles),
        arma: random(armasPosibles)
    };
    currentTurn = 1;
    mochilasRevisadas = [];
    armasDescartadas = [];
    alumnaInterrogada = null;

    document.getElementById('intro').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    output.textContent = "Comienza la investigación...";
    updateTurn();
}

function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function appendOutput(txt) {
    output.textContent += "\n" + txt;
    output.scrollTop = output.scrollHeight;
}

function updateTurn() {
    turnDisplay.textContent = currentTurn;
}

// ---------------- INTERROGAR ----------------
function showInterrogation() {
    document.getElementById('input-area').innerHTML = `
        <select id="alumna-select">
            <option value="">Selecciona alumna</option>
            ${culpablesPosibles.map(a=>`<option>${a}</option>`).join('')}
        </select>
        <button onclick="interrogate()">Interrogar</button>
        <button onclick="backToActions()">Cancelar</button>`;
    toggleInputs(true);
}

function interrogate() {
    const alumna = document.getElementById('alumna-select').value;
    if (!alumna) return appendOutput("Selecciona una alumna válida.");

    alumnaInterrogada = alumna;
    studentImage.src = spritePaths[alumna];
    studentImage.classList.remove('hidden');
    sceneImage.classList.add('hidden');
    miniStudentImage.classList.add('hidden');

    if (alumna === casoReal.culpable) {
        coartadaActual = random(locacionesPosibles.filter(l => l !== casoReal.locacion));
        appendOutput(`${alumna} dice: "Estaba en ${coartadaActual}, no sé nada."`);
    } else {
        coartadaActual = random(locacionesPosibles.filter(l => l !== casoReal.locacion));
        appendOutput(`${alumna} dice: "Estaba en ${coartadaActual}, puedes revisar la cámara si no me crees."`);
    }

    nextTurn();
    backToActions();
}

// ---------------- CÁMARAS ----------------
function showCameras() {
    if (!alumnaInterrogada) return alert("Primero interroga a una alumna.");
    document.getElementById('input-area').innerHTML = `
        <select id="locacion-cam-select">
            <option value="">Selecciona locación</option>
            ${locacionesPosibles.map(l=>`<option>${l}</option>`).join('')}
        </select>
        <button onclick="checkCamera()">Revisar</button>
        <button onclick="backToActions()">Cancelar</button>`;
    toggleInputs(true);
}

function checkCamera() {
    const loc = document.getElementById('locacion-cam-select').value;
    if (!loc) return appendOutput("Selecciona una locación válida.");

    if (loc === casoReal.locacion) {
        sceneImage.src = staticScene;
        appendOutput(`Cámara en ${loc}: Interferencia total... parece que algo ocurrió aquí.`);
        miniStudentImage.classList.add('hidden');
    } else if (loc === coartadaActual) {
        if (alumnaInterrogada === casoReal.culpable) {
            const otra = random(culpablesPosibles.filter(a => a !== alumnaInterrogada));
            miniStudentImage.src = spritePaths[otra];
            appendOutput(`En la cámara de ${loc} se ve a ${otra}, no a ${alumnaInterrogada}.`);
        } else {
            miniStudentImage.src = spritePaths[alumnaInterrogada];
            appendOutput(`En la cámara de ${loc} se ve a ${alumnaInterrogada}, tal como dijo.`);
        }
        sceneImage.src = scenePaths[loc];
        miniStudentImage.classList.remove('hidden');
    } else {
        sceneImage.src = scenePaths[loc];
        miniStudentImage.classList.add('hidden');
        appendOutput(`Cámara en ${loc}: Todo tranquilo, nada fuera de lo normal.`);
    }

    sceneImage.classList.remove('hidden');
    nextTurn();
    backToActions();
}

// ---------------- MOCHILAS ----------------
function checkBackpacks() {
    if (mochilasRevisadas.length >= armasPosibles.length - 1)
        return appendOutput("Ya revisaste todas las mochilas posibles.");

    const disponibles = armasPosibles.filter(a => a !== casoReal.arma && !armasDescartadas.includes(a));
    const encontrada = random(disponibles);
    mochilasRevisadas.push(encontrada);
    armasDescartadas.push(encontrada);
    appendOutput(`Revisas una mochila y encuentras ${encontrada}.`);

    nextTurn();
}

// ---------------- VEREDICTO ----------------
function showVerdict() {
    document.getElementById('game').classList.add('hidden');
    document.getElementById('verdict-area').classList.remove('hidden');
}

function submitVerdict() {
    const c = document.getElementById('culpable-select').value;
    const l = document.getElementById('locacion-select').value;
    const a = document.getElementById('arma-select').value;
    if (!c || !l || !a) return alert("Selecciona todas las opciones.");

    const correcto = (c === casoReal.culpable && l === casoReal.locacion && a === casoReal.arma);
    endGame(correcto, correcto ? "¡Has resuelto el caso!" : "Veredicto incorrecto.");
}

// ---------------- SISTEMA DE CONTROL ----------------
function nextTurn() {
    currentTurn++;
    updateTurn();
    if (currentTurn > maxTurns) {
        appendOutput("Turnos agotados. Debes dar tu veredicto.");
        showVerdict();
    }
}

function toggleInputs(show) {
    document.getElementById('input-area').classList.toggle('hidden', !show);
    document.getElementById('actions').classList.toggle('hidden', show);
}

function backToActions() {
    toggleInputs(false);
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
