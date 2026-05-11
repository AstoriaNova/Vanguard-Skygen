import { EnchantmentType, ItemLockMode, ItemStack } from "@minecraft/server";
export default class Item {
    static Create(data) {
        const item = new ItemStack(data.typeId, data.amount);
        item.nameTag = data.nameTag;
        item.keepOnDeath = data.keepOnDeath ?? false;
        item.lockMode = data.lockMode ?? ItemLockMode.none;
        if (data.damage) {
            const component = item.getComponent("durability");
            if (component) {
                component.damage = data.damage;
            }
        }
        if (data.enchants) {
            const component = item.getComponent("enchantable");
            if (component) {
                try {
                    component.addEnchantments(data.enchants.map((enchant) => {
                        return {
                            level: enchant.level,
                            type: new EnchantmentType(enchant.id),
                        };
                    }));
                }
                catch { }
            }
        }
        if (data.properties) {
            for (const [key, value] of Object.entries(data.properties)) {
                item.setDynamicProperty(key, value);
            }
        }
        if (data.lore) {
            item.setLore(data.lore);
        }
        return item;
    }
}
