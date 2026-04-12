#include "../include/World.h"
#include <stdexcept>
#include <vector>

namespace ECS {

World::World(uint32_t initialCapacity, LogFn logger)
    : entityManager_(initialCapacity)
    , logger_(logger ? std::move(logger) : [](const std::string&){}) {}

Entity World::createEntity() {
    return entityManager_.create();
}

void World::destroyEntity(Entity e) {
    if (!entityManager_.isAlive(e)) return;
    for (auto& [id, p] : pools_)
        p->remove(e);
    entityManager_.destroy(e);
    pendingDestroy_.erase(e);
}

void World::queueDestroy(Entity e) {
    pendingDestroy_.insert(e);          // unordered_set deduplicates
}

void World::flushDestroyed() {
    // Snapshot first — destroyEntity() erases from pendingDestroy_,
    // so iterating the set directly would be iterator invalidation.
    const std::vector<Entity> toDestroy(pendingDestroy_.begin(),
                                        pendingDestroy_.end());
    pendingDestroy_.clear();
    for (Entity e : toDestroy)
        destroyEntity(e);
}

bool World::isAlive(Entity e) const noexcept {
    return entityManager_.isAlive(e);
}

std::size_t World::entityCount() const noexcept {
    return entityManager_.aliveCount();
}

void World::addSystem(std::unique_ptr<ISystem> system) {
    logger_("[World] Registered system: " + system->name());
    systems_.push_back(std::move(system));
}

void World::update(float deltaTime) {
    for (auto& sys : systems_)
        if (sys->isEnabled())
            sys->update(*this, deltaTime);
    flushDestroyed();
}

void World::assertAlive(Entity e) const {
    if (!entityManager_.isAlive(e))
        throw std::runtime_error(
            "World: operation on dead entity " + e.toString());
}

} // namespace ECS