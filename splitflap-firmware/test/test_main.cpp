// Minimal zero-dependency test harness + all core unit tests.
// Compiles on the host with g++; verifies the platform-independent logic that
// the Arduino/ESP32 firmware relies on.
#include <cstdio>
#include <string>
#include <vector>

#include "splitflap/board.h"
#include "splitflap/charset.h"
#include "splitflap/config.h"
#include "splitflap/motion.h"
#include "splitflap/protocol.h"

using namespace splitflap;

static int g_failures = 0;
static int g_checks = 0;

#define CHECK(cond)                                                       \
  do {                                                                    \
    ++g_checks;                                                           \
    if (!(cond)) {                                                        \
      ++g_failures;                                                       \
      std::printf("  FAIL %s:%d  %s\n", __FILE__, __LINE__, #cond);       \
    }                                                                     \
  } while (0)

#define CHECK_EQ(a, b)                                                    \
  do {                                                                    \
    ++g_checks;                                                           \
    auto _va = (a);                                                       \
    auto _vb = (b);                                                       \
    if (!(_va == _vb)) {                                                  \
      ++g_failures;                                                       \
      std::printf("  FAIL %s:%d  %s == %s  (got %ld vs %ld)\n", __FILE__, \
                  __LINE__, #a, #b, (long)_va, (long)_vb);                \
    }                                                                     \
  } while (0)

// ---------------------------------------------------------------------------
static void test_charset() {
  std::printf("charset\n");
  CHECK_EQ(charToCode(' '), CODE_BLANK);
  CHECK_EQ(charToCode('A'), 1);
  CHECK_EQ(charToCode('Z'), 26);
  CHECK_EQ(charToCode('a'), 1);          // folds to uppercase
  CHECK_EQ(charToCode('z'), 26);
  CHECK_EQ(charToCode('1'), 27);
  CHECK_EQ(charToCode('9'), 35);
  CHECK_EQ(charToCode('0'), 36);
  CHECK_EQ(charToCode('!'), CODE_EXCLAIM);
  CHECK_EQ(charToCode('/'), CODE_SLASH);
  CHECK_EQ(charToCode('~'), -1);         // unrepresentable

  // Home flap is blank.
  CHECK_EQ(flapOrder()[kHomeFlapIndex], CODE_BLANK);
  CHECK_EQ(charToFlap(' '), kHomeFlapIndex);
  // 'A' is the flap right after blank in the default drum order.
  CHECK_EQ(charToFlap('A'), 1);
  // Codes not on the drum (e.g. '@') fall back to blank/home.
  CHECK_EQ(codeToFlap(CODE_AT), kHomeFlapIndex);
  // Round trip for every char on the drum.
  for (int i = 0; i < kFlapCount; ++i) {
    CHECK_EQ(codeToFlap(flapOrder()[i]), i);
  }
}

// ---------------------------------------------------------------------------
static void test_motion() {
  std::printf("motion\n");
  const long rev = 4096;
  const int flaps = 45;

  // No movement when already on target.
  CHECK_EQ(stepsBetweenFlaps(3, 3, flaps, rev), 0);

  // Forward one flap ~ rev/flaps steps.
  long one = stepsBetweenFlaps(0, 1, flaps, rev);
  CHECK(one >= 90 && one <= 92);  // 4096/45 = 91.02

  // Wrap-around: from the last flap back to blank is one flap forward, never
  // (flaps-1) flaps backward.
  long wrap = stepsBetweenFlaps(flaps - 1, 0, flaps, rev);
  CHECK(wrap >= 90 && wrap <= 92);

  // A full loop of single-flap moves equals exactly one revolution (no drift).
  long total = 0;
  for (int i = 0; i < flaps; ++i) {
    total += stepsBetweenFlaps(i, (i + 1) % flaps, flaps, rev);
  }
  CHECK_EQ(total, rev);

  // Absolute positions are monotonic and bounded.
  CHECK_EQ(stepForFlap(0, flaps, rev), 0);
  CHECK(stepForFlap(flaps - 1, flaps, rev) < rev);

  // Evenly divisible geometry stays exact.
  CHECK_EQ(stepsBetweenFlaps(0, 1, 40, 4000), 100);
  CHECK_EQ(stepsBetweenFlaps(39, 0, 40, 4000), 100);
}

// ---------------------------------------------------------------------------
static void test_protocol() {
  std::printf("protocol\n");

  uint8_t payload[1] = {7};
  uint8_t frame[kMaxFrame];
  size_t n = encodeFrame(5, CMD_SET_FLAP, payload, 1, frame);
  CHECK_EQ(n, 6u);                 // START,ADDR,CMD,LEN,1 payload,CRC
  CHECK_EQ(frame[0], kFrameStart);
  CHECK_EQ(frame[1], 5);
  CHECK_EQ(frame[2], CMD_SET_FLAP);
  CHECK_EQ(frame[3], 1);
  CHECK_EQ(frame[4], 7);

  // Round-trip through the decoder.
  FrameDecoder dec;
  bool got = false;
  for (size_t i = 0; i < n; ++i) got = dec.feed(frame[i]);
  CHECK(got);
  CHECK_EQ(dec.address(), 5);
  CHECK_EQ(dec.command(), CMD_SET_FLAP);
  CHECK_EQ(dec.payloadLength(), 1u);
  CHECK_EQ(dec.payload()[0], 7);

  // A corrupted payload byte must fail the CRC.
  FrameDecoder dec2;
  bool got2 = false;
  for (size_t i = 0; i < n; ++i) {
    uint8_t b = frame[i];
    if (i == 4) b ^= 0xFF;         // flip the payload
    got2 = dec2.feed(b);
  }
  CHECK(!got2);

  // Decoder resynchronises after garbage.
  FrameDecoder dec3;
  dec3.feed(0x11);
  dec3.feed(0x22);
  bool got3 = false;
  for (size_t i = 0; i < n; ++i) got3 = dec3.feed(frame[i]);
  CHECK(got3);

  // Broadcast SHOW frame with a full row of codes.
  std::vector<uint8_t> codes(kCols);
  for (int i = 0; i < kCols; ++i) codes[i] = static_cast<uint8_t>(i);
  size_t m = encodeFrame(kBroadcastAddress, CMD_SHOW, codes.data(), codes.size(), frame);
  CHECK(m > 0);
  FrameDecoder dec4;
  bool got4 = false;
  for (size_t i = 0; i < m; ++i) got4 = dec4.feed(frame[i]);
  CHECK(got4);
  CHECK_EQ(dec4.payloadLength(), (size_t)kCols);
  CHECK_EQ(dec4.payload()[kCols - 1], kCols - 1);
}

// ---------------------------------------------------------------------------
static void test_board() {
  std::printf("board\n");

  auto grid = layoutText("HI", 2, 6, Align::Left);
  CHECK_EQ(grid.size(), (size_t)12);
  CHECK_EQ(grid[0], charToCode('H'));
  CHECK_EQ(grid[1], charToCode('I'));
  CHECK_EQ(grid[2], CODE_BLANK);
  CHECK_EQ(grid[6], CODE_BLANK);         // second row empty

  // Center alignment of a 2-char word on a 6-wide line -> offset 2.
  auto c = layoutText("HI", 1, 6, Align::Center);
  CHECK_EQ(c[0], CODE_BLANK);
  CHECK_EQ(c[2], charToCode('H'));
  CHECK_EQ(c[3], charToCode('I'));

  // Right alignment.
  auto r = layoutText("HI", 1, 6, Align::Right);
  CHECK_EQ(r[4], charToCode('H'));
  CHECK_EQ(r[5], charToCode('I'));

  // Word wrap: "FOO BAR" on width 4 -> two lines.
  auto w = layoutText("FOO BAR", 2, 4, Align::Left);
  CHECK_EQ(w[0], charToCode('F'));
  CHECK_EQ(w[4], charToCode('B'));       // second row starts with BAR

  // Explicit newline.
  auto nl = layoutText("A\nB", 2, 4, Align::Left);
  CHECK_EQ(nl[0], charToCode('A'));
  CHECK_EQ(nl[4], charToCode('B'));

  // Lowercase folds; unknown chars blank.
  auto lc = layoutText("go~", 1, 6, Align::Left);
  CHECK_EQ(lc[0], charToCode('G'));
  CHECK_EQ(lc[1], charToCode('O'));
  CHECK_EQ(lc[2], CODE_BLANK);

  // A full 6x22 board is always fully sized.
  auto full = layoutText("BOTAFOGO 2 X 1 FLAMENGO", kRows, kCols, Align::Center);
  CHECK_EQ(full.size(), (size_t)(kRows * kCols));
}

// ---------------------------------------------------------------------------
int main() {
  std::printf("== split-flap core tests ==\n");
  test_charset();
  test_motion();
  test_protocol();
  test_board();

  std::printf("\n%d checks, %d failures\n", g_checks, g_failures);
  if (g_failures == 0) std::printf("ALL PASSED\n");
  return g_failures == 0 ? 0 : 1;
}
