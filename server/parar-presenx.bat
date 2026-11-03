@echo off
title PresenX - Parar Servidor
echo.
echo  Encerrando servicos do PresenX...
taskkill /F /IM node.exe > nul 2>&1
echo  Servidor PresenX encerrado com sucesso!
timeout /t 2 /nobreak > nul
exit
