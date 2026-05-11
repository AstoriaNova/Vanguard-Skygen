import { system, world } from "@minecraft/server";
import clientInfo from "./clientInfo";
import { ArmorKitSystem } from "./under-armor";
import { Plots } from "./plots";

export default class Names {
    static async Init() {
        system.runInterval(() => {
            this.PlayerNames()
        }, 20)
    }
    
static PlayerNames() {
    const Players = world.getPlayers()
    for (const player of Players) {
        const health = player.getComponent('health').currentValue;
        const nick = player.getTags().find(t => t.startsWith("nick:"))?.slice(5) ?? player.name;
        const color = player.getTags().find(t => t.startsWith("nc:"))?.slice(3) ?? "§7";
        const items = (ArmorKitSystem)["getItems"]?.(player);
        const highestKit = ArmorKitSystem.getHighestKit(items);
        const tierIcon = ArmorKitSystem.getKitTier(highestKit);
        
        const teamTag = Plots.getTeamTag(player);
        
        if (teamTag) {
            player.nameTag = `${tierIcon} | ${color}${nick}\n §r§c ${health.toFixed(2)}\n§f${clientInfo.getPlatform(player)} | ${clientInfo.getDevice(player)}\n§8[§r${teamTag}§r§8]`;
        } else {
            player.nameTag = `${tierIcon} | ${color}${nick} §r§c ${health.toFixed(2)}\n§f${clientInfo.getPlatform(player)} | ${clientInfo.getDevice(player)}`;
        }
    }
}

    static UpdateItemNames(event) {
        const entity = event.entity ?? event.removedEntity;
        if (!entity || !entity.isValid || entity.typeId !== "minecraft:item") return;

        function formatItem(ent) {
            const itemComp = ent.getComponent("item")?.itemStack;
            if (!itemComp) return;

            const base = itemComp.typeId.split(":")[1];
            const name = itemComp.nameTag ?? (base
                ? base
                    .split("_")
                    .map(word => word[0].toUpperCase() + word.slice(1))
                    .join(" ")
                : itemComp.typeId);

            ent.nameTag = `§b${name}\n§8[ §9${itemComp.amount}§8/§9${itemComp.maxAmount} §8]`;
        }

        formatItem(entity);

        const nearby = entity.dimension.getEntities({
            type: "minecraft:item",
            location: entity.location,
            maxDistance: 3
        });

        for (const nearbyItem of nearby) {
            if (!nearbyItem.isValid) continue;
            formatItem(nearbyItem);
        }
    }
}