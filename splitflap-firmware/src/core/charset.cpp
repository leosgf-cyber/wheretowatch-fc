#include "splitflap/charset.h"

#include "splitflap/config.h"

namespace splitflap {

// Physical drum order. Position 0 is the home flap (blank). Edit this to match
// the order in which you glued the flaps onto YOUR drum, then update
// kFlapCount in config.h to match its length.
//
// Default: blank, A-Z, 1-9, 0, then a handful of common symbols. 45 flaps.
static const int8_t kFlapOrder[kFlapCount] = {
    CODE_BLANK,                                              // 0
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,              // A-M
    14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,     // N-Z
    27, 28, 29, 30, 31, 32, 33, 34, 35,                     // 1-9
    36,                                                     // 0
    CODE_HYPHEN, CODE_PERIOD, CODE_COLON, CODE_SLASH,       // - . : /
    CODE_EXCLAIM, CODE_QUESTION, CODE_DOLLAR, CODE_AMP,     // ! ? $ &
};

static_assert(sizeof(kFlapOrder) / sizeof(kFlapOrder[0]) == kFlapCount,
              "kFlapOrder length must equal kFlapCount in config.h");

const int8_t* flapOrder() { return kFlapOrder; }

int charToCode(char c) {
  // Fold lowercase to uppercase.
  if (c >= 'a' && c <= 'z') c = static_cast<char>(c - 'a' + 'A');

  if (c == ' ') return CODE_BLANK;
  if (c >= 'A' && c <= 'Z') return c - 'A' + 1;      // 1..26
  if (c >= '1' && c <= '9') return c - '1' + 27;     // 27..35
  if (c == '0') return 36;

  switch (c) {
    case '!': return CODE_EXCLAIM;
    case '@': return CODE_AT;
    case '#': return CODE_HASH;
    case '$': return CODE_DOLLAR;
    case '(': return CODE_LPAREN;
    case ')': return CODE_RPAREN;
    case '-': return CODE_HYPHEN;
    case '+': return CODE_PLUS;
    case '&': return CODE_AMP;
    case '=': return CODE_EQUAL;
    case ';': return CODE_SEMICOLON;
    case ':': return CODE_COLON;
    case '\'': return CODE_APOS;
    case '"': return CODE_QUOTE;
    case '%': return CODE_PERCENT;
    case ',': return CODE_COMMA;
    case '.': return CODE_PERIOD;
    case '/': return CODE_SLASH;
    case '?': return CODE_QUESTION;
    default: return -1;
  }
}

int codeToFlap(int code) {
  for (int i = 0; i < kFlapCount; ++i) {
    if (kFlapOrder[i] == code) return i;
  }
  return kHomeFlapIndex;  // not on this drum -> blank/home
}

int charToFlap(char c) {
  int code = charToCode(c);
  if (code < 0) return kHomeFlapIndex;
  return codeToFlap(code);
}

}  // namespace splitflap
