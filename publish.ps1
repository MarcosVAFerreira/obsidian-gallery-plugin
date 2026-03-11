# ================================================================
#  publish.ps1 - Note Gallery Plugin Publisher
#  Uso: .\publish.ps1
# ================================================================

$GITHUB_USER    = "MarcosVAFerreira"
$REPO_NAME      = "obsidian-gallery-plugin"
$PLUGIN_ID      = "obsidian-note-gallery"
$PLUGIN_NAME    = "Note Gallery"
$PLUGIN_DESC    = "A rich gallery view for your notes with covers, ratings, filtering, and multilingual support."
$VERSION        = (Get-Content "manifest.json" | ConvertFrom-Json).version

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "===================================================" -ForegroundColor Cyan
}
function Write-OK($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-ERR($msg)  { Write-Host "  [ERRO] $msg" -ForegroundColor Red }
function Write-INFO($msg) { Write-Host "  $msg" -ForegroundColor Yellow }

Write-Step "Verificando dependencias"

if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-ERR "Node.js nao encontrado. Instale em https://nodejs.org e reinicie o PC."
    exit 1
}
Write-OK "Node.js: $(node --version)"

if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
    Write-ERR "npm nao encontrado. Reinstale o Node.js."
    exit 1
}
Write-OK "npm: $(npm --version)"

if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
    Write-ERR "Git nao encontrado. Instale em https://git-scm.com"
    exit 1
}
Write-OK "git: $(git --version)"

if (-not (Get-Command "gh" -ErrorAction SilentlyContinue)) {
    Write-ERR "GitHub CLI nao encontrado. Instale em https://cli.github.com"
    exit 1
}
Write-OK "gh: $(gh --version | Select-Object -First 1)"

Write-Step "Build do plugin (versao $VERSION)"

Write-INFO "Instalando dependencias npm..."
npm install
if ($LASTEXITCODE -ne 0) { Write-ERR "npm install falhou."; exit 1 }
Write-OK "npm install concluido"

Write-INFO "Compilando TypeScript..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-ERR "npm run build falhou."; exit 1 }
Write-OK "Build concluido - main.js gerado"

foreach ($f in @("main.js", "manifest.json", "styles.css")) {
    if (-not (Test-Path $f)) {
        Write-ERR "Arquivo obrigatorio nao encontrado: $f"
        exit 1
    }
}
Write-OK "Arquivos presentes: main.js, manifest.json, styles.css"

Write-Step "Enviando para o GitHub ($GITHUB_USER/$REPO_NAME)"

if (-not (Test-Path ".git")) {
    git init
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
}

$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl -ne "https://github.com/$GITHUB_USER/$REPO_NAME.git") {
    git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
}

git add -A
git commit -m "release: v$VERSION" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-INFO "Nenhuma mudanca nova para commitar."
}

git push -u origin main 2>$null
if ($LASTEXITCODE -ne 0) {
    git push -u origin master 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-ERR "Push falhou. Verifique suas credenciais do GitHub."
        exit 1
    }
}
Write-OK "Push concluido"

Write-Step "Criando GitHub Release v$VERSION"

gh release delete "v$VERSION" --yes 2>$null

$releaseNotes = "## Note Gallery v$VERSION

Installation: copy main.js, manifest.json and styles.css to:
<vault>/.obsidian/plugins/obsidian-note-gallery/"

