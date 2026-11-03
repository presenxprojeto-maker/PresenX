# PresenX — Arquitetura

## Stack definida

- Frontend: React + TypeScript + Vite
- Infraestrutura/backend: Supabase
- Banco: PostgreSQL
- Autenticação: Supabase Auth
- Realtime: Supabase Realtime
- Backend complementar: Supabase Edge Functions
- Hardware inicial: ESP32 + RC522
- Comunicação: HTTPS

## Visão geral

```text
Frontend
React + TypeScript + Vite
        |
       HTTPS
        v
Supabase
├── Auth
├── PostgreSQL
├── Realtime
└── Edge Functions
        |
       HTTPS
        v
Pontos de controle
├── ESP32
└── RC522
```

## Responsabilidades do frontend

- autenticação
- dashboard
- pessoas
- setores
- áreas
- permissões
- pontos de controle
- dispositivos
- eventos
- mapa
- painel público quando habilitado

## Backend

O Supabase será a infraestrutura principal.

**PostgreSQL:** persistência dos dados.

**Supabase Auth:** autenticação dos usuários de gestão.

**Realtime:** atualizações em tempo real quando necessárias.

**Edge Functions:** operações que exigem validação no backend, especialmente comunicação de dispositivos.

## Fluxo de identificação

```text
Pessoa
  ↓
Identificação
  ↓
Ponto de controle
  ↓
Dispositivo
  ↓
HTTPS
  ↓
Validação
  ↓
Pessoa / permissão / organização
  ↓
Evento
  ↓
PostgreSQL
```

## Segurança

- autenticação
- autorização por função
- isolamento por organização
- Row Level Security (RLS)
- validação dos dispositivos
- HTTPS

O frontend não é considerado uma barreira de segurança.

## Multi-organização

A arquitetura suporta escolas, empresas, fábricas e outros ambientes compatíveis com o modelo.

Cada organização possui seus próprios usuários, pessoas, setores, áreas, permissões, pontos, dispositivos e eventos.

## Painel

O painel público é um módulo opcional.

No CETEP ele será mantido como parte do projeto e do teste real. Em empresas, pode não existir.

## Mapa

O mapa representa visualmente áreas físicas e dados derivados dos eventos. Não é apenas uma imagem decorativa.

## Fora do MVP

- GPS
- rastreamento contínuo
- reconhecimento facial
- aplicativo mobile nativo
- offline com sincronização
- dispositivo em cada sala
- folha de pagamento
- integração obrigatória com catracas
- IA

## Ordem inicial de implementação

1. Criar projeto React
2. Configurar Supabase
3. Criar banco
4. Configurar autenticação
5. Configurar RLS
6. Implementar entidades
7. Área de gestão
8. Eventos
9. Mapa
10. ESP32 + RC522
11. Teste no CETEP
12. Avaliação e ajustes
