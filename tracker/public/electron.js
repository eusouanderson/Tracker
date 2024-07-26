const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

// Caminho para o backend
const backendPath = path.join(__dirname, '../backend/mongo.js');

let mainWindow;
let backendProcess;

// Função para criar a janela principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'favicon.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            preload: path.join(__dirname, 'preload.js'), // Caminho absoluto para preload.js
        }
    });

    // Carregar a URL do frontend
    mainWindow.loadURL('http://localhost:5000');
}

// Função para iniciar o backend
function startBackend() {
    backendProcess = exec(`node ${backendPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting backend: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Backend stderr: ${stderr}`);
            return;
        }
        console.log(`Backend stdout: ${stdout}`);
    });

    // Adicionar manipuladores para eventos do processo backend
    backendProcess.on('exit', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });
}

// Iniciar o backend e criar a janela principal do Electron
app.whenReady().then(() => {
    startBackend();
    createWindow();
});

// Encerrar o backend ao fechar a aplicação
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (backendProcess) {
            backendProcess.kill();
        }
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
