#pragma once
// ============================================================
//  Entity.h
//  SRP: Represent a unique, versioned entity ID only.
//  A 32-bit integer: [31..20] generation | [19..0] index
// ============================================================

#include <cstdint>
#include <functional>
#include <limits>
#include <string>

namespace ECS {

class Entity {
public:
    static constexpr uint32_t INDEX_BITS = 20u;
    static constexpr uint32_t GEN_BITS   = 12u;
    static constexpr uint32_t INDEX_MASK = (1u << INDEX_BITS) - 1u;
    static constexpr uint32_t MAX_INDEX  = INDEX_MASK;
    static constexpr uint32_t MAX_GEN    = (1u << GEN_BITS) - 1u;
    static constexpr uint32_t INVALID_ID = std::numeric_limits<uint32_t>::max();

    Entity() noexcept;
    static Entity create(uint32_t index, uint32_t generation) noexcept;

    [[nodiscard]] uint32_t    index()      const noexcept;
    [[nodiscard]] uint32_t    generation() const noexcept;
    [[nodiscard]] uint32_t    raw()        const noexcept;
    [[nodiscard]] bool        isValid()    const noexcept;
    [[nodiscard]] std::string toString()   const;

    bool operator==(const Entity& o) const noexcept;
    bool operator!=(const Entity& o) const noexcept;
    bool operator< (const Entity& o) const noexcept;

private:
    uint32_t id_;
};

} // namespace ECS

namespace std {
    template<>
    struct hash<ECS::Entity> {
        size_t operator()(const ECS::Entity& e) const noexcept {
            return std::hash<uint32_t>{}(e.raw());
        }
    };
}