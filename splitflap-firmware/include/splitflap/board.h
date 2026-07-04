// board.h — Text -> board layout.
//
// Turns a human string into a rows*cols grid of Vestaboard codes, applying the
// constraints of a physical board: uppercase only, word wrapping, per-line
// alignment, and explicit '\n' line breaks. The result is a flat code buffer in
// row-major order that the master broadcasts (CMD_SHOW) or splits per module.
#ifndef SPLITFLAP_BOARD_H
#define SPLITFLAP_BOARD_H

#include <cstdint>
#include <string>
#include <vector>

namespace splitflap {

enum class Align { Left, Center, Right };

// Render `text` into a rows*cols grid of logical codes (row-major).
//
//  * Characters fold to uppercase; anything with no code becomes blank.
//  * '\n' forces a new line.
//  * Lines longer than `cols` wrap on word boundaries; a single word longer
//    than a line is hard-split.
//  * Text taller than `rows` is truncated (extra lines dropped).
//
// The returned vector always has exactly rows*cols entries.
std::vector<uint8_t> layoutText(const std::string& text, int rows, int cols,
                                Align align = Align::Left);

}  // namespace splitflap

#endif  // SPLITFLAP_BOARD_H
