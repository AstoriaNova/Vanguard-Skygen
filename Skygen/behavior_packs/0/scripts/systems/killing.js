import { world, system, ItemStack, ItemLockMode } from "@minecraft/server"


world.afterEvents.entityDie.subscribe((event) => {
const { deadEntity, damageSource } = event


if (deadEntity.typeId === "minecraft:player") {
    const deaths = deadEntity.getDynamicProperty("deaths") ?? 0
    deadEntity.setDynamicProperty("deaths", deaths + 1)

    deadEntity.setDynamicProperty("killstreak", 0)
    deadEntity.setDynamicProperty("combatEnd", 0)

    if (deadEntity.hasTag("inPlots")) {
        deadEntity.removeTag("inPlots")
    }
}

const killer = damageSource.damagingEntity

if (killer && killer.typeId === "minecraft:player") {
    const kills = killer.getDynamicProperty("kills") ?? 0
    killer.setDynamicProperty("kills", kills + 1)

    const streak = (killer.getDynamicProperty("killstreak") ?? 0) + 1
    killer.setDynamicProperty("killstreak", streak)

    killer.setDynamicProperty("combatEnd", 0)

    killer.addEffect("instant_health", 1, {
        amplifier: 255,
        showParticles: false
    })

    if (
        streak === 5 ||
        streak === 10 ||
        streak === 25 ||
        streak === 50 ||
        streak === 100 ||
        streak === 200 ||
        streak === 500 ||
        streak === 1000
    ) {
        world.sendMessage(`§3${killer.name} §r§b§lis on a ${streak} killstreak!`)
    }
}

})


function startCombat(p, now) {
    const end = p.getDynamicProperty("combatEnd") ?? 0
    const inCombat = end > now

    p.setDynamicProperty("combatEnd", now + 15000)

    if (!inCombat) {
        p.sendMessage("§c You are now in combat. Do not leave.")

        const check = () => {
            if (!p.isValid) return

            const current = p.getDynamicProperty("combatEnd") ?? 0

            if (Date.now() >= current) {
                p.sendMessage("§a You are no longer in combat.")
                return
            }

            system.runTimeout(check, 20)
        }

        system.runTimeout(check, 20)
    }
}

world.afterEvents.entityHitEntity.subscribe(({ damagingEntity: player, hitEntity: enemy }) => {
    if (player.typeId !== "minecraft:player" || enemy.typeId !== "minecraft:player") return
    if (player.getGameMode() === "Creative" || enemy.getGameMode() === "Creative") return
    if (!player.hasTag("inPlots") || !enemy.hasTag("inPlots")) return

    const now = Date.now()

    startCombat(player, now)
    startCombat(enemy, now)

    const { x, z } = player.getViewDirection()
    enemy.applyKnockback({ x: x * 0.100, z: z * 0.100 }, 0.125)

    const attackerClicks = JSON.parse(player.getDynamicProperty("cpsClicks") ?? "[]").filter(t => now - t < 1000)
    const targetClicks = JSON.parse(enemy.getDynamicProperty("cpsClicks") ?? "[]").filter(t => now - t < 1000)

    attackerClicks.push(now)

    player.setDynamicProperty("cpsClicks", JSON.stringify(attackerClicks))
    enemy.setDynamicProperty("cpsClicks", JSON.stringify(targetClicks))

    const cpsPlayer = attackerClicks.length
    const cpsTarget = targetClicks.length

    const p1 = player.location
    const p2 = enemy.location

    const reach = Math.sqrt(
        (p1.x - p2.x) ** 2 +
        (p1.y - p2.y) ** 2 +
        (p1.z - p2.z) ** 2
    ).toFixed(2)

    player.setDynamicProperty("lastReach", reach)

    const combo = (player.getDynamicProperty("combo") ?? 0) + 1
    player.setDynamicProperty("combo", combo)
    player.setDynamicProperty("lastHit", now)

    enemy.setDynamicProperty("combo", 0)
    enemy.setDynamicProperty("lastHit", now)

    system.runTimeout(() => {
        if (player.getDynamicProperty("lastHit") === now && player.isValid) {
            player.setDynamicProperty("combo", 0)
        }
    }, 80)

    player.onScreenDisplay.setActionBar(
`§l§3--------------------
§r§b CPS: §f${cpsPlayer} §l/ §r§f${cpsTarget}
§b Combo: §f${combo} §l/ §r§f0
§b Reach: §f${reach}
§l§3--------------------`
    )

    enemy.onScreenDisplay.setActionBar(
`§l§3--------------------
§r§b CPS: §f${cpsTarget} §l/ §r§f${cpsPlayer}
§b Combo: §f0 §l/ §r§f${combo}
§b Reach: §f${enemy.getDynamicProperty("lastReach") ?? "0.00"}
§l§3-------------------`
    )

    if (cpsPlayer > 15) {
        player.onScreenDisplay.setActionBar(
`§l§3--------------------
§r§bPlease lower your
click speed §f(${cpsPlayer}/15)
§l§3--------------------`
        )
        player.addEffect("weakness", 1, { amplifier: 255 })
    }

    if (cpsPlayer > 20) {
        player.runCommand(`kick "${player.name}" §cExceeded CPS Limit.`)
    }
})

world.beforeEvents.playerLeave.subscribe((ev) => {
    const player = ev.player
    const now = Date.now()
    const end = player.getDynamicProperty("combatEnd") ?? 0

    if (!player.hasTag(`inPlots`)) return

    if (end <= now) return

    const loc = player.location
    const dim = player.dimension
    const name = player.name

    const items = []

    const inv = player.getComponent("minecraft:inventory")?.container
    if (inv) {
        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i)
            if (item) items.push(item)
        }
    }

    const equip = player.getComponent("minecraft:equippable")
    if (equip) {
        const slots = ["Head","Chest","Legs","Feet","Mainhand","Offhand"]
        for (const s of slots) {
            const item = equip.getEquipment(s)
            if (item) items.push(item)
        }
    }

    system.run(() => {
        for (const item of items) {
            dim.spawnItem(item, loc)
        }

        world.sendMessage(`§c ${name} was killed for Combat Logging.`)
    })

    player.setDynamicProperty("combatLogged", true)
})

world.afterEvents.playerSpawn.subscribe((ev) => {
  const player = ev.player
  if (!ev.initialSpawn) return

  const combatLogged = player.getDynamicProperty("combatLogged")

  if (combatLogged === true) {
    player.runCommand("clear @s")
    player.sendMessage("§c You were killed for combat logging.")

    const inventory = player.getComponent("minecraft:inventory")?.container
    if (inventory) {
      const item = new ItemStack("vanguard:gui", 1)
      item.keepOnDeath = true
      item.lockMode = ItemLockMode.inventory
      inventory.setItem(8, item)
    }

    player.setDynamicProperty("combatLogged", false)
  }
})