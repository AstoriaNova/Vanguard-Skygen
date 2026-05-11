import { Cache } from "../modules/cache";
import { EquipmentSlot, Player, system, world } from "@minecraft/server";
// Messaging
Player.prototype.sendSuccess = function (message) {
    this.playSound("random.orb");
    this.sendMessage(" §l§aSuccess§r§2 " + message);
};
Player.prototype.sendError = function (message) {
    this.playSound("item.shield.block", { pitch: 0.8 });
    this.sendMessage(" §l§4Error§r§c " + message);
};
Player.prototype.sendWarning = function (message) {
    this.playSound("random.break");
    this.sendMessage(" §l§gWarning§r§e " + message);
};
// Inventory
Player.prototype.container = function () {
    return this.getComponent("inventory").container;
};
Player.prototype.inventoryItems = function () {
    const items = [];
    const container = this.container();
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (!item) {
            continue;
        }
        items.push({ data: item, slot: i });
    }
    return items;
};
Player.prototype.clearInventory = function () {
    const container = this.container();
    const items = this.inventoryItems();
    for (const item of items) {
        container.setItem(item.slot);
    }
};
Player.prototype.setInventoryItem = function (slot, item) {
    this.container().setItem(slot, item);
};
Player.prototype.addInventoryItem = function (item) {
    this.container().addItem(item);
};
Player.prototype.emptyInventorySlots = function () {
    return this.container().emptySlotsCount;
};
// Equipment
Player.prototype.equipment = function () {
    return this.getComponent("equippable");
};
Player.prototype.equipmentItems = function () {
    const items = [];
    const equipment = this.equipment();
    for (const key of Object.keys(EquipmentSlot)) {
        const item = equipment.getEquipment(key);
        if (!item)
            continue;
        items.push({
            data: item,
            slot: key,
            nameTag: item.nameTag ?? "",
            typeId: item.typeId
        });
    }
    return items;
};
Player.prototype.clearEquipment = function () {
    const equipment = this.equipment();
    const items = this.equipmentItems();
    for (const item of items) {
        equipment.setEquipment(item.slot);
    }
};
Player.prototype.setEquipmentItem = function (slot, item) {
    this.equipment().setEquipment(slot, item);
};
// Both
Player.prototype.allItems = function () {
    return [...this.inventoryItems(), ...this.equipmentItems()];
};
Player.prototype.clear = function () {
    this.clearInventory();
    this.clearEquipment();
};
Player.prototype.findItem = function (typeId) {
    return this.allItems().filter((item) => item.data.typeId === typeId);
};
Player.prototype.findItemAndDelete = function (typeId) {
    const items = this.findItem(typeId);
    if (items.length === 0) {
        return;
    }
    for (const item of items) {
        switch (typeof item.slot) {
            case "string":
                this.equipment().setEquipment(item.slot);
                break;
            case "number":
                this.container().setItem(item.slot);
                break;
        }
    }
};
Player.prototype.findItemAndReplace = function (typeId, replacer) {
    const items = this.findItem(typeId);
    if (items.length === 0) {
        return;
    }
    for (const item of items) {
        switch (typeof item.slot) {
            case "string":
                this.equipment().setEquipment(item.slot, replacer);
                break;
            case "number":
                this.container().setItem(item.slot, replacer);
                break;
        }
    }
};
// CPS
Player.prototype.getCPS = function () {
    Cache.CPS[this.id] = (Cache.CPS[this.id] ?? []).filter((entry) => entry > Date.now() - 1000);
    return Cache.CPS[this.id].length;
};
Player.prototype.addCPS = function () {
    const CPS = (Cache.CPS[this.id] ?? []).filter((entry) => entry > Date.now() - 1000);
    CPS.push(Date.now());
    Cache.CPS[this.id] = CPS;
};
// Reach
Player.prototype.setReach = function (target) {
    const reach = Math.sqrt(Math.pow(this.location.x - target.x, 2) +
        Math.pow(this.location.z - target.z, 2));
    Cache.Reach[this.id] = {
        value: reach,
        time: Date.now()
    };
};

Player.prototype.getReach = function () {
    const data = Cache.Reach[this.id];
    if (!data)
        return "0.00";
    if (Date.now() - data.time > 10_000) {
        delete Cache.Reach[this.id];
        return "0.00";
    }
    return data.value.toFixed(2);
};
// Combo
Player.prototype.getCombo = function () {
    return Cache.Combo[this.id] ?? 0;
};
Player.prototype.addCombo = function () {
    Cache.Combo[this.id] = (Cache.Combo[this.id] ?? 0) + 1;
};