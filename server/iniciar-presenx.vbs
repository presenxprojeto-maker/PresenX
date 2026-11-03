Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Obtem o diretorio atual do script
strPath = fso.GetParentFolderName(WScript.ScriptFullName)

' Inicia o servidor Node.js de forma 100% invisivel (sem janelas pretas de terminal)
WshShell.CurrentDirectory = strPath
WshShell.Run "node index.js", 0, False

' Aguarda 2 segundos para o servidor subir
WScript.Sleep 2000

' Abre o Painel Institucional no navegador padrao
WshShell.Run "http://localhost:3000/web/painel.html"
