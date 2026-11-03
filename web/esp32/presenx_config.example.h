// Copie este arquivo para presenx_config.h e preencha os valores locais.
// presenx_config.h nao deve ser enviado ao repositorio nem compartilhado.
#pragma once

#define PRESENX_WIFI_SSID "NOME_DA_REDE_WIFI"
#define PRESENX_WIFI_PASSWORD "SENHA_DA_REDE_WIFI"
#define PRESENX_FUNCTION_URL "https://SEU-PROJETO.supabase.co/functions/v1/rfid-identification"
#define PRESENX_ANON_KEY "CHAVE_PUBLICA_DO_SUPABASE"
#define PRESENX_DEVICE_KEY "CHAVE_UNICA_CADASTRADA_PARA_ESTE_LEITOR"

// Cole o certificado CA raiz usado pelo dominio do projeto Supabase.
// O leitor valida TLS; nao desative essa validacao em uma demonstracao publica.
static const char PRESENX_ROOT_CA[] PROGMEM = R"CERT(
-----BEGIN CERTIFICATE-----
COLE_AQUI_O_CERTIFICADO_CA_RAIZ_PEM
-----END CERTIFICATE-----
)CERT";
