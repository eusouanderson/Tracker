# Documentação do Campeonato

## Introdução

Este documento descreve o funcionamento do sistema de campeonato, que coleta dados de telemetria dos jogadores e os classifica com base em suas pontuações. O sistema é projetado para trabalhar com dados do jogo, calcular pontuações e apresentar uma classificação atualizada dos jogadores.

## Estrutura do Sistema

1. [Coleta de Dados de Telemetria](#coleta-de-dados-de-telemetria)
2. [Cálculo da Pontuação](#cálculo-da-pontuação)
3. [Ordenação e Exibição dos Dados](#ordenação-e-exibição-dos-dados)

### 1. Coleta de Dados de Telemetria

#### 1.1. Fontes de Dados

Os dados de telemetria são coletados de um servidor de telemetria que envia atualizações em tempo real. O servidor deve fornecer os seguintes dados para cada jogador:

- **Informações do Jogo:** Dados gerais do jogo, como tempo, versão do plugin e status de conexão.
- **Dados do Caminhão:** Informações detalhadas sobre o caminhão, incluindo velocidade, combustível, e saúde.
- **Dados do Reboque:** Informações sobre o reboque, se conectado, incluindo carga e peso.
- **Dados do Trabalho:** Informações sobre o trabalho atual, como destino, prazo e renda.
- **Dados de Navegação:** Informações sobre a navegação, incluindo distância estimada e limites de velocidade.

#### 1.2. Implementação

A coleta de dados é realizada por meio de uma conexão de socket (Socket.io) e uma requisição HTTP inicial para obter os dados históricos.

```js
const socket = io('http://localhost:5000');

const fetchTelemetryData = async () => {
    try {
        const response = await axios.get('http://localhost:5000/todos-dados-telemetry');
        setTelemetryData(response.data);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching telemetry data:', error);
        setError(error);
        setLoading(false);
    }
};


socket.on('telemetryUpdate', (data) => {
    setTelemetryData(data);
});

```

## 2. Cálculo da Pontuação

A pontuação de cada jogador é calculada com base em vários fatores. A função `calculateScore` é responsável por este cálculo.

### 2.1. Fatores de Pontuação

- **Distância Percorrida:** Calculada a partir dos dados de navegação e multiplicada por um fator de 10.
- **Tempo de Jogo:** Calculado com base no tempo decorrido desde o início do jogo e multiplicado por um fator de 5.
- **Cumprimento de Prazo:** Pontos adicionais se o prazo do trabalho for cumprido.
- **Penalidades:** Redução de pontos por baixo nível de combustível e danos no caminhão.
- **Bônus:** Pontos adicionais para velocidade dentro do limite e baixo consumo de combustível.

### 2.2. Implementação

```js
const calculateScore = (data) => {
    let score = 0;

    // Calcula a pontuação com base na distância percorrida
    score += data.navigation.estimatedDistance * 10;

    // Calcula a pontuação com base no tempo de jogo
    const gameTime = new Date(data.game.time);
    const currentTime = new Date();
    const timeDiff = (currentTime - gameTime) / (1000 * 60 * 60);
    score += timeDiff * 5;

    // Pontos adicionais se o prazo do trabalho for cumprido
    const deadlineTime = new Date(data.job.deadlineTime);
    if (currentTime <= deadlineTime) {
        score += 50;
    }

    // Penalidades por baixo nível de combustível
    if (data.truck.fuel < (data.truck.fuelCapacity * 0.10)) {
        score -= 20;
    }

    // Penalidades por danos no caminhão
    const damagePercentage = (
        data.truck.wearEngine + 
        data.truck.wearTransmission + 
        data.truck.wearCabin + 
        data.truck.wearChassis + 
        data.truck.wearWheels
    ) / 5;
    score -= damagePercentage * 0.5;

    // Bônus por velocidade dentro do limite
    if (data.truck.speed <= data.navigation.speedLimit) {
        score += data.truck.speed * 0.1;
    }

    // Bônus por baixo consumo de combustível
    if (data.truck.fuelAverageConsumption < 10) {
        score += 50;
    }

    return score;
};
```
### 3. Ordenação e Exibição dos Dados

- 3.1. Ordenação
Após calcular a pontuação para cada jogador, a lista é ordenada em ordem decrescente de pontuação para determinar a classificação.

```js
const sortedTelemetryData = telemetryData
    .map(data => ({ ...data, score: calculateScore(data) })) // Adiciona a pontuação a cada entrada de dados
    .sort((a, b) => b.score - a.score); // Ordena pela pontuação em ordem decrescente
```


- 3.2. Exibição
Os dados ordenados são exibidos em uma página React. Cada jogador é apresentado com sua posição, dados do jogo, dados do caminhão, dados do reboque, e dados do trabalho.

```jsx
return (
    <div className="championships-container">
        <Header />
        <h2>Dados dos Campeonatos</h2>
        {loading && <p className="loading">Carregando...</p>}
        {error && <p className="error">Erro ao buscar os dados: {error.message}</p>}
        {sortedTelemetryData.length > 0 ? (
            <div className="championships-list">
                {sortedTelemetryData.map((data, index) => (
                    <div key={index} className="championship-item">
                        <h1>{index + 1}° Posição - Motorista: {data.game.gameName}</h1>
                        <p><span>Jogador Conectado:</span> {data.game.connected ? 'Sim' : 'Não'}</p>
                        <p><span>Tempo de Jogo:</span> {formatDate(data.game.time)}</p>
                        <p><span>Tempo Ajustado:</span> {adjustGameTime(data.game.time, data.game.timeScale)}</p>
                        <p><span>Jogo Pausado:</span> {data.game.paused ? 'Sim' : 'Não'}</p>
                        <p><span>Próximo Tempo Para Descanso:</span> {formatDate(data.game.nextRestStopTime)}</p>
                        <p><span>Versão do Plugin de Telemetria:</span> {data.game.telemetryPluginVersion}</p>
                        <p><span>Pontuação:</span> {data.score}</p>
                        {/* Mais informações e botões de alternância */}
                    </div>
                ))}
            </div>
        ) : (
            <p>Nenhum dado disponível.</p>
        )}
        <Footer />
    </div>
);