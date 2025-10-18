// Listas base
const culpablesPosibles = ["Sofía", "Iris", "Ana Cecy", "Diana", "Andrea"];
const locacionesPosibles = ["Baños", "Dirección", "Patio de juegos", "Salón de clases", "Escaleras"];
const armasPosibles = ["Cutter", "Pastillas abortivas", "Bastón", "Pastillas para dormir", "Ganchito"];

// Coartadas y diálogos
const coartadasInocentes = { "Sofía":"Salón de clases","Iris":"Patio de juegos","Ana Cecy":"Dirección","Diana":"Baños","Andrea":"Escaleras" };
const coartadasFalsas = { "Sofía":"Patio de juegos","Iris":"Escaleras","Ana Cecy":"Salón de clases","Diana":"Dirección","Andrea":"Baños" };
const dialogosBase = {
    "Sofía":"sisea mientras saca el arma, celosa por los chismes de María.",
    "Iris":"ofrece un vaso con una sonrisa falsa, silenciando el secreto del embarazo.",
    "Ana Cecy":"balancea el arma en un 'juego' agresivo, gritando '¡Corre, perra!'",
    "Diana":"desliza el arma en la bebida, susurrando 'Duerme y olvídate de mis secretos.'",
    "Andrea":"espera en la sombra, murmurando 'Devuélveme lo que robaste', antes de empujar."
};

// Casos predefinidos
const casosPredefinidos = [];
let count = 0;
for(let i=0;i<5 && count<25;i++){
    for(let j=0;j<5 && count<25;j++){
        casosPredefinidos.push({culpable: culpablesPosibles[i], locacion: locacionesPosibles[j], arma: armasPosibles[(i+j)%5]});
        count++;
    }
}

// Variables globales
let casoReal = null;
let currentTurn = 1;
let maxTurns = 10;
let alumnaInterrogada = null; // Alumna que ya fue interrogada
let mochilasRevisadas = []; // Armas ya encontradas en mochilas (descartadas)

// INICIAR JUEGO
function startGame(){
    const idxCaso = Math.floor(Math.random()*casosPredefinidos.length);
    casoReal = casosPredefinidos[idxCaso];
    console.log("Caso secreto:", casoReal);
    document.getElementById('intro').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    currentTurn = 1;
    alumnaInterrogada = null;
    mochilasRevisadas = [];
    document.getElementById('output').textContent = '';
    updateTurnInfo();
    appendOutput("Partida iniciada. ¡Deduce con cuidado!");
}

// ACTUALIZAR TURNO
function updateTurnInfo(){
    document.getElementById('current-turn').textContent = currentTurn;
    if(currentTurn>maxTurns){
        document.getElementById('turn-info').innerHTML = '<h3>¡Turnos agotados! Da tu veredicto ahora.</h3>';
    } else {
        document.getElementById('turn-info').innerHTML = '';
    }
}

// APPEND OUTPUT
function appendOutput(text){
    const output = document.getElementById('output');
    output.textContent += text + '\n\n';
    output.scrollTop = output.scrollHeight;
}

// MOSTRAR IMAGEN DINÁMICA
function showImage(src){
    const img = document.getElementById('dynamic-image');
    if(src && src!==''){
        img.src = src;
        img.classList.remove('hidden');
    } else {
        img.classList.add('hidden');
    }
}

// INTERROGAR ALUMNA
function showInterrogation(){
    document.getElementById('input-area').innerHTML=`
        <select id="alumna-select">
            <option value="">Selecciona alumna</option>
            ${culpablesPosibles.map(a=>`<option value="${a}">${a}</option>`).join('')}
        </select>
        <button onclick="interrogate()">Interrogar</button>
        <button onclick="backToActions()">Cancelar</button>
    `;
    document.getElementById('input-area').classList.remove('hidden');
    document.getElementById('actions').classList.add('hidden');
}

// FUNCION INTERROGAR
function interrogate(){
    const alumna = document.getElementById('alumna-select').value;
    if(!alumna){ appendOutput('Selecciona una alumna válida.'); return; }
    alumnaInterrogada = alumna; // Guardamos la alumna interrogada
    // Mostrar imagen de alumna (solo espacio reservado)
    showImage(`assets/${alumna.toLowerCase().replace(/ /g,'_')}.png`);
    const esCulpable = alumna===casoReal.culpable;
    let coartada = esCulpable ? coartadasFalsas[alumna] : coartadasInocentes[alumna];
    appendOutput(`${alumna}: '${esCulpada ? "Estaba en "+coartada+", sola." : "Estaba en "+coartada+", estudiando/charlando."}'\nNota: La cámara en ${coartada} verifica su coartada.`);
    nextTurn();
    backToActions();
}

