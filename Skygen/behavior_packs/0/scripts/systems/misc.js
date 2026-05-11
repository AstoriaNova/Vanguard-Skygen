import { world, system, ItemStack, ItemLockMode, BlockPermutation, GameMode  } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    const player = event.player;
    const block = event.block;

    if (player.getGameMode() === GameMode.Creative) return;

    if (block.typeId === "minecraft:ender_chest") return;
    if (block.typeId === "minecraft:crafting_table") return;

    if (!player.hasTag("inPlots")) {
        event.cancel = true;
        return;
    }

    if (
        (
            block.typeId === "minecraft:anvil" ||
            block.typeId === "minecraft:chipped_anvil" ||
            block.typeId === "minecraft:damaged_anvil"
        ) &&
        !player.hasTag("staff")
    ) {
        event.cancel = true;
    }

    if (block.typeId === "minecraft:jungle_fence_gate") {
        event.cancel = true;
        return;
    }

    if (block.typeId === "minecraft:acacia_wood") {
        event.cancel = true;
        return;
    }


    if (
        block.typeId === "minecraft:waxed_exposed_copper_golem_statue" &&
        !player.hasTag("staff")
    ) {
        event.cancel = true;

        const direction = block.permutation.getState("minecraft:cardinal_direction");
        const { x, y, z } = block.location;
        const dimension = block.dimension;

        system.run(() => {
            dimension.setBlockType({ x, y, z }, "minecraft:air");

            const newPermutation = BlockPermutation.resolve(
                "minecraft:waxed_exposed_copper_golem_statue",
                { "minecraft:cardinal_direction": direction }
            );

            dimension.setBlockPermutation({ x, y, z }, newPermutation);
        });
    }
});

world.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player;

  if (!event.initialSpawn) return;
  player.teleport({ x: 178, y: 118, z: -6})
  player.removeTag('inPlots')
  if (player.hasTag("joined_before")) return;

  let count = world.getDynamicProperty("player_count");
  if (count === undefined) count = 0;

  count = Number(count) + 1;

  world.setDynamicProperty("player_count", count);
  player.setDynamicProperty("player_id", count);
  player.setDynamicProperty("joinDate", Date.now());

  player.addTag("joined_before");

  const inventory = player.getComponent("minecraft:inventory")?.container;
  if (inventory) {
    const item = new ItemStack("vanguard:gui", 1);
    item.keepOnDeath = true;
    item.lockMode = ItemLockMode.inventory;
    inventory.setItem(8, item);
  }

  world.sendMessage(`§3Welcome §l>§b>§3> §r§bWelcome our new member, §3${player.name}§b! [§r§7#${count}§b]`);
});


function getItemComponent(entity) {
    if (!entity.isValid) return
    return entity.getComponent("minecraft:item")
}

function formatItem(entity, stack) {
    const customName = stack.nameTag
    let itemName

    if (customName && customName.length > 0) {
        itemName = customName
    } else {
        const rawId = stack.typeId.startsWith("minecraft:") 
  ? stack.typeId.replace("minecraft:", "") 
  : stack.typeId.replace("vanguard:", "");
        itemName = rawId
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
    }

    entity.nameTag = `§3${stack.amount}x §f${itemName}`
}

function updateNearby(dimension, location) {
    const nearby = dimension.getEntities({
        type: "minecraft:item",
        location,
        maxDistance: 3
    })

    for (const entity of nearby) {
        if (!entity.isValid) continue

        const comp = getItemComponent(entity)
        if (!comp) continue

        formatItem(entity, comp.itemStack)
    }
}

world.afterEvents.entitySpawn.subscribe(event => {
    const entity = event.entity
    if (entity.typeId !== "minecraft:item") return
    if (!entity.isValid) return

    const comp = getItemComponent(entity)
    if (!comp) return

    formatItem(entity, comp.itemStack)
})

world.beforeEvents.entityRemove.subscribe(event => {
    const entity = event.removedEntity
    if (entity.typeId !== "minecraft:item") return
    if (!entity.isValid) return

    const dimension = entity.dimension
    const location = { ...entity.location }

    system.run(() => {
        updateNearby(dimension, location)
    })
})