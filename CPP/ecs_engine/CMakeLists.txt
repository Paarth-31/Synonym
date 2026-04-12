cmake_minimum_required(VERSION 3.16)
project(ECSEngine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# All source files
set(SOURCES
    main.cpp
    src/Entity.cpp
    src/EntityManager.cpp
    src/Components.cpp
    src/World.cpp
    src/MovementSystem.cpp
    src/LifetimeSystem.cpp
    src/CombatSystem.cpp
    src/RenderSystem.cpp
)

add_executable(ecs_demo ${SOURCES})
target_include_directories(ecs_demo PRIVATE ${CMAKE_SOURCE_DIR}/include)

# Strict warnings
target_compile_options(ecs_demo PRIVATE
    $<$<CXX_COMPILER_ID:GNU,Clang>:-Wall -Wextra -Wpedantic>
    $<$<CXX_COMPILER_ID:MSVC>:/W4>
)

# Sanitizer build type
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_compile_options(ecs_demo PRIVATE -fsanitize=address,undefined)
    target_link_options(ecs_demo PRIVATE -fsanitize=address,undefined)
endif()