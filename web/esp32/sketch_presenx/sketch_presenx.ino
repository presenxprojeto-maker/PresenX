// ====================================================================
// PresenX - Firmware do Leitor RFID (ESP32)
// Compatível com PresenX Render / Nuvem e Servidor Local
// ====================================================================

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <MFRC522.h>
#include <SPI.h>

#if __has_include("presenx_config.h")
  #include "presenx_config.h"
#elif __has_include("../presenx_config.h")
  #include "../presenx_config.h"
#else
  #error "Copie presenx_config.example.h para presenx_config.h nesta pasta e configure a rede Wi-Fi."
#endif

// Fallbacks de configuração caso não definidos no header
#ifndef LCD_I2C_ADDR
  #define LCD_I2C_ADDR 0x3F
#endif
#ifndef BUZZER_PIN
  #define BUZZER_PIN -1
#endif
#ifndef PRESENX_LEITOR_ID
  #define PRESENX_LEITOR_ID "leitor_portaria"
#endif
#ifndef PRESENX_LEITOR_NOME
  #define PRESENX_LEITOR_NOME "Leitor Portaria"
#endif
#ifndef PRESENX_LEITOR_LOCAL
  #define PRESENX_LEITOR_LOCAL "Portaria Principal"
#endif

MFRC522 rfid(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(LCD_I2C_ADDR, 16, 2);

// Controle de Wi-Fi e Heartbeat (Ping)
unsigned long lastWifiAttempt = 0;
const unsigned long WIFI_RETRY_INTERVAL = 10000;

unsigned long lastPingTime = 0;
const unsigned long PING_INTERVAL = 30000; // Envia heartbeat a cada 30 segundos

// ====================================================================
// FUNÇÕES DE ÁUDIO / BUZZER
// ====================================================================
void emitirBip(int frequencia, int duracaoMs) {
  if (BUZZER_PIN < 0) return;
  tone(BUZZER_PIN, frequencia, duracaoMs);
  delay(duracaoMs);
  noTone(BUZZER_PIN);
}

void bipSucesso() {
  emitirBip(2000, 100);
}

void bipErro() {
  emitirBip(800, 150);
  delay(80);
  emitirBip(600, 200);
}

// ====================================================================
// FUNÇÕES DO DISPLAY LCD
// ====================================================================
void showWelcome() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("PresenX | CETEP");
  lcd.setCursor(0, 1);
  lcd.print("Aproxime cartao");
}

// Parser simples de campos JSON sem precisar de bibliotecas pesadas
String extrairCampoJson(const String& json, const String& campo) {
  const String chave = "\"" + campo + "\":";
  int start = json.indexOf(chave);
  if (start < 0) return "";
  start += chave.length();
  while (start < json.length() && (json[start] == ' ' || json[start] == ':')) start++;
  if (start >= json.length()) return "";

  if (json[start] == '"') {
    start++;
    int end = json.indexOf('"', start);
    return end < 0 ? "" : json.substring(start, end);
  } else {
    // Número ou booleano
    int end = start;
    while (end < json.length() && json[end] != ',' && json[end] != '}' && json[end] != ' ' && json[end] != '\r' && json[end] != '\n') {
      end++;
    }
    return json.substring(start, end);
  }
}

// ====================================================================
// CONEXÃO WI-FI
// ====================================================================
void connectWifi() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("PresenX");
  lcd.setCursor(0, 1);
  lcd.print("Conectando WiFi");

  Serial.print("Conectando ao Wi-Fi: ");
  Serial.println(PRESENX_WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(PRESENX_WIFI_SSID, PRESENX_WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(400);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Wi-Fi Conectado! IP do leitor: ");
    Serial.println(WiFi.localIP());
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Conectado!");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP().toString().substring(0, 16));
    delay(1200);
    showWelcome();
  } else {
    Serial.println("Falha ao conectar no Wi-Fi. Tentara novamente em segundo plano.");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Erro de conexao");
    lcd.setCursor(0, 1);
    lcd.print("Sem sinal WiFi");
    lastWifiAttempt = millis();
  }
}

bool ensureWifi() {
  if (WiFi.status() == WL_CONNECTED) return true;
  if (millis() - lastWifiAttempt >= WIFI_RETRY_INTERVAL) {
    connectWifi();
  }
  return WiFi.status() == WL_CONNECTED;
}

// ====================================================================
// HEARTBEAT / PING PERIÓDICO (Mantém status verde nos painéis)
// ====================================================================
void enviarHeartbeatPing() {
  if (WiFi.status() != WL_CONNECTED) return;

  const String urlServidor = String(PRESENX_SERVER_URL) + "/api/leitores/ping";
  const String payload = "{\"id\":\"" + String(PRESENX_LEITOR_ID) +
                         "\",\"nome\":\"" + String(PRESENX_LEITOR_NOME) +
                         "\",\"local\":\"" + String(PRESENX_LEITOR_LOCAL) + "\"}";

  HTTPClient http;
  WiFiClientSecure secureClient;
  WiFiClient regularClient;
  bool iniciou = false;

  if (urlServidor.startsWith("https://")) {
    secureClient.setInsecure(); // Conecta TLS sem precisar de certificado CA fixo
    iniciou = http.begin(secureClient, urlServidor);
  } else {
    iniciou = http.begin(regularClient, urlServidor);
  }

  if (iniciou) {
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(5000);
    int httpCode = http.POST(payload);
    if (httpCode > 0) {
      Serial.printf("[Ping] Heartbeat OK (HTTP %d)\n", httpCode);
    } else {
      Serial.printf("[Ping] Falha no heartbeat: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }
}

// ====================================================================
// ENVIO DE CARTÃO RFID (/api/presenca)
// ====================================================================
bool registrarPresenca(
  const String& uid,
  String& nome,
  String& acao,
  String& mensagem,
  bool& permitido
) {
  if (WiFi.status() != WL_CONNECTED) {
    mensagem = "Sem conexao WiFi";
    permitido = false;
    return false;
  }

  const String urlPresenca = String(PRESENX_SERVER_URL) + "/api/presenca";
  const String payload = "{\"uid\":\"" + uid +
                         "\",\"leitor_id\":\"" + String(PRESENX_LEITOR_ID) +
                         "\",\"leitor_nome\":\"" + String(PRESENX_LEITOR_NOME) + "\"}";

  Serial.println("[PresenX] Enviando UID: " + uid + " para: " + urlPresenca);

  HTTPClient http;
  WiFiClientSecure secureClient;
  WiFiClient regularClient;
  bool iniciou = false;

  if (urlPresenca.startsWith("https://")) {
    secureClient.setInsecure();
    iniciou = http.begin(secureClient, urlPresenca);
  } else {
    iniciou = http.begin(regularClient, urlPresenca);
  }

  if (!iniciou) {
    mensagem = "Falha conexao HTTP";
    permitido = false;
    return false;
  }

  http.addHeader("Content-Type", "application/json");
  http.setTimeout(7000); // 7s timeout

  int httpCode = http.POST(payload);
  String resposta = http.getString();
  http.end();

  Serial.printf("[PresenX] Resposta HTTP %d: %s\n", httpCode, resposta.c_str());

  if (httpCode <= 0) {
    mensagem = "Servidor offline";
    permitido = false;
    return false;
  }

  // Extrai campos da resposta JSON
  nome = extrairCampoJson(resposta, "nome");
  acao = extrairCampoJson(resposta, "acao");
  if (acao.isEmpty()) acao = extrairCampoJson(resposta, "action");
  mensagem = extrairCampoJson(resposta, "mensagem");
  if (mensagem.isEmpty()) mensagem = extrairCampoJson(resposta, "message");

  String campoAllowed = extrairCampoJson(resposta, "allowed");
  String campoStatus = extrairCampoJson(resposta, "status");
  String campoOk = extrairCampoJson(resposta, "ok");

  if (campoAllowed == "true" || campoStatus == "success" || campoOk == "true") {
    permitido = true;
    return true;
  } else {
    permitido = false;
    if (mensagem.isEmpty()) mensagem = "Nao cadastrado";
    return false;
  }
}

// ====================================================================
// SETUP INICIAL
// ====================================================================
void setup() {
  Serial.begin(115200);
  delay(400);
  Serial.println("\n--- PresenX Leitor RFID Inicializando ---");

  if (BUZZER_PIN >= 0) {
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);
  }

  // Inicializa SPI e leitor RFID RC522
  SPI.begin(18, 19, 23, SS_PIN);
  rfid.PCD_Init();

  // Inicializa display LCD I2C
  Wire.begin(21, 22); // SDA=21, SCL=22 no ESP32
  lcd.init();
  lcd.backlight();

  // Conecta Wi-Fi
  connectWifi();
  if (WiFi.status() == WL_CONNECTED) {
    enviarHeartbeatPing();
    lastPingTime = millis();
    showWelcome();
  }
}

// ====================================================================
// LOOP PRINCIPAL
// ====================================================================
void loop() {
  // 1. Garante conexão Wi-Fi
  if (!ensureWifi()) {
    delay(100);
    return;
  }

  // 2. Envia Heartbeat periódico para atualizar status online no painel
  if (millis() - lastPingTime >= PING_INTERVAL) {
    enviarHeartbeatPing();
    lastPingTime = millis();
  }

  // 3. Verifica presença de cartão RFID no sensor
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(50);
    return;
  }

  // 4. Lê o UID do cartão em formato HEX maiúsculo (ex: 336C58ED)
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();

  Serial.println("[RFID] Cartao detectado: " + uid);

  // 5. Exibe status de verificação no LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Verificando...");
  lcd.setCursor(0, 1);
  lcd.print("UID: " + uid);

  // 6. Envia para a API do PresenX
  String nome = "";
  String acao = "";
  String mensagem = "";
  bool permitido = false;

  bool ok = registrarPresenca(uid, nome, acao, mensagem, permitido);

  lcd.clear();
  if (ok && permitido) {
    bipSucesso();
    // Linha 0: Nome do Professor (primeiros 16 caracteres)
    lcd.setCursor(0, 0);
    if (nome.length() > 16) {
      lcd.print(nome.substring(0, 16));
    } else {
      lcd.print(nome);
    }

    // Linha 1: Entrada ou Saída
    lcd.setCursor(0, 1);
    if (acao == "entrada") {
      lcd.print("Entrada liberada");
    } else if (acao == "saida") {
      lcd.print("Saida liberada");
    } else {
      lcd.print("Acesso liberado");
    }
  } else {
    bipErro();
    lcd.setCursor(0, 0);
    lcd.print("Acesso negado");
    lcd.setCursor(0, 1);
    if (!mensagem.isEmpty()) {
      lcd.print(mensagem.substring(0, 16));
    } else {
      lcd.print("UID: " + uid);
    }
  }

  // Finaliza leitura do cartão atual para evitar leituras duplicadas imediatas
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  delay(2200); // Aguarda para o usuário ler a mensagem
  showWelcome();
}
