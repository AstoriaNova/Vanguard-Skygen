import { EquipmentSlot, ItemLockMode, system, world } from "@minecraft/server";
import Item from "../utils/item";
export default class Stats {
        static ForceUI() {
        system.runInterval(() => {
            const UIItem = {
                typeId: "vanguard:gui",
                nameTag: "§r§l§bVanguard GUI",
                keepOnDeath: true,
                lockMode: ItemLockMode.inventory,
            };
            for (const player of world.getAllPlayers()) {
                let cursorItem;
                try {
                    const cursorComponent = player.getComponent("cursor_inventory");
                    cursorItem = cursorComponent?.item;
                }
                catch {
                    cursorItem = undefined;
                }
                const items = player
                    .findItem("vanguard:gui")
                    .filter((item) => item.slot !== EquipmentSlot.Mainhand);
                if (cursorItem?.typeId === "vanguard:gui" || items.length > 0) {
                    if (items.length > 1) {
                        player.findItemAndDelete("vanguard:gui");
                        player.addInventoryItem(Item.Create(UIItem));
                    }
                    continue;
                }
                if (items.length === 0) {
                    player.addInventoryItem(Item.Create(UIItem));
                }
            }
        }, 100);
    }
}