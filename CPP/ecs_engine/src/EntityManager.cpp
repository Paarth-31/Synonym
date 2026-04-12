#include "../include/EntityManager.h"
#include <stdexcept>

namespace ECS {

EntityManager::EntityManager(uint32_t initialCapacity) {
    generations_.reserve(initialCapacity);
    alive_.reserve(initialCapacity);
}

Entity EntityManager::create() {
    if (!freeList_.empty()) {
        const uint32_t index = freeList_.front();
        freeList_.pop();
        alive_[index] = true;
        return Entity::create(index, generations_[index]);
    }
    const auto index = static_cast<uint32_t>(generations_.size());
    if (index > Entity::MAX_INDEX)
        throw std::overflow_error("EntityManager: maximum entity count reached");
    generations_.push_back(0u);
    alive_.push_back(true);
    return Entity::create(index, 0u);
}

void EntityManager::destroy(Entity e) {
    assertValid(e);
    const uint32_t idx = e.index();
    alive_[idx]        = false;
    generations_[idx]  = (generations_[idx] + 1u) & Entity::MAX_GEN;
    freeList_.push(idx);
}

bool EntityManager::isAlive(Entity e) const noexcept {
    const uint32_t idx = e.index();
    return idx < generations_.size() &&
           alive_[idx] &&
           generations_[idx] == e.generation();
}

std::size_t EntityManager::aliveCount() const noexcept {
    return generations_.size() - freeList_.size();
}

void EntityManager::assertValid(Entity e) const {
    if (!isAlive(e))
        throw std::runtime_error(
            "EntityManager: operation on dead/invalid entity " + e.toString());
}

} // namespace ECS