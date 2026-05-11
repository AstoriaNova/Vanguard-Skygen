import { system, world, ItemStack, GameMode, Potions } from "@minecraft/server";
import "../protos/main"

system.beforeEvents.startup.subscribe((event) => {
  VanguardGenerators.OnStartup(event)
})
const minerCooldowns = new Map();

export default class VanguardGenerators {
  static OnStartup(event) {
    const { blockComponentRegistry } = event;

    const generators = [
      { id: "vanguard:dirt_gen_component", output: "minecraft:dirt" },
      { id: "vanguard:sand_gen_component", output: "minecraft:sand" },
      { id: "vanguard:moss_gen_component", output: "minecraft:moss_block" },
      { id: "vanguard:oak_log_gen_component", output: "minecraft:oak_log" },
      { id: "vanguard:cobblestone_gen_component", output: "minecraft:cobblestone" },
      { id: "vanguard:coal_ore_gen_component", output: "minecraft:coal_ore" },
      { id: "vanguard:iron_ore_gen_component", output: "minecraft:iron_ore" },
      { id: "vanguard:redstone_ore_gen_component", output: "minecraft:redstone_ore" },
      { id: "vanguard:gold_ore_gen_component", output: "minecraft:gold_ore" },
      { id: "vanguard:lapis_ore_gen_component", output: "minecraft:lapis_ore" },
      { id: "vanguard:diamond_ore_gen_component", output: "minecraft:diamond_ore" },
      { id: "vanguard:emerald_ore_gen_component", output: "minecraft:emerald_ore" },
      { id: "vanguard:ancient_debris_gen_component", output: "minecraft:ancient_debris" },
      { id: "vanguard:iron_block_gen_component", output: "minecraft:iron_block" },
      { id: "vanguard:gold_block_gen_component", output: "minecraft:gold_block" },
      { id: "vanguard:diamond_block_gen_component", output: "minecraft:diamond_block" },
      { id: "vanguard:emerald_block_gen_component", output: "minecraft:emerald_block" },
      { id: "vanguard:netherite_block_gen_component", output: "minecraft:netherite_block" },
      { id: "vanguard:netherrack_gen_component", output: "minecraft:netherrack" },
      { id: "vanguard:soul_soil_gen_component", output: "minecraft:soul_soil" },
      { id: "vanguard:nether_wart_gen_component", output: "minecraft:nether_wart_block" },
      { id: "vanguard:magma_gen_component", output: "minecraft:magma" },
      { id: "vanguard:shroomlight_gen_component", output: "minecraft:shroomlight" },
      { id: "vanguard:end_stone_gen_component", output: "minecraft:end_stone" },
      { id: "vanguard:amethyst_gen_component", output: "minecraft:amethyst_block" },
      { id: "vanguard:purpur_gen_component", output: "minecraft:purpur_block" },
      { id: "vanguard:purpur_pillar_gen_component", output: "minecraft:purpur_pillar" },
      { id: "vanguard:lodestone_gen_component", output: "minecraft:lodestone" },
      { id: "vanguard:chiseled_nether_gen_component", output: "minecraft:chiseled_nether_bricks" },
      { id: "vanguard:obsidian_gen_component", output: "minecraft:obsidian" },
      { id: "vanguard:crying_obsidian_gen_component", output: "minecraft:crying_obsidian" },
      { id: "vanguard:beacon_gen_component", output: "minecraft:beacon" }
    ];

    for (const gen of generators) {
      blockComponentRegistry.registerCustomComponent(gen.id, {
        onTick: ({ block, dimension }) => {
          const above = block.above();
          if (above?.typeId === "minecraft:air") {
            dimension.setBlockType({
              ...block.location,
              y: block.location.y + 1,
            }, gen.output);
          }
        }
      });
    }

    blockComponentRegistry.registerCustomComponent("vanguard:autominer_component", {
      onTick: ({ block, dimension }) => {
        const key = `${block.location.x},${block.location.y},${block.location.z}`;

        if (minerCooldowns.has(key)) return;

        const below = block.below();
        if (!below) return;
        if (below.typeId === "minecraft:air" || below.typeId.includes("vanguard")) return;

        const blockDrops = {
          "minecraft:coal_ore": "minecraft:coal",
          "minecraft:iron_ore": "minecraft:raw_iron",
          "minecraft:gold_ore": "minecraft:raw_gold",
          "minecraft:redstone_ore": "minecraft:redstone",
          "minecraft:lit_redstone_ore": "minecraft:redstone",
          "minecraft:lapis_ore": "minecraft:lapis_lazuli",
          "minecraft:diamond_ore": "minecraft:diamond",
          "minecraft:emerald_ore": "minecraft:emerald",
          "minecraft:ancient_debris": "minecraft:ancient_debris"
        };

        const dropId = blockDrops[below.typeId] || below.typeId;

        below.setType("minecraft:air");
        dimension.spawnItem(new ItemStack(dropId, 1), below.center());

        minerCooldowns.set(key, true);

        system.runTimeout(() => {
          minerCooldowns.delete(key);
        }, 10);
      }
    });
  }
}

world.beforeEvents.playerBreakBlock.subscribe((event) => {
  const player = event.player;
  const block = event.block;
  const typeId = block.typeId;

  const blocksMined = player.getDynamicProperty("blocksMined") || 0
  player.setDynamicProperty("blocksMined", blocksMined + 1)

  if (player.getGameMode() === "Creative") return;
  if (!typeId.startsWith("vanguard:") || !typeId.endsWith("_gen")) return;
  
  event.cancel = true;

  const speed = block.permutation.getState("vanguard:speed");
  const amount = speed + 1;

  const rawName = typeId.split(":")[1].replace("_gen", "");
  const formattedName = rawName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const item = new ItemStack(typeId, amount);
  const inventory = player.getComponent("minecraft:inventory")?.container;
  system.run(() => {
    block.setType("minecraft:air");
  });

  let dropped = false;

  if (inventory) {
    system.run(() => {
      const leftover = inventory.addItem(item);
      if (leftover) {
        player.dimension.spawnItem(leftover, player.location);
        dropped = true;
      }
    });
  } else {
    system.run(() => {
      player.dimension.spawnItem(item, player.location);
      dropped = true;
    });
  }

  system.run(() => {
    if (dropped) {
      player.sendError(`${formattedName} Generator§r§c has dropped on the ground.`)
    } else {
      player.sendMessage(
        ` §a§lSuccess §r§2You picked up §a§l${amount}x ${formattedName} Generator§r§a.`,
      );
      player.playSound("ui.claim");
    }
  });
});