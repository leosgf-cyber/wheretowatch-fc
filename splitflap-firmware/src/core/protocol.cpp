#include "splitflap/protocol.h"

namespace splitflap {

uint8_t crc8(const uint8_t* data, size_t len) {
  uint8_t crc = 0x00;
  for (size_t i = 0; i < len; ++i) {
    uint8_t inbyte = data[i];
    for (uint8_t bit = 0; bit < 8; ++bit) {
      uint8_t mix = (crc ^ inbyte) & 0x01;
      crc >>= 1;
      if (mix) crc ^= 0x8C;  // reflected 0x31
      inbyte >>= 1;
    }
  }
  return crc;
}

size_t encodeFrame(uint8_t addr, uint8_t cmd, const uint8_t* payload,
                   size_t payloadLen, uint8_t* out) {
  if (payloadLen > kMaxPayload) return 0;

  size_t i = 0;
  out[i++] = kFrameStart;
  out[i++] = addr;
  out[i++] = cmd;
  out[i++] = static_cast<uint8_t>(payloadLen);
  for (size_t p = 0; p < payloadLen; ++p) out[i++] = payload[p];

  // CRC covers addr,cmd,len,payload (everything after START).
  out[i] = crc8(out + 1, 3 + payloadLen);
  ++i;
  return i;
}

bool FrameDecoder::feed(uint8_t byte) {
  switch (state_) {
    case WAIT_START:
      if (byte == kFrameStart) state_ = READ_ADDR;
      return false;

    case READ_ADDR:
      addr_ = byte;
      state_ = READ_CMD;
      return false;

    case READ_CMD:
      cmd_ = byte;
      state_ = READ_LEN;
      return false;

    case READ_LEN:
      len_ = byte;
      idx_ = 0;
      if (len_ > kMaxPayload) {          // malformed; resync
        state_ = WAIT_START;
        return false;
      }
      state_ = (len_ == 0) ? READ_CRC : READ_PAYLOAD;
      return false;

    case READ_PAYLOAD:
      payload_[idx_++] = byte;
      if (idx_ >= len_) state_ = READ_CRC;
      return false;

    case READ_CRC: {
      state_ = WAIT_START;
      // Reconstruct addr,cmd,len,payload contiguously and CRC it, matching the
      // exact byte order encodeFrame() used.
      uint8_t buf[3 + kMaxPayload];
      buf[0] = addr_;
      buf[1] = cmd_;
      buf[2] = len_;
      for (uint8_t k = 0; k < len_; ++k) buf[3 + k] = payload_[k];
      return crc8(buf, 3 + len_) == byte;
    }
  }
  return false;
}

}  // namespace splitflap
