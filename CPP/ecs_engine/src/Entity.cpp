#include "../include/Entity.h"
#include <stdexcept>

namespace ECS {

Entity::Entity() noexcept : id_(INVALID_ID) {}

Entity Entity::create(uint32_t index, uint32_t generation) noexcept {
    Entity e;
    e.id_ = ((generation & MAX_GEN) << INDEX_BITS) | (index & INDEX_MASK);
    return e;
}

uint32_t Entity::index()      const noexcept { return id_ & INDEX_MASK; }
uint32_t Entity::generation() const noexcept { return (id_ >> INDEX_BITS) & MAX_GEN; }
uint32_t Entity::raw()        const noexcept { return id_; }
bool     Entity::isValid()    const noexcept { return id_ != INVALID_ID; }

std::string Entity::toString() const {
    if (!isValid()) return "Entity(invalid)";
    return "Entity(idx=" + std::to_string(index()) +
           ", gen="      + std::to_string(generation()) + ")";
}

bool Entity::operator==(const Entity& o) const noexcept { return id_ == o.id_; }
bool Entity::operator!=(const Entity& o) const noexcept { return id_ != o.id_; }
bool Entity::operator< (const Entity& o) const noexcept { return id_ <  o.id_; }

} // namespace ECS