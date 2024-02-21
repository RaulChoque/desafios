const fs = require('fs');

let rutaArchivo = "./archivo/lista.txt";

class TicketManager {
    static #precioBaseganancia = 0.15;
    static #idCounter = 1; // Contador de ID

    constructor() {
        this.eventos = [];
    }

    getEventos() {
        return this.eventos;
    }

    addEventos(nombre, lugar, fecha = new Date(), capacidad = 50, costo = 0) {
        if (!nombre || !lugar) {
            throw new Error("Complete nombre y lugar");
        }

        let existe = this.eventos.find(evento => evento.nombre === nombre && evento.lugar === lugar);
        if (existe) {
            throw new Error(`El evento ${nombre} ya existe!!!`);
        }

        let id = TicketManager.#idCounter++;

        let nuevoevento = {
            id, nombre, lugar, fecha, capacidad,
            costo: costo + costo * TicketManager.#precioBaseganancia,
            asistentes: []
        };

        this.eventos.push(nuevoevento);
    }

    addUsuario(id, nombre, email) {
        let indiceEvento = this.eventos.findIndex(evento => evento.id === id);
        if (indiceEvento === -1) {
            throw new Error(`No existen eventos con id ${id}`);
        }

        let existe = this.eventos[indiceEvento].asistentes.find(asistente => asistente.email === email);
        if (existe) {
            throw new Error(`El usuario con email ${email} ya está registrado`);
        }
        this.eventos[indiceEvento].asistentes.push({ nombre, email });
    }

    ponerEnGira(id, lugar, fecha) {
        let indiceEvento = this.eventos.findIndex(evento => evento.id === id);
        if (indiceEvento === -1) {
            throw new Error(`No existen eventos con id ${id}`);
        }

        let nuevoEvento = {
            ...this.eventos[indiceEvento],
            id: TicketManager.#idCounter++, // Incrementar el contador de ID
            lugar,
            fecha,
            asistentes: []
        };

        this.eventos.push(nuevoEvento);

        fs.appendFileSync(rutaArchivo, JSON.stringify(nuevoEvento) + '\n', 'utf-8');
    }
}

const tm01 = new TicketManager();

console.log(tm01.getEventos());

try {
    tm01.addEventos("AFTERCLASS1", "en remoto", new Date(2024, 1, 14), 100, 100);
    tm01.addEventos("AFTERCLASS2", "en remoto 2", new Date(2024, 1, 14), 100, 100);
    tm01.addEventos("AFTERCLASS3", "en remoto 3", new Date(2024, 1, 14), 100, 100);
    tm01.addEventos("AFTERCLASS4", "en remoto 4", new Date(2024, 1, 14), 100, 100);

    tm01.addUsuario(90, "miguel", "estecorreo@test.com");
    tm01.addUsuario(2, "raul", "estecorreoraul@test.com");
    tm01.addUsuario(1, "copo", "estecorreocopo@test.com");
    tm01.addUsuario(76, "rosa", "estecorreorosa@test.com");

    tm01.ponerEnGira(1, "por zoom", new Date(2024, 5, 10));
    tm01.ponerEnGira(1, "por zoom otra vez", new Date(2024, 10, 10));

    console.log(tm01.getEventos());
} catch (error) {
    console.error(error.message);
}



const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 3000;


const TicketManager = require('./TicketManager');
const tm01 = new TicketManager();


app.get('/eventos', (req, res) => {
    try {
        
        const eventos = tm01.getEventos();
        
        res.json(eventos);
    } catch (error) {
        
        res.status(500).send(error.message);
    }
});

// Ruta para agregar un nuevo evento
app.post('/eventos', (req, res) => {
    try {
        
        
        const { nombre, lugar, fecha, capacidad, costo } = req.body;
        tm01.addEventos(nombre, lugar, fecha, capacidad, costo);
        res.send('Evento agregado correctamente');
    } catch (error) {
        res.status(400).send(error.message);
    }
});


app.post('/eventos/:id/asistentes', (req, res) => {
    try {
        const idEvento = req.params.id;
        const { nombre, email } = req.body;
        tm01.addUsuario(idEvento, nombre, email);
        res.send('Usuario agregado al evento correctamente');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});