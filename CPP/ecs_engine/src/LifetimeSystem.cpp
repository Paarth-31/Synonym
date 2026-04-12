#include "../include/LifetimeSystem.h"
#include "../include/World.h"
#include "../include/Components.h"
#include <iostream>

namespace ECS {

std::string LifetimeSystem::name() const { return "LifetimeSystem"; }

void LifetimeSystem::update(World& world, float deltaTime) {
    world.query<Lifetime>([&](Entity e, Lifetime& lt) {
        lt.remaining -= deltaTime;
        if (lt.remaining <= 0.f) {
            if (auto* nm = world.tryGetComponent<Name>(e))
                std::cout << "[Lifetime] '" << nm->value << "' expired.\n";
            world.queueDestroy(e);
        }
    });
}

} // namespace ECS