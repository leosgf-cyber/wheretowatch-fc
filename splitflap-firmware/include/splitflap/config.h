// config.h — Hardware/board configuration for the split-flap system.
//
// Everything installation-specific lives here so the rest of the firmware
// stays generic. These values are compile-time constants shared by the master
// and by every module; keep the two builds in sync (or, better, flash the same
// config.h to both). All of this is plain C++ so it also compiles on the host
// for the native unit tests.
#ifndef SPLITFLAP_CONFIG_H
#define SPLITFLAP_CONFIG_H

#include <cstdint>

namespace splitflap {

// ---------------------------------------------------------------------------
// Board geometry
// ---------------------------------------------------------------------------
// A Vestaboard is 6 rows x 22 columns = 132 modules. Change to match your build.
constexpr int kRows = 6;
constexpr int kCols = 22;
constexpr int kModuleCount = kRows * kCols;

// ---------------------------------------------------------------------------
// Drum / stepper geometry (per module)
// ---------------------------------------------------------------------------
// 28BYJ-48 in half-step mode = 4096 steps per output revolution.
// If you use a NEMA-17 with a driver at 1/16 microstepping and a gear ratio,
// set the effective steps-per-drum-revolution here.
constexpr long kStepsPerRevolution = 4096;

// Number of physical flaps on the drum. Must equal the length of kFlapOrder
// (see charset.h). Common DIY drums have 40-45 flaps.
constexpr int kFlapCount = 45;

// The home (Hall sensor) position corresponds to this flap index on the drum.
// After homing, the module assumes it is sitting on kFlapOrder[kHomeFlapIndex].
constexpr int kHomeFlapIndex = 0;  // flap 0 == blank

// Motion timing. Split-flap drums are unidirectional: the drum only ever turns
// forward, so a "move" is always (target - current) mod kFlapCount flaps.
constexpr uint16_t kStepIntervalMicros = 1200;  // between coil steps
constexpr uint16_t kHomingStepIntervalMicros = 1500;
constexpr int kMaxHomingSteps = kStepsPerRevolution * 2;  // safety cutoff

// ---------------------------------------------------------------------------
// Bus / addressing
// ---------------------------------------------------------------------------
// Each module has a unique 1-based address (0 is reserved for broadcast).
constexpr uint8_t kBroadcastAddress = 0;
constexpr long kBusBaudRate = 57600;

}  // namespace splitflap

#endif  // SPLITFLAP_CONFIG_H
