import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Plots } from "../modules/plots";

let activeMath = null;
let activeScramble = null;

world.beforeEvents.chatSend.subscribe(ev => {
  const { sender, message } = ev;
  ev.cancel = true;

  if (sender.hasTag('muted')) return

  if ([...message].filter(c => c === "").length > 3) {
    system.run(() =>
      world.getDimension("overworld").runCommand(
        `kick "${sender.name}" §cInvalid chat packet.`
      )
    );
    world.sendMessage(`§r§7» §b${sender.name}§3 was kicked for Crash Exploit [§bc§3]`);
    return;
  }

  if (activeMath && message.trim() === String(activeMath.answer)) {
    const balance = sender.getDynamicProperty("balance") ?? 0;
    let prize;

    if (balance < 1000) {
      prize = Math.floor(Math.random() * 501) + 500;
    } else {
      const percent = Math.random() * 0.15 + 0.1;
      prize = Math.max(1, Math.floor(balance * percent));
    }

    sender.setDynamicProperty("balance", balance + prize);
    system.run(() => sender.playSound('ui.big_claim'))
    world.sendMessage(`§bMath Event §3§l>§b>§3> §r§b${sender.name} solved it and won §a$${metricScores(prize)}§b!`);
    activeMath = null;
    return;
  }

  if (activeScramble && message.trim().toLowerCase() === activeScramble.word.toLowerCase()) {
    const balance = sender.getDynamicProperty("balance") ?? 0;
    let prize;

    if (balance < 1000) {
      prize = Math.floor(Math.random() * 501) + 500;
    } else {
      const percent = Math.random() * 0.15 + 0.1;
      prize = Math.max(1, Math.floor(balance * percent));
    }

    sender.setDynamicProperty("balance", balance + prize);
    system.run(() => sender.playSound('ui.big_claim'))
    world.sendMessage(`§bScramble Event §3§l>§b>§3> §r§b${sender.name} unscrambled the word and won §a$${metricScores(prize)}§b!`);
    activeScramble = null;
    return;
  }

  if (!sender.getTags().includes("staff")) {
    const now = Date.now();

    if (sender.lastMessage === message) {
      sender.sendMessage(" §4§lError§r§c You can't send the same message twice.");
      system.run(() => sender.playSound("item.shield.block", { pitch: 0.8 }));
      return;
    }

    if (sender.lastTime && now - sender.lastTime < 1250) {
      sender.sendMessage(" §4§lError§r§c Please do not spam.");
      system.run(() => sender.playSound("item.shield.block", { pitch: 0.8 }));
      return;
    }

    sender.lastMessage = message;
    sender.lastTime = now;
  }

  let rawRank = sender.getTags().find(t => t.startsWith("rank:"))?.slice(5) ?? "";
  const cleanRank = rawRank.replace(/§./g, "");
  const chars = [...cleanRank];

  const isSingleGlyph =
    chars.length === 1 &&
    chars[0].codePointAt(0) >= 0xe000 &&
    chars[0].codePointAt(0) <= 0xf8ff;

  if (!isSingleGlyph) {
    rawRank = `§7[${rawRank}§7]`;
  }

  const balance = sender.getDynamicProperty("balance") ?? 0;
  const nick = sender.getTags().find(t => t.startsWith("nick:"))?.slice(5) ?? sender.name;
  const color = sender.getTags().find(t => t.startsWith("nc:"))?.slice(3) ?? "§7";
  const teamTag = Plots.getTeamTag(sender);
  if (teamTag) {
      world.sendMessage(`§a$${metricScores(balance)} §8[§r${teamTag}§r§8] §r${rawRank}§r${color} ${nick}: §r§f${message}`);
  } else {
      world.sendMessage(`§a$${metricScores(balance)} §r${rawRank}§r${color} ${nick}: §r§f${message}`);
  }
});

function metricScores(value) {
  if (value <= 0) return "0";
  const types = ["", "k", "m", "b", "t", "p", "e", "z", "y"];
  const selectType = (Math.log10(value) / 3) | 0;
  if (selectType === 0) return value.toString();
  const scaled = value / Math.pow(10, selectType * 3);
  return scaled.toFixed(2) + types[selectType];
}

