# ARCHITECTURE.md

## Arquitetura conceitual

Pessoa → Identificador → Ponto de controle/Dispositivo → Internet → Backend/API → Banco de dados → Regras → Gestão / Painel CETEP / Mapa

## Online

O MVP será desenvolvido considerando conexão com a internet. Offline completo e sincronização ficam fora do primeiro ciclo.

## Responsabilidades

### Dispositivo
Identificar credencial, informar seu ponto de controle, enviar identificação e fornecer feedback básico.

### Backend
Autenticação, validação, permissões, regras, criação de eventos e cálculo de presença/última localização.

### Banco
Pessoas, setores, áreas, permissões, dispositivos, pontos de controle, eventos e usuários administrativos.

### Frontend administrativo
Configuração, consulta, gestão, histórico, mapa e relatórios futuros.

### Painel CETEP
Interface separada para informações configuradas para a comunidade escolar.

## Hardware

ESP32 + RFID podem ser usados no protótipo, mas não definem o domínio do produto.

## Localização

A localização é derivada de eventos. O MVP não garante localização física contínua.

## Segurança

Dados administrativos não devem ser expostos no painel público. A autorização deve ser verificada no backend, não apenas no frontend ou
dispositivo.