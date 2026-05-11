import { CustomCommandStatus, system, world } from "@minecraft/server"

export function baltopCommand(origin) {
    const source = origin.sourceEntity
    if (!source) return { status: CustomCommandStatus.Failure }

    let leaderboard = {}
    const raw = world.getDynamicProperty("moneyLeaderboard3")

    if (typeof raw === "string") {
        try {
            leaderboard = JSON.parse(raw)
        } catch {
            leaderboard = {}
        }
    }

    const sorted = Object.entries(leaderboard).sort((a, b) => b[1] - a[1])

    let text = "§3§lBalance Leaderboard\n§r§3----------------------------------------------------"

    for (let i = 0; i < 10; i++) {
        const entry = sorted[i]

        if (entry) {
            const name = entry[0]
            const val = Number(entry[1]) || 0

            let displayVal
            if (val >= 1_000_000_000) displayVal = "$" + (val / 1_000_000_000).toFixed(1) + "B"
            else if (val >= 1_000_000) displayVal = "$" + (val / 1_000_000).toFixed(1) + "M"
            else if (val >= 1_000) displayVal = "$" + (val / 1_000).toFixed(1) + "K"
            else displayVal = "$" + val

            text += `\n§b${i + 1}. §3${name} §b${displayVal}`
        } else {
            text += `\n§b${i + 1}. §3N/A`
        }
    }

    text += "\n§r§3----------------------------------------------------"

    source.sendMessage(text)

    return { status: CustomCommandStatus.Success }
}