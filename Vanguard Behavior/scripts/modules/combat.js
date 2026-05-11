import { Player, system, world, World, EquipmentSlot } from "@minecraft/server";
import { Cache } from "./cache";
import { ArmorKitSystem, kitOrder } from "./under-armor";
import "../protos/main"

function getDevice(player) {
  const mode = player.inputInfo.lastInputModeUsed
  if (mode === "KeyboardAndMouse") return "Keyboard"
  if (mode === "MotionController" || mode === "Gamepad") return "Controller"
  return mode
}

export default class Combat {
    static async Init() {
        this.CPSLimiter();
    }

    static getTeam(name) {
        const raw = world.getDynamicProperty("team:" + name);
        if (typeof raw !== "string") return undefined;
        return JSON.parse(raw);
    }

    static getPlayerTeam(player) {
        const name = player.getDynamicProperty("team");
        if (typeof name !== "string") return undefined;
        return this.getTeam(name);
    }

    static OnDeath(event) {
        const { deadEntity, damageSource } = event;

        if (!(deadEntity instanceof Player)) return;

        const deaths = deadEntity.getDynamicProperty("deaths") ?? 0;
        deadEntity.setDynamicProperty("deaths", deaths + 1);
        deadEntity.setDynamicProperty("killstreak", 0);

        if (deadEntity.hasTag("inPlots")) deadEntity.removeTag("inPlots");

        const killer = damageSource?.damagingEntity;
        if (!(killer instanceof Player)) return;

        const kills = killer.getDynamicProperty("kills") ?? 0;
        killer.setDynamicProperty("kills", kills + 1);

        const streak = (killer.getDynamicProperty("killstreak") ?? 0) + 1;
        killer.setDynamicProperty("killstreak", streak);

        const healthComp = killer.getComponent("minecraft:health")
        healthComp.setCurrentValue(healthComp.defaultValue)
        const milestones = [5, 10, 25, 50, 100, 200, 500, 1000];
        if (milestones.includes(streak)) {
            world.sendMessage(`§3${killer.name} §r§b§lis on a ${streak} killstreak!`);
        }
    }

    static async ClearInventory(player) {
        if (!player) return;

        try {
            const inventoryComp = player.getComponent("minecraft:inventory") || player.getComponent("inventory");
            const equippable = player.getComponent("minecraft:equippable") || player.getComponent("equippable");
            if (!inventoryComp?.container) return;
            const inventory = inventoryComp.container;
            for (let i = 0; i < inventory.size; i++)
                inventory.setItem(i, undefined);
            if (equippable) {
                for (const slot of ["Head", "Chest", "Legs", "Feet", "Offhand"]) {
                    equippable.setEquipment(slot, undefined);
                }
            }
        }
        catch (err) {
            Logger.Error("[ClearInventory] Failed to clear inventory:", err);
        }
    }

    static DropInventorySync(player) {
        if (!player)
            return;
        const inventoryComp = player.getComponent("minecraft:inventory") || player.getComponent("inventory");
        const equippable = player.getComponent("minecraft:equippable") || player.getComponent("equippable");
        if (!inventoryComp?.container) return;
        const inventory = inventoryComp.container;
        const location = player.location;
        const dimension = player.dimension;
        if (!location || !dimension) return;

        const invItems = Array.from({ length: inventory.size }, (_, i) => inventory.getItem(i));

        const slots = [
            EquipmentSlot.Head,
            EquipmentSlot.Chest,
            EquipmentSlot.Legs,
            EquipmentSlot.Feet,
            EquipmentSlot.Offhand,
        ];
        const equipItems = equippable ? slots.map(slot => equippable.getEquipment(slot)) : [];
        const items = [...invItems, ...equipItems].filter(Boolean);

        system.run(() => {
            try {
                for (const item of items) {
                    if (!item)
                        continue;
                    dimension.spawnItem(item, location);
                }
            }
            catch (err) {
                Logger.Error("[DropInventorySync] Failed to spawn items:", err);
            }
        });
    }

static async OnHit(event) {
    const { damagingEntity: source, hitEntity: target } = event;

    if (!(source instanceof Player) || !(target instanceof Player)) return;
    if (source.getGameMode() === "Creative" || target.getGameMode() === "Creative") return;
    if (!source.hasTag("inPlots") || !target.hasTag("inPlots")) return;

    source.addCPS();
    source.setReach(target.location);
    delete Cache.Combo[target.id];

    const attackerKit = ArmorKitSystem.getHighestKit(ArmorKitSystem.getItems(source));
    const victimKit = ArmorKitSystem.getHighestKit(ArmorKitSystem.getItems(target));

    const attackerIndex = kitOrder.indexOf(attackerKit);
    const victimIndex = kitOrder.indexOf(victimKit);

    const diff = Math.abs(attackerIndex - victimIndex);

    let sourceActionBar = "";

    if (source.getCPS() > 15) {
        sourceActionBar = `§l§3--------------------\n` +
                          `§r§b Please lower your click speed §f(${source.getCPS()}/15)\n` +
                          `§l§3--------------------`;
    } else if (diff > 1 && !source.hasTag("KOS")) {
        sourceActionBar = `§l§3----------------------------------\n` +
                          `§r§b You cannot hit this\n player because their armor\n is too different!\n` +
                          `§l§3----------------------------------`;
    } else {
        sourceActionBar = `§l§3--------------------\n` +
                          `§r§b CPS: §f${source.getCPS()} §l/ §r§f${target.getCPS()}\n` +
                          `§b Combo: §f${source.getCombo()} §l/ §r§f${target.getCombo()}\n` +
                          `§b Reach: §f${source.getReach?.() ?? "0.00"} §l/ §r§f${target.getReach?.() ?? "0.00"}\n` +
                          `§l§3--------------------`;
    }

    let targetActionBar = `§l§3--------------------\n` +
                          `§r§b CPS: §f${target.getCPS()} §l/ §r§f${source.getCPS()}\n` +
                          `§b Combo: §f${target.getCombo()} §l/ §r§f${source.getCombo()}\n` +
                          `§b Reach: §f${target.getReach?.() ?? "0.00"} §l/ §r§f${source.getReach?.() ?? "0.00"}\n` +
                          `§l§3--------------------`;

    source.onScreenDisplay.setActionBar(sourceActionBar);
    target.onScreenDisplay.setActionBar(targetActionBar);

    if (diff > 1 && !source.hasTag("KOS")) return;

    const { x, z } = source.getViewDirection();
    target.applyKnockback({ x: x * 0.100, z: z * 0.100 }, 0.125);
}

