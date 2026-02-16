# Script de Monitoramento - Supabase
# Execute no PowerShell: .\monitor-supabase.ps1

$URL_SUPABASE = "https://condominio-supa-academic.yzqq8i.easypanel.host"
$INTERVALO = 5 # segundos entre cada teste

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Monitor de Conexão Supabase" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL: $URL_SUPABASE" -ForegroundColor Yellow
Write-Host "Testando a cada $INTERVALO segundos..." -ForegroundColor Yellow
Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Gray
Write-Host ""

$contador = 0
$sucessos = 0
$falhas = 0

while ($true) {
    $contador++
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    try {
        # Teste 1: REST API
        $inicio = Get-Date
        $response = Invoke-WebRequest -Uri "$URL_SUPABASE/rest/v1/" -TimeoutSec 10 -ErrorAction Stop
        $duracao = ((Get-Date) - $inicio).TotalMilliseconds
        
        $sucessos++
        Write-Host "[$timestamp] ✓ CONECTADO - Status: $($response.StatusCode) - Tempo: $([math]::Round($duracao))ms" -ForegroundColor Green
        
        # Teste 2: Auth API
        try {
            $authResponse = Invoke-WebRequest -Uri "$URL_SUPABASE/auth/v1/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
            Write-Host "           ✓ Auth: OK ($($authResponse.StatusCode))" -ForegroundColor DarkGreen
        }
        catch {
            Write-Host "           ⚠ Auth: Não disponível" -ForegroundColor Yellow
        }
        
    }
    catch {
        $falhas++
        $erro = $_.Exception.Message
        
        if ($erro -match "timeout|timed out") {
            Write-Host "[$timestamp] ✗ TIMEOUT - Servidor não responde!" -ForegroundColor Red
        }
        elseif ($erro -match "unable to connect|connection refused") {
            Write-Host "[$timestamp] ✗ OFFLINE - Servidor está fora do ar!" -ForegroundColor Red
        }
        elseif ($erro -match "could not be resolved") {
            Write-Host "[$timestamp] ✗ DNS - Domínio não resolve!" -ForegroundColor Red
        }
        else {
            Write-Host "[$timestamp] ✗ ERRO - $erro" -ForegroundColor Red
        }
    }
    
    # Estatísticas a cada 10 testes
    if ($contador % 10 -eq 0) {
        $taxaSucesso = [math]::Round(($sucessos / $contador) * 100, 1)
        Write-Host ""
        Write-Host "--- Estatísticas ---" -ForegroundColor Cyan
        Write-Host "Total: $contador | Sucessos: $sucessos | Falhas: $falhas | Taxa: $taxaSucesso%" -ForegroundColor Cyan
        Write-Host ""
    }
    
    Start-Sleep -Seconds $INTERVALO
}
