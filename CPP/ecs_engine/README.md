# ECS Game Engine Core

A production-structured, header-split Entity-Component-System (ECS) engine written in modern **C++20**.  
Zero external dependencies · ~1 100 lines · 22 files · compiles with zero warnings on GCC and Clang.

---

## Directory Structure

```
ecs_engine/
├── main.cpp                  Composition root — wires everything together
├── CMakeLists.txt            CMake build script (C++20, warnings, sanitizers)
│
├── include/                  Public API — declarations and interface contracts
│   ├── Entity.h              Versioned 32-bit entity ID
│   ├── EntityManager.h       Creates, destroys, and recycles entity slots
│   ├── TypeId.h              Compile-time unique integer per C++ type  [*]
│   ├── IComponentPool.h      Type-erased abstract pool interface
│   ├── ComponentPool.h       Sparse-set storage for one component type  [*]
│   ├── ISystem.h             Abstract system interface
│   ├── World.h               Central registry — entities, pools, systems  [†]
│   ├── Components.h          Pure-data structs + aabbOverlaps free function
│   ├── MovementSystem.h      Moves entities by velocity
│   ├── LifetimeSystem.h      Expires time-limited entities
│   ├── CombatSystem.h        Applies damage on AABB collision
│   └── RenderSystem.h        ANSI terminal renderer
│
└── src/                      Implementations — one .cpp per .h
    ├── Entity.cpp
    ├── EntityManager.cpp
    ├── Components.cpp        Vec2 operators, Health helpers, aabbOverlaps
    ├── World.cpp             Non-template World methods
    ├── MovementSystem.cpp
    ├── LifetimeSystem.cpp
    ├── CombatSystem.cpp
    └── RenderSystem.cpp

[*] Header-only: template bodies must be visible at every instantiation site.
[†] Declarations in .h, non-template bodies in World.cpp, template
    bodies inlined at the bottom of World.h (C++ language requirement).
```

---

## Why Some Headers Are Header-Only

C++ compiles each `.cpp` independently. When you write `world.addComponent<Health>(e, ...)`, the
compiler must generate machine code for `addComponent<Health>` right there in that translation unit.
It can only do that if the full template body is visible — i.e., in the `.h` file.

| File | Split? | Reason |
|---|---|---|
| `TypeId.h` | Header-only | `TypeId<T>` is a class template |
| `ComponentPool.h` | Header-only | `ComponentPool<T>` is a class template |
| `World.h` | Partial | Non-template methods → `World.cpp`; template methods inline in `.h` |
| All other files | Fully split | Concrete classes with no templates |

---

## Build

### CMake (recommended)

```bash
# Release build
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
./build/ecs_demo

# Debug build with Address + UndefinedBehaviour sanitizers
cmake -B build_dbg -DCMAKE_BUILD_TYPE=Debug
cmake --build build_dbg
./build_dbg/ecs_demo
```

### Manual (GCC / Clang)

```bash
g++ -std=c++20 -Wall -Wextra -Wpedantic -O2 -I include \
    main.cpp \
    src/Entity.cpp \
    src/EntityManager.cpp \
    src/Components.cpp \
    src/World.cpp \
    src/MovementSystem.cpp \
    src/LifetimeSystem.cpp \
    src/CombatSystem.cpp \
    src/RenderSystem.cpp \
    -o ecs_demo

./ecs_demo
```

---

## Architecture

### The Three Pillars

| Concept | Role | Rule |
|---|---|---|
| **Entity** | An ID, nothing more | No data, no pointers |
| **Component** | Data, nothing more | No logic, no virtual |
| **System** | Logic, nothing more | No state of its own |

A "player" is not a class. It is an entity with these components attached:

```
Entity 0  ←  Transform + Velocity + Health + Collider + Renderable + PlayerTag + Name
Entity 1  ←  Transform + Collider + Health + Renderable + EnemyTag + Damage + Name
Entity 3  ←  Transform + Velocity + Collider + Renderable + ProjectileTag + Lifetime + Name
```

