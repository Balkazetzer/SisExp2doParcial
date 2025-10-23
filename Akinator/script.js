const animalsBase = [
    { nombre: "gato", atributos: ["peludo", "pequeño", "mamífero"] },
    { nombre: "perro", atributos: ["peludo", "mamífero", "doméstico"] },
    { nombre: "águila", atributos: ["volador", "grande", "ave"] },
    { nombre: "tiburón", atributos: ["acuático", "grande", "pez"] },
    { nombre: "ratón", atributos: ["pequeño", "mamífero", "gris"] },
    { nombre: "elefante", atributos: ["grande", "mamífero", "gris"] },
    { nombre: "serpiente", atributos: ["reptil", "sin patas", "no peludo"] },
    { nombre: "rana", atributos: ["anfibio", "verde", "pequeño"] },
    { nombre: "pez dorado", atributos: ["acuático", "pequeño", "pez"] },
    { nombre: "león", atributos: ["grande", "mamífero", "peludo"] }
];

let animales = JSON.parse(localStorage.getItem("animales")) || animalsBase;
let posibles = [...animales];
let atributoActual = null;
let preguntasHechas = [];
let modoConfirmacion = false;
let indiceConfirmacion = 0;

const questionArea = document.getElementById("question-area");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const learnArea = document.getElementById("learn-area");
const saveAnimalBtn = document.getElementById("save-animal");
const message = document.getElementById("message");
const restartArea = document.getElementById("restart-area");
const restartBtn = document.getElementById("restart-btn");

function obtenerMejorPregunta() {
    let todosAtributos = new Set();
    posibles.forEach(a => a.atributos.forEach(at => todosAtributos.add(at)));
    todosAtributos = [...todosAtributos].filter(a => !preguntasHechas.includes(a));
    if (todosAtributos.length === 0) return null;
    let mejor = null;
    let mejorBalance = Infinity;
    todosAtributos.forEach(attr => {
        const si = posibles.filter(a => a.atributos.includes(attr)).length;
        const no = posibles.length - si;
        const balance = Math.abs(si - no);
        if (balance < mejorBalance) {
            mejor = attr;
            mejorBalance = balance;
        }
    });
    return mejor;
}

function hacerPregunta() {
    if (posibles.length === 1) {
        questionArea.textContent = "¿Es " + posibles[0].nombre + "?";
        modoConfirmacion = true;
        return;
    }

    if (posibles.length === 2) {
        questionArea.textContent = "¿Es " + posibles[indiceConfirmacion].nombre + "?";
        modoConfirmacion = true;
        return;
    }

    atributoActual = obtenerMejorPregunta();
    if (!atributoActual) {
        aprenderNuevoAnimal();
        return;
    }
    preguntasHechas.push(atributoActual);
    questionArea.textContent = "¿Tu animal es " + atributoActual + "?";
}

function procesarRespuesta(respuesta) {
    if (modoConfirmacion) {
        if (respuesta === "sí") {
            message.textContent = "¡He adivinado! Era " + posibles[indiceConfirmacion].nombre + " 🎉";
            yesBtn.disabled = true;
            noBtn.disabled = true;
            mostrarReinicio();
            return;
        } else {
            indiceConfirmacion++;
            if (indiceConfirmacion >= posibles.length) {
                aprenderNuevoAnimal();
                return;
            }
            hacerPregunta();
            return;
        }
    }

    if (respuesta === "sí") {
        posibles = posibles.filter(a => a.atributos.includes(atributoActual));
    } else {
        posibles = posibles.filter(a => !a.atributos.includes(atributoActual));
    }

    if (posibles.length === 0) {
        aprenderNuevoAnimal();
    } else {
        hacerPregunta();
    }
}

function aprenderNuevoAnimal() {
    questionArea.textContent = "";
    learnArea.classList.remove("hidden");
    yesBtn.classList.add("hidden");
    noBtn.classList.add("hidden");
    restartArea.classList.remove("hidden");
    message.textContent = "Enséñame un nuevo animal para aprender.";
}

function mostrarReinicio() {
    yesBtn.classList.add("hidden");
    noBtn.classList.add("hidden");
    restartArea.classList.remove("hidden");
}

function reiniciarJuego() {
    posibles = [...animales];
    preguntasHechas = [];
    modoConfirmacion = false;
    indiceConfirmacion = 0;
    yesBtn.disabled = false;
    noBtn.disabled = false;
    yesBtn.classList.remove("hidden");
    noBtn.classList.remove("hidden");
    learnArea.classList.add("hidden");
    restartArea.classList.add("hidden");
    message.textContent = "";
    hacerPregunta();
}

yesBtn.onclick = () => procesarRespuesta("sí");
noBtn.onclick = () => procesarRespuesta("no");
restartBtn.onclick = reiniciarJuego;

saveAnimalBtn.onclick = () => {
    const nombre = document.getElementById("new-animal").value.trim().toLowerCase();
    const atributos = document.getElementById("new-attributes").value.trim().toLowerCase().split(",");
    if (nombre && atributos.length > 0) {
        animales.push({ nombre, atributos });
        localStorage.setItem("animales", JSON.stringify(animales));
        message.textContent = "Gracias, he aprendido un nuevo animal: " + nombre;
        learnArea.classList.add("hidden");
        mostrarReinicio();
    }
};

hacerPregunta();