// MOSTRAR CAMARAS (SOLO SI HAY ALUMNA INTERROGADA)
function showCameras(){
    if(!alumnaInterrogada){
        alert('Primero debes interrogar a una alumna antes de revisar cámaras.');
        return;
    }
    document.getElementById('input-area').innerHTML=`
        <select id="locacion-cam-select">
            <option value="">Selecciona locación</option>
            ${locacionesPosibles.map(l=>`<option value="${l}">${l}</option>`).join('')}
        </select>
        <button onclick="checkCamera()">Revisar</button>
        <button onclick="backToActions()">Cancelar</button>
    `;
    document.getElementById('input-area').classList.remove('hidden');
    document.getElementById('actions').classList.add('hidden');
    // Espacio para mostrar imagen de la cámara
    showImage(''); 
}

// FUNCION REVISAR CAMARA
function checkCamera(){
    const locacion = document.getElementById('locacion-cam-select').value;
    if(!locacion){ appendOutput('Selecciona una locación válida.'); return; }
    if(locacion===casoReal.locacion){
        appendOutput(`Cámaras de ${locacion}: Interferencia estática. Algo pasó aquí.`);
    } else {
        let visibles = [];
        culpablesPosibles.forEach(a=>{
            if(a!==casoReal.culpable && coartadasInocentes[a]===locacion) visibles.push(a);
        });
        let mensaje = `Cámaras de ${locacion}: Movimiento normal. `;
        mensaje += visibles.length>0?`Se ve a ${visibles.join(', ')} allí.`:'Nada sospechoso.';
        appendOutput(mensaje);
    }
    nextTurn();
    backToActions();
}

// REVISAR MOCHILAS
function checkBackpacks(){
    if(mochilasRevisadas.length>=armasPosibles.length-1){
        appendOutput("Ya revisaste todas las mochilas posibles. No hay más armas descartables.");
        return;
    }
    // Elegir arma aleatoria que no sea el arma real y que no haya salido antes
    const armasDescartables = armasPosibles.filter(a=>a!==casoReal.arma && !mochilasRevisadas.includes(a));
    const armaEncontrada = armasDescartables[Math.floor(Math.random()*armasDescartables.length)];
    mochilasRevisadas.push(armaEncontrada);
    appendOutput(`Revisas mochilas: Encuentras ${armaEncontrada}.`);
    nextTurn();
}

// VEREDICTO
function showVerdict(){
    document.getElementById('game').classList.add('hidden');
    document.getElementById('verdict-area').classList.remove('hidden');
}

function submitVerdict(){
    const culpable = document.getElementById('culpable-select').value;
    const locacion = document.getElementById('locacion-select').value;
    const arma = document.getElementById('arma-select').value;
    if(!culpable || !locacion || !arma){ alert('Selecciona todas las opciones.'); return; }
    endGame(culpable===casoReal.culpable && locacion===casoReal.locacion && arma===casoReal.arma, culpable===casoReal.culpable && locacion===casoReal.locacion && arma===casoReal.arma?'¡Correcto!':'Incorrecto.'); 
}

function backToGame(){
    document.getElementById('verdict-area').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
}

function backToActions(){
    document.getElementById('input-area').classList.add('hidden');
    document.getElementById('actions').classList.remove('hidden');
}

function nextTurn(){
    currentTurn++;
    updateTurnInfo();
    if(currentTurn>maxTurns){
        appendOutput('¡Turnos agotados! Da tu veredicto.');
        showVerdict();
    }
    backToActions();
}

function exitGame(){ endGame(false,'Has salido del juego.'); }

function endGame(win,msg){
    document.getElementById('game').classList.add('hidden');
    document.getElementById('verdict-area').classList.add('hidden');
    document.getElementById('end-game').classList.remove('hidden');
    document.getElementById('end-title').textContent = win?'¡Ganaste!':'Juego Terminado';
    document.getElementById('end-message').textContent = msg;
}

function restartGame(){ location.reload(); }
