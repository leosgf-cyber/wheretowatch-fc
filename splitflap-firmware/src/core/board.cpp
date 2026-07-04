#include "splitflap/board.h"

#include "splitflap/charset.h"

#include <sstream>

namespace splitflap {
namespace {

// Break one logical line into pieces that each fit within `cols`, wrapping on
// spaces and hard-splitting any word longer than a line.
std::vector<std::string> wrapLine(const std::string& line, int cols) {
  std::vector<std::string> out;
  std::string cur;

  std::istringstream words(line);
  std::string word;
  while (words >> word) {
    // A single word longer than the line: emit it in cols-sized chunks.
    while (static_cast<int>(word.size()) > cols) {
      if (!cur.empty()) { out.push_back(cur); cur.clear(); }
      out.push_back(word.substr(0, cols));
      word = word.substr(cols);
    }
    if (cur.empty()) {
      cur = word;
    } else if (static_cast<int>(cur.size() + 1 + word.size()) <= cols) {
      cur += ' ';
      cur += word;
    } else {
      out.push_back(cur);
      cur = word;
    }
  }
  out.push_back(cur);  // may be empty (preserves blank lines)
  return out;
}

int alignOffset(int used, int cols, Align align) {
  switch (align) {
    case Align::Center: return (cols - used) / 2;
    case Align::Right: return cols - used;
    case Align::Left: default: return 0;
  }
}

}  // namespace

std::vector<uint8_t> layoutText(const std::string& text, int rows, int cols,
                                Align align) {
  std::vector<uint8_t> grid(static_cast<size_t>(rows) * cols, CODE_BLANK);

  // Split on explicit newlines first, then word-wrap each segment.
  std::vector<std::string> lines;
  std::string segment;
  std::istringstream in(text);
  while (std::getline(in, segment)) {
    for (auto& w : wrapLine(segment, cols)) {
      lines.push_back(w);
      if (static_cast<int>(lines.size()) >= rows) break;
    }
    if (static_cast<int>(lines.size()) >= rows) break;
  }

  for (int r = 0; r < rows && r < static_cast<int>(lines.size()); ++r) {
    const std::string& line = lines[r];
    int used = static_cast<int>(line.size());
    if (used > cols) used = cols;
    int off = alignOffset(used, cols, align);

    for (int c = 0; c < used; ++c) {
      int code = charToCode(line[c]);
      grid[static_cast<size_t>(r) * cols + off + c] =
          static_cast<uint8_t>(code < 0 ? CODE_BLANK : code);
    }
  }
  return grid;
}

}  // namespace splitflap
