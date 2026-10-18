@echo off
chcp 65001 > nul
cd /d "%~dp0"
node genereaza-email.mjs
echo.
echo Deschide email-output.html (subiecte + cod) si email-output-previzualizare.html (cum arata).
pause
