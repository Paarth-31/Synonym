#include "../include/RenderSystem.h"
#include "../include/World.h"
#include "../include/Components.h"
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

namespace ECS {

std::string RenderSystem::name() const { return "RenderSystem"; }

void RenderSystem::update(World& world, float /*deltaTime*/) {
    struct DrawCall { int z; char sym; int color; Vec2 pos; std::string label; };
    std::vector<DrawCall> calls;

    world.query<Transform, Renderable>(
        [&](Entity e, const Transform& tf, const Renderable& rend) {
            std::string label;
            if (auto* nm = world.tryGetComponent<Name>(e))
                label = nm->value;
            calls.push_back({rend.zLayer, rend.symbol, rend.colorCode,
                             tf.position, std::move(label)});
        });

    // stable_sort: equal-z entities keep consistent order across ticks.
    std::stable_sort(calls.begin(), calls.end(),
        [](const DrawCall& a, const DrawCall& b){ return a.z < b.z; });

    std::cout << "\n--- Render Frame ---\n";
    for (const auto& dc : calls) {
        std::cout << "\033[" << dc.color << "m"
                  << "  [" << dc.sym << "] "
                  << (dc.label.empty() ? "entity" : dc.label)
                  << "  pos=" << dc.pos.toString()
                  << "\033[0m\n";
    }
    std::cout << "--------------------\n";
}

} // namespace ECS