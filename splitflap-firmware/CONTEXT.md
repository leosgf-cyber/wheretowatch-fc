# CONTEXT — handoff para continuar no MacBook

Documento de continuidade do projeto **split-flap board (estilo Vestaboard)**.
Escrito para você retomar do zero no Mac, e para dar contexto a uma nova sessão
de IA se precisar.

## Onde está o código

- Repo: `leosgf-cyber/wheretowatch-fc`
- Branch: `claude/split-flat-board-control-9elibv`
- Pasta: `splitflap-firmware/`

Para pegar no MacBook:

```bash
git clone https://github.com/leosgf-cyber/wheretowatch-fc.git
cd wheretowatch-fc
git checkout claude/split-flat-board-control-9elibv
cd splitflap-firmware
```

## O que já está pronto (e testado)

Arquitetura escolhida: **1 master (ESP32, WiFi/HTTP) → barramento RS485 → N
módulos** (cada módulo = 1 caractere: Arduino Nano + 28BYJ-48 + sensor Hall).

O núcleo lógico é C++ portável, compartilhado entre PC e firmware, e tem
**103 asserts de teste passando** no PC.

| Camada | Arquivo | Status |
|---|---|---|
| Charset (código Vestaboard ↔ pá física) | `src/core/charset.cpp` | ✅ testado |
| Movimento unidirecional do tambor | `src/core/motion.cpp` | ✅ testado |
| Protocolo RS485 (frame + CRC-8) | `src/core/protocol.cpp` | ✅ testado |
| Layout de texto → grade 6×22 | `src/core/board.cpp` | ✅ testado |
| Firmware do módulo (Arduino) | `firmware/module/module_main.cpp` | ✅ escrito, ⬜ não testado em HW |
| Firmware do master (ESP32) | `firmware/master/master_main.cpp` | ✅ escrito, ⬜ não testado em HW |
| CLI de host (texto → painel) | `tools/push.py` | ✅ preview testado |
| Config de hardware | `include/splitflap/config.h` | ⬜ ajustar aos seus pinos |

## Como validar no Mac (sem hardware)

```bash
# testes do núcleo
cmake -S . -B build && cmake --build build && ctest --test-dir build --output-on-failure
# ou: g++ -std=c++17 -Iinclude src/core/*.cpp test/test_main.cpp -o sf_tests && ./sf_tests

# preview de mensagem em ASCII
python3 tools/push.py --preview "BOTAFOGO 2 X 1 FLAMENGO"
```

## Como compilar/flashar (quando tiver o hardware)

```bash
brew install platformio        # ou: pip install platformio
pio run -e module -t upload    # cada módulo: ajuste kMyAddress antes
pio run -e master -t upload    # ESP32: ajuste SSID/senha WiFi antes
```

## Decisões de projeto (o porquê)

1. **Núcleo portável separado do firmware.** A lógica difícil (movimento,
   protocolo, layout) não depende do Arduino, então é testada no PC. O firmware
   só amarra essa lógica aos pinos/motores.
2. **Movimento unidirecional.** Tambor split-flap só gira pra frente; ir de uma
   pá a outra é `(destino - atual) mod N`. Uso passos ABSOLUTOS por revolução
   (`stepForFlap`) pra não acumular erro quando `4096 / kFlapCount` não é inteiro.
3. **code vs flap.** `code` = glifo lógico (mapa Vestaboard, como você escreve).
   `flap` = posição física no SEU tambor. `kFlapOrder[]` em `charset.cpp` faz a
   ponte — edite pra bater com a ordem em que você colar as pás.
4. **RS485 com endereço por módulo.** Broadcast `CMD_SHOW` manda a placa toda;
   cada módulo lê só a sua célula pelo próprio endereço (índice = addr-1).
5. **Modelo 1-MCU-por-módulo** por ser o mais fácil de montar/depurar. Alternativa
   mais barata em escala (74HC595 + 74HC4051, estilo Scott Bezek) está descrita
   em `HARDWARE.md` — exigiria reescrever `firmware/module` no modo centralizado.

## Próximos passos sugeridos (em ordem)

1. **Protótipo de 1 módulo + ESP32** (~US$15). Validar homing (Hall), um
   movimento de pá, e o barramento master→módulo de ponta a ponta.
2. Ajustar `config.h` (pinos reais, `kStepsPerRevolution`, `kFlapCount`) e
   `kFlapOrder[]` conforme montar as pás.
3. Confirmar timing (`kStepIntervalMicros`) sem perder passos.
4. Replicar pros 132 módulos + dimensionar fonte 5V (ver `HARDWARE.md`).
5. Integrar com o WhereToWatch FC: um script que puxa os jogos e chama
   `tools/push.py` (ou a API HTTP do master) pra mostrar "onde assistir".

## Ideias em aberto (não implementadas)

- Simulação web animada do painel pro site WhereToWatch FC (caminho rápido, sem HW).
- Transporte alternativo: falar com um Vestaboard REAL via API oficial deles
  (trocar o transporte em `push.py`/`master`, mantendo `layoutText()`).
- Persistir `kMyAddress` de cada módulo em EEPROM/DIP switch em vez de hard-coded.
- Comando de transição/efeito (mostrar mensagem letra a letra, delays por coluna).

## Referências úteis

- Projeto de referência de split-flap DIY: "Scott Bezek splitflap" (GitHub).
- Mapa de códigos de caractere do Vestaboard (docs.vestaboard.com) — base do charset.
