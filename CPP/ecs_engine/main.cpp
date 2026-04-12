// ============================================================
//  main.cpp — Composition Root
//  The ONLY file that includes concrete system/component headers.
//  DIP: all other files depend on abstractions only.
// ============================================================

#include "include/World.h"
#include "include/Components.h"
#include "include/MovementSystem.h"
#include "include/LifetimeSystem.h"
#include "include/CombatSystem.h"
#include "include/RenderSystem.h"

#include <chrono>
#include <iostream>
#include <thread>

using namespace ECS;

// Logger injected into World (DIP: World has no cout dependency).
static void ecsLog(const std::string& msg) {
    std::cout << msg << "\n";
}

static void section(const std::string& title) {
    std::cout << "\n\033[1;36m=== " << title << " ===\033[0m\n";
}

// ── Entity factories ─────────────────────────────────────
// In a larger project these would live in a Prefab or Factory class.

static Entity spawnPlayer(World& world) {
    Entity e = world.createEntity();
    world.addComponent<Name>(e, Name{"Player"});
    world.addComponent<Transform>(e, Transform{{100.f, 100.f}, 0.f, 1.f});
    world.addComponent<Velocity>(e,  Velocity{{1.f, 0.f}, 80.f});
    world.addComponent<Health>(e,    Health{100.f, 100.f});
    world.addComponent<Collider>(e,  Collider{{20.f, 20.f}, false});
    world.addComponent<Renderable>(e,Renderable{'P', 32, 1});
    world.addComponent<PlayerTag>(e);
    std::cout << "[Spawn] Player    " << e.toString() << "\n";
    return e;
}

static Entity spawnEnemy(World& world, const std::string& tag,
                         Vec2 pos, Vec2 dir, float speed, float dmg) {
    Entity e = world.createEntity();
    world.addComponent<Name>(e, Name{tag});
    world.addComponent<Transform>(e, Transform{pos, 0.f, 1.f});
    world.addComponent<Velocity>(e,  Velocity{dir, speed});
    world.addComponent<Health>(e,    Health{50.f, 50.f});
    world.addComponent<Collider>(e,  Collider{{18.f, 18.f}, false});
    world.addComponent<Renderable>(e,Renderable{'E', 31, 0});
    // timeSinceLastHit defaults to max() — fires on first contact.
    world.addComponent<Damage>(e,    Damage{dmg, 1.0f});
    world.addComponent<EnemyTag>(e);
    std::cout << "[Spawn] Enemy '" << tag << "'  " << e.toString() << "\n";
    return e;
}

static Entity spawnProjectile(World& world, Vec2 pos, Vec2 dir) {
    Entity e = world.createEntity();
    world.addComponent<Name>(e, Name{"Bullet"});
    world.addComponent<Transform>(e, Transform{pos, 0.f, 0.5f});
    world.addComponent<Velocity>(e,  Velocity{dir, 300.f});
    world.addComponent<Collider>(e,  Collider{{5.f, 5.f}, false});
    world.addComponent<Renderable>(e,Renderable{'*', 33, 2});
    world.addComponent<Lifetime>(e,  Lifetime{2.f});
    world.addComponent<ProjectileTag>(e);
    std::cout << "[Spawn] Projectile " << e.toString() << "\n";
    return e;
}

// ── Entry point ───────────────────────────────────────────
int main() {
    std::cout << "\033[1;33m== ECS Game Engine Demo ==\033[0m\n";

    section("World Initialisation");
    World world(256, ecsLog);   // ecsLog injected — DIP in action

    section("Register Systems");
    world.emplaceSystem<MovementSystem>();
    world.emplaceSystem<LifetimeSystem>();
    world.emplaceSystem<CombatSystem>();
    world.emplaceSystem<RenderSystem>();

    section("Spawn Entities");
    Entity player = spawnPlayer(world);
    Entity enemy1 = spawnEnemy(world, "Grunt",   {95.f, 100.f},  {0.f, 0.f},   0.f, 15.f);
    Entity enemy2 = spawnEnemy(world, "Charger", {300.f, 200.f}, {-1.f, 0.f}, 60.f, 25.f);
    /* bullet */ spawnProjectile(world, {50.f, 100.f}, {1.f, 0.f});

    section("Game Loop  (5 ticks @ 0.5 s)");
    constexpr int   TICKS = 5;
    constexpr float DT    = 0.5f;
    for (int tick = 0; tick < TICKS; ++tick) {
        std::cout << "\n\033[1m[ Tick " << (tick + 1)
                  << " | dt=" << DT << " s ]\033[0m\n";
        world.update(DT);
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    section("Final Stats");
    std::cout << "Entities alive: " << world.entityCount() << "\n";

    section("Component API Demo");
    if (world.isAlive(player)) {
        const auto& tf = world.getComponent<Transform>(player);
        const auto& hp = world.getComponent<Health>(player);
        std::cout << "Player pos : " << tf.position.toString() << "\n";
        std::cout << "Player HP  : " << hp.current << "/" << hp.maximum
                  << " (" << (hp.percentage() * 100.f) << "%)\n";
    } else {
        std::cout << "Player was destroyed.\n";
    }

    section("Manual Destroy Demo");
    if (world.isAlive(enemy2)) {
        world.destroyEntity(enemy2);
        std::cout << "Charger destroyed. isAlive="
                  << std::boolalpha << world.isAlive(enemy2) << "\n";
    }
    if (world.isAlive(enemy1)) {
        const auto& hp = world.getComponent<Health>(enemy1);
        std::cout << "Grunt survived. HP=" << hp.current << "/" << hp.maximum << "\n";
    }

    std::cout << "\n\033[1;33m== Simulation complete ==\033[0m\n";
    return 0;
}