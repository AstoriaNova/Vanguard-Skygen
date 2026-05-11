import { CustomCommandStatus, system } from "@minecraft/server"

const cooldownLength = 600000

export function repairCommand(origin) {
    const source = origin.sourceEntity
    const now = Date.now()

    if (!source.hasTag("repair")) {
        source.sendMessage(` §4§lError§r§c You do not have access to this command. Please purchase /repair in the donator shop.`)
        system.run(() => {
            source.playSound("item.shield.block", { pitch: 0.8 })
        })
       return
    }

    const lastUse = source.getDynamicProperty("repairCooldown")

    if (typeof lastUse === "number" && now - lastUse < cooldownLength) {
        const remaining = cooldownLength - (now - lastUse)
        const minutes = Math.floor(remaining / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        source.sendMessage(` §4§lError§r§c You must wait ${minutes}m ${seconds}s before using this again.`)
        system.run(() => {
            source.playSound("item.shield.block", { pitch: 0.8 })
        })
        return
    }

    system.run(() => {
        const inventory = source.getComponent("inventory")
        const container = inventory.container

        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i)
            if (!item) continue
            const durability = item.getComponent("durability")
            if (!durability) continue
            durability.damage = 0
            container.setItem(i, item)
        }

        source.setDynamicProperty("repairCooldown", now)
        source.sendMessage(`§a All items have been fully repaired.`)
        system.run(() => source.playSound("random.levelup"))
    
    })

    return
}