@echo off
chcp 65001 > nul
echo ====================================================
echo     ACTUALIZADOR DE LOANY DETALLES (GITHUB ^> SERVER)
echo ====================================================
echo.

cd /d "%~dp0"

echo [1/3] Detectando cambios locales...
git status -s

echo.
set /p commit_msg="Introduce una descripcion del cambio (Enter para 'Actualizacion'): "
if "%commit_msg%"=="" set commit_msg=Actualizacion

echo.
echo [2/3] Subiendo cambios a GitHub...
git add .
git commit -m "%commit_msg%"
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo [!] Hubo un detalle al subir a GitHub. Verifica tu conexion.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Actualizando servidor en la nube...
ssh -i "D:\2026- 20\llaves\ssh-key-2026-08-05.key" ubuntu@163.176.226.113 "cd /var/www/loanydetalles.site && git pull"

echo.
echo ====================================================
echo   ¡DESPLIEGUE EXITOSO EN https://loanydetalles.site!
echo ====================================================
echo.
pause
