param([string]$cmd1, [string]$cmd2)
$nodePath = "C:\Users\lucid\tools\node-v24.13.1-win-x64\node.exe"
$gsdPath = "C:\Users\lucid\.claude\get-shit-done\bin\gsd-tools.cjs"
$projectPath = "C:\Users\lucid\Desktop\Brain Website Build"
& $nodePath $gsdPath $cmd1 $cmd2 --project $projectPath 2>&1
