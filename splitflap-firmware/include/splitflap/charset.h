// charset.h — Character set and physical flap ordering.
//
// Two distinct concepts live here, and keeping them separate is the whole point:
//
//   * "code"  — a stable logical id for a glyph. We use the Vestaboard code map
//               (0=blank, 1..26=A..Z, 27..36=1..9,0, then symbols/colours) so a
//               real Vestaboard, a host tool, and this firmware all agree.
//
//   * "flap"  — the physical position of a glyph on the drum, 0..kFlapCount-1.
//               This depends on how YOU assembled the vinyl flaps. Motion is
//               planned in flap space; text is authored in code space.
//
// codeToFlap() bridges the two. Glyphs not present on the drum fall back to blank.
#ifndef SPLITFLAP_CHARSET_H
#define SPLITFLAP_CHARSET_H

#include <cstdint>

namespace splitflap {

// Vestaboard-compatible logical codes.
enum Code : int8_t {
  CODE_BLANK = 0,
  // 1..26  -> A..Z
  // 27..35 -> 1..9
  // 36     -> 0
  CODE_EXCLAIM = 37,   // !
  CODE_AT = 38,        // @
  CODE_HASH = 39,      // #
  CODE_DOLLAR = 40,    // $
  CODE_LPAREN = 41,    // (
  CODE_RPAREN = 42,    // )
  CODE_HYPHEN = 44,    // -
  CODE_PLUS = 46,      // +
  CODE_AMP = 47,       // &
  CODE_EQUAL = 48,     // =
  CODE_SEMICOLON = 49, // ;
  CODE_COLON = 50,     // :
  CODE_APOS = 52,      // '
  CODE_QUOTE = 53,     // "
  CODE_PERCENT = 54,   // %
  CODE_COMMA = 55,     // ,
  CODE_PERIOD = 56,    // .
  CODE_SLASH = 59,     // /
  CODE_QUESTION = 60,  // ?
  CODE_DEGREE = 62,    // (degree)
  // 63..71 -> colour tiles (red, orange, yellow, green, blue, violet, white,
  //           black, filled). Present in the code map but usually not on a
  //           DIY drum, so they map to blank unless you add them to kFlapOrder.
};

// ASCII char -> Vestaboard code. Lowercase folds to uppercase. Returns -1 for
// characters with no representable code (caller should substitute blank).
int charToCode(char c);

// Physical drum layout: kFlapOrder[i] is the logical code of the flap that sits
// at physical position i. Position kHomeFlapIndex is where homing lands.
// Defined in charset.cpp; its length is kFlapCount (checked by a static_assert).
extern const int8_t* flapOrder();

// Logical code -> physical flap index. Codes absent from the drum return 0
// (blank), which is always present at the home position.
int codeToFlap(int code);

// Convenience: ASCII char straight to a physical flap index.
int charToFlap(char c);

}  // namespace splitflap

#endif  // SPLITFLAP_CHARSET_H
