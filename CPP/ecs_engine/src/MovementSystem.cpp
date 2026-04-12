#include "../include/MovementSystem.h"
#include "../include/World.h"
#include "../include/Components.h"

namespace ECS {

std::string MovementSystem::name() const { return "MovementSystem"; }

void MovementSystem::update(World& world, float deltaTime) {
    // p = p + direction * speed * dt
    world.query<Transform, Velocity>(
        [deltaTime](Entity, Transform& tf, const Velocity& vel) {
            tf.position += vel.direction * (vel.speed * deltaTime);
        });
}

} // namespace ECS