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

1. Abra a pasta `web/esp32/sketch_presenx`.
2. O arquivo `presenx_config.h` já suporta **Multi-Wi-Fi (várias redes simultâneas)**:
   - `PRESENX_WIFI_SSID_1` / `PRESENX_WIFI_PASS_1`: Roteador / Ponto de Acesso 4G do seu celular (ótimo para feiras e apresentações externas).
   - `PRESENX_WIFI_SSID_2` / `PRESENX_WIFI_PASS_2`: Wi-Fi residencial ou da escola.
   - `PRESENX_SERVER_URL`: `"https://presenx.onrender.com"`.
3. **⚠️ Dica importante para Ponto de Acesso do celular (Feiras):**
   - O ESP32 opera apenas na frequência **2.4 GHz**.
   - No **iPhone**: Ative a opção **"Maximizar Compatibilidade"** em *Ajustes > Acesso Pessoal*.
   - No **Android**: Em *Ponto de Acesso Wi-Fi*, certifique-se de que a banda AP está em **2.4 GHz** (não deixe somente em 5 GHz).
4. No Arduino IDE, instale as bibliotecas (Menu *Sketch > Incluir Biblioteca > Gerenciar Bibliotecas*):
   - **MFRC522** (por GithubCommunity)
   - **LiquidCrystal_I2C** (por Frank de Brabander ou Marco Schwartz)
   *(A biblioteca `WiFiMulti` já é nativa do pacote de placas ESP32).*
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
