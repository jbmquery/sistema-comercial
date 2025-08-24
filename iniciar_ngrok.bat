@echo off
:: Script para iniciar ngrok con frontend y backend
:: Asegúrate de que ngrok.exe y ngrok.yml estén en esta carpeta

echo.
echo 🚀 Iniciando ngrok con dos túneles (frontend y backend)...
echo.

:: Navega a la carpeta actual
cd /d "C:\Users\santi\OneDrive\Escritorio\cafeteria"

:: Verifica que ngrok.exe exista
if not exist "ngrok.exe" (
    echo ❌ ERROR: No se encuentra ngrok.exe en esta carpeta.
    echo Asegúrate de descargar ngrok y colocar ngrok.exe aquí.
    echo.
    pause
    exit /b 1
)

:: Verifica que ngrok.yml exista
if not exist "ngrok.yml" (
    echo ❌ ERROR: No se encuentra ngrok.yml en esta carpeta.
    echo Crea el archivo de configuración con los túneles frontend y backend.
    echo.
    pause
    exit /b 1
)

:: Inicia ngrok con todos los túneles definidos en ngrok.yml
echo ✅ Iniciando ngrok (frontend en 5173, backend en 5000)...
echo.
echo 🔗 Abriendo el dashboard de ngrok en tu navegador...
start "" https://dashboard.ngrok.com/agents

:: Ejecuta ngrok
.\ngrok start --all

echo.
echo ⚠️  ngrok se ha detenido. Cierra esta ventana cuando quieras.
pause