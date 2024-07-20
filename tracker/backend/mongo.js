import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import cors from 'cors';
import bodyParser from 'body-parser';
import Telemetry from './models/Telemetry.js';
import User from './models/User.js';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import envoriments from './envoriments/envoriments.js';



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

app.use(cors());
app.use(bodyParser.json());

// Configurar a URI do MongoDB usando variáveis de ambiente
const MONGO_URI = `mongodb+srv://${envoriments.MONGO_USER}:${envoriments.MONGO_PASSWORD}@${envoriments.MONGO_CLUSTER}/farmSimulator?retryWrites=true&w=majority`;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar com o MongoDB:', err));

const emitTelemetryUpdates = async () => {
    try {
        const telemetry = await Telemetry.find({});
        io.emit('telemetryUpdate', telemetry);
    } catch (error) {
        console.error("Erro ao emitir atualizações de telemetria:", error);
    }
};

const updateTelemetryData = async (name) => {
    try {
        const response = await axios.get(envoriments.API_SERVER);
        const telemetryData = response.data;
        telemetryData.game.gameName = name;

        let telemetry = await Telemetry.findOne({ 'game.gameName': name });

        if (telemetry) {
            telemetry = await Telemetry.findOneAndUpdate(
                { 'game.gameName': name },
                telemetryData,
                { new: true }
            );
            console.log("Dados de telemetria atualizados com sucesso:", telemetry);
        } else {
            telemetry = await Telemetry.create(telemetryData);
            console.log("Novos dados de telemetria salvos com sucesso:", telemetry);
        }

        emitTelemetryUpdates();
    } catch (error) {
        console.error("Erro ao obter ou salvar dados de telemetria:", error);
    }
};

app.get('/dados-telemetry', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ error: 'Nome é necessário' });
        }

        const intervalId = setInterval(() => updateTelemetryData(name), 1000);

        io.on('connection', (socket) => {
            console.log('Cliente conectado:', name);
            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', name);
                clearInterval(intervalId);
            });
        });

        res.json({ message: 'Atualização de telemetria iniciada', name });
    } catch (error) {
        console.error("Erro ao processar solicitação:", error);
        res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
});

app.get('/todos-dados-telemetry', async (req, res) => {
    try {
        const telemetry = await Telemetry.find({});
        res.json(telemetry);
    } catch (error) {
        console.error("Erro ao buscar dados de telemetria:", error);
        res.status(500).json({ error: 'Erro ao buscar dados de telemetria' });
    }
});

io.on('connection', (socket) => {
    console.log('Cliente conectado');
    socket.emit('telemetryUpdate', []);
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

server.listen(envoriments.PORT_SERVER, () => {
    console.log(`Server running on http://localhost:${envoriments.PORT_SERVER}`);
});