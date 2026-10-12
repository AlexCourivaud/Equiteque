@echo off
title Equiteque - Gestion d'Etiquettes
color 0A
chcp 65001 >nul

cd /d "%~dp0"

REM Vérifier si Node.js portable existe dans le dossier
if exist "nodejs-portable\node.exe" (
    echo.
    echo ========================================
    echo    EQUITEQUE - Lancement
    echo ========================================
    echo.
    echo Utilisation de Node.js portable...
    echo.
    
    REM Lancer avec Node.js portable
    "nodejs-portable\node.exe" server.js
    goto :end
)

REM Sinon, vérifier si Node.js est installé sur le système
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    EQUITEQUE - Lancement
    echo ========================================
    echo.
    echo Utilisation de Node.js système...
    echo.
    
    REM Lancer avec Node.js système
    node server.js
    goto :end
)

REM Si aucun Node.js n'est trouvé
echo.
echo ========================================
echo    ERREUR - Node.js non trouvé
echo ========================================
echo.
echo Node.js n'est pas installé et Node.js portable
echo n'est pas présent dans le dossier.
echo.
echo SOLUTIONS :
echo.
echo 1. Téléchargez le package complet avec Node.js portable
echo    (demandez-le au développeur)
echo.
echo 2. OU installez Node.js depuis https://nodejs.org
echo    puis relancez ce fichier
echo.
echo ========================================
echo.
pause
exit /b 1

:end
pause

@REM Made with Bob
