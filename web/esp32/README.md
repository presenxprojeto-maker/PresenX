# Como Conectar o ESP32 ao PresenX

Este firmware conecta o leitor RFID (RC522) e display LCD ao sistema **PresenX** (hospedado na nuvem no Render ou em rede local).

---

## 🔌 1. Esquema de Ligação dos Pinos (ESP32)

### MFRC522 (Leitor RFID) -> ESP32
| MFRC522 | ESP32 (Padrão) | Observação |
|---|---|---|
| **SDA / SS** | **GPIO 5** | Seleção de Escravo SPI |
| **SCK** | **GPIO 18** | Clock SPI |
| **MOSI** | **GPIO 23** | Master Out Slave In |
| **MISO** | **GPIO 19** | Master In Slave Out |
| **RST** | **GPIO 2** | Reset |
| **3.3V** | **3.3V** | ⚠️ **NÃO LIGUE NO 5V (queima o leitor)** |
| **GND** | **GND** | Terra comum |

### Display LCD 16x2 com Módulo I2C -> ESP32
| LCD I2C | ESP32 |
|---|---|
| **VCC** | **VIN ou 5V** |
| **GND** | **GND** |
| **SDA** | **GPIO 21** |
| **SCL** | **GPIO 22** |

*(Se o display acender mas não exibir letras, ajuste o potenciômetro azul de contraste na traseira do módulo I2C).*

---

## ⚙️ 2. Como Configurar no Arduino IDE

1. Abra a pasta `web/esp32`.
2. Duplique o arquivo `presenx_config.example.h` e renomeie a cópia para **`presenx_config.h`**.
3. Abra o `presenx_config.h` e preencha:
   - `PRESENX_WIFI_SSID`: Nome da sua rede Wi-Fi.
   - `PRESENX_WIFI_PASSWORD`: Senha do seu Wi-Fi.
   - `PRESENX_SERVER_URL`: `"https://presenx.onrender.com"` (ou `http://192.168.x.x:3000` se testar em rede local).
4. No Arduino IDE, instale as bibliotecas (Menu *Sketch > Incluir Biblioteca > Gerenciar Bibliotecas*):
   - **MFRC522** (por GithubCommunity)
   - **LiquidCrystal_I2C** (por Frank de Brabander ou Marco Schwartz)
5. Selecione a sua placa (**ESP32 Dev Module**) e a porta COM correspondente.
6. Clique em **Carregar (Upload)**.

---

## 📡 3. O que acontece em operação

- **Heartbeat automático**: A cada 30 segundos, o ESP32 envia um sinal para o PresenX. Tanto a tela institucional (`painel.html`) quanto o painel administrativo (`gestao.html`) mostrarão **"Leitor Portaria: Online" (verde)**.
- **Ao aproximar um cartão cadastrado**:
  - Exibe o nome do professor e **"Entrada liberada"** ou **"Saída liberada"**.
  - O painel de presença atualiza em tempo real.
- **Ao aproximar um cartão novo (não cadastrado)**:
  - Exibe **"Acesso negado"** e o **UID do cartão** no LCD.
  - No painel administrativo em `gestao.html`, aparecerá um banner automático permitindo vincular aquele cartão com 1 clique a qualquer professor cadastrado!
