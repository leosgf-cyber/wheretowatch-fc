// master_main.cpp — Firmware for the board controller (ESP32).
//
// Responsibilities:
//   * Hold the desired board state (kRows x kCols codes).
//   * Expose an HTTP API so anything on the network can post a message.
//   * Also accept plain text over USB serial (great for bench testing).
//   * Translate text -> per-cell codes with the shared board layout, then push
//     the whole board to the modules over RS485 (CMD_SHOW broadcast).
//
// Wiring: an ESP32 with a MAX485 on UART2 (RX2/TX2 + DE/RE). USB serial (UART0)
// stays free for the serial command console and flashing.
//
// Build with PlatformIO: `pio run -e master`. Uses Arduino-ESP32 + WiFi, so it
// is excluded from the native test build.
#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>

#include <string>
#include <vector>

#include "splitflap/board.h"
#include "splitflap/config.h"
#include "splitflap/protocol.h"

using namespace splitflap;

// ---- Configuration ---------------------------------------------------------
static const char* kWifiSsid = "YOUR_WIFI";
static const char* kWifiPass = "YOUR_PASSWORD";

static const uint8_t kRs485DePin = 4;
static const uint8_t kRs485RxPin = 16;  // UART2 RX
static const uint8_t kRs485TxPin = 17;  // UART2 TX

static WebServer g_server(80);
static std::vector<uint8_t> g_board(kRows * kCols, CODE_BLANK);

// ---- Bus transmit ----------------------------------------------------------
static void busSend(const uint8_t* frame, size_t n) {
  digitalWrite(kRs485DePin, HIGH);
  Serial2.write(frame, n);
  Serial2.flush();
  digitalWrite(kRs485DePin, LOW);
}

// Broadcast the whole board. Each module reads its own cell out of the payload
// by its address (index = address - 1).
static void pushBoard() {
  uint8_t frame[kMaxFrame];
  size_t n = encodeFrame(kBroadcastAddress, CMD_SHOW, g_board.data(),
                         g_board.size(), frame);
  if (n) busSend(frame, n);
}

static void showText(const std::string& text, Align align = Align::Center) {
  g_board = layoutText(text, kRows, kCols, align);
  pushBoard();
}

static void homeAll() {
  uint8_t frame[kMaxFrame];
  size_t n = encodeFrame(kBroadcastAddress, CMD_HOME, nullptr, 0, frame);
  if (n) busSend(frame, n);
}

// ---- HTTP API --------------------------------------------------------------
// POST /message   body: raw text        -> render + display
// POST /home                            -> re-home every module
// GET  /          -> tiny status page
static void handleMessage() {
  if (!g_server.hasArg("plain")) {
    g_server.send(400, "text/plain", "empty body\n");
    return;
  }
  std::string body = g_server.arg("plain").c_str();
  Align align = Align::Center;
  if (g_server.hasArg("align")) {
    String a = g_server.arg("align");
    if (a == "left") align = Align::Left;
    else if (a == "right") align = Align::Right;
  }
  showText(body, align);
  g_server.send(200, "text/plain", "ok\n");
}

static void handleHome() {
  homeAll();
  g_server.send(200, "text/plain", "homing\n");
}

static void handleRoot() {
  g_server.send(200, "text/html",
                "<h1>Split-Flap Master</h1>"
                "<p>POST text to <code>/message</code> "
                "(optional <code>?align=left|center|right</code>).</p>"
                "<p>POST <code>/home</code> to re-home.</p>");
}

// ---- Serial console (bench testing without WiFi) ---------------------------
// Type a line of text + Enter -> it shows on the board. ":home" re-homes.
static void pollSerialConsole() {
  static std::string line;
  while (Serial.available()) {
    char c = static_cast<char>(Serial.read());
    if (c == '\n' || c == '\r') {
      if (!line.empty()) {
        if (line == ":home") homeAll();
        else showText(line);
        line.clear();
      }
    } else {
      line += c;
    }
  }
}

// ---- Arduino entry points --------------------------------------------------
void setup() {
  Serial.begin(115200);
  pinMode(kRs485DePin, OUTPUT);
  digitalWrite(kRs485DePin, LOW);
  Serial2.begin(kBusBaudRate, SERIAL_8N1, kRs485RxPin, kRs485TxPin);

  WiFi.mode(WIFI_STA);
  WiFi.begin(kWifiSsid, kWifiPass);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(250);
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi failed — serial console still available.");
  }

  g_server.on("/", handleRoot);
  g_server.on("/message", HTTP_POST, handleMessage);
  g_server.on("/home", HTTP_POST, handleHome);
  g_server.begin();

  homeAll();
  showText("WHERE TO WATCH FC");
}

void loop() {
  g_server.handleClient();
  pollSerialConsole();
}
