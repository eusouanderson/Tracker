module.exports = {
    transformIgnorePatterns: [
        "/node_modules/(?!axios).+\\.js$"
    ],
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
    },
    moduleNameMapper: {
        "\\.(css|less)$": "identity-obj-proxy"
    }
};
