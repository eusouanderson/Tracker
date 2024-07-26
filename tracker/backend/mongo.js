process.title = 'MongoDB';

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const Telemetry = require('./models/Telemetry');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const envoriments = require('./envoriments/envoriments');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

app.use(cors());
app.use(bodyParser.json());

const MONGO_URI = `mongodb+srv://${envoriments.MONGO_USER}:${envoriments.MONGO_PASSWORD}@${envoriments.MONGO_CLUSTER}/EuroTruckSim2020?retryWrites=true&w=majority`;

mongoose.connect(MONGO_URI)
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

const updateTelemetryData = async (name, password, connected) => {
    try {
        const response = await axios.get(envoriments.API_SERVER);
        const telemetryData = response.data;

        if (!telemetryData.gamer) {
            telemetryData.gamer = {};
        }
        if (!telemetryData.game) {
            telemetryData.game = {};
        }

        telemetryData.gamer.user = name;
        telemetryData.gamer.password = password;
        telemetryData.game.connected = connected;

        let telemetry = await Telemetry.findOne({ 'gamer.user': name });

        if (telemetry) {
            telemetry = await Telemetry.findOneAndUpdate(
                { 'gamer.user': name },
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
        const { name, password } = req.query;

        if (!name || !password) {
            return res.status(400).json({ error: 'Nome e senha são necessários' });
        }

        let telemetry = await Telemetry.findOne({ 'gamer.user': name });

        if (!telemetry) {
            telemetry = await Telemetry.create({
                gamer: { user: name, password: password }
            });
            console.log("Novo jogador criado com sucesso:", telemetry);
        } else if (telemetry.gamer.password !== password) {
            return res.status(401).json({ error: 'Senha inválida' });
        }

        const intervalId = setInterval(() => updateTelemetryData(name, password, true), 1000);

        io.on('connection', (socket) => {
            console.log('Cliente conectado:', name);
            updateTelemetryData(name, password, true);

            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', name);
                updateTelemetryData(name, password, false);
                clearInterval(intervalId);
            });
        });

        res.json({ message: 'Atualização de telemetria iniciada', name });
    } catch (error) {
        console.error("Erro ao processar solicitação:", error);
        res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
});

const isDev = process.env.NODE_ENV !== 'production';
const buildPath = isDev ? path.join(__dirname, '..', 'build') : path.join(path.dirname(process.execPath), 'build');

app.use(express.static(buildPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/dados-telemetry/:score', (req, res) => {
    const { score } = req.params;
    if (!score) {
        return res.status(400).json({ error: 'Score é necessário' });
    }
    io.emit('score', score);
    res.json({ message: 'Atualização de telemetria iniciada', score });
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

const shutdown = (signal) => {
    console.log(`Recebido sinal de ${signal}. Fechando o servidor...`);
    server.close(() => {
        console.log('Servidor encerrado.');
        mongoose.disconnect(() => {
            console.log('Desconectado do MongoDB.');
            process.exit(0);
        });
    });
};

server.listen(envoriments.PORT_SERVER, () => {
    console.log(`Server running on http://localhost:${envoriments.PORT_SERVER}`);
    console.log('Caminho da build do index:', buildPath);
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
