# DOMAIN.md

## Pessoa
Indivíduo cadastrado no PresenX: professor, funcionário, gestor ou visitante.

## Setor
Agrupamento organizacional ao qual uma pessoa está vinculada. Ex.: Manutenção, Produção, Estoque, Docência.

## Área
Local físico configurado no ambiente. Ex.: Laboratório 1, Oficina, Produção, Estoque.

## Área autorizada
Relacionamento que indica que uma pessoa ou grupo pode acessar uma área.

**Autorização não representa localização.**

## Ponto de controle
Local ou dispositivo utilizado para registrar uma identificação. Pode representar entrada, saída ou uma área.

## Dispositivo
Equipamento responsável por realizar ou receber a identificação. No protótipo pode ser ESP32 + RFID.

## Identificador
Credencial usada para identificar uma pessoa, como um cartão RFID.

## Evento
Registro de uma ocorrência: entrada, saída, identificação em área ou tentativa de acesso não autorizado.

Conceitualmente pode conter:
- pessoa;
- data/hora;
- ponto de controle;
- tipo;
- área/local associado;
- resultado de autorização;
- metadados.

## Última localização registrada
Área associada ao evento de localização mais recente.

**Não significa presença física garantida naquele instante.**

## Permissão
Regra que determina se uma pessoa ou grupo pode realizar determinada ação ou acessar determinada área.

## Usuário administrativo
Pessoa autorizada a utilizar a plataforma de gestão.

## Relações

Pessoa → Setor
Pessoa → Identificador
Pessoa → Áreas autorizadas
Pessoa → Eventos
Ponto de controle → Dispositivo
Ponto de controle → Área/entrada/saída
Evento → Pessoa
Evento → Ponto de controle
Evento → Última localização registrada
