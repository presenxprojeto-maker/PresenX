# USE_CASES.md

## Entrada
Pessoa apresenta identificador → sistema valida → evento de entrada → estado de presença atualizado.

## Registro em área
Pessoa apresenta identificador → sistema identifica área → verifica permissão → registra evento → se autorizado, pode atualizar última localização.

## Acesso não autorizado
Pessoa tenta utilizar área sem permissão → sistema registra tentativa → operação é negada conforme a regra configurada.

## Saída
Pessoa apresenta identificador no ponto de saída → evento de saída → estado atualizado.

Sem saída registrada, o sistema não inventa horário.

## Consulta administrativa
Usuário autorizado consulta presença, setores, últimos registros, histórico e tentativas não autorizadas.

## Painel CETEP
Consulta somente informações configuradas para exibição pública.

## Mudança de local

Exemplo:

Setor principal: Manutenção
Área autorizada: Produção
Última localização registrada: Produção

O setor continua sendo Manutenção.
