import React, { useEffect } from 'react';
import './Popup.css'; // Importe o CSS do Popup

const Popup = ({ message, onClose }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose(); // Fecha o popup após 5 segundos
            }, 5000);
            return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
        }
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div className="popup popup-show">
            {message}
        </div>
    );
};

export default Popup;
