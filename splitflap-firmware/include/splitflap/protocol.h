// protocol.h — Wire framing for the master <-> module RS485 bus.
//
// Frame layout (half-duplex, master-driven):
//
//   0x7E  START
//   ADDR  destination module address (0 = broadcast)
//   CMD   command byte
//   LEN   payload length (0..kMaxPayload)
//   P0..  payload bytes
//   CRC   CRC-8 (Dallas/Maxim) over ADDR,CMD,LEN,payload
//
// The frame is intentionally tiny and fixed-shape: modules are cheap MCUs and
// parse it with a small state machine. START never appears mid-frame because
// every other field is constrained (we never send 0x7E as ADDR/CMD/LEN and the
// payload for SET_FLAP is a single code < 0x7E).
#ifndef SPLITFLAP_PROTOCOL_H
#define SPLITFLAP_PROTOCOL_H

#include <cstddef>
#include <cstdint>

namespace splitflap {

constexpr uint8_t kFrameStart = 0x7E;
constexpr size_t kMaxPayload = 132;   // enough for a full 6x22 board broadcast
constexpr size_t kMaxFrame = 4 + kMaxPayload + 1;

enum Command : uint8_t {
  CMD_SET_FLAP = 0x01,  // payload: [flapIndex]   -> move this module to a flap
  CMD_SET_CODE = 0x02,  // payload: [code]        -> module maps code->flap itself
  CMD_HOME = 0x03,      // payload: none          -> re-home the drum
  CMD_SHOW = 0x04,      // payload: [code0..codeN] broadcast, indexed by address
  CMD_PING = 0x05,      // payload: none          -> module replies CMD_PONG
  CMD_PONG = 0x06,      // payload: [status]
};

// CRC-8 Dallas/Maxim (poly 0x31 reflected, init 0x00). Used for frame integrity.
uint8_t crc8(const uint8_t* data, size_t len);

// Encode a frame into out (must hold at least kMaxFrame bytes). Returns the
// number of bytes written, or 0 if payloadLen exceeds kMaxPayload.
size_t encodeFrame(uint8_t addr, uint8_t cmd, const uint8_t* payload,
                   size_t payloadLen, uint8_t* out);

// Incremental decoder: feed received bytes one at a time. Returns true exactly
// once per complete, CRC-valid frame, exposing its fields via the out params.
class FrameDecoder {
 public:
  bool feed(uint8_t byte);

  uint8_t address() const { return addr_; }
  uint8_t command() const { return cmd_; }
  const uint8_t* payload() const { return payload_; }
  size_t payloadLength() const { return len_; }

 private:
  enum State { WAIT_START, READ_ADDR, READ_CMD, READ_LEN, READ_PAYLOAD, READ_CRC };
  State state_ = WAIT_START;
  uint8_t addr_ = 0, cmd_ = 0, len_ = 0, idx_ = 0;
  uint8_t payload_[kMaxPayload] = {0};
};

}  // namespace splitflap

#endif  // SPLITFLAP_PROTOCOL_H
