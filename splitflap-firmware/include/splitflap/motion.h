// motion.h — Unidirectional drum motion planning.
//
// A split-flap drum only ever turns one way. Reaching a target flap therefore
// means stepping forward (target - current) mod kFlapCount flaps. To avoid
// cumulative rounding error when kStepsPerRevolution is not divisible by the
// flap count, we work in absolute step positions on the revolution and derive
// the forward delta from there.
#ifndef SPLITFLAP_MOTION_H
#define SPLITFLAP_MOTION_H

namespace splitflap {

// Absolute step position (0..stepsPerRev-1) of a given flap index, rounded to
// the nearest whole step. Deterministic, so current/target use the same map.
long stepForFlap(int flapIndex, int flapCount, long stepsPerRev);

// Forward-only distance in steps to get from fromStep to toStep on a ring of
// stepsPerRev steps. Always in [0, stepsPerRev).
long forwardSteps(long fromStep, long toStep, long stepsPerRev);

// Steps to move forward from the current flap to the target flap. Convenience
// wrapper combining the two functions above.
long stepsBetweenFlaps(int fromFlap, int toFlap, int flapCount, long stepsPerRev);

}  // namespace splitflap

#endif  // SPLITFLAP_MOTION_H
