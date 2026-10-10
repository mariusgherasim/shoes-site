@echo off
echo.
echo Sincronizez products.json din feed-ul XML...
echo.
cd /d "%~dp0"

:: Instalez @xmldom/xmldom dacă nu e instalat
if not exist node_modules\@xmldom (
  echo Instalez dependenta @xmldom/xmldom...
  npm install @xmldom/xmldom --save-dev
  echo.
)

node sync-from-feed.cjs

echo.
echo Apasa orice tasta pentru a inchide.
pause > nul
