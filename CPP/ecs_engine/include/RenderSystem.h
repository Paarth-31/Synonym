#pragma once
// ============================================================
//  RenderSystem.h
//  SRP: Render entities to the terminal. No game logic.
//  OCP: Replace this file to swap in SDL / OpenGL / ImGui.
// ============================================================

#include "ISystem.h"
#include <string>

namespace ECS {

class RenderSystem final : public ISystem {
public:
    void update(World& world, float deltaTime) override;
    [[nodiscard]] std::string name() const override;
};

} // namespace ECS