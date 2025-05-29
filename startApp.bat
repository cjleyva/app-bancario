@echo off
title Ejecutando Proyecto Completo
color 0a

REM Configuración de puertos (ajusta según tus necesidades)
set ACCOUNT_SERVER_PORT=3002
set AUTH_SERVER_PORT=3001
set TRANSACTION_SERVER_PORT=3003
set MAIN_URL=http://localhost:%AUTH_SERVER_PORT%

REM Iniciar servidores en ventanas separadas
start "Account Server" node accountServer.js
start "Auth Server" node authServer.js
start "Transaction Server" node transactionServer.js

REM Esperar un momento para que los servidores se inicien
timeout /t 5 /nobreak >nul

REM Abrir el navegador con la página principal
start "" "%MAIN_URL%"

echo Proyecto iniciado correctamente. Presiona cualquier tecla para cerrar esta ventana...
pause >nul