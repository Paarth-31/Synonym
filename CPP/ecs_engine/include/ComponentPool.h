#pragma once
// ============================================================
//  ComponentPool.h
//  SRP: Store and retrieve one component type using a sparse set.
//  Header-only (template): implementation visible at instantiation.
//
//  Sparse-set layout:
//    sparse_[entityIndex]  -> position in dense arrays
//    dense_[pos]           -> full Entity ID (index + generation)
//    components_[pos]      -> the component data
//
//  Complexity: add / remove / contains -> O(1)
//              iteration               -> linear, cache-friendly
//
//  Generation-safe: contains() checks dense_[pos] == e (full 32-bit
//  match), so stale handles from recycled slots return false / nullptr.
// ============================================================

#include "IComponentPool.h"
#include "Entity.h"
#include <stdexcept>
#include <vector>

namespace ECS {

template<typename T>
class ComponentPool final : public IComponentPool {
public:
    static constexpr std::size_t INVALID_SPARSE = std::size_t(-1);

    // ── Add ───────────────────────────────────────────────────
    template<typename... Args>
    T& emplace(Entity e, Args&&... args) {
        if (contains(e))
            throw std::runtime_error(
                "ComponentPool::emplace: entity already has component: " +
                e.toString());
        const std::size_t idx = e.index();
        growSparse(idx);
        sparse_[idx] = dense_.size();
        dense_.push_back(e);
        components_.emplace_back(std::forward<Args>(args)...);
        return components_.back();
    }

    // ── Get (throwing) ────────────────────────────────────────
    [[nodiscard]] T& get(Entity e) {
        assertContains(e);
        return components_[sparse_[e.index()]];
    }

    [[nodiscard]] const T& get(Entity e) const {
        assertContains(e);
        return components_[sparse_[e.index()]];
    }

    // ── Get (non-throwing) ────────────────────────────────────
    [[nodiscard]] T* tryGet(Entity e) noexcept {
        const std::size_t idx = e.index();
        if (idx >= sparse_.size()) return nullptr;
        const std::size_t pos = sparse_[idx];
        if (pos == INVALID_SPARSE || dense_[pos] != e) return nullptr;
        return &components_[pos];
    }

    // ── Remove (idempotent) ───────────────────────────────────
    void remove(Entity e) override {
        if (!contains(e)) return;
        const std::size_t removePos = sparse_[e.index()];
        const std::size_t lastPos   = dense_.size() - 1u;
        if (removePos != lastPos) {
            dense_[removePos]      = dense_[lastPos];
            components_[removePos] = std::move(components_[lastPos]);
            sparse_[dense_[removePos].index()] = removePos;
        }
        sparse_[e.index()] = INVALID_SPARSE;
        dense_.pop_back();
        components_.pop_back();
    }

    // ── IComponentPool ────────────────────────────────────────
    [[nodiscard]] bool contains(Entity e) const noexcept override {
        const std::size_t idx = e.index();
        if (idx >= sparse_.size()) return false;
        const std::size_t pos = sparse_[idx];
        return pos != INVALID_SPARSE && dense_[pos] == e;
    }

    [[nodiscard]] std::size_t size() const noexcept override {
        return dense_.size();
    }

    // ── Iteration support ─────────────────────────────────────
    [[nodiscard]] const std::vector<Entity>& entities()   const noexcept { return dense_; }
    [[nodiscard]] std::vector<T>&            components()       noexcept { return components_; }
    [[nodiscard]] const std::vector<T>&      components() const noexcept { return components_; }

private:
    std::vector<std::size_t> sparse_;
    std::vector<Entity>      dense_;
    std::vector<T>           components_;

    void growSparse(std::size_t idx) {
        if (idx >= sparse_.size())
            sparse_.resize(idx + 1u, INVALID_SPARSE);
    }

    void assertContains(Entity e) const {
        if (!contains(e))
            throw std::runtime_error(
                "ComponentPool::get: entity has no component: " + e.toString());
    }
};

} // namespace ECS