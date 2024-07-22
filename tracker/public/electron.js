const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const net = require('net');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'public/preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });

    
    const httpURL = 'http://localhost:3000/';

    
    mainWindow.loadURL(httpURL);
}


function checkPortInUse(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(true);
            } else {
                resolve(false);
            }
        });
        server.once('listening', () => {
            server.close(() => resolve(false));
        });
        server.listen(port);
    });
}

// Função para iniciar os servidores
function startServers() {
    return new Promise((resolve, reject) => {
        exec('node start-servers.js', (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro ao iniciar os servidores: ${error}`);
                reject(error);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            console.log(`Servidores iniciados: ${stdout}`);
            resolve();
        });
    });
}

// Função para iniciar o aplicativo Electron
async function startApp() {
    try {
        const { default: isDev } = await import('electron-is-dev');
        const PORT_SERVER = 5000; // Porta que você está usando para os servidores

        const isPortInUse = await checkPortInUse(PORT_SERVER);
        if (!isPortInUse) {
            await startServers();
        } else {
            console.log(`Porta ${PORT_SERVER} já está em uso, presumindo que os servidores já estão em execução.`);
        }

        app.whenReady().then(() => {
            createWindow(isDev);

            app.on('activate', () => {
                if (BrowserWindow.getAllWindows().length === 0) {
                    createWindow(isDev);
                }
            });
        });

        app.on('window-all-closed', () => {
            app.quit();
        });


    } catch (err) {
        console.error('Erro ao iniciar o aplicativo:', err);
    }
}

// Executar a função para iniciar o aplicativo
startApp();
