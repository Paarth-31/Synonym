#pragma once
// ============================================================
//  World.h
//  SRP: Coordinate entity lifecycle, component storage, and
//       system execution.
//  OCP: New components / systems plug in via templates — no
//       existing code changes.
//  DIP: Depends on IComponentPool / ISystem abstractions.
//       I/O injected via LogFn callback (no std::cout inside).
// ============================================================

#include "Entity.h"
#include "EntityManager.h"
#include "IComponentPool.h"
#include "ComponentPool.h"
#include "ISystem.h"
#include "TypeId.h"

#include <functional>
#include <memory>
#include <stdexcept>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace ECS {

// Injected logger — defaults to no-op (DIP: World has no cout dependency)
using LogFn = std::function<void(const std::string&)>;

class World {
public:
    explicit World(uint32_t initialCapacity = 1024,
                   LogFn    logger          = nullptr);

    World(const World&)            = delete;
    World& operator=(const World&) = delete;
    World(World&&)                 = default;
    World& operator=(World&&)      = default;

    // ── Entity lifecycle ──────────────────────────────────────
    [[nodiscard]] Entity      createEntity();
    void                      destroyEntity(Entity e);
    void                      queueDestroy(Entity e);
    void                      flushDestroyed();
    [[nodiscard]] bool        isAlive(Entity e)  const noexcept;
    [[nodiscard]] std::size_t entityCount()       const noexcept;

    // ── Component API (template — defined inline below) ───────
    template<typename T, typename... Args>
    T& addComponent(Entity e, Args&&... args);

    template<typename T>
    void removeComponent(Entity e);

    template<typename T>
    [[nodiscard]] T& getComponent(Entity e);

    template<typename T>
    [[nodiscard]] const T& getComponent(Entity e) const;

    template<typename T>
    [[nodiscard]] T* tryGetComponent(Entity e) noexcept;

    template<typename T>
    [[nodiscard]] bool hasComponent(Entity e) const noexcept;

    // ── Query (template — defined inline below) ───────────────
    // Iterates all entities that have EVERY listed component type.
    // Lambda signature: (Entity, T0&, T1&, ...) -> void
    template<typename... Ts, typename Func>
    void query(Func&& func);

    // ── System management ─────────────────────────────────────
    void addSystem(std::unique_ptr<ISystem> system);

    template<typename S, typename... Args>
    S& emplaceSystem(Args&&... args);

    void update(float deltaTime);

private:
    // ── Template helpers (bodies must be in header) ───────────
    template<typename First, typename... Rest, typename Func>
    void queryImpl(Func&& func);

    template<typename T>
    ComponentPool<T>& pool();

    template<typename T>
    const ComponentPool<T>& poolConst() const;

    template<typename T>
    bool hasPool() const noexcept;

    void assertAlive(Entity e) const;

    // ── Data ──────────────────────────────────────────────────
    EntityManager                                        entityManager_;
    std::unordered_map<std::size_t,
                       std::unique_ptr<IComponentPool>> pools_;
    std::vector<std::unique_ptr<ISystem>>               systems_;
    std::unordered_set<Entity>                          pendingDestroy_;
    LogFn                                               logger_;
};

// ================================================================
//  Template method definitions
//  (Must be in the header so the compiler sees them at each
//   instantiation site — this is standard C++ template rules.)
// ================================================================

template<typename T, typename... Args>
T& World::addComponent(Entity e, Args&&... args) {
    assertAlive(e);
    return pool<T>().emplace(e, std::forward<Args>(args)...);
}

template<typename T>
void World::removeComponent(Entity e) {
    if (hasPool<T>()) pool<T>().remove(e);
}

template<typename T>
T& World::getComponent(Entity e) {
    return pool<T>().get(e);
}

template<typename T>
const T& World::getComponent(Entity e) const {
    return poolConst<T>().get(e);
}

template<typename T>
T* World::tryGetComponent(Entity e) noexcept {
    if (!hasPool<T>()) return nullptr;
    return pool<T>().tryGet(e);
}

template<typename T>
bool World::hasComponent(Entity e) const noexcept {
    if (!hasPool<T>()) return false;
    return poolConst<T>().contains(e);
}

template<typename... Ts, typename Func>
void World::query(Func&& func) {
    queryImpl<Ts...>(std::forward<Func>(func));
}

template<typename S, typename... Args>
S& World::emplaceSystem(Args&&... args) {
    auto sys = std::make_unique<S>(std::forward<Args>(args)...);
    S* ptr   = sys.get();
    addSystem(std::move(sys));
    return *ptr;
}

// ── Private template helpers ──────────────────────────────────

template<typename First, typename... Rest, typename Func>
void World::queryImpl(Func&& func) {
    ComponentPool<First>& primary = pool<First>();
    // Snapshot avoids iterator invalidation if lambda mutates world.
    const std::vector<Entity> snapshot = primary.entities();
    for (Entity e : snapshot) {
        if (!entityManager_.isAlive(e)) continue;
        if ((hasComponent<Rest>(e) && ...)) {
            if (primary.contains(e))
                func(e, pool<First>().get(e), pool<Rest>().get(e)...);
        }
    }
}

template<typename T>
ComponentPool<T>& World::pool() {
    const std::size_t id = typeId<T>();
    auto it = pools_.find(id);
    if (it == pools_.end()) {
        auto p   = std::make_unique<ComponentPool<T>>();
        auto* ptr = p.get();
        pools_.emplace(id, std::move(p));
        return *ptr;
    }
    return *static_cast<ComponentPool<T>*>(it->second.get());
}

template<typename T>
const ComponentPool<T>& World::poolConst() const {
    const std::size_t id = typeId<T>();
    auto it = pools_.find(id);
    if (it == pools_.end())
        throw std::runtime_error("World::getComponent: no pool for type");
    return *static_cast<const ComponentPool<T>*>(it->second.get());
}

template<typename T>
bool World::hasPool() const noexcept {
    return pools_.count(typeId<T>()) > 0;
}

} // namespace ECS