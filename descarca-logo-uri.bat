@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Caut logo-urile brandurilor... (dureaza cateva minute)
echo.
node "%~dp0descarca-logo-uri.mjs" %*
echo.
if exist "%TEMP%\logo-uri-raport-style.html" (
  start "" "%TEMP%\logo-uri-raport-style.html"
) else (
  echo Raportul nu a fost creat - vezi mesajul de eroare de mai sus.
)
pause
