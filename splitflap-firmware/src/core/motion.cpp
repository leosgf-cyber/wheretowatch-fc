#include "splitflap/motion.h"

namespace splitflap {

long stepForFlap(int flapIndex, int flapCount, long stepsPerRev) {
  if (flapCount <= 0) return 0;
  // Round-to-nearest integer step: (flap * stepsPerRev + flapCount/2) / flapCount.
  // Using long long guards the intermediate product on 8-bit targets.
  long long num = static_cast<long long>(flapIndex) * stepsPerRev + flapCount / 2;
  return static_cast<long>(num / flapCount);
}

long forwardSteps(long fromStep, long toStep, long stepsPerRev) {
  if (stepsPerRev <= 0) return 0;
  long delta = (toStep - fromStep) % stepsPerRev;
  if (delta < 0) delta += stepsPerRev;
  return delta;
}

long stepsBetweenFlaps(int fromFlap, int toFlap, int flapCount, long stepsPerRev) {
  long from = stepForFlap(fromFlap, flapCount, stepsPerRev);
  long to = stepForFlap(toFlap, flapCount, stepsPerRev);
  return forwardSteps(from, to, stepsPerRev);
}

}  // namespace splitflap
