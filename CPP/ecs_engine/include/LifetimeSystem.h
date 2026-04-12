#pragma once
// ============================================================
//  LifetimeSystem.h
//  SRP: Expire and queue-destroy time-limited entities only.
// ============================================================

#include "ISystem.h"
#include <string>

namespace ECS {

class LifetimeSystem final : public ISystem {
public:
    void update(World& world, float deltaTime) override;
    [[nodiscard]] std::string name() const override;
};

} // namespace ECS