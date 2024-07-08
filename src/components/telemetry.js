import React, { useState, useEffect } from 'react';

const TelemetryComponent = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/ets2/telemetry')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text(); // Alterado para text() para depuração
      })
      .then(text => {
        console.log('Resposta da API:', text); // Verifique o que está sendo retornado
        try {
          const data = JSON.parse(text);
          setData(data); // Defina o estado com os dados recebidos
        } catch (error) {
          console.error('Erro ao analisar JSON:', error);
          setError(new Error('Resposta inválida da API'));
        }
      })
      .catch(error => {
        console.error('Erro ao fazer requisição:', error);
        setError(error);
      });
  }, []);
  

  if (error) {
    return <div>Erro: {error.message}</div>;
  }

  if (!data) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>Dados de Telemetria</h1>
      {/* Renderize os dados da forma que desejar */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default TelemetryComponent;
