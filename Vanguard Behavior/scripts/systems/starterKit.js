import { world, system, EquipmentSlot } from "@minecraft/server";

function SlotGrab(slot, x, y, z) {
  const chest = world.getDimension("overworld").getBlock({ x, y, z });
  const container = chest.getComponent("minecraft:inventory").container;
  return container.getItem(slot);
}

const equipSlots = [
  EquipmentSlot.Head,
  EquipmentSlot.Chest,
  EquipmentSlot.Legs,
  EquipmentSlot.Feet,
];

world.beforeEvents.playerInteractWithBlock.subscribe((data) => {
  const { player, block } = data;

  if (
    block.location.x === 182 &&
    block.location.y === 119 &&
    block.location.z === -6 &&
    block.typeId === "minecraft:barrel"
  ) {
    data.cancel = true;

    if (player.isSneaking) return;

const now = system.currentTick;
const lastClaim = player.getDynamicProperty("starter_cooldown");

if (typeof lastClaim === "number" && now - lastClaim < 200) {
  const remainingTicks = 200 - (now - lastClaim);
  const remainingSeconds = Math.ceil(remainingTicks / 20);

  player.sendMessage(` §4§lError§r§c Please wait ${remainingSeconds}s before reclaiming.`);
  system.run(() => player.playSound("item.shield.block", { pitch: 0.8 }));
  return;
}

    system.run(() => {
      const inventory = player.getComponent("inventory").container;
      const equippable = player.getComponent("equippable");

      let addedSomething = false;

      for (let i = 0; i < 4; i++) {
        const armor = SlotGrab(i, 9998, 101, 9992);
        if (!armor) continue;

        const current = equippable.getEquipment(equipSlots[i]);
        if (!current) {
          equippable.setEquipment(equipSlots[i], armor);
          addedSomething = true;
        }
      }

      for (let i = 4; i <= 7; i++) {
        const item = SlotGrab(i, 9998, 101, 9992);
        if (!item) continue;

        const leftover = inventory.addItem(item);
        if (!leftover) addedSomething = true;
      }

      if (!addedSomething) {
        player.sendMessage(" §4§lError§r§c Your inventory is completely full.");
        system.run(() => player.playSound("item.shield.block", { pitch: 0.8 }))
        return;
      }

      player.setDynamicProperty("starter_cooldown", now);

      player.sendMessage(" §b§lStarter§r§3 You have successfully equipped the starter kit!");
      system.run(() => player.playSound("armor.equip_chain", { pitch: 1.0 }))
    });
  }
});