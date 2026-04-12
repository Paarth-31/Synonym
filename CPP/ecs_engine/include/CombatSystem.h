#pragma once
// ============================================================
//  CombatSystem.h
//  SRP: Apply damage on AABB collision. Mark dead entities for
//       deferred removal. No knowledge of rendering or movement.
// ============================================================

#include "ISystem.h"
#include <string>

namespace ECS {

class CombatSystem final : public ISystem {
public:
    void update(World& world, float deltaTime) override;
    [[nodiscard]] std::string name() const override;
};

} // namespace ECS