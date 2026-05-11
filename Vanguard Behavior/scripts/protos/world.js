import { Dimension, ItemStack, World } from "@minecraft/server";
// General
World.prototype.runCommand = function (command, dimension) {
    (dimension ?? this.overworld()).runCommand(command);
};
// Dimensions
World.prototype.overworld = function () {
    return this.getDimension("overworld");
};
World.prototype.nether = function () {
    return this.getDimension("nether");
};
World.prototype.end = function () {
    return this.getDimension("end");
};
// Players
World.prototype.findPlayer = function (id) {
    return this.getAllPlayers().find((player) => player.id === id);
};
// Entities
World.prototype.entityCount = function (dimension) {
    return (dimension ?? this.overworld()).getEntities().length;
};
// Ticking Areas
World.prototype.loadArea = async function (location) {
    const id = UUID();
    this.runCommand(`tickingarea add circle ${location.x} ${location.y} ${location.z} 4 "${id}"`);
    await Sleep(100);
    return id;
};
World.prototype.unloadArea = function (id) {
    this.runCommand(`tickingarea remove "${id}"`);
};
// Blocks
World.prototype.getContainer = function (location, dimension) {
    const block = (dimension ?? this.overworld()).getBlock(location);
    if (!block) {
        return undefined;
    }
    return block.getComponent("inventory")?.container;
};
World.prototype.getContainerItems = function (location, dimension) {
    const container = this.getContainer(location, dimension ?? this.overworld());
    const items = [];
    if (!container) {
        return items;
    }
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (!item) {
            continue;
        }
        items.push(item);
    }
    return items;
};
// Broadcasting
World.prototype.broadcast = function (message) {
    for (const player of this.getAllPlayers()) {
        player.sendMessage(message);
    }
};
World.prototype.broadcastInfo = function (message) {
    for (const player of this.getAllPlayers()) {
        player.sendInfo(message);
    }
};
World.prototype.broadcastSuccess = function (message) {
    for (const player of this.getAllPlayers()) {
        player.sendSuccess(message);
    }
};
World.prototype.broadcastWarning = function (message) {
    for (const player of this.getAllPlayers()) {
        player.sendWarning(message);
    }
};
World.prototype.broadcastError = function (message) {
    for (const player of this.getAllPlayers()) {
        player.sendError(message);
    }
};

World.prototype.staffAlert = function (message) {
    const players = this.getPlayers({ tags: ["Staff"] })
    players.forEach((player) => {
        player.sendMessage(` §l§gStaff Alert§r§e  ${message}`)
    })
}