gh release create "v$VERSION" `
    main.js `
    manifest.json `
    styles.css `
    --title "v$VERSION" `
    --notes $releaseNotes

if ($LASTEXITCODE -ne 0) { Write-ERR "Falha ao criar a release."; exit 1 }
Write-OK "Release v$VERSION criada!"

Write-Step "Preparando submissao para Obsidian Community Plugins"

$OBSIDIAN_REPO  = "obsidianmd/obsidian-releases"
$FORK_REPO      = "$GITHUB_USER/obsidian-releases"
$BRANCH_NAME    = "add-$PLUGIN_ID"

Write-INFO "Verificando fork do obsidian-releases..."
$forkExists = gh repo view $FORK_REPO 2>$null
if (-not $forkExists) {
    Write-INFO "Fazendo fork..."
    gh repo fork $OBSIDIAN_REPO --clone=false
    Start-Sleep -Seconds 5
    Write-OK "Fork criado em $FORK_REPO"
} else {
    Write-OK "Fork ja existe: $FORK_REPO"
}

$tempDir = Join-Path $env:TEMP "obsidian-releases-fork"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }

Write-INFO "Clonando fork..."
gh repo clone $FORK_REPO $tempDir -- --depth=1
if ($LASTEXITCODE -ne 0) { Write-ERR "Falha ao clonar o fork."; exit 1 }

$originalDir = Get-Location
Set-Location $tempDir

Write-INFO "Sincronizando com upstream..."
git remote add upstream "https://github.com/$OBSIDIAN_REPO.git" 2>$null
git fetch upstream --quiet
git checkout main 2>$null
if ($LASTEXITCODE -ne 0) { git checkout master }
git merge upstream/HEAD --quiet

git checkout -b $BRANCH_NAME
Write-OK "Branch criada: $BRANCH_NAME"

Write-INFO "Adicionando plugin ao community-plugins.json..."
$pluginsFile = "community-plugins.json"
$plugins = Get-Content $pluginsFile -Raw | ConvertFrom-Json
$plugins = $plugins | Where-Object { $_.id -ne $PLUGIN_ID }

$newEntry = [PSCustomObject][ordered]@{
    id          = $PLUGIN_ID
    name        = $PLUGIN_NAME
    author      = $GITHUB_USER
    description = $PLUGIN_DESC
    repo        = "$GITHUB_USER/$REPO_NAME"
}

$plugins += $newEntry
$plugins | ConvertTo-Json -Depth 10 | Set-Content $pluginsFile -Encoding UTF8
Write-OK "community-plugins.json atualizado"

git add community-plugins.json
git commit -m "feat: add $PLUGIN_NAME plugin"
git push origin $BRANCH_NAME --force
if ($LASTEXITCODE -ne 0) {
    Write-ERR "Falha ao fazer push do branch."
    Set-Location $originalDir
    exit 1
}
Write-OK "Branch enviada para o fork"

Write-INFO "Criando Pull Request..."
$prBody = "Plugin ID: $PLUGIN_ID / Repo: https://github.com/$GITHUB_USER/$REPO_NAME / Release: v$VERSION"

gh pr create `
    --repo $OBSIDIAN_REPO `
    --head "${GITHUB_USER}:${BRANCH_NAME}" `
    --base main `
    --title "Add plugin: $PLUGIN_NAME" `
    --body $prBody

if ($LASTEXITCODE -ne 0) {
    Write-INFO "PR pode ja existir. Verifique: https://github.com/$OBSIDIAN_REPO/pulls"
} else {
    Write-OK "Pull Request criado!"
}

Set-Location $originalDir
Remove-Item $tempDir -Recurse -Force 2>$null

Write-Step "Concluido!"
Write-Host ""
Write-Host "  Plugin:      $PLUGIN_NAME v$VERSION" -ForegroundColor White
Write-Host "  Repositorio: https://github.com/$GITHUB_USER/$REPO_NAME" -ForegroundColor White
Write-Host "  Release:     https://github.com/$GITHUB_USER/$REPO_NAME/releases/tag/v$VERSION" -ForegroundColor White
Write-Host "  PR:          https://github.com/obsidianmd/obsidian-releases/pulls" -ForegroundColor White
Write-Host ""
Write-Host "  Aprovacao leva de 1 a 4 semanas." -ForegroundColor Yellow
Write-Host "  Instale manualmente copiando main.js + manifest.json + styles.css para:" -ForegroundColor Yellow
Write-Host "  <seu-vault>/.obsidian/plugins/obsidian-note-gallery/" -ForegroundColor White
Write-Host ""