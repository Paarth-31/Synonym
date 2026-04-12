#pragma once
// ============================================================
//  MovementSystem.h
//  SRP: Advance entity positions by velocity each tick only.
//  OCP: Adding friction/damping = new component + new system.
// ============================================================

#include "ISystem.h"
#include <string>

namespace ECS {

class MovementSystem final : public ISystem {
public:
    void update(World& world, float deltaTime) override;
    [[nodiscard]] std::string name() const override;
};

} // namespace ECS