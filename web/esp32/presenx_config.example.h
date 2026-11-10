// ====================================================================
// PresenX - Arquivo de Configuração do Leitor RFID (ESP32)
// Copie este arquivo para "presenx_config.h" nesta mesma pasta
// e preencha com o nome da sua rede Wi-Fi e senha.
// ====================================================================
#pragma once

// 1. Redes Wi-Fi (Multi-Rede / Fallback Automático)
// O ESP32 procura e conecta automaticamente na rede com melhor sinal disponível.
// Ideal para feiras e apresentações: cadastre o 4G do seu celular e a rede de casa/escola!

// Rede 1: Ponto de Acesso / Roteador 4G do seu Celular (para a feira)
#define PRESENX_WIFI_SSID_1     "Ponto de Acesso Celular"
#define PRESENX_WIFI_PASS_1     "senha1234"

// Rede 2: Wi-Fi Residencial / Colégio / CETEP
#define PRESENX_WIFI_SSID_2     "WiFi_Principal"
#define PRESENX_WIFI_PASS_2     "senha_wifi"

// Rede 3: Terceira rede de contingência (Opcional, deixe "" se não for usar)
#define PRESENX_WIFI_SSID_3     ""
#define PRESENX_WIFI_PASS_3     ""

// Compatibilidade caso algum código antigo ainda utilize
#define PRESENX_WIFI_SSID       PRESENX_WIFI_SSID_1
#define PRESENX_WIFI_PASSWORD   PRESENX_WIFI_PASS_1

// 2. Endereço do Servidor PresenX (sem barra no final)
// Em produção no Render (padrão):
#define PRESENX_SERVER_URL    "https://presenx.onrender.com"
// Ou para testes em rede local no mesmo Wi-Fi do computador:
// #define PRESENX_SERVER_URL "http://192.168.1.100:3000"

// 3. Identificação deste Ponto de Leitura
#define PRESENX_LEITOR_ID     "leitor_portaria"
#define PRESENX_LEITOR_NOME   "Leitor Portaria"
#define PRESENX_LEITOR_LOCAL  "Portaria Principal"

// 4. Endereço I2C do display LCD 16x2 (geralmente 0x27 ou 0x3F)
#define LCD_I2C_ADDR 0x27

// 5. Pinos do MFRC522 (Padrão ESP32 SPI)
// MFRC522   ->   ESP32
// SDA (SS)  ->   GPIO 5
// SCK       ->   GPIO 18
// MOSI      ->   GPIO 23
// MISO      ->   GPIO 19
// RST       ->   GPIO 2
// 3.3V      ->   3.3V
// GND       ->   GND
#define SS_PIN  5
#define RST_PIN 2

// 6. Pino do Buzzer (opcional, coloque -1 se não estiver usando)
#define BUZZER_PIN -1
