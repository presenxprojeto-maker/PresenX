# CONTEXT.md

## Origem

O PresenX nasceu no CETEP/LNAB para melhorar a comunicação sobre a presença de professores. A versão original utilizava ESP32, RFID, Firebase e uma interface web, com painel voltado principalmente aos estudantes.

## Por que a ideia mudou

Colocar um dispositivo em cada sala seria inviável: professores mudam de sala, existem muitas salas e a quantidade de hardware e manutenção aumentaria.

A nova proposta utiliza **pontos de controle**.

Exemplo:
Professor → cartão → ponto de controle do Laboratório 1 → evento → última localização registrada: Laboratório 1.

Se não houver outro registro, o sistema não afirma que o professor continua no laboratório.

## Nova oportunidade

Empresas e fábricas possuem setores, áreas com diferentes níveis de acesso, funcionários com funções distintas e necessidade de acompanhamento administrativo.

Exemplo:
- Produção: 40 funcionários
- Manutenção: 30
- Estoque: 30

A gestão pode consultar pessoas, horários, eventos e registros por área.

## Objetivo do primeiro ciclo

Criar uma versão funcional e testá-la no CETEP para descobrir:
- quais informações são úteis;
- se a identificação funciona;
- como entrada e saída são utilizadas;
- se a última localização registrada é compreensível;
- como permissões funcionam;
- se o painel escolar continua útil;
- o que deve ser mantido, alterado ou removido.
