#pragma once
// ============================================================
//  EntityManager.h
//  SRP: Create, destroy, and recycle entity IDs only.
//  OCP: No knowledge of components — works with any pool system.
// ============================================================

#include "Entity.h"
#include <cstddef>
#include <cstdint>
#include <queue>
#include <vector>

namespace ECS {

class EntityManager {
public:
    explicit EntityManager(uint32_t initialCapacity = 1024);

    [[nodiscard]] Entity      create();
    void                      destroy(Entity e);
    [[nodiscard]] bool        isAlive(Entity e)  const noexcept;
    [[nodiscard]] std::size_t aliveCount()        const noexcept;

private:
    std::vector<uint32_t> generations_;
    std::vector<bool>     alive_;
    std::queue<uint32_t>  freeList_;

    void assertValid(Entity e) const;
};

} // namespace ECS