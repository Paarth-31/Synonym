#pragma once
// ============================================================
//  TypeId.h
//  SRP: Assign a compile-time unique integer to each C++ type.
//  Header-only: template bodies must be visible at instantiation.
//  DIP: Components are referenced by TypeId, not by class name.
// ============================================================

#include <atomic>
#include <cstddef>
#include <type_traits>

namespace ECS {

namespace detail {
    // Monotonically incrementing counter — one step per unique type.
    inline std::atomic<std::size_t> gTypeCounter{0};
}

// Each instantiation gets its own static value, initialised once at startup.
// ODR-initialised static const + atomic fetch_add = thread-safe.
template<typename T>
struct TypeId {
    static const std::size_t value;
};

template<typename T>
const std::size_t TypeId<T>::value =
    detail::gTypeCounter.fetch_add(1, std::memory_order_relaxed);

// Convenience wrapper — strips const/reference before lookup.
template<typename T>
[[nodiscard]] inline std::size_t typeId() noexcept {
    return TypeId<std::remove_const_t<std::remove_reference_t<T>>>::value;
}

} // namespace ECS