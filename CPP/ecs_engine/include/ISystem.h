#pragma once
// ============================================================
//  ISystem.h
//  SRP: Define the contract every System must satisfy.
//  OCP: New systems extend by inheriting — World loop unchanged.
//  LSP: Every concrete system is a drop-in for ISystem.
// ============================================================

#include <string>

namespace ECS { class World; }

namespace ECS {

class ISystem {
public:
    virtual ~ISystem() = default;

    virtual void update(World& world, float deltaTime) = 0;
    [[nodiscard]] virtual std::string name() const     = 0;

    [[nodiscard]] bool isEnabled()         const noexcept { return enabled_; }
    void               setEnabled(bool on)       noexcept { enabled_ = on;   }

private:
    bool enabled_{true};
};

} // namespace ECS