### Entity ID — Bit Layout

```
 31          20 19              0
 ┌────────────┬─────────────────┐
 │ generation │      index      │
 │  (12 bits) │    (20 bits)    │
 └────────────┴─────────────────┘

Max entities alive simultaneously : 1 048 575
Max recycles per slot before wrap : 4 095
```

When an entity is destroyed, its **generation** increments. Any stale handle
(`Entity` object) still pointing at that slot holds an old generation value and
will fail `isAlive()` — no silent use-after-free.

### ComponentPool — Sparse Set

```
                 Index:  0     1     2     3     4
sparse_         [ INVAL ][ 0  ][ 1  ][ INVAL ][ INVAL ]  ← indexed by entity.index()
                           │     │
                           ▼     ▼
dense_          [ E1  ][ E2  ]                            ← packed, no holes
components_     [ T1  ][ T2  ]                            ← parallel packed data
```

Operations: `add`, `remove`, `contains` — all **O(1)**.  
Iteration: single linear scan over `components_[]` — **cache-friendly**.

Generation safety: `contains(e)` verifies `dense_[pos] == e` (all 32 bits).
A recycled slot with a new entity never leaks its component to a stale handle.

### World::query — Variadic Template Intersection

```cpp
world.query<Transform, Velocity>(
    [](Entity e, Transform& tf, const Velocity& vel) {
        tf.position += vel.direction * vel.speed * dt;
    });
```

Internally iterates the `Transform` pool (smallest primary), then tests
`hasComponent<Velocity>(e)` for each candidate. Only entities passing every
predicate receive the lambda call. The entity list is **snapshotted** before
iteration, so adding/removing components inside the lambda is safe.

### Request Lifecycle — One Game Tick

```
World::update(dt)
  │
  ├─► MovementSystem::update()    query<Transform, Velocity>
  │       position += dir * speed * dt
  │
  ├─► LifetimeSystem::update()    query<Lifetime>
  │       remaining -= dt
  │       expired? → queueDestroy(e)
  │
  ├─► CombatSystem::update()      query<EnemyTag, Damage, Collider, Transform>
  │       ↳ inner query<Health, Collider, Transform>
  │           overlap? → hp -= dmg; isDead? → queueDestroy(e)
  │
  ├─► RenderSystem::update()      query<Transform, Renderable>
  │       stable_sort by zLayer → print ANSI glyphs
  │
  └─► World::flushDestroyed()
          snapshot pendingDestroy_ → clear set → destroyEntity each
```

---

## File-by-File Reference

### `include/Entity.h` + `src/Entity.cpp`

Defines the `Entity` value type. An entity IS its ID — a `uint32_t`
encoding index and generation. Provides `operator==`, `operator<`, and a
`std::hash` specialisation so `Entity` works directly in `unordered_map` /
`unordered_set`. Carries no component data and no pointers.  
Fully split: `.h` declares, `.cpp` defines all methods.

### `include/EntityManager.h` + `src/EntityManager.cpp`

Creates entities from a slot pool, recycles destroyed slots via an
`std::queue<uint32_t>` free-list, and bumps the generation counter on
destroy. `aliveCount()` is O(1) (size minus free-list size).  
Fully split.

### `include/TypeId.h` (header-only)

Maps each C++ type to a unique `std::size_t` at program startup.
Uses an `std::atomic` counter — thread-safe at static initialisation.
No RTTI, no `typeid`, no macros.  
`typeId<const Health&>()` strips cv-qualifiers and references before lookup,
so `typeId<Health>() == typeId<const Health&>()`.

### `include/IComponentPool.h`

Three pure-virtual methods: `remove()`, `contains()`, `size()`.
`World` stores `unique_ptr<IComponentPool>` so it is fully decoupled from
every concrete component type (DIP).  
Fully declarative — no `.cpp` needed for a pure interface.

### `include/ComponentPool.h` (header-only)

