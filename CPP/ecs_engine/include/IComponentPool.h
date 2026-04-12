#pragma once
// ============================================================
//  IComponentPool.h
//  ISP: Minimal interface — only what World needs for
//       type-erased component management.
//  DIP: World holds unique_ptr<IComponentPool> — no concrete
//       component type leaks into World.
//  LSP: Any ComponentPool<T> transparently replaces this base.
// ============================================================

#include "Entity.h"
#include <cstddef>

namespace ECS {

class IComponentPool {
public:
    virtual ~IComponentPool() = default;

    virtual void                      remove(Entity e)              = 0;
    [[nodiscard]] virtual bool        contains(Entity e) const noexcept = 0;
    [[nodiscard]] virtual std::size_t size()             const noexcept = 0;
};

} // namespace ECS