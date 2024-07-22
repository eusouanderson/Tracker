@echo off
:: Verifica se o script está sendo executado como administrador
>nul 2>&1 set "params=%1"
if '%params%' == '' (
    echo Requesting elevated privileges...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~f0 runas' -Verb RunAs"
    exit /b
)

:: Executa o script Node.js
node start-servers.js
