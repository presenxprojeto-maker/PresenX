# Configurar o leitor RFID do PresenX

O firmware envia o UID do cartão pela internet para a função do PresenX. A autorização é calculada no backend; o leitor mostra o resultado no LCD.

## Antes de começar

1. Aplique o schema do Supabase e as migrações indicadas em supabase/SETUP.md.
2. Publique a função rfid-identification.
3. No PresenX, crie um ponto de controle associado a uma área.
4. Cadastre um dispositivo nesse ponto. Use uma chave exclusiva e forte para esse leitor.
5. Instale no Arduino IDE o suporte à placa ESP32 e as bibliotecas MFRC522 e LiquidCrystal_I2C.

## Configuração local

1. Faça uma cópia de presenx_config.example.h com o nome presenx_config.h nesta pasta.
2. Preencha a rede Wi-Fi, o endereço da função, a chave pública do Supabase e a chave do dispositivo cadastrada no PresenX.
3. Obtenha o certificado CA raiz da cadeia TLS usada pelo domínio do projeto e cole o PEM completo em PRESENX_ROOT_CA. A validação do certificado fica ativa no firmware.
4. Abra sketch_presenx.ino no Arduino IDE, selecione a placa e a porta serial corretas e grave o programa.

O arquivo presenx_config.h contém credenciais locais e está excluído pelo .gitignore desta pasta. Não o envie nem compartilhe.

## Teste de apresentação

Cadastre um cartão com acesso permitido à área do ponto. Depois teste também um cartão de uma pessoa sem permissão e um cartão ainda não cadastrado. Os três resultados devem aparecer no LCD e no histórico de eventos do PresenX.

O firmware requer Wi-Fi e acesso à função Supabase. Ele não registra leituras offline para sincronizar depois.
