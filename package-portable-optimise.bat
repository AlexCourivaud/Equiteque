@echo off
title Equiteque - Packaging Portable Optimisé
color 0B
chcp 65001 >nul

echo.
echo ========================================
echo   EQUITEQUE - Packaging Optimisé
echo ========================================
echo.

cd /d "%~dp0"

REM Vérifier que Node.js est disponible pour le build
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installé.
    echo.
    echo Node.js est nécessaire pour builder l'application.
    echo Installez-le depuis https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM 1. Build de l'application
echo [1/6] Build de l'application web...
echo.
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERREUR] Le build a échoué.
    echo.
    pause
    exit /b 1
)
echo.
echo ✓ Build terminé
echo.

REM 2. Vérifier Node.js portable
echo [2/6] Vérification de Node.js portable...
echo.
if not exist "nodejs-portable\node.exe" (
    echo [ERREUR] Node.js portable n'est pas présent !
    echo.
    echo Téléchargez Node.js portable et placez node.exe dans nodejs-portable/
    echo.
    pause
    exit /b 1
)
echo ✓ Node.js portable trouvé
echo.

REM 3. Créer le dossier de package
echo [3/6] Création du dossier de package...
echo.
if exist "Equiteque-Portable" (
    echo Suppression de l'ancien package...
    rmdir /S /Q "Equiteque-Portable" 2>nul
)
mkdir "Equiteque-Portable"
mkdir "Equiteque-Portable\nodejs-portable"
echo ✓ Dossier créé
echo.

REM 4. Copier les fichiers essentiels
echo [4/6] Copie des fichiers essentiels...
echo.

echo   - Application web (dist/)...
xcopy /E /I /Y /Q dist "Equiteque-Portable\dist" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec de la copie de dist/
    pause
    exit /b 1
)

echo   - Node.js (node.exe uniquement)...
copy /Y nodejs-portable\node.exe "Equiteque-Portable\nodejs-portable\" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec de la copie de node.exe
    pause
    exit /b 1
)

echo   - Serveur HTTP...
copy /Y server.js "Equiteque-Portable\" >nul

echo   - Lanceur...
copy /Y LANCER_EQUITEQUE.bat "Equiteque-Portable\" >nul

echo   - Documentation...
copy /Y README_UTILISATEUR.md "Equiteque-Portable\" >nul

echo   - Métadonnées...
copy /Y package.json "Equiteque-Portable\" >nul

echo.
echo ✓ Fichiers essentiels copiés
echo.

REM 5. Calculer la taille
echo [5/6] Calcul de la taille du package...
echo.
powershell -Command "$size = (Get-ChildItem -Path 'Equiteque-Portable' -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB; Write-Host ('Taille totale : ' + [math]::Round($size, 2) + ' MB')"
echo.

REM 6. Créer le ZIP
echo [6/6] Création du fichier ZIP...
echo.

set "VERSION=2.0.0"
set "ZIPNAME=Equiteque-v%VERSION%-Portable-Optimise.zip"

if exist "%ZIPNAME%" (
    echo Suppression de l'ancien ZIP...
    del /F /Q "%ZIPNAME%" >nul
)

powershell -Command "Compress-Archive -Path 'Equiteque-Portable' -DestinationPath '%ZIPNAME%' -CompressionLevel Optimal" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec de la création du ZIP
    echo.
    echo Le dossier Equiteque-Portable est prêt mais le ZIP n'a pas pu être créé.
    echo Vous pouvez le compresser manuellement.
    echo.
    pause
    exit /b 1
)

echo ✓ ZIP créé
echo.

REM Calculer la taille du ZIP
for %%A in ("%ZIPNAME%") do set "ZIPSIZE=%%~zA"
set /a "ZIPSIZE_MB=%ZIPSIZE% / 1048576"

echo.
echo ========================================
echo   PACKAGE OPTIMISÉ CRÉÉ !
echo ========================================
echo.
echo Fichier : %ZIPNAME%
echo Taille  : ~%ZIPSIZE_MB% MB
echo.
echo ✓ Package optimisé (sans npm)
echo   → Seulement node.exe + application
echo   → ~60%% plus léger que la version complète
echo.
echo Contenu du package :
echo   - Application web complète (dist/)
echo   - Node.js portable (node.exe uniquement)
echo   - Serveur HTTP intégré (server.js)
echo   - Lanceur automatique (LANCER_EQUITEQUE.bat)
echo   - Documentation utilisateur
echo.
echo ========================================
echo.
echo PROCHAINES ÉTAPES :
echo.
echo 1. Testez le package :
echo    - Extrayez %ZIPNAME%
echo    - Lancez LANCER_EQUITEQUE.bat
echo    - Vérifiez que tout fonctionne
echo.
echo 2. Distribuez à votre client :
echo    - Envoyez %ZIPNAME%
echo    - Aucune installation requise !
echo.
echo ========================================
echo.

pause

@REM Made with Bob