function generateMathProblem() {
  const difficulty = Math.random();
  let question = "";
  let answer = 0;

  if (difficulty < 0.4) {
    const operations = ["+", "-", "*"];
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operator = operations[Math.floor(Math.random() * operations.length)];

    if (operator === "+") answer = num1 + num2;
    if (operator === "-") answer = num1 - num2;
    if (operator === "*") answer = num1 * num2;

    question = `${num1} ${operator} ${num2}`;
  } else if (difficulty < 0.75) {
    const a = Math.floor(Math.random() * 50) + 10;
    const b = Math.floor(Math.random() * 50) + 10;
    const c = Math.floor(Math.random() * 10) + 1;
    const operator = Math.random() < 0.5 ? "+" : "-";
    const inner = operator === "+" ? a + b : a - b;
    answer = inner * c;
    question = `(${a} ${operator} ${b}) * ${c}`;
  } else {
    const a = Math.floor(Math.random() * 100) + 50;
    const b = Math.floor(Math.random() * 20) + 1;
    const c = Math.floor(Math.random() * 20) + 1;
    const d = Math.floor(Math.random() * 10) + 1;
    const formatType = Math.floor(Math.random() * 3);

    if (formatType === 0) {
      answer = (a + b) * (c - d);
      question = `(${a} + ${b}) * (${c} - ${d})`;
    } else if (formatType === 1) {
      answer = Math.floor(a / b) + c * d;
      question = `${a} / ${b} + ${c} * ${d}`;
    } else {
      answer = a - b * c + d;
      question = `${a} - (${b} * ${c}) + ${d}`;
    }
  }

  return { question, answer };
}

const words = [
  "Skygen","Sword","Pickaxe","Diamond","Portal","Nether","Dragon","Cactus","Zombie","Potion","Coal",
  "California","Romance","Barrel","Minecraft","Enderman","Generator","Vyse","Vortex","Scramble",
  "Plots","Iron","Dirt","Homeless","Job","Unemployed","Mcdonalds","Word","Crafting","Furnace",
  "Apple","Enchanted Book","Sticky Piston","Nether Fortress","End Crystal","Block of Iron","Obsidian",
  "Blaze Powder","Redstone Dust","Stonecutter","Nether Quartz","Brewing Stand","Block of Coal",
  "Diamond Helmet","Golden Apple","Dark Prismarine","Vyse xyz","Monster Spawner","Spawn Egg",
  "Glow Lichen","Reinforced Deepslate","Pointed Dripstone","Spore Blossom","Budding Amethyst",
  "Azalea","Bone Meal","Small Dripleaf","Soul Sand","Sculk Shrieker","Sculk Sensor","Chorus Fruit",
  "Rotten Flesh","Respawn Anchor","Blast Furnace","Netherite Scrap","Wooden Sword","Shulker Box",
  "Glowstone Dust","Slime Block","Command Block","Dripstone Block","Mossy Cobblestone","Warped Fungus",
  "Crimson Roots","Villager House","Zombie Pigman","Netherite Ingot","Beacon Base","Cartography Table"
];

function shuffle(word) {
  return word.split(" ").map(part => {
    const arr = part.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join("");
  }).join(" ");
}

function SlotGrab(slot, x, y, z) {
  const chestLocation = { x, y, z };
  const chest = world.getDimension("overworld").getBlock(chestLocation);
  const chestInventory = chest.getComponent("minecraft:inventory")?.container;
  return chestInventory?.getItem(slot);
}

function startDropParty(chestCoords) {
  const delayTicks = 800;
  const runTicks = 400;
  const spawnInterval = 5;

  world.sendMessage(
    `§3§lDrop Party §r§7» §bDrop party starting in ${delayTicks / 20} seconds at spawn.`
  );

  system.runTimeout(() => {
    world.sendMessage(
      `§3§lDrop Party §r§7» §bThe drop party has started!`
    );

    let ticks = 0;

    const intervalId = system.runInterval(() => {
      if (ticks >= runTicks) {
        system.clearRun(intervalId);
        world.sendMessage(
          `§3§lDrop Party §r§7» §bThe drop party has ended.`
        );
        return;
      }

      if (ticks % spawnInterval === 0) {
        const slot = Math.floor(Math.random() * 27);

        const item = SlotGrab(
          slot,
          chestCoords.x,
          chestCoords.y,
          chestCoords.z
        );

        if (!item) return;

        const spawnLoc = { x: 145, y: 124, z: -6 };

        const itemEntity = world
          .getDimension("overworld")
          .spawnItem(item, spawnLoc);

        const angle = Math.random() * Math.PI * 2;
        const horizontalSpeed = Math.random() * 0.9 + 0.3;
        const y = Math.random() * 0.3 + 0.3;
        const x = Math.cos(angle) * horizontalSpeed;
        const z = Math.sin(angle) * horizontalSpeed;

        itemEntity.applyImpulse({ x, y, z });
      }

      ticks++;
    }, 1);
  }, delayTicks);
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
  const { id } = event;

  if (id === "t:drop_party") {
    playSoundAll("beacon.power")
    startDropParty({ x: 9981, y: 101, z: 9999 });
  }

  if (id === "t:black_market") {
    playSoundAll("beacon.power")
    startBlackMarket()
  }

  if (id === "t:op_drop_party") {
    playSoundAll("beacon.activate")
    startDropParty({ x: 9979, y: 101, z: 9999 });
  }

  if (id === "t:math") {
    playSoundAll("random.orb")
    const { question, answer } = generateMathProblem();
    activeMath = { question, answer };
    world.sendMessage(
      `\n  \n \n§bMath Event §3§l>§b>§3> §r§bSolve the equation: §3${question}§b!\n `
    );
  }


  if (id === "t:scramble") {
    playSoundAll("random.orb")
    const word = words[Math.floor(Math.random() * words.length)];
    const scrambled = shuffle(word);
    activeScramble = { word };
    world.sendMessage(
      `\n  \n \n§bScramble Event §3§l>§b>§3> §r§bUnscramble the word "§3${scrambled}§b"!\n `
    );
  }


  if (id === "t:haste_event") {
    playSoundAll("random.levelup")
    world.sendMessage(
      ` \n§6Haste Event §e§l>§6>§e> §r§6Everyone now has haste for 3 minutes!\n `
    );

    const interval = system.runInterval(() => {
      for (const player of world.getPlayers()) {
        player.addEffect("haste", 20, { amplifier: 1, showParticles: false });
      }
    }, 20);

    system.runTimeout(() => {
      system.clearRun(interval);
    }, 3600);
  }
});

