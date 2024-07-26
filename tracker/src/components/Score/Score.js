import React from 'react';
import './Score.css';

const calculateScore = (data) => {
    let score = 0;

    if (data && data.game && data.game.connected !== undefined) {
        // Adiciona 1 ponto por segundo de conexão
        const currentTime = new Date();
        const timeDiffInSeconds = 0
        score += timeDiffInSeconds; // 1 ponto por segundo

        // Verifica prazo de entrega
        const deadlineTime = new Date(data.job.deadlineTime);
        if (currentTime <= deadlineTime) {
            score += 200; // Bônus por estar dentro do prazo
        }

        // Penalidades
        if (data.truck.fuel < (data.truck.fuelCapacity * 0.10)) {
            score -= 2000; // Penalidade por baixo nível de combustível
        }

        const damagePercentage = (
            data.truck.wearEngine +
            data.truck.wearTransmission +
            data.truck.wearCabin +
            data.truck.wearChassis +
            data.truck.wearWheels
        ) / 5;
        score -= damagePercentage * 1000 * 0.2; // Penalidade por desgaste do caminhão

        // Bônus
        if (data.truck.speed <= data.navigation.speedLimit) {
            score += data.truck.speed * 100; // Bônus por respeitar o limite de velocidade
        }

        if (data.truck.fuelAverageConsumption < 10) {
            score += 100; // Bônus por bom consumo de combustível
        }
    }

    return score;
};

const Score = ({ data }) => {
    const score = calculateScore(data);
    return (
        <p className='score'><span>Pontuação:</span> {score?.toFixed(2) || 'N/A'}</p>
    );
};

export default Score;