    static OnLeave(event) {
        const player = event.player;
        if (!player) return;
        if (!Cache.CombatTime[player.id]) return;
        if (!player.hasTag(`inPlots`)) return

        const playerName = player.name;
        const playerId = player.id;
        this.DropInventorySync(player);
        player.setDynamicProperty(`combat_logged`, true);
        delete Cache.CombatTime[playerId];
        world.broadcastWarning(`§l§c${playerName}§r§7 combat logged and has been punished!`);
    }

    static async OnSpawn(event) {
        const player = event.player;
        if (!player) return;
        const playerId = player.id;
        const logged = player.getDynamicProperty(`combat_logged`) === true;
        if (logged) {
            await this.ClearInventory(player);
            player.sendError("You logged out during combat! Your inventory has been cleared as a penalty.");
            player.setDynamicProperty(`combat_logged`, false);
        }
        if (Cache.CombatTime[playerId])
            delete Cache.CombatTime[playerId];
    }

    static OnHurt(event) {
        const { damageSource: { damagingEntity: source }, hurtEntity: target } = event;

        if (!(source instanceof Player) || !(target instanceof Player)) {
            return;
        }
        if (source.getGameMode() === "Creative" || target.getGameMode() === "Creative") return
        if (!source.hasTag("inPlots") || !target.hasTag("inPlots")) return

        source.addCombo();

        const sourceTeam = this.getPlayerTeam(source);
        const targetTeam = this.getPlayerTeam(target);

        if (sourceTeam && targetTeam && sourceTeam.name === targetTeam.name) return;

        const attackerKit = ArmorKitSystem.getHighestKit(ArmorKitSystem.getItems(source));
        const victimKit = ArmorKitSystem.getHighestKit(ArmorKitSystem.getItems(target));

        const attackerIndex = kitOrder.indexOf(attackerKit);
        const victimIndex = kitOrder.indexOf(victimKit);

        const diff = Math.abs(attackerIndex - victimIndex);

        if (diff > 1) return;

        [source, target].forEach((player) => {
            if (!Cache.CombatTime[player.id]) {
                player.sendWarning("You have just entered combat!");
            }

            Cache.CombatTime[player.id] = 15;
        });
    }

    static CPSLimiter() {
        system.runInterval(() => {
            for (const player of world.getAllPlayers()) {
                const CPS = player.getCPS();
                switch (true) {
                    case CPS < 15 && player.hasTag("cps"):
                        player.removeTag("cps");
                        player.sendSuccess("You are no longer CPS limited!");
                        break;
                    case CPS >= 15 && !player.hasTag("cps"):
                        player.addTag("cps");
                        player.sendWarning(`You have been CPS limited! (${CPS} CPS)`);
                        break;
                }
            }
        }, 5);
    }
    static blockHit(event) {
        const { damageSource, hurtEntity } = event;
        const attacker = damageSource.damagingEntity;
        if (!(hurtEntity instanceof Player))
            return;
        if (!(attacker instanceof Player))
            return;
        if (!attacker.hasTag("cps"))
            return;
        if (attacker.hasTag("cps")) {
            event.cancel = true;
        }
    }
}