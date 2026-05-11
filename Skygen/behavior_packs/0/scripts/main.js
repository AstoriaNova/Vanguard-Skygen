import { world, system } from "@minecraft/server"

system.run(() => {
    world.sendMessage(`   \n§b§l Vanguard §r§3scripts reloaded.\n   `)
})

import './intervals.js'

import './commands/register.js'

import './systems/starterKit.js'
import './systems/killing.js'
import './systems/plots.js'
import './systems/chat.js'
import './systems/misc.js'
import './systems/gens.js'
import './systems/ui.js'

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