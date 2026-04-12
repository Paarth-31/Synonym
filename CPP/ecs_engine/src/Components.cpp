#include "../include/Components.h"
#include <cmath>
#include <iomanip>
#include <sstream>

namespace ECS {

// ── Vec2 implementations ─────────────────────────────────────
Vec2  Vec2::operator+(const Vec2& o) const noexcept { return {x + o.x, y + o.y}; }
Vec2  Vec2::operator-(const Vec2& o) const noexcept { return {x - o.x, y - o.y}; }
Vec2  Vec2::operator*(float s)       const noexcept { return {x * s,   y * s  }; }

Vec2& Vec2::operator+=(const Vec2& o) noexcept { x += o.x; y += o.y; return *this; }
Vec2& Vec2::operator-=(const Vec2& o) noexcept { x -= o.x; y -= o.y; return *this; }
Vec2& Vec2::operator*=(float s)       noexcept { x *= s;   y *= s;   return *this; }

float Vec2::length() const noexcept { return std::sqrt(x * x + y * y); }

Vec2 Vec2::normalise() const noexcept {
    const float l = length();
    return l > 0.f ? Vec2{x / l, y / l} : Vec2{};
}

std::string Vec2::toString() const {
    std::ostringstream ss;
    ss << std::fixed << std::setprecision(2) << "(" << x << ", " << y << ")";
    return ss.str();
}

// ── Health implementations ────────────────────────────────────
bool  Health::isDead()     const noexcept { return current <= 0.f; }
float Health::percentage() const noexcept { return current / maximum; }

// ── Free function: AABB overlap ───────────────────────────────
bool aabbOverlaps(
    const Vec2& posA, const Collider& ca,
    const Vec2& posB, const Collider& cb) noexcept
{
    return std::abs(posA.x - posB.x) < (ca.halfExtents.x + cb.halfExtents.x)
        && std::abs(posA.y - posB.y) < (ca.halfExtents.y + cb.halfExtents.y);
}

} // namespace ECS