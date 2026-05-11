import {
  world,
  system,
  Player,
  EquipmentSlot,
  EntityComponentTypes
} from "@minecraft/server";

export const kitOrder = ["leather", "chain", "iron", "diamond", "netherite"];

const kitEmoji = {
  leather: "",
  chain: "",
  iron: "",
  diamond: "",
  netherite: ""
};

const kits = {
  leather: [
    "leather_helmet",
    "leather_chestplate",
    "leather_leggings",
    "leather_boots",
    "wooden_sword",
    "wooden_axe",
  ],

  chain: [
    "chainmail_helmet",
    "chainmail_chestplate",
    "chainmail_leggings",
    "chainmail_boots",
    "chainmail_sword",
    "chainmail_axe",
  ],

  iron: [
    "iron_helmet",
    "iron_chestplate",
    "iron_leggings",
    "iron_boots",
    "iron_sword",
    "iron_axe",
    "golden_helmet",
    "golden_chestplate",
    "golden_leggings",
    "golden_boots",
    "golden_sword",
    "golden_axe",
  ],

  diamond: [
    "diamond_helmet",
    "diamond_chestplate",
    "diamond_leggings",
    "diamond_boots",
    "diamond_sword",
    "diamond_axe",
  ],

  netherite: [
    "netherite_helmet",
    "netherite_chestplate",
    "netherite_leggings",
    "netherite_boots",
    "netherite_sword",
    "netherite_axe",
  ]
};

export class ArmorKitSystem {

  static Init(intervalTicks = 20) {
    system.runInterval(() => {
      for (const player of world.getPlayers()) {
        this.handlePlayer(player);
      }
    }, intervalTicks);
  }

  static handlePlayer(player) {

    if (player.hasTag("KOS")) {
      this.clearKitTags(player);
      return;
    }

    const items = this.getItems(player);
    const highestKit = this.getHighestKit(items);

    for (const kit of kitOrder) {
      if (kit !== highestKit && player.hasTag(kit)) {
        player.removeTag(kit);
      }
    }

    if (highestKit && !player.hasTag(highestKit)) {
      player.addTag(highestKit);
    }
  }

  static clearKitTags(player) {
    for (const kit of kitOrder) {
      if (player.hasTag(kit)) {
        player.removeTag(kit);
      }
    }
  }

  static getItems(entity) {

    const inventory = entity.getComponent("inventory")?.container;
    const equippable = entity.getComponent("equippable");

    if (!inventory || !equippable) return [];

    const invItems = Array.from({ length: inventory.size })
      .map((_, i) => inventory.getItem(i));

    const armorItems = [
      EquipmentSlot.Head,
      EquipmentSlot.Chest,
      EquipmentSlot.Legs,
      EquipmentSlot.Feet,
    ].map(slot => equippable.getEquipment(slot));

    return [...invItems, ...armorItems].filter(Boolean);
  }

  static getHighestKit(items) {

    let highest = null;

    for (const kit of kitOrder) {
      if (items.some(item =>
        kits[kit].includes(item.typeId.split(":")[1])
      )) {
        highest = kit;
      }
    }

    return highest;
  }

  static getKitTier(kit, isKOS = false) {

    if (isKOS) return "KOS";
    if (!kit) return "";

    return kitEmoji[kit];
  }

  static blockHit(event) {

    const { damageSource, hurtEntity } = event;

    if (!(hurtEntity instanceof Player)) return;

    const attacker = damageSource.damagingEntity;
    if (!(attacker instanceof Player)) return;

    if (attacker.hasTag("KOS") || hurtEntity.hasTag("KOS")) return;

    const attackerKit = this.getHighestKit(this.getItems(attacker));
    const victimKit = this.getHighestKit(this.getItems(hurtEntity));

    if (!attackerKit || !victimKit) return;

    const attackerIndex = kitOrder.indexOf(attackerKit);
    const victimIndex = kitOrder.indexOf(victimKit);

    const diff = Math.abs(attackerIndex - victimIndex);

    if (diff <= 1) return;

    event.cancel = true;

    const fireComp = hurtEntity.getComponent(EntityComponentTypes.OnFire);

    if (fireComp) {
      system.runTimeout(() => {
        hurtEntity.extinguishFire(true);
      });
    }
  }
}