import { world, system } from "@minecraft/server"

system.run(() => {
    world.sendMessage(`   \n§b§l Vanguard §r§3scripts reloaded.\n   `)
})

import './intervals.js'

import './commands/register.js'

import './systems/starterKit.js'
import './systems/chat.js'
import './systems/misc.js'
import './systems/gens.js'
import './systems/ui.js'
import Combat from "./modules/combat.js"
import { Cache } from "./modules/cache.js"
import "./events.js"
import { ArmorKitSystem } from "./modules/under-armor.js"
import Names from "./modules/names.js"
import Stats from "./modules/stats.js"
Combat.Init()
Cache.Init()
ArmorKitSystem.Init(20)
Names.Init()
Stats.ForceUI()
export const redeemCodes = {
  "FREE2026": 500,
  "Aiden Isaiah Lucas": 1500,
};


/*

do famouse npc ui

events:
 black market

 black market cords:
 loaad structure blackMarket: 199 146 -34

 kill all entities with tag blackMarket
 and click npc with tag blackMarketNPC

*/

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
    const player = event.player;
    
    if (!event.isFirstEvent || !player.isSneaking) return;
    
    const item = player.getComponent("inventory").container.getItem(player.selectedSlotIndex);
    
    if (!item || item.typeId !== "minecraft:stick") return;
    
    const itemName = item.nameTag?.toLowerCase() || "";
    if (itemName !== "§l§bsell wand" && itemName !== "sell wand") return;
    
    const block = event.block;
    const blockType = block.typeId;
    
    const validContainers = [
        "minecraft:chest",
        "minecraft:barrel",
        "minecraft:shulker_box",
        "minecraft:trapped_chest",
        "minecraft:hopper"
    ];
    
    if (!validContainers.includes(blockType)) return;
    
    event.cancel = true;
    
    const container = block.getComponent("inventory")?.container;
    if (!container) {
        player.sendError("Could not access container inventory.");
        return;
    }
    
    const sells = [
        { name: "Dirt", typeId: "minecraft:dirt", price: 1 },
        { name: "Sand", typeId: "minecraft:sand", price: 2 },
        { name: "Moss", typeId: "minecraft:moss_block", price: 4 },
        { name: "Oak Log", typeId: "minecraft:oak_log", price: 8 },
        { name: "Cobblestone", typeId: "minecraft:cobblestone", price: 16 },
        { name: "Coal", typeId: "minecraft:coal", price: 18 },
        { name: "Iron", typeId: "minecraft:raw_iron", price: 20 },
        { name: "Redstone", typeId: "minecraft:redstone", price: 13 },
        { name: "Gold", typeId: "minecraft:raw_gold", price: 80 },
        { name: "Lapis", typeId: "minecraft:lapis_lazuli", price: 20 },
        { name: "Diamond", typeId: "minecraft:diamond", price: 150 },
        { name: "Emerald", typeId: "minecraft:emerald", price: 350 },
        { name: "Ancient Debris", typeId: "minecraft:ancient_debris", price: 450 },
        { name: "Iron Block", typeId: "minecraft:iron_block", price: 750 },
        { name: "Gold Block", typeId: "minecraft:gold_block", price: 900 },
        { name: "Diamond Block", typeId: "minecraft:diamond_block", price: 1200 },
        { name: "Emerald Block", typeId: "minecraft:emerald_block", price: 2250 },
        { name: "Netherite Block", typeId: "minecraft:netherite_block", price: 3500 },
        { name: "Netherrack", typeId: "minecraft:netherrack", price: 3000 },
        { name: "Soul Soil", typeId: "minecraft:soul_soil", price: 3300 },
        { name: "Nether Wart", typeId: "minecraft:nether_wart_block", price: 3800 },
        { name: "Magma", typeId: "minecraft:magma", price: 4200 },
        { name: "Shroomlight", typeId: "minecraft:shroomlight", price: 4600 },
        { name: "End Stone", typeId: "minecraft:end_stone", price: 5000 },
        { name: "Amethyst", typeId: "minecraft:amethyst_block", price: 5400 },
        { name: "Purpur", typeId: "minecraft:purpur_block", price: 6000 },
        { name: "Purpur Pillar", typeId: "minecraft:purpur_pillar", price: 6500 },
        { name: "Lodestone", typeId: "minecraft:lodestone", price: 7500 },
        { name: "Chiseled Nether", typeId: "minecraft:chiseled_nether_bricks", price: 9000 },
        { name: "Obsidian", typeId: "minecraft:obsidian", price: 11000 },
        { name: "Crying Obsidian", typeId: "minecraft:crying_obsidian", price: 15000 },
        { name: "Beacon", typeId: "minecraft:beacon", price: 25000 },
    ];
    
    const prestige = player.getDynamicProperty("prestige") || 0;
    const multiplier = 1 + prestige * 0.25;
    
    let totalValue = 0;
    const itemsToRemove = {};
    const itemsToKeep = [];
    
    sells.forEach(s => {
        itemsToRemove[s.typeId] = 0;
    });
    
    for (let i = 0; i < container.size; i++) {
        const slot = container.getItem(i);
        if (!slot) continue;
        
        const sellItem = sells.find(s => s.typeId === slot.typeId);
        if (sellItem) {
            itemsToRemove[sellItem.typeId] += slot.amount;
            totalValue += slot.amount * sellItem.price;
        } else {
            itemsToKeep.push({ index: i, item: slot });
        }
    }
    
    if (totalValue === 0) {
        system.run(() => {
        player.sendError("This container has no sellable items.")});
        return;
    }
    
    totalValue = Math.floor(totalValue * multiplier);
    
    system.run(() => {
        try {
            for (let i = 0; i < container.size; i++) {
                container.setItem(i, undefined);
            }
            
            itemsToKeep.forEach(({ index, item }) => {
                container.setItem(index, item);
            });
            
            const currentBalance = player.getDynamicProperty("balance") || 0;
            player.setDynamicProperty("balance", currentBalance + totalValue);
            
            const soldItems = sells
                .filter(s => itemsToRemove[s.typeId] > 0)
                .map(s => `${itemsToRemove[s.typeId]}x ${s.name}`)
                .join(", ");
            
            player.sendMessage(`§a Sold §f${soldItems}§a for §l$${metricScores(totalValue)}§r§a.`);
            player.playSound("random.orb");
        } catch (error) {
            console.warn(`[Sell Wand] Error: ${error}`);
            player.sendError("An error occurred while selling items.");
        }
    });
});

function metricScores(value) {
  const types = ["", "k", "m", "b", "t", "p", "e", "z", "y"];
  const selectType = (Math.log10(value) / 3) | 0;
  if (selectType == 0) return value;
  let scaled = value / Math.pow(10, selectType * 3);
  return scaled.toFixed(2) + types[selectType];
}