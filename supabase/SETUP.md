# Configuração inicial do Supabase

Este guia configura o login administrativo, os cadastros do núcleo do sistema e o histórico no Supabase.

## 1. Criar o projeto e aplicar o schema

1. Crie um projeto no Supabase.
2. Abra o **SQL Editor** do projeto.
3. Abra `supabase/schema.sql` deste repositório e execute o conteúdo uma vez no projeto vazio.

O schema cria as tabelas e as regras de isolamento por organização. Não execute novamente por cima de um banco já configurado: algumas políticas ainda não estão preparadas para reaplicação.

Depois do schema, em banco novo ou já configurado, abra o SQL Editor e execute estes arquivos, nesta ordem:

1. `supabase/migrations/20261009_record_unknown_identifications.sql` — registra tentativas de cartões sem cadastro.
2. `supabase/migrations/20261009_save_person_with_permissions.sql` — salva uma pessoa e suas permissões na mesma transação.
3. `supabase/migrations/20261009_enable_event_realtime.sql` — habilita a atualização imediata do histórico.

## 2. Criar a conta administrativa

No painel Supabase, abra **Authentication → Users** e crie um usuário com e-mail e senha. Copie o UUID desse usuário.

No **SQL Editor**, crie a organização e o perfil administrativo. Substitua o UUID e os dados de exemplo:

```sql
WITH nova_organizacao AS (
  INSERT INTO public.organizations (name, type)
  VALUES ('CETEP / LNAB', 'school')
  RETURNING id
)
INSERT INTO public.profiles (id, organization_id, name, role)
SELECT
  'COLOQUE-AQUI-O-UUID-DO-USUARIO',
  nova_organizacao.id,
  'Administrador',
  'admin'
FROM nova_organizacao;
```

O usuário precisa existir em Authentication antes da criação do perfil, pois `profiles.id` referencia o usuário autenticado.

## 3. Configurar o frontend

1. Copie `frontend/.env.example` para `frontend/.env.local`.
2. No painel Supabase, abra **Project Settings → API** e copie a URL do projeto e a chave publicável (também chamada `anon` em projetos antigos).
3. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no arquivo `.env.local`.
4. Reinicie o servidor de desenvolvimento do frontend.

Nunca use a chave `service_role` no frontend ou em arquivos `VITE_*`: ela ignora as políticas de segurança do banco.

## 4. Entrar no PresenX

Abra o frontend e entre com o e-mail e a senha criados no Supabase. O PresenX consulta `profiles` e a organização vinculada antes de abrir a área administrativa. Se aparecer que falta perfil, confira se o UUID usado no SQL corresponde ao usuário de Authentication.

O cadastro de pessoas, setores, áreas, pontos de controle e dispositivos, além da consulta de eventos, usa o Supabase. A função que recebe leituras do ESP32 está em `supabase/functions/rfid-identification`; ela precisa ser publicada antes de atualizar o firmware:

1. Instale o Supabase CLI e conecte o projeto com `supabase link --project-ref ID_DO_PROJETO`.
2. Na pasta do projeto, publique com `supabase functions deploy rfid-identification`. A função não exige login de usuário, mas valida a chave individual do leitor.
3. Em **Pontos de controle**, associe um dispositivo a um ponto e configure a mesma chave no firmware.
4. Associe o ponto a uma área e dê permissão à pessoa para essa área.

5. Siga `web/esp32/README.md` para configurar e gravar o ESP32.
