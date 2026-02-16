@echo off
REM Script de Instalacao do Syllab para Windows
REM Execute: setup.bat

echo ========================================
echo    Syllab - Instalacao
echo ========================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado. Por favor, instale Node.js 18+ primeiro.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
node --version
echo.

REM Instalar dependencias
echo [INFO] Instalando dependencias...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Erro ao instalar dependencias.
    pause
    exit /b 1
)

echo [OK] Dependencias instaladas com sucesso!
echo.

REM Criar .env.local se nao existir
if not exist .env.local (
    echo [INFO] Criando arquivo .env.local...
    copy .env.local.example .env.local
    echo [OK] Arquivo .env.local criado!
) else (
    echo [INFO] Arquivo .env.local ja existe.
)

echo.
echo ========================================
echo    Instalacao concluida!
echo ========================================
echo.
echo Proximos passos:
echo.
echo 1. Execute o schema SQL no Supabase:
echo    - Acesse: https://condominio-supa-academic.yzqq8i.easypanel.host
echo    - Va em 'SQL Editor'
echo    - Cole e execute: database\schema.sql
echo.
echo 2. (Opcional) Popule com dados de exemplo:
echo    - Execute tambem: database\seed.sql
echo.
echo 3. Inicie o servidor:
echo    npm run dev
echo.
echo 4. Acesse: http://localhost:3000
echo.
echo Para mais informacoes, consulte INSTALACAO.md
echo.
pause
