# VISION.md

## Visão

O PresenX pretende ser uma plataforma configurável para **identificação, controle e rastreabilidade de pessoas em ambientes físicos**.

O sistema conecta pessoas a setores, áreas autorizadas e pontos de controle. Cada identificação gera um evento que pode construir histórico, verificar permissões e determinar a última localização registrada.

## Problema

Ambientes com muitas pessoas e áreas podem ter dificuldade para saber:
- quem está registrado no ambiente;
- qual foi o último ponto de controle utilizado;
- a qual setor a pessoa pertence;
- quais áreas ela pode acessar;
- quando eventos ocorreram;
- quais tentativas de acesso não autorizado aconteceram.

## Solução

Centralizar essas informações e utilizar dispositivos de identificação para alimentar eventos.

O PresenX não pretende realizar rastreamento contínuo por padrão.

## Conceitos separados

1. **Setor principal:** vínculo administrativo.
2. **Áreas autorizadas:** locais que a pessoa pode acessar.
3. **Localização registrada:** local do último evento relevante.
4. **Estado de presença:** interpretação dos registros de entrada/saída.
5. **Histórico:** sequência de eventos.

## Evolução

O domínio não deve depender de RFID. Outras tecnologias de identificação poderão alimentar os mesmos eventos no futuro.
