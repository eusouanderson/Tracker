const { contextBridge } = require('electron');

// Exponha um objeto vazio para evitar erros, mas sem fornecer nenhuma API.
contextBridge.exposeInMainWorld('myAPI', {});
