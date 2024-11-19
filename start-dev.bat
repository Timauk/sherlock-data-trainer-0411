@echo off
echo Verificando dependencias...

:: Verifica se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js nao encontrado! Por favor, instale o Node.js primeiro.
    pause
    exit
)

:: Mata qualquer processo que esteja usando a porta 3001
echo Liberando porta 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001"') do taskkill /F /PID %%a 2>nul

:: Verifica se as dependências estão instaladas
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
) else (
    echo Dependencias ja instaladas.
)

:: Verifica se a pasta checkpoints existe, se não, cria
if not exist "checkpoints" (
    echo Criando pasta checkpoints...
    mkdir checkpoints
    echo Pasta checkpoints criada com sucesso!
) else (
    echo Pasta checkpoints ja existe.
)

:: Inicia o servidor em uma nova janela
echo Iniciando servidor Node.js...
start cmd /k "node --watch server.js"

:: Aguarda 5 segundos para garantir que o servidor iniciou
timeout /t 5 /nobreak

:: Inicia a aplicação React
echo Iniciando aplicacao React...
start cmd /k "npm run dev"

echo Ambiente de desenvolvimento iniciado com sucesso!