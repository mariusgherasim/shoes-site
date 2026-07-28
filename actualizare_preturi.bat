@echo off
echo Actualizez preturile style.gherasimmarius.com...
cd /d "%~dp0"
node update-prices.cjs
echo.
echo Gata! Apasa orice tasta pentru a inchide.
pause > nul
