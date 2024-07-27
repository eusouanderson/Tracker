import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Score.css';

const calculateScore = (data) => {
    let score = 0;

    if (data.game.connected !== undefined) {
        
        const currentTime = new Date();
        const timeDiffInSeconds = 0;
        score += timeDiffInSeconds; 

        
        const deadlineTime = new Date(data.job.deadlineTime);
        if (currentTime <= deadlineTime) {
            score += 200;
        }

        
        if (data.truck.fuel < (data.truck.fuelCapacity * 0.10)) {
            score -= 2000;
        }

        const damagePercentage = (
            data.truck.wearEngine +
            data.truck.wearTransmission +
            data.truck.wearCabin +
            data.truck.wearChassis +
            data.truck.wearWheels
        ) / 5;
        score -= damagePercentage * 1000 * 0.2;

        
        if (data.truck.speed <= data.navigation.speedLimit) {
            score += data.truck.speed * 100;
        }

        if (data.truck.fuelAverageConsumption < 10) {
            score += 100; 
        }
    }

    return score;
};

const Score = ({ data, name }) => {
    const [score, setScore] = useState(calculateScore(data));

    useEffect(() => {
        const intervalId = setInterval(() => {
            const newScore = calculateScore(data);
            setScore(newScore);
            // Envia a pontuação atualizada para o backend
            axios.get('http://localhost:25555/dados-telemetry', {
                params: {
                    name,
                    score: newScore
                }
            })
                .then(response => {
                    console.log("Pontuação enviada com sucesso:", response.data);
                })
                .catch(error => {
                    console.error("Erro ao enviar pontuação:", error);
                });
        }, 1000);

        return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
    }, [data, name]);

    return (
        <p className='score'><span>Pontuação:</span> {score?.toFixed(2) || 'N/A'}</p>
    );
};

export default Score;
