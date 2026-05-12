@echo off
setlocal

:: Se placer dans le dossier du script
cd /d "%~dp0"

:: Générer timestamp fiable
for /f %%i in ('powershell -command "Get-Date -Format yyyyMMdd_HHmmss"') do set DATE=%%i

:: Dossier de backup
set BACKUP_DIR=backup\%DATE%

set UPLOADS_DIR=..\..\app\public\

echo.
echo ====================================================
echo   Sauvegarde de l'application locale Me-Hira
echo   Date : %DATE%
echo ====================================================
echo.

echo Sauvegarde de la base de donnée locale ...
echo.

:: Création dossier
mkdir "%BACKUP_DIR%"

:: Exécution mongodump
mongodump --uri="mongodb://127.0.0.1:27017/ME_HIRA" --out="%BACKUP_DIR%/database"

:: Vérification erreur
if %errorlevel% neq 0 (
    echo.
    echo ERREUR : La sauvegarde de la base de donnée locale a échouée.
    exit /b 1
)

echo.
echo Sauvegarde de la base de donnée locale terminée avec succès !
echo Dossier : %BACKUP_DIR%\database
echo.

echo Copie des fichiers uploadés ...
echo.

xcopy %UPLOADS_DIR% %BACKUP_DIR%\uploads\public /E /I /Y

if %errorlevel% neq 0 (
    echo ERREUR : Echèque de copie des fichiers publiques
    exit /b 1
)

echo.
echo Copie des fichiers uploadés locale terminée avec succès !
echo Dossier : %BACKUP_DIR%\uploads\public
echo.

echo Compréssion du sauvegarde ...
echo.

powershell Compress-Archive "%BACKUP_DIR%" "%BACKUP_DIR%.zip"

rd /s /q "%BACKUP_DIR%"

echo Sauvegarde compréssée avec succès

endlocal
