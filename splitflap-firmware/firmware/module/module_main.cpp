// module_main.cpp — Firmware for ONE split-flap module.
//
// Hardware per module:
//   * 28BYJ-48 stepper + ULN2003 driver  (4 GPIO)
//   * A3144 Hall-effect sensor for homing (1 GPIO, active-low)
//   * MAX485 transceiver on the shared RS485 bus (RX, TX, DE/RE)
//
// The module boots, homes the drum (blank), then listens on the bus for frames
// addressed to it (or broadcast) and moves the drum to the requested flap.
//
// Build with PlatformIO: `pio run -e module`. This file uses the Arduino API,
// so it does not compile in the native test build — the logic it depends on
// (charset/motion/protocol) is tested separately on the host.
#include <Arduino.h>

#include "splitflap/charset.h"
#include "splitflap/config.h"
#include "splitflap/motion.h"
#include "splitflap/protocol.h"

using namespace splitflap;

// ---- Per-module configuration ---------------------------------------------
// Give each module a unique address. Read it from DIP switches / EEPROM in a
// real build; hard-coded here for clarity.
static const uint8_t kMyAddress = 1;

// Pin map (adjust to your wiring).
static const uint8_t kCoilPins[4] = {2, 3, 4, 5};  // IN1..IN4 on the ULN2003
static const uint8_t kHallPin = 6;                 // active-low
static const uint8_t kRs485DePin = 7;              // DE+RE tied together
// RS485 RX/TX use the hardware UART (pins 0/1 on an ATmega328).

// Half-step drive sequence for the 28BYJ-48.
static const uint8_t kHalfStep[8] = {
    0b0001, 0b0011, 0b0010, 0b0110, 0b0100, 0b1100, 0b1000, 0b1001};

// ---- Module state ----------------------------------------------------------
static int g_currentFlap = kHomeFlapIndex;
static long g_currentStep = 0;      // absolute step position on the revolution
static uint8_t g_phase = 0;         // index into kHalfStep
static FrameDecoder g_decoder;

// ---- Low-level stepping ----------------------------------------------------
static void writeCoils(uint8_t bits) {
  for (uint8_t i = 0; i < 4; ++i) {
    digitalWrite(kCoilPins[i], (bits >> i) & 0x01);
  }
}

static void releaseCoils() { writeCoils(0); }

static void stepForwardOnce(uint16_t intervalMicros) {
  g_phase = (g_phase + 1) & 0x07;
  writeCoils(kHalfStep[g_phase]);
  g_currentStep = (g_currentStep + 1) % kStepsPerRevolution;
  delayMicroseconds(intervalMicros);
}

// ---- Homing ----------------------------------------------------------------
// Rotate forward until the Hall sensor triggers, then declare that position the
// home flap. A magnet on the drum passes the sensor once per revolution.
static void home() {
  int steps = 0;
  // If we're already sitting on the magnet, step off it first.
  while (digitalRead(kHallPin) == LOW && steps < kStepsPerRevolution) {
    stepForwardOnce(kHomingStepIntervalMicros);
    ++steps;
  }
  steps = 0;
  while (digitalRead(kHallPin) == HIGH && steps < kMaxHomingSteps) {
    stepForwardOnce(kHomingStepIntervalMicros);
    ++steps;
  }
  releaseCoils();
  g_currentFlap = kHomeFlapIndex;
  g_currentStep = stepForFlap(kHomeFlapIndex, kFlapCount, kStepsPerRevolution);
}

// ---- Move to a flap --------------------------------------------------------
static void moveToFlap(int targetFlap) {
  if (targetFlap < 0 || targetFlap >= kFlapCount) return;
  long target = stepForFlap(targetFlap, kFlapCount, kStepsPerRevolution);
  long toGo = forwardSteps(g_currentStep, target, kStepsPerRevolution);
  for (long i = 0; i < toGo; ++i) stepForwardOnce(kStepIntervalMicros);
  releaseCoils();
  g_currentFlap = targetFlap;
}

// ---- Bus helpers -----------------------------------------------------------
static void sendPong(uint8_t status) {
  digitalWrite(kRs485DePin, HIGH);
  uint8_t frame[kMaxFrame];
  uint8_t payload[1] = {status};
  size_t n = encodeFrame(kMyAddress, CMD_PONG, payload, 1, frame);
  Serial.write(frame, n);
  Serial.flush();
  digitalWrite(kRs485DePin, LOW);
}

static void handleFrame() {
  uint8_t addr = g_decoder.address();
  if (addr != kMyAddress && addr != kBroadcastAddress) return;

  switch (g_decoder.command()) {
    case CMD_SET_FLAP:
      if (g_decoder.payloadLength() >= 1) moveToFlap(g_decoder.payload()[0]);
      break;
    case CMD_SET_CODE:
      if (g_decoder.payloadLength() >= 1)
        moveToFlap(codeToFlap(g_decoder.payload()[0]));
      break;
    case CMD_SHOW:
      // Broadcast row/board: this module's cell is at index (kMyAddress-1).
      if (kMyAddress >= 1 && g_decoder.payloadLength() >= kMyAddress)
        moveToFlap(codeToFlap(g_decoder.payload()[kMyAddress - 1]));
      break;
    case CMD_HOME:
      home();
      break;
    case CMD_PING:
      sendPong(0);
      break;
    default:
      break;
  }
}

// ---- Arduino entry points --------------------------------------------------
void setup() {
  for (uint8_t i = 0; i < 4; ++i) pinMode(kCoilPins[i], OUTPUT);
  pinMode(kHallPin, INPUT_PULLUP);
  pinMode(kRs485DePin, OUTPUT);
  digitalWrite(kRs485DePin, LOW);  // receive mode

  Serial.begin(kBusBaudRate);
  home();
}

void loop() {
  while (Serial.available()) {
    if (g_decoder.feed(static_cast<uint8_t>(Serial.read()))) handleFrame();
  }
}
