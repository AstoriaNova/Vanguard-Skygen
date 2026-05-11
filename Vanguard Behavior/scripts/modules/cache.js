import { system, world, World } from "@minecraft/server";

World.prototype.findPlayer = function (id) {
    return this.getAllPlayers().find((player) => player.id === id);
};

export class Cache {
    static CPS = {};
    static Reach = {};
    static Combo = {};
    static CombatTime = {};

    static async Init() {
        this.CombatLoop();
    }

    static CombatLoop() {
        system.runInterval(() => {
            for (const [entity_id, time] of Object.entries(this.CombatTime)) {
                const player = world.findPlayer(entity_id);
                if (!player) {
                    delete this.CombatTime[entity_id];
                    continue;
                }
                if (time - 1 === 0) {
                    delete this.CombatTime[entity_id];
                    player.sendSuccess(`You have gotten out of combat!`)
                    player.playSound("note.harp");
                    continue;
                }
                this.CombatTime[entity_id] = time - 1;
            }
        }, 20);
    }
}