Sparse-set storage templated on `T`. Must be header-only — the compiler
generates a separate specialisation for each component type at each
call site. Highlights:

- `emplace<Args...>()` — in-place construction, throws on duplicate
- `tryGet()` — non-throwing, generation-safe (returns nullptr for stale handles)
- `remove()` — swap-and-pop keeps the dense array gapless
- `contains()` — O(1), full 32-bit entity ID comparison

### `include/ISystem.h`

Two pure-virtual methods: `update(World&, float)` and `name()`.  
Optional `isEnabled()` / `setEnabled()` allow per-system pause
(e.g. pause physics in a menu) without touching `World`.

### `include/World.h` + `src/World.cpp`

The composition hub. Non-template methods (`createEntity`, `destroyEntity`,
`queueDestroy`, `flushDestroyed`, `addSystem`, `update`) live in `World.cpp`.
Template methods (`addComponent<T>`, `getComponent<T>`, `query<Ts...>` etc.)
are inlined at the bottom of `World.h` — required by the C++ standard.

Key design points:
- **Deferred destroy**: `queueDestroy(e)` inserts into `unordered_set<Entity>`
  (deduplicates). `flushDestroyed()` snapshots into a `vector`, clears the set,
  then destroys — avoiding iterator invalidation UB.
- **Injected logger**: `World` accepts a `LogFn` callback and has zero
  `#include <iostream>` dependency.
- **Lazy pool creation**: pools are created on first `addComponent<T>()` call.

### `include/Components.h` + `src/Components.cpp`

All components are plain structs — no virtual, no inheritance, no mutable
side-effects. Method exceptions:

- `Health::isDead()` / `Health::percentage()` — pure computed properties, no
  state change. Acceptable on a data struct; avoids duplicating the formula
  in every system.
- `Vec2` operators and `toString()` — math helpers, no state change.
- `aabbOverlaps()` — **free function**, not a Collider method. Collision logic
  is behaviour; it belongs outside the data struct (SRP).
- `Damage::timeSinceLastHit` defaults to `std::numeric_limits<float>::max()`
  — explicit intent, no magic numbers.

### System files (`.h` + `.cpp` pairs)

Each system declares its class in `.h` and defines `update()` in `.cpp`.
The `.h` file `#include`s only `ISystem.h` (forward-declared `World`).
The `.cpp` file `#include`s `World.h` and `Components.h` — so changes to
components only force recompilation of system `.cpp` files, not all headers.

| System | Query | Action |
|---|---|---|
| `MovementSystem` | `Transform, Velocity` | `position += dir * speed * dt` |
| `LifetimeSystem` | `Lifetime` | decrement timer; queue destroy on expiry |
| `CombatSystem` | `EnemyTag, Damage, Collider, Transform` × `Health, Collider, Transform` | AABB test → apply damage → queue destroy if dead |
| `RenderSystem` | `Transform, Renderable` | collect, stable_sort by zLayer, print ANSI |

### `main.cpp`

The **composition root** — the only file that knows about all concrete types.
Factory functions (`spawnPlayer`, `spawnEnemy`, `spawnProjectile`) compose
entities from components. `ecsLog` is injected into `World` at construction
(DIP: `World` never calls `std::cout` directly).

---

## SOLID Principles Applied

### S — Single Responsibility

Every class has exactly one reason to change:

| Class | Its single job |
|---|---|
| `Entity` | Encode and compare a versioned slot ID |
| `EntityManager` | Allocate and recycle entity slots |
| `TypeId<T>` | Map a C++ type to a unique integer |
| `ComponentPool<T>` | Store one component type for all entities |
| `ISystem` / `IComponentPool` | Define contracts, nothing else |
| `World` | Route queries between pools and systems |
| Each `System` | One specific gameplay behaviour |

`Collider` carries no collision logic — `aabbOverlaps()` is a free function.

---

### O — Open / Closed

Open for extension, closed for modification.

Adding a new **component**:
```cpp
// 1. Add to Components.h — zero other files change
struct Inventory { std::vector<std::string> items; };
```

