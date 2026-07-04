#!/usr/bin/env python3
"""push.py — send a message to the split-flap board.

Two transports:
  * HTTP  — talk to the ESP32 master's REST API (default).
  * serial — talk to the master (or directly to the bus) over a USB serial port,
             emitting the same binary frame format the firmware uses.

Examples:
  ./push.py "BOTAFOGO 2 X 1 FLAMENGO"
  ./push.py --host 192.168.0.42 --align left "NEXT MATCH 20H"
  ./push.py --serial /dev/ttyUSB0 "HELLO"
  ./push.py --home

The character/flap model mirrors include/splitflap/charset.h so what you preview
here is exactly what the board will show.
"""
import argparse
import sys

# Vestaboard-compatible code map (must match src/core/charset.cpp).
_CODES = {" ": 0}
for i, ch in enumerate("ABCDEFGHIJKLMNOPQRSTUVWXYZ", start=1):
    _CODES[ch] = i
for i, ch in enumerate("123456789", start=27):
    _CODES[ch] = i
_CODES["0"] = 36
_CODES.update({"!": 37, "@": 38, "#": 39, "$": 40, "(": 41, ")": 42,
               "-": 44, "+": 46, "&": 47, "=": 48, ";": 49, ":": 50,
               "'": 52, '"': 53, "%": 54, ",": 55, ".": 56, "/": 59, "?": 60})

ROWS, COLS = 6, 22


def char_to_code(ch):
    return _CODES.get(ch.upper(), 0)


def wrap_line(line, cols):
    out, cur = [], ""
    for word in line.split():
        while len(word) > cols:
            if cur:
                out.append(cur)
                cur = ""
            out.append(word[:cols])
            word = word[cols:]
        if not cur:
            cur = word
        elif len(cur) + 1 + len(word) <= cols:
            cur += " " + word
        else:
            out.append(cur)
            cur = word
    out.append(cur)
    return out


def layout(text, rows=ROWS, cols=COLS, align="center"):
    lines = []
    for seg in text.split("\n"):
        for w in wrap_line(seg, cols):
            lines.append(w)
            if len(lines) >= rows:
                break
        if len(lines) >= rows:
            break
    grid = [[0] * cols for _ in range(rows)]
    for r, line in enumerate(lines[:rows]):
        line = line[:cols]
        if align == "center":
            off = (cols - len(line)) // 2
        elif align == "right":
            off = cols - len(line)
        else:
            off = 0
        for c, ch in enumerate(line):
            grid[r][off + c] = char_to_code(ch)
    return grid


def preview(grid):
    inv = {v: k for k, v in _CODES.items()}
    border = "+" + "-" * COLS + "+"
    print(border)
    for row in grid:
        print("|" + "".join(inv.get(v, "?") if v else " " for v in row) + "|")
    print(border)


def send_http(host, text, align):
    import urllib.request
    url = f"http://{host}/message?align={align}"
    req = urllib.request.Request(url, data=text.encode("utf-8"), method="POST")
    with urllib.request.urlopen(req, timeout=5) as resp:
        return resp.read().decode().strip()


def http_home(host):
    import urllib.request
    req = urllib.request.Request(f"http://{host}/home", data=b"", method="POST")
    with urllib.request.urlopen(req, timeout=5) as resp:
        return resp.read().decode().strip()


def crc8(data):
    crc = 0
    for b in data:
        inbyte = b
        for _ in range(8):
            mix = (crc ^ inbyte) & 1
            crc >>= 1
            if mix:
                crc ^= 0x8C
            inbyte >>= 1
    return crc


def encode_frame(addr, cmd, payload=b""):
    body = bytes([addr, cmd, len(payload)]) + payload
    return bytes([0x7E]) + body + bytes([crc8(body)])


def send_serial(port, grid, home):
    import serial  # pyserial; pip install pyserial
    codes = bytes(v for row in grid for v in row)
    with serial.Serial(port, 57600, timeout=1) as ser:
        if home:
            ser.write(encode_frame(0, 0x03))          # CMD_HOME broadcast
        ser.write(encode_frame(0, 0x04, codes))       # CMD_SHOW broadcast


def main(argv=None):
    ap = argparse.ArgumentParser(description="Push a message to the split-flap board.")
    ap.add_argument("text", nargs="?", default="", help="message to display")
    ap.add_argument("--host", default="splitflap.local", help="master HTTP host/IP")
    ap.add_argument("--serial", help="serial port (e.g. /dev/ttyUSB0) instead of HTTP")
    ap.add_argument("--align", choices=["left", "center", "right"], default="center")
    ap.add_argument("--home", action="store_true", help="re-home before displaying")
    ap.add_argument("--preview", action="store_true", help="print an ASCII preview only")
    args = ap.parse_args(argv)

    grid = layout(args.text, align=args.align)

    if args.preview or not args.text and not args.home:
        preview(grid)
        if args.preview:
            return 0

    try:
        if args.serial:
            send_serial(args.serial, grid, args.home)
            print("sent over serial")
        elif args.home and not args.text:
            print(http_home(args.host))
        else:
            if args.home:
                http_home(args.host)
            print(send_http(args.host, args.text, args.align))
    except Exception as exc:  # noqa: BLE001 — CLI: surface any transport error
        print(f"error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
