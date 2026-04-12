#pragma once
// ============================================================
//  Components.h
//  Components are PURE DATA: no logic, no virtual, no inheritance.
//  All behaviour lives in Systems (SRP).
//  Utility: Vec2, free function aabbOverlaps, tag structs.
// ============================================================

#include <cmath>
#include <limits>
#include <string>

namespace ECS {

// ── Vec2 ─────────────────────────────────────────────────────
struct Vec2 {
    float x{0.f}, y{0.f};

    Vec2  operator+(const Vec2& o) const noexcept;
    Vec2  operator-(const Vec2& o) const noexcept;
    Vec2  operator*(float s)       const noexcept;
    Vec2& operator+=(const Vec2& o) noexcept;
    Vec2& operator-=(const Vec2& o) noexcept;
    Vec2& operator*=(float s)       noexcept;

    [[nodiscard]] float length()    const noexcept;
    [[nodiscard]] Vec2  normalise() const noexcept;
    [[nodiscard]] std::string toString() const;  // fixed 2 dp, e.g. "(95.00, 100.00)"
};

// ── Transform ────────────────────────────────────────────────
struct Transform {
    Vec2  position{};
    float rotation{0.f};   // radians
    float scale{1.f};
};

// ── Velocity ─────────────────────────────────────────────────
struct Velocity {
    Vec2  direction{};     // must be a unit vector
    float speed{0.f};      // world-units per second
};

// ── Health ───────────────────────────────────────────────────
struct Health {
    float current{100.f};
    float maximum{100.f};

    [[nodiscard]] bool  isDead()     const noexcept;
    [[nodiscard]] float percentage() const noexcept;
};

// ── Damage ───────────────────────────────────────────────────
struct Damage {
    float amount{0.f};
    float cooldown{0.f};
    // max() = ready to fire immediately; no magic-number initialiser.
    float timeSinceLastHit{std::numeric_limits<float>::max()};
};

// ── Collider (pure data) ─────────────────────────────────────
// Collision logic lives in aabbOverlaps() below — not here (SRP).
struct Collider {
    Vec2 halfExtents{16.f, 16.f};
    bool isTrigger{false};
};

// ── Free function: AABB overlap ───────────────────────────────
// Belongs here (not in Collider) so Collider stays pure data.
[[nodiscard]] bool aabbOverlaps(
    const Vec2& posA, const Collider& ca,
    const Vec2& posB, const Collider& cb) noexcept;

// ── Renderable ───────────────────────────────────────────────
struct Renderable {
    char symbol{'?'};
    int  colorCode{37};  // ANSI terminal color code
    int  zLayer{0};
};

// ── Tags (zero-size markers, ISP) ────────────────────────────
struct PlayerTag     {};
struct EnemyTag      {};
struct ProjectileTag {};

// ── Lifetime ─────────────────────────────────────────────────
struct Lifetime {
    float remaining{5.f};
};

// ── Name ─────────────────────────────────────────────────────────
struct Name {
    std::string value;
};

} // namespace ECS