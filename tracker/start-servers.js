const { exec } = require('child_process');
const net = require('net');

// Função para verificar se a porta está em uso
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

// Função para encontrar e matar o processo que está usando a porta (Windows)
function killProcessUsingPort(port) {
    return new Promise((resolve, reject) => {
        exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
            if (error) {
                return reject(`Erro ao executar netstat: ${error}`);
            }
            if (stderr) {
                console.error(`stderr ao executar netstat: ${stderr}`);
            }

            const lines = stdout.trim().split('\n');
            const pids = lines.map(line => {
                const parts = line.trim().split(/\s+/);
                return parts[parts.length - 1];
            });

            if (pids.length > 0) {
                const killPromises = pids.map(pid => {
                    return new Promise((res, rej) => {
                        exec(`taskkill /PID ${pid} /F /T`, (killError, killStdout, killStderr) => {
                            if (killError) {
                                return rej(`Erro ao executar taskkill para PID ${pid}: ${killError}`);
                            }
                            if (killStderr) {
                                return rej(`stderr ao executar taskkill para PID ${pid}: ${killStderr}`);
                            }
                            res();
                        });
                    });
                });
                Promise.all(killPromises).then(() => resolve()).catch(reject);
            } else {
                resolve();
            }
        });
    });
}

// Função para iniciar os servidores
async function startServers() {
    const PORT_SERVER = 5000; // Porta que você está usando para MongoDB
    const HTTP_SERVER_PORT = 8080; // Porta que você está usando para o http-server

    try {
        console.log(`Verificando a porta ${PORT_SERVER}...`);
        const isPortInUse = await checkPortInUse(PORT_SERVER);
        if (isPortInUse) {
            console.log(`Porta ${PORT_SERVER} está em uso. Tentando liberar...`);
            await killProcessUsingPort(PORT_SERVER);
            console.log(`Porta ${PORT_SERVER} liberada.`);
        } else {
            console.log(`Porta ${PORT_SERVER} está disponível.`);
        }

        console.log('Iniciando o servidor MongoDB...');
        await new Promise((resolve, reject) => {
            exec('node backend/mongo.js', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Erro ao iniciar o servidor MongoDB: ${error}`);
                    reject(error);
                }
                if (stderr) {
                    console.error(`stderr ao iniciar o servidor MongoDB: ${stderr}`);
                }
                console.log(`stdout ao iniciar o servidor MongoDB: ${stdout}`);
                resolve();
            });
        });

        console.log('Servidor MongoDB iniciado com sucesso.');

        // Verificar se a porta do http-server está em uso
        console.log(`Verificando a porta ${HTTP_SERVER_PORT}...`);
        const isHttpServerPortInUse = await checkPortInUse(HTTP_SERVER_PORT);
        if (isHttpServerPortInUse) {
            console.log(`Porta ${HTTP_SERVER_PORT} está em uso. Tentando liberar...`);
            await killProcessUsingPort(HTTP_SERVER_PORT);
            console.log(`Porta ${HTTP_SERVER_PORT} liberada.`);
        } else {
            console.log(`Porta ${HTTP_SERVER_PORT} está disponível.`);
        }

        // Iniciar o http-server na pasta build
        console.log('Iniciando o http-server na pasta build...');
        exec(`npx http-server build -p ${HTTP_SERVER_PORT}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro ao iniciar o http-server: ${error}`);
            }
            if (stderr) {
                console.error(`stderr ao iniciar o http-server: ${stderr}`);
            }
            console.log(`stdout ao iniciar o http-server: ${stdout}`);
        });

    } catch (err) {
        console.error('Erro ao iniciar os servidores:', err);
    }
}

// Executar a função
startServers();
