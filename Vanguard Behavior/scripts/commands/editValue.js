import { CustomCommandStatus } from "@minecraft/server"

export function editValueCommand(origin, operation, key, value, players) {
    const source = origin.sourceEntity

    if (!source.hasTag("owner")) {
        return {
            status: CustomCommandStatus.Failure,
            message: "You do not have permission to use this command."
        }
    }

    const op = operation.toLowerCase()
    const validOps = ["set", "add", "remove"]
    if (!validOps.includes(op)) {
        return {
            status: CustomCommandStatus.Failure,
            message: `Invalid operation '${operation}'. Use: set, add, or remove.`
        }
    }

    const numValue = Number(value)
    if (isNaN(numValue)) {
        return {
            status: CustomCommandStatus.Failure,
            message: `Value '${value}' must be a number.`
        }
    }

    for (const player of players) {
        let current = player.getDynamicProperty(key)
        if (typeof current !== "number") current = 0

        if (op === "set") {
            player.setDynamicProperty(key, numValue)
        } else if (op === "add") {
            player.setDynamicProperty(key, current + numValue)
        } else if (op === "remove") {
            player.setDynamicProperty(key, current - numValue)
        }
    }

    return {
        status: CustomCommandStatus.Success,
        message: `Operation '${op}' applied on '${key}' with value '${numValue}' to ${players.length} player(s).`
    }
}
