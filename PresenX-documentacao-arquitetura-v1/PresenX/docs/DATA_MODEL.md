# PresenX — Modelo de Dados

## Objetivo
Define o modelo de dados inicial do PresenX 2.0 para o MVP.

## Princípios
- Organização representa instituição, empresa ou outro ambiente.
- Pessoa é independente do método de identificação.
- Setor principal é vínculo administrativo/profissional.
- Área é espaço físico.
- Permissão autoriza uma pessoa a acessar uma área.
- Ponto de controle é o local onde eventos são registrados.
- Dispositivo é o equipamento que gera eventos.
- Eventos são a fonte principal do histórico.
- Última localização registrada é derivada de eventos válidos.
- O sistema não realiza rastreamento físico contínuo.
- Acesso negado também gera evento.
- O modelo suporta múltiplas organizações.

## Entidades

### Organization
`id`, `name`, `type`, `created_at`

### Profile
Usuário que entra na área de gestão.
`id`, `organization_id`, `name`, `role`, `created_at`

Papéis iniciais: `admin`, `manager`, `operator`.

### Person
Pessoa identificada pelo PresenX.
`id`, `organization_id`, `sector_id`, `name`, `identifier`, `active`, `created_at`

No MVP, `identifier` será principalmente RFID, mas a pessoa não depende conceitualmente de RFID.

### Sector
Vínculo administrativo/profissional.
`id`, `organization_id`, `name`, `description`, `created_at`

### Area
Espaço físico.
`id`, `organization_id`, `name`, `description`, `created_at`

### Permission
Relaciona pessoa e área autorizada.
`id`, `person_id`, `area_id`, `created_at`

### Control Point
Ponto físico onde uma identificação pode acontecer.
`id`, `organization_id`, `area_id`, `name`, `description`, `active`, `created_at`

Não é necessário um dispositivo em cada sala.

### Device
Equipamento associado a um ponto de controle.
`id`, `control_point_id`, `name`, `device_key`, `type`, `active`, `last_seen_at`, `created_at`

MVP: ESP32 + RC522/RFID.

### Event
Ocorrência registrada pelo sistema.
`id`, `organization_id`, `person_id`, `device_id`, `control_point_id`, `event_type`, `access_result`, `occurred_at`, `metadata`

Tipos iniciais: `identification`, `entry`, `exit`.

Resultados: `allowed`, `denied`.

## Relacionamentos

```text
Organization
├── Profiles
├── People
├── Sectors
├── Areas
├── Control Points
├── Devices
└── Events

Person
├── Sector principal
├── Permissions → Areas
└── Events

Area
├── Permissions ← People
└── Control Points

Control Point
└── Device

Device
└── Events

Event
├── Person
├── Device
└── Control Point
```

## Conceitos que não devem ser confundidos

**Setor:** vínculo administrativo/profissional.

**Área:** espaço físico.

**Permissão:** autorização de acesso.

**Última localização registrada:** último ponto em que houve evento válido. Não significa que a pessoa continua fisicamente naquele local.

## Presença

Presença é interpretada a partir dos eventos de entrada e saída.

Se houver entrada sem saída, o sistema deve mostrar que não existe registro de saída, sem inventar horário.

## Eventos negados

Eventos negados permanecem no histórico e não alteram a última localização válida.

Exemplo:

```text
10:43 → Oficina → permitido
10:51 → Estoque → negado
```

Última localização válida: Oficina — 10:43.

## Multi-organização

O sistema deve isolar os dados de cada organização.

```text
PresenX
├── CETEP/LNAB
├── Empresa A
└── Empresa B
```

## Segurança

A implementação utilizará autenticação, autorização por função, isolamento por organização e RLS no PostgreSQL/Supabase.

## Decisões fechadas

| Decisão | Definição |
|---|---|
| Banco | PostgreSQL |
| Multi-organização | Sim |
| Pessoa independente de RFID | Sim |
| Setor separado de área | Sim |
| Permissão por área | Sim |
| Pontos de controle | Sim |
| Dispositivos separados dos pontos | Sim |
| Eventos como histórico principal | Sim |
| Última localização diretamente em Person | Não |
| Rastreamento contínuo | Não |
| Eventos negados registrados | Sim |
| Presença derivada de eventos | Sim |
| Offline no MVP | Não |
| Hardware inicial | ESP32 + RC522 |
| Comunicação | HTTPS |