Adding a new **system**:
```cpp
// 2. Create InventorySystem.h + InventorySystem.cpp
// 3. Register in main.cpp:
world.emplaceSystem<InventorySystem>();
// World.h, ISystem.h, all other systems — untouched.
```

---

### L — Liskov Substitution

`ComponentPool<T>` substitutes `IComponentPool` transparently:
```cpp
IComponentPool* pool = new ComponentPool<Health>();
pool->remove(e);      // correct sparse-set removal
pool->contains(e);    // correct generation-safe check
pool->size();         // correct dense array count
```

Every concrete system substitutes `ISystem` in `World::update()` —
the loop calls `sys->update(*this, dt)` identically for all of them.

---

### I — Interface Segregation

Interfaces are as small as possible:

- `IComponentPool` — 3 methods (only what `World` needs for type erasure)
- `ISystem` — 2 pure-virtual methods (`update`, `name`) + 2 non-virtual helpers
- Tag structs (`PlayerTag`, `EnemyTag`, `ProjectileTag`) — zero methods, zero data

---

### D — Dependency Inversion

High-level modules depend on abstractions, not concretions:

| Module | Depends on | NOT on |
|---|---|---|
| `World` | `IComponentPool` | `ComponentPool<Health>`, `ComponentPool<Transform>`, … |
| `World` | `ISystem` | `MovementSystem`, `CombatSystem`, … |
| `World` | `LogFn` callback | `std::cout` / `std::cerr` |
| Each `System` | `World` public API | Individual pool internals |
| `main.cpp` | Everything concrete | (this IS the composition root) |

---

## C++ Features Used

| Feature | Where | Purpose |
|---|---|---|
| Class templates `template<typename T>` | `ComponentPool<T>`, `World::addComponent<T>` | Type-safe, zero-overhead storage |
| Variadic templates `typename... Ts` | `World::query<Ts...>` | Multi-component intersection query |
| Fold expressions `(expr && ...)` | `World::queryImpl` | Check all component types in one expression |
| `[[nodiscard]]` | `isAlive()`, `createEntity()`, all pool accessors | Compiler error if return value silently discarded |
| `noexcept` | All read-only accessors | Documents + enables optimizer to skip EH machinery |
| `std::unique_ptr` | Pools and systems in `World` | RAII ownership, no manual `delete` |
| `std::unordered_set<Entity>` | `pendingDestroy_` | O(1) insert/lookup + automatic deduplication |
| `std::function<void(string)>` | `LogFn` in `World` | Type-erased injected logger (DIP) |
| Move semantics | `ComponentPool::remove()` swap-and-pop | No copy of component data when compacting |
| `std::stable_sort` | `RenderSystem` | Deterministic draw order for equal-z entities |
| `std::numeric_limits<float>::max()` | `Damage::timeSinceLastHit` | Self-documenting default — no magic numbers |
| `std::atomic<std::size_t>` | `TypeId` counter | Thread-safe type registration at startup |
| `std::ostringstream` + `setprecision` | `Vec2::toString()` | Clean 2-decimal output |
| `#pragma once` | All headers | Include guard without boilerplate |
| `forward<Args>(args)...` | `ComponentPool::emplace`, `World::addComponent` | Perfect forwarding for in-place construction |

---

## Known Limitations and Extensions

| Limitation | Suggested extension |
|---|---|
| Single-threaded query | `std::execution::par` on the snapshot `vector` |
| O(n×m) collision in `CombatSystem` | Spatial hash or BVH broad-phase |
| `unordered_map` pool lookup per type | Cache pool pointer on first access |
| No event / observer system | `EventBus<EventT>` for cross-system communication |
| No scene serialization | Add `serialize(std::ostream&)` virtual to `IComponentPool` |
| Logger is `std::function` (heap alloc) | Template the logger type for zero-cost stack lambdas |
| No archetype storage | Group entities by component signature for multi-query cache locality |