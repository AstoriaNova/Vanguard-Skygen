import { EquipmentSlot, system, world } from "@minecraft/server";
import Combat from "./modules/combat";
import Stats from "./modules/stats";
import { ArmorKitSystem } from "./modules/under-armor";
import Names from "./modules/names";

world.beforeEvents.entityHurt.subscribe((event) => {
    Combat.blockHit(event)
    ArmorKitSystem.blockHit(event)
})

world.afterEvents.entityHitEntity.subscribe((event) => {
  Combat.OnHit(event)
})

world.afterEvents.entityHurt.subscribe((event) => {
  Combat.OnHurt(event);
})

world.beforeEvents.playerLeave.subscribe((event) => {
    Combat.OnLeave(event)
})

world.afterEvents.playerSpawn.subscribe((event) => {
    Combat.OnSpawn(event)
})

world.afterEvents.entityDie.subscribe((event) => {
    Combat.OnDeath(event)
})

world.afterEvents.entitySpawn.subscribe((event) => {
    Names.UpdateItemNames(event)
})

world.beforeEvents.entityRemove.subscribe((event) => {
    system.run(() => {
    Names.UpdateItemNames(event)})
})

// system.runInterval(() => {

//     for (const player of world.getPlayers()) {

//         const inv = player.getComponent("inventory")?.container;
//         if (!inv) continue;

//         // check inventory
//         for (let i = 0; i < inv.size; i++) {

//             const item = inv.getItem(i);
//             if (!item) continue;

//             const durability = item.getComponent("durability");
//             if (!durability) continue;

//             if (durability.damage < 0) {
//                 inv.setItem(i, undefined);
//                 player.sendMessage("§cIllegal durability item removed.");
//             }
//         }

//         // check armor slots
//         const equip = player.getComponent("equippable");
//         if (!equip) continue;

//         const armorSlots = [
//             EquipmentSlot.Head,
//             EquipmentSlot.Chest,
//             EquipmentSlot.Legs,
//             EquipmentSlot.Feet
//         ];

//         for (const slot of armorSlots) {

//             const item = equip.getEquipment(slot);
//             if (!item) continue;

//             const durability = item.getComponent("durability");
//             if (!durability) continue;

//             if (durability.damage < 0) {
//                 equip.setEquipment(slot, undefined);
//                 player.sendMessage("§cIllegal armor removed.");
//             }
//         }

//     }

// }, 20);

world.afterEvents.entitySpawn.subscribe((event) => {

    const entity = event.entity;

    if (entity.typeId !== "minecraft:item") return;
    if (!entity.isValid) return
    const itemComp = entity.getComponent("item");
    if (!itemComp) return;

    const item = itemComp.itemStack;
    const durability = item.getComponent("durability");

    if (!durability) return;

    if (durability.damage < 0) {
        entity.remove();
    }

});