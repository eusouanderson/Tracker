import { app, BrowserWindow } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { spawn } from 'child_process';

const startServer = () => {
    // Inicie o servidor Node.js
    const server = spawn('node', ['backend/mongo.js'], { stdio: 'inherit' });

    server.on('close', (code) => {
        console.log(`Servidor Node.js saiu com o código ${code}`);
    });
};

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, 'build', 'index.html')}`
    );

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
};

app.whenReady().then(() => {
    startServer();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
