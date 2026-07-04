# Native build for the platform-independent core + unit tests.
# This does NOT build firmware (that's PlatformIO's job — see platformio.ini).
# It lets you develop and test the charset/motion/protocol/board logic on your
# desktop with a normal C++ toolchain.
#
#   cmake -S . -B build && cmake --build build && ctest --test-dir build
cmake_minimum_required(VERSION 3.16)
project(splitflap_core LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
add_compile_options(-Wall -Wextra)

add_library(splitflap_core
  src/core/charset.cpp
  src/core/motion.cpp
  src/core/protocol.cpp
  src/core/board.cpp)
target_include_directories(splitflap_core PUBLIC include)

enable_testing()
add_executable(core_tests test/test_main.cpp)
target_link_libraries(core_tests PRIVATE splitflap_core)
add_test(NAME core_tests COMMAND core_tests)
