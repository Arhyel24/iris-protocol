#Requires -Version 5.1
# build-devnet.ps1 - Build IRIS Anchor program for Solana devnet

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Ensure HOME is set (required by cargo-build-sbf on Windows)
if (-not $env:HOME) {
    $env:HOME = $env:USERPROFILE
    Write-Host "Set HOME=$env:HOME"
}

$anchor = $PSScriptRoot
$root   = Split-Path -Parent $anchor
$idlSrc = Join-Path $anchor "target\idl\anchor.json"
$idlDst = Join-Path $root  "frontend\public\anchor-idl.json"

Push-Location $anchor

# Step 1: Build the program .so
# NOTE: --no-idl skips IDL codegen which fails on anchor-syn 0.30.1 + proc-macro2 >= 1.0.84.
# The IDL in target/idl/anchor.json is pre-built and stays in sync manually.
Write-Host ""
Write-Host "=== anchor build --no-idl ===" -ForegroundColor Cyan
anchor build --no-idl
if ($LASTEXITCODE -ne 0) {
    Write-Error "anchor build failed (exit $LASTEXITCODE)"
    Pop-Location
    exit 1
}

$so = Join-Path $anchor "target\deploy\anchor.so"
if (-not (Test-Path $so)) {
    Write-Error "Expected .so not found: $so"
    Pop-Location
    exit 1
}

$soInfo = Get-Item $so
Write-Host "Built: $($soInfo.FullName)  ($($soInfo.Length) bytes)" -ForegroundColor Green

# Step 2: Sync IDL to frontend public folder
if (Test-Path $idlSrc) {
    Copy-Item -Force $idlSrc $idlDst
    Write-Host "IDL synced to: $idlDst" -ForegroundColor Green
} else {
    Write-Warning "IDL source not found at $idlSrc - skipping sync"
}

Pop-Location

Write-Host ""
Write-Host "Build complete! To deploy to devnet, run:" -ForegroundColor Green
Write-Host "  cd anchor" -ForegroundColor Yellow
Write-Host "  solana airdrop 2   # if wallet balance is 0" -ForegroundColor Yellow
Write-Host "  anchor deploy --provider.cluster devnet" -ForegroundColor Yellow
