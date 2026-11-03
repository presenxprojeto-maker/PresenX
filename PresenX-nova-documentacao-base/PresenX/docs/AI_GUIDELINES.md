# AI_GUIDELINES.md

Este arquivo orienta qualquer IA usada no desenvolvimento do PresenX.

## Fonte de verdade

Antes de alterações importantes, consultar:
- README.md
- CONTEXT.md
- VISION.md
- DOMAIN.md
- REQUIREMENTS.md
- ARCHITECTURE.md
- DECISIONS.md
- PRODUCT_SCOPE.md

## A IA deve
- preservar decisões;
- apontar conflitos entre solicitações e decisões existentes;
- propor mudanças estruturais antes de implementá-las;
- manter o MVP simples;
- explicar decisões técnicas importantes;
- atualizar documentação quando uma decisão permanente for tomada.

## A IA não deve
- inventar requisitos;
- adicionar funcionalidades sem justificativa;
- afirmar localização atual baseada apenas em último registro;
- transformar setor em localização;
- transformar permissão em localização;
- adicionar offline sem decisão;
- criar dispositivo para cada sala sem justificativa;
- expor dados administrativos no painel público.

## Terminologia
Preferir:
- última localização registrada;
- evento;
- ponto de controle;
- área autorizada;
- setor principal.

Evitar "localização em tempo real" quando não houver mecanismo que garanta isso.

## Mudanças
Se uma solicitação mudar uma decisão registrada, apontar a decisão afetada e atualizar DECISIONS.md quando a nova regra for confirmada.
