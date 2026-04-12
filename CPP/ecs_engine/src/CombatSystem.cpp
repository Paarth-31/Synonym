#include "../include/CombatSystem.h"
#include "../include/World.h"
#include "../include/Components.h"
#include <iostream>
#include <string>

namespace ECS {

std::string CombatSystem::name() const { return "CombatSystem"; }

void CombatSystem::update(World& world, float deltaTime) {
    // Pass 1: advance cooldown timers
    world.query<Damage>([deltaTime](Entity, Damage& dmg) {
        if (dmg.timeSinceLastHit < dmg.cooldown)
            dmg.timeSinceLastHit += deltaTime;
    });

    // Pass 2: enemy vs damageable entity — AABB test + apply damage
    world.query<EnemyTag, Damage, Collider, Transform>(
        [&](Entity eEnemy, EnemyTag&, Damage& dmg,
            const Collider& eColl, const Transform& eTf)
    {
        if (dmg.timeSinceLastHit < dmg.cooldown) return;

        world.query<Health, Collider, Transform>(
            [&](Entity eVictim, Health& hp,
                const Collider& vColl, const Transform& vTf)
        {
            if (eEnemy == eVictim)            return;
            if (!world.isAlive(eVictim))      return;  // already dying this tick
            if (!aabbOverlaps(eTf.position, eColl,
                              vTf.position, vColl)) return;

            hp.current           -= dmg.amount;
            dmg.timeSinceLastHit  = 0.f;

            std::string label = "entity";
            if (auto* nm = world.tryGetComponent<Name>(eVictim))
                label = nm->value;

            std::cout << "[Combat] " << label
                      << " took " << dmg.amount << " dmg"
                      << "  HP: " << hp.current << "/" << hp.maximum << "\n";

            if (hp.isDead()) {
                std::cout << "[Combat] " << label << " has died!\n";
                world.queueDestroy(eVictim);
            }
        });
    });
}

} // namespace ECS