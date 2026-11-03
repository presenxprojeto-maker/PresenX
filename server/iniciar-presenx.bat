@echo off
title PresenX Server
cd /d "%~dp0"

echo =========================================
echo  PresenX - Sistema Escolar Integrado
echo =========================================
echo.
echo [1/2] Iniciando Servidor...
start "" "%~dp0iniciar-presenx.vbs"

echo [2/2] Servidor rodando em segundo plano em:
echo  - Painel: http://localhost:3000/web/painel.html
echo  - Gestao: http://localhost:3000/web/gestao.html
echo.
echo Para encerrar o servidor, execute: parar-presenx.bat
timeout /t 3 /nobreak > nul
exit