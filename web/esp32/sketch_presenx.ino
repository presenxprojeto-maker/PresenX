#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <MFRC522.h>
#include <SPI.h>

#if __has_include("presenx_config.h")
  #include "presenx_config.h"
#else
  #error "Copie presenx_config.example.h para presenx_config.h e configure a conexão."
#endif

#define SS_PIN 5
#define RST_PIN 2

MFRC522 rfid(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x3F, 16, 2);

unsigned long lastWifiAttempt = 0;
const unsigned long WIFI_RETRY_INTERVAL = 10000;

void showWelcome() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("PresenX");
  lcd.setCursor(0, 1);
  lcd.print("Aproxime cartao");
}

String jsonStringField(const String& json, const String& field) {
  const String key = "\"" + field + "\":";
  int start = json.indexOf(key);
  if (start < 0) return "";
  start += key.length();
  while (start < json.length() && json[start] == ' ') start++;
  if (start >= json.length() || json[start] != '"') return "";
  start++;
  const int end = json.indexOf('"', start);
  return end < 0 ? "" : json.substring(start, end);
}

bool jsonBooleanField(const String& json, const String& field) {
  const String key = "\"" + field + "\":";
  const int start = json.indexOf(key);
  return start >= 0 && json.substring(start + key.length(), start + key.length() + 5) == "true,";
}

void connectWifi() {
  lcd.clear();
  lcd.print("Conectando WiFi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(PRESENX_WIFI_SSID, PRESENX_WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Wi-Fi conectado. IP do leitor: ");
    Serial.println(WiFi.localIP());
    lcd.clear();
    lcd.print("WiFi conectado");
    delay(700);
    showWelcome();
  } else {
    Serial.println("Nao foi possivel conectar ao Wi-Fi configurado.");
    lcd.clear();
    lcd.print("Sem conexao WiFi");
    lastWifiAttempt = millis();
  }
}

bool ensureWifi() {
  if (WiFi.status() == WL_CONNECTED) return true;
  if (millis() - lastWifiAttempt >= WIFI_RETRY_INTERVAL) connectWifi();
  return WiFi.status() == WL_CONNECTED;
}

bool sendIdentification(
  const String& identifier,
  String& personName,
  String& action,
  String& message,
  bool& allowed
) {
  if (WiFi.status() != WL_CONNECTED) {
    message = "Wi-Fi desconectado";
    return false;
  }

  WiFiClientSecure secureClient;
  secureClient.setCACert(PRESENX_ROOT_CA);

  HTTPClient http;
  if (!http.begin(secureClient, PRESENX_FUNCTION_URL)) {
    message = "Falha na conexao";
    return false;
  }
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", PRESENX_ANON_KEY);
  http.addHeader("x-device-key", PRESENX_DEVICE_KEY);

  const String body = "{\"identifier\":\"" + identifier + "\"}";
  const int status = http.POST(body);
  const String response = http.getString();
  http.end();

  if (status != 200) {
    message = jsonStringField(response, "message");
    if (message.isEmpty()) message = status <= 0 ? "Servidor indisponivel" : "Falha ao registrar";
    return false;
  }

  allowed = jsonBooleanField(response, "allowed");
  personName = jsonStringField(response, "name");
  action = jsonStringField(response, "action");
  message = jsonStringField(response, "message");
  return true;
}

void setup() {
  Serial.begin(115200);
  delay(300);
  SPI.begin(18, 19, 23, SS_PIN);
  rfid.PCD_Init();
  lcd.init();
  lcd.backlight();
  connectWifi();
  if (WiFi.status() == WL_CONNECTED) showWelcome();
}

void loop() {
  if (!ensureWifi()) {
    delay(100);
    return;
  }

  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    delay(60);
    return;
  }

  String identifier;
  for (byte index = 0; index < rfid.uid.size; index++) {
    if (rfid.uid.uidByte[index] < 0x10) identifier += '0';
    identifier += String(rfid.uid.uidByte[index], HEX);
  }
  identifier.toUpperCase();
  Serial.println("Cartao apresentado ao PresenX.");

  lcd.clear();
  lcd.print("Verificando...");

  String personName;
  String action;
  String message;
  bool allowed = false;
  const bool processed = sendIdentification(identifier, personName, action, message, allowed);

  lcd.clear();
  if (!processed) {
    lcd.print("Erro na leitura");
    lcd.setCursor(0, 1);
    lcd.print(message.substring(0, 16));
  } else if (allowed) {
    lcd.print(personName.substring(0, 16));
    lcd.setCursor(0, 1);
    lcd.print(action == "entrada" ? "Entrada liberada" : action == "saida" ? "Saida liberada" : "Acesso liberado");
  } else {
    lcd.print("Acesso negado");
    lcd.setCursor(0, 1);
    lcd.print(message.substring(0, 16));
  }

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  delay(1800);
  showWelcome();
}
