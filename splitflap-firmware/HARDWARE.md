# Hardware — o que comprar

Este firmware assume a arquitetura **1 controlador (ESP32) + N módulos idênticos**
ligados num barramento RS485. Cada módulo é 1 caractere.

Antes de comprar 132 de qualquer coisa: **monte 1 módulo primeiro**, valide o
homing e o movimento, e só então replique.

---

## Por MÓDULO (1 caractere) — o que se repete

| Item | Função | Qtd | Custo aprox. (unid.) |
|---|---|---|---|
| Motor de passo **28BYJ-48** (5V) | gira o tambor de pás | 1 | US$ 1–2 |
| Driver **ULN2003** (placa que vem com o motor) | aciona as bobinas | 1 | incluso |
| Sensor Hall **A3144** (ou switch óptico) | homing (acha o "zero") | 1 | US$ 0,20 |
| Ímã pequeno de neodímio | dispara o Hall a cada volta | 1 | US$ 0,10 |
| Transceiver **MAX485 / MAX3485** (módulo) | põe o módulo no barramento RS485 | 1 | US$ 0,50 |
| MCU do módulo — **ATmega328** (Arduino Nano) *ou* ESP32/RP2040 | roda `firmware/module` | 1 | US$ 2–4 |
| Tambor + **pás/flaps** impressas (vinil ou impressão 3D) | os caracteres em si | 1 kit | variável |
| Rolamento/eixo + estrutura (impressão 3D) | mecânica do tambor | 1 | filamento |

> **Alternativa mais barata em escala:** dá pra tirar o MCU de cada módulo e
> acionar vários motores a partir de um controlador só usando **registradores de
> deslocamento (74HC595)** para as bobinas e um **multiplexador (74HC4051)** para
> ler os sensores Hall — é o approach do projeto _Scott Bezek splitflap_. Reduz
> muito o custo por módulo, mas exige adaptar o `firmware/module` para o modelo
> "controlador central" em vez de "1 MCU por módulo". O firmware atual está no
> modelo 1-MCU-por-módulo, que é o mais simples de montar e depurar.

---

## Para o PAINEL inteiro (6×22 = 132 módulos) — comprar 1x

| Item | Função | Qtd |
|---|---|---|
| **ESP32** (DevKit) | o master: WiFi/HTTP + dispara o barramento | 1 |
| Módulo **MAX485** para o master | põe o master no RS485 | 1 |
| **Fonte 5V** robusta | 28BYJ-48 puxa ~240 mA cada; 132 motores ≠ tudo ao mesmo tempo, mas dimensione com folga (fonte de **5V / 20–30A**, ou várias menores por seção) | 1+ |
| Fiação do barramento (par trançado) + resistores de terminação 120Ω | RS485 | — |
| Distribuição de energia (barramentos/PCB) | alimentar 132 motores sem queda de tensão | — |
| Estrutura/moldura | segurar tudo | 1 |

---

## Duas decisões que mudam o custo

1. **Motor:** `28BYJ-48` (barato, lento, ~US$1) vs. **NEMA-17 + driver A4988/TMC2208**
   (mais caro, mais rápido/silencioso). O firmware suporta os dois — é só ajustar
   `kStepsPerRevolution` em `config.h`. Para um painel grande, 28BYJ-48 é o padrão
   por custo.

2. **Fabricação das pás:** este é o trabalho de verdade. Opções:
   - kits/pás prontas de comunidades de split-flap;
   - impressão 3D dos tambores + adesivos de vinil recortados;
   - terceirizar o corte dos flaps.

---

## Estimativa rápida de custo (montando do zero)

- **1 módulo protótipo:** ~US$ 6–10 (motor+driver+Hall+MAX485+Nano) + pás/impressão.
- **Painel 6×22 completo:** os 132 módulos dominam o custo — na ordem de
  **US$ 800–1500** em componentes (fora fonte, estrutura e muitas horas de
  montagem). É um projeto de fim de semana… vários fins de semana. 🙂

## Caminho mais rápido (sem soldar nada)

Se o objetivo é ter mensagens no painel **logo**, dá pra:
- comprar um **Vestaboard pronto** e usar a **API oficial** deles — nesse caso eu
  adapto o `firmware/master`/`tools/push.py` para falar com a API REST do
  Vestaboard em vez do RS485 (é troca de transporte, o `layoutText()` continua
  igual); ou
- começar pela **simulação web** (posso montar um componente animado pro
  WhereToWatch FC) e migrar pro físico depois.

---

### Recomendação

Comece com **1 módulo + 1 ESP32** (custo baixo, ~US$ 15 no total) rodando este
firmware. Valida homing, movimento e o barramento de ponta a ponta. Só depois
comprometa dinheiro nos 132 módulos e na fonte grande.
