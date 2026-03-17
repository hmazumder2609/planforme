# setup-github-ssh.ps1
# Sets up an SSH key for GitHub and loads it into ssh-agent.

param(
  [string]$Email = "hmazumder@mun.ca",
  [string]$KeyName = "id_ed25519_github"
)

$ErrorActionPreference = "Stop"

# 1) Ensure OpenSSH client + agent service are available (Windows 10/11 usually has this)
$sshDir = Join-Path $HOME ".ssh"
if (!(Test-Path $sshDir)) { New-Item -ItemType Directory -Path $sshDir | Out-Null }

# 2) Start ssh-agent and set it to start automatically
Get-Service ssh-agent -ErrorAction SilentlyContinue | Out-Null
if (!$?) { throw "ssh-agent service not found. Install 'OpenSSH Client' in Windows Optional Features." }

try {
  # Setting StartupType typically requires Administrator.
  Set-Service -Name ssh-agent -StartupType Automatic -ErrorAction Stop
} catch {
  Write-Warning "Couldn't set ssh-agent startup type (needs Administrator). Continuing..."
  Write-Host "One-time fix (run PowerShell as Administrator):"
  Write-Host "  Set-Service ssh-agent -StartupType Automatic"
}

try {
  if ((Get-Service ssh-agent).Status -ne 'Running') {
    Start-Service ssh-agent -ErrorAction Stop
  }
} catch {
  Write-Warning "Couldn't start ssh-agent (may need Administrator)."
  Write-Host "One-time fix (run PowerShell as Administrator):"
  Write-Host "  Start-Service ssh-agent"
  Write-Host ""
  Write-Host "If you can't run as admin, you can still use SSH, but you'll need to run 'ssh-add' each new terminal session after starting ssh-agent."
}

# 3) Generate a new key (or reuse if it already exists)
$keyPath = Join-Path $sshDir $KeyName
if (!(Test-Path $keyPath)) {
  ssh-keygen -t ed25519 -C $Email -f $keyPath
} else {
  Write-Host "Key already exists at $keyPath"
}

# 4) Add key to the agent (prompts once per login if you used a passphrase)
ssh-add $keyPath

# 5) Create/append SSH config for GitHub (forces correct key usage)
$configPath = Join-Path $sshDir "config"
$configBlock = @"
Host github.com
  HostName github.com
  User git
  IdentityFile $keyPath
  IdentitiesOnly yes
"@

if (!(Test-Path $configPath)) {
  Set-Content -Path $configPath -Value $configBlock -Encoding ascii
} else {
  $existing = Get-Content $configPath -Raw
  if ($existing -notmatch "Host github\.com") {
    Add-Content -Path $configPath -Value "`r`n$configBlock" -Encoding ascii
  }
}

# 6) Print the public key to add to GitHub
$pubPath = "$keyPath.pub"
Write-Host "`n=== Copy this public key to GitHub -> Settings -> SSH and GPG keys ===`n"
Get-Content $pubPath
Write-Host "`n=== After adding it, test with: ssh -T git@github.com ===`n"