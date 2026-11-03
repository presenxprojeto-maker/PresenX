# PresenX

## Plataforma de identificação, controle e rastreabilidade de pessoas em ambientes físicos

O PresenX registra eventos de identificação de pessoas em ambientes físicos, relacionando pessoas, setores, áreas, permissões, pontos de controle e registros de localização.

O sistema não deve afirmar que uma pessoa está fisicamente em determinado local apenas porque esse foi seu último registro. O conceito central é **última localização registrada**.

A primeira versão será funcional e testada no **CETEP/LNAB**, usado como ambiente de validação. Depois dos testes, o projeto poderá evoluir para outros ambientes, especialmente empresas e fábricas.

## Conceito central

Pessoa → Setor principal → Áreas autorizadas → Pontos de controle → Eventos → Última localização registrada

**Setor não é localização. Permissão não é localização.**

## Ambientes

### CETEP/LNAB
O painel público existente será mantido e adaptado para continuar sendo útil à comunidade escolar.

### Empresas e fábricas
As informações operacionais, de localização e controle serão destinadas principalmente a usuários administrativos autorizados. Um painel público não é obrigatório.

## Princípios
- O software é o núcleo; RFID/ESP32 são meios de identificação.
- Eventos são registros históricos.
- A última localização registrada não garante presença física atual.
- Permissões e localização são conceitos independentes.
- A administração deve poder configurar pessoas, setores, áreas, permissões, pontos de controle e dispositivos.
- O MVP será online.
- O MVP deve ser pequeno o suficiente para ser testado no CETEP.
