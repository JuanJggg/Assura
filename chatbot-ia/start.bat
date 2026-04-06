@echo off
echo ============================================================
echo    Assura BERT Chatbot - Instalacion de dependencias
echo ============================================================
echo.

REM Verificar Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python no encontrado. Por favor instala Python 3.9+
    pause
    exit /b 1
)

echo [OK] Python encontrado
python --version

echo.
echo Instalando dependencias Python...
echo (La primera vez puede tardar 5-10 minutos)
echo.

pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo [ERROR] Error al instalar dependencias
    pause
    exit /b 1
)

echo.
echo ============================================================
echo    Dependencias instaladas!
echo    Iniciando servidor BERT (puerto 8000)...
echo    La primera vez descarga el modelo (~680MB)
echo ============================================================
echo.

python main.py

pause
