# Split-Flap Board — Firmware (estilo Vestaboard)

Software para controlar um painel de pás (split-flap) caseiro, no estilo do
Vestaboard. A arquitetura é **1 controlador (master) → barramento RS485 → N
módulos**, cada módulo sendo um caractere.

O código de "cérebro" (charset, planejamento de movimento, protocolo de
comunicação e layout de texto) é **C++ portável e testado no PC**, e é o mesmo
compilado dentro do firmware do Arduino/ESP32. Ou seja: você desenvolve e testa
a lógica no notebook, e só depois flasha no hardware.

```
                       WiFi / HTTP / Serial
                              │
                     ┌────────▼────────┐
                     │  MASTER (ESP32) │  layoutText(): texto -> códigos 6x22
                     └────────┬────────┘
                              │ RS485 (半-duplex, 57600)
        ┌──────────┬──────────┼──────────┬──────────┐
      ┌─▼─┐      ┌─▼─┐      ┌─▼─┐      ┌─▼─┐      ┌─▼─┐
      │M1 │      │M2 │      │M3 │ ...  │M131│     │M132│   (6 x 22 = 132 módulos)
      └───┘      └───┘      └───┘      └───┘      └───┘
   28BYJ-48 + Hall + MAX485 por módulo
```

## Estrutura

| Caminho | O quê |
|---|---|
| `include/splitflap/` | Headers do núcleo + `config.h` (ajuste aqui geometria/pinos) |
| `src/core/` | Núcleo portável: `charset`, `motion`, `protocol`, `board` |
| `firmware/module/` | Firmware de **um módulo** (Arduino Nano / ATmega328) |
| `firmware/master/` | Firmware do **controlador** (ESP32 + WiFi/HTTP) |
| `test/` | Testes unitários nativos (g++), 100+ asserts |
| `tools/push.py` | CLI de host: manda texto pro painel (HTTP ou serial) + preview |
| `CMakeLists.txt` | Build/teste do núcleo no PC |
| `platformio.ini` | Build/flash dos firmwares |

## Rodar os testes (no PC, sem hardware)

```bash
# Com CMake:
cmake -S . -B build && cmake --build build && ctest --test-dir build --output-on-failure

# Ou direto com g++:
g++ -std=c++17 -Iinclude src/core/*.cpp test/test_main.cpp -o sf_tests && ./sf_tests
```

## Preview de uma mensagem (sem hardware)

```bash
python3 tools/push.py --preview "BOTAFOGO 2 X 1 FLAMENGO"
```

## Compilar e flashar o firmware

```bash
pip install platformio
pio run -e module   -t upload   # flasha um módulo (ajuste kMyAddress em cada um)
pio run -e master   -t upload   # flasha o controlador (ajuste SSID/senha)
```

## Enviar mensagens pro painel montado

```bash
python3 tools/push.py --host 192.168.0.42 "NEXT MATCH 20H"      # via WiFi
python3 tools/push.py --serial /dev/ttyUSB0 --home "HELLO"       # via USB/RS485
```

Ou direto por HTTP: `POST /message` com o texto no corpo
(`?align=left|center|right`), e `POST /home` pra re-homing.

## Protocolo do barramento

Frame (master → módulo, half-duplex):

```
0x7E  START
ADDR  endereço do módulo (0 = broadcast)
CMD   comando
LEN   tamanho do payload
...   payload
CRC   CRC-8 (Dallas/Maxim) de ADDR..payload
```

Comandos: `SET_FLAP`, `SET_CODE`, `HOME`, `SHOW` (broadcast da placa toda,
cada módulo lê sua célula pelo próprio endereço), `PING`/`PONG`.

## Charset e ordem das pás

`codeToFlap()` separa dois conceitos:

* **code** — id lógico do glifo (compatível com o mapa do Vestaboard). É como
  você "escreve" a mensagem.
* **flap** — posição física da pá no tambor (0..N-1). Depende de como VOCÊ colou
  os adesivos. Edite `kFlapOrder[]` em `src/core/charset.cpp` pra bater com o seu
  tambor e ajuste `kFlapCount` em `config.h`.

O movimento é **unidirecional** (o tambor só gira pra frente): ir de uma pá a
outra é sempre `(destino - atual) mod N` pás. As posições são calculadas em
passos absolutos por revolução pra não acumular erro de arredondamento.

## Hardware — lista de compras

Ver [`HARDWARE.md`](HARDWARE.md) para a lista completa, custos aproximados e
opções (usar Vestaboard pronto vs. montar do zero).

## Aviso

Não tenho como flashar/mover motores aqui — o **núcleo é testado de verdade**
(103 asserts passando) e os firmwares usam essa mesma base, mas a validação no
hardware (homing, timing dos passos, endereçamento) é o passo que fica com você.
