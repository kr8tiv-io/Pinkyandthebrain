param([Parameter(ValueFromRemainingArguments=$true)]$args)
Set-Location "C:\Users\lucid\Desktop\Brain Website Build"
$cmd = $args -join ' '
Invoke-Expression $cmd