function playSoundAll(soundId) {
  for (const player of world.getAllPlayers()) {
    player.playSound(soundId)
  }
}

const blItems = [
  { id: "minecraft:enchanted_golden_apple", amount: 1, maxStock: 5, price: 25000000, name: "Enchanted Golden Apple", icon: "textures/items/apple_golden" },
  { id: "minecraft:bedrock", amount: 1, maxStock: 3, price: 125000000, name: "Bedrock", icon: "textures/blocks/bedrock" },
  { id: "vanguard:autominer", amount: 1, maxStock: 3, price: 325000000, name: "Autominer", icon: "textures/items/custom/autominer" }
]

function startBlackMarket() {
  const overworld = world.getDimension("overworld")
  world.sendMessage(` \n §5The black market has appeared somewhere in spawn..\n `)
  world.structureManager.place("blackMarket", overworld, { x: 199, y: 146, z: -34 })
  playSoundAll("random.levelup")
  const copy = [...blItems]
  const picked = []
  for (let i = 0; i < 3 && copy.length > 0; i++) {
    const index = Math.floor(Math.random() * copy.length)
    const item = copy.splice(index, 1)[0]
    picked.push({ id: item.id, amount: item.amount, price: item.price, name: item.name, icon: item.icon })
  }
  for (const item of picked) {
    world.setDynamicProperty(item.id, blItems.find(x => x.id === item.id).maxStock)
  }
  world.setDynamicProperty("currentBlackMarketItems", JSON.stringify(picked))
  system.runTimeout(() => {
    for (const entity of overworld.getEntities({ tags: ["blackMarket"] })) {
      entity.kill()
    }
    world.sendMessage(` \n §5The black market has vanished..\n `)
    world.setDynamicProperty("currentBlackMarketItems", JSON.stringify([]))
  }, 6000)
}

function blackMarket(player) {
  const marketStr = world.getDynamicProperty("currentBlackMarketItems")
  if (!marketStr) return
  const marketItems = JSON.parse(marketStr)
  if (!marketItems.length) return
  const form = new ActionFormData().title("Black Market")
  for (const item of marketItems) {
    const stock = world.getDynamicProperty(item.id)
    if (stock > 0) form.button(`§b${item.name}\n§a$${metricScores(item.price)} §7§l| §r§7Stock: ${stock}`, item.icon)
    else form.button(`§b${item.name}\n§cOUT OF STOCK`, item.icon)
  }
  form.show(player).then(r => {
    if (r.canceled) return
    const selected = marketItems[r.selection]
    let stock = world.getDynamicProperty(selected.id)
    if (stock <= 0) {
      player.playSound("item.shield.block", { pitch: 0.8 })
      player.sendMessage(" §4§lError§r§c This item is sold out!")
      return
    }
    const bal = Number(player.getDynamicProperty("balance")) || 0
    if (bal < selected.price) {
      player.playSound("item.shield.block", { pitch: 0.8 })
      player.sendMessage(" §4§lError§r§c Insufficient funds!")
      return
    }
    const invComp = player.getComponent("minecraft:inventory")
    if (!invComp) return
    const container = invComp.container
    if (!container) return
    const stack = new ItemStack(selected.id, selected.amount)
    const leftover = container.addItem(stack)
    if (leftover) {
      player.playSound("item.shield.block", { pitch: 0.8 })
      player.sendMessage(" §4§lError§r§c Your inventory is full.")
      return
    }
    player.setDynamicProperty("balance", bal - selected.price)
    world.setDynamicProperty(selected.id, stock - 1)
    player.playSound("random.orb")
    player.sendMessage(`§a Purchased §l${selected.name}§r§a for §l$${metricScores(selected.price)}§r§a.`)
  })
}

world.beforeEvents.playerInteractWithEntity.subscribe(event => {
  const player = event.player
  const target = event.target
  if (target.typeId === "minecraft:npc" && target.hasTag("blackMarketNPC")) {
    event.cancel = true
    system.run(() => {
      blackMarket(player)
      player.playSound("random.pop")
    })
  }
})