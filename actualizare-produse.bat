@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo.
echo ===============================================
echo   ACTUALIZARE PRODUSE — styleaccessories.eu
echo   (cele 7 feed-uri XML trebuie sa fie in folder)
echo ===============================================
echo.
echo [1/3] Benvenuti, Gryxx, Otter, Picadili, Menzo...
node sync-from-feed.cjs
echo.
echo [2/3] WatchShop si Ceasuri-Shop...
node actualizare-json.cjs
echo.
echo [3/3] Raport de clasificare...
node raport-clasificare.mjs
echo.
echo Gata. Deschide raport-clasificare.html ca sa verifici categoriile.
echo Pentru reducerile WatchShop ruleaza separat: node scrape-promotii.cjs
echo.
pause
