import React from 'react';
import './ScoreBoard.css';

const ScoreBoard = ({ telemetryData }) => {
    const calculateScore = (data) => {
        let score = 0;

        // Distância percorrida
        score += data.navigation.estimatedDistance * 10;

        // Tempo de jogo
        const gameTime = new Date(data.game.time);
        const currentTime = new Date();
        const timeDiff = (currentTime - gameTime) / (1000 * 60 * 60); // em horas
        score += timeDiff * 5;

        // Cumprimento de prazo
        const deadlineTime = new Date(data.job.deadlineTime);
        if (currentTime <= deadlineTime) {
            score += 50;
        }

        // Penalidades
        if (data.truck.fuel < (data.truck.fuelCapacity * 0.10)) {
            score -= 20;
        }

        const damagePercentage = (
            data.truck.wearEngine +
            data.truck.wearTransmission +
            data.truck.wearCabin +
            data.truck.wearChassis +
            data.truck.wearWheels
        ) / 5;
        score -= damagePercentage * 0.5;

        // Bônus
        if (data.truck.speed <= data.navigation.speedLimit) {
            score += data.truck.speed * 0.1;
        }

        if (data.truck.fuelAverageConsumption < 10) {
            score += 50;
        }

        return score;
    };

    return (
        <div className="scoreboard-container">
            <h2>Pontuação dos Jogadores</h2>
            {telemetryData.map((data, index) => (
                <div key={index} className="scoreboard-item">
                    <h3>Jogador {index + 1}: {data.game.gameName || 'Desconhecido'}</h3>
                    <p><strong>Pontuação:</strong> {calculateScore(data)}</p>
                </div>
            ))}
        </div>
    );
};

export default ScoreBoard;
