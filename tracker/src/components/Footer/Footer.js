import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="game-footer">
            <p>&copy; 2024 Game Tracker. All rights reserved.</p>
            <p>Follow us on
                <a href="https://twitter.com"> Twitter</a>,
                <a href="https://facebook.com"> Facebook</a>,
                <a href="https://instagram.com"> Instagram</a>
            </p>
        </footer>
    );
};

export default Footer;
