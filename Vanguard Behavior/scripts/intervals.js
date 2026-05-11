import { world, system } from "@minecraft/server";
function getDurabilitySymbol(item) {
  if (!item || item.typeId === "minecraft:air") return " §c||||||||||";
  if (!item.getComponent("durability")) return "§c||||||||||";

  const durability = item.getComponent("durability");
  const maxDurability = durability?.maxDurability ?? 0;
  const damage = durability?.damage ?? 0;

  if (maxDurability <= 0) return "§c||||||||||";

  const durabilityPercent = Math.max(
    0,
    Math.min(100, Math.floor(((maxDurability - damage) / maxDurability) * 100))
  );
  const greenBars = Math.max(
    0,
    Math.min(10, Math.floor(durabilityPercent / 10))
  );
  const redBars = Math.max(0, 10 - greenBars);

  return `${getArmorSymbol(item.typeId)} ${"§a|".repeat(
    greenBars
  )}${"§c|".repeat(redBars)}`;
}

function getArmorSymbol(typeId) {
  const armorIcons = {
    "minecraft:diamond_helmet": "",
    "minecraft:iron_helmet": "",
    "minecraft:leather_helmet": "",
    "minecraft:chainmail_helmet": "",
    "minecraft:netherite_helmet": "",
    "minecraft:diamond_chestplate": "",
    "minecraft:iron_chestplate": "",
    "minecraft:leather_chestplate": "",
    "minecraft:chainmail_chestplate": "",
    "minecraft:netherite_chestplate": "",
    "minecraft:diamond_leggings": "",
    "minecraft:iron_leggings": "",
    "minecraft:leather_leggings": "",
    "minecraft:chainmail_leggings": "",
    "minecraft:netherite_leggings": "",
    "minecraft:diamond_boots": "",
    "minecraft:iron_boots": "",
    "minecraft:leather_boots": "",
    "minecraft:chainmail_boots": "",
    "minecraft:netherite_boots": "",
  };
  return armorIcons[typeId] || "❓";
}

function metricScores(value) {
  const types = ["", "k", "m", "b", "t", "p", "e", "z", "y"];
  const selectType = (Math.log10(value) / 3) | 0;
  if (selectType == 0) return value;
  let scaled = value / Math.pow(10, selectType * 3);
  return scaled.toFixed(2) + types[selectType];
}

function toRomanNumeral(num) {
  if (!+num) return 0;
  var digits = String(+num).split(""),
    key = [
      "",
      "C",
      "CC",
      "CCC",
      "CD",
      "D",
      "DC",
      "DCC",
      "DCCC",
      "CM",
      "",
      "X",
      "XX",
      "XXX",
      "XL",
      "L",
      "LX",
      "LXX",
      "LXXX",
      "XC",
      "",
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
    ],
    roman = "",
    i = 3;
  while (i--) roman = (key[+digits.pop() + i * 10] || "") + roman;
  return Array(+digits.join("") + 1).join("M") + roman;
}


function getPlayerTeam(player) {
  const name = player.getDynamicProperty("team")
  if (typeof name !== "string") return undefined
  return getTeam(name)
}

function getTeam(name) {
  const raw = world.getDynamicProperty("team:" + name)
  if (typeof raw !== "string") return undefined
  return JSON.parse(raw)
}

const dashLines = [
  "§f---§3---§b---§f---§3---§b---§f---§3---§b---§f---§3---§b---§f---",
  "§3---§b---§f---§3---§b---§f---§3---§b---§f---§3---§b---§f---§3---",
  "§b---§f---§3---§b---§f---§3---§b---§f---§3---§b---§f---§3---§b---",
];


let currentDashLineIndex = 0;

system.runInterval(() => {
  const dashLine = dashLines[currentDashLineIndex];

  world.getAllPlayers().forEach((player) => {
    const equipment = {
      Head: player.getComponent("equippable").getEquipment("Head"),
      Chest: player.getComponent("equippable").getEquipment("Chest"),
      Legs: player.getComponent("equippable").getEquipment("Legs"),
      Feet: player.getComponent("equippable").getEquipment("Feet"),
    };

    const armorHealth = Object.values(equipment)
      .map((item, index) =>
        index === 1 ? getDurabilitySymbol(item) + "\n" : getDurabilitySymbol(item)
      )
      .join("   ");

const activeEffects = player.getEffects()
  .filter(e => e.typeId !== "minecraft:regeneration" && e.typeId !== "minecraft:saturation" && e.typeId !== "minecraft:weakness")
  .map(e => {
    const name = formatEffectName(e.typeId);
    const level = e.amplifier + 1;
    const displayLevel = level === 1 ? "" : ` §b${toRomanNumeral(level)}`;
    return `§3${name}${displayLevel} §b${(e.duration / 20).toFixed(1)}s`;
  })
  .join("\n   ");



    const effectsPrefix = activeEffects ? "\n   " : "";

    const kills = parseFloat(player.getDynamicProperty("kills") || 0) || 0;
    const deaths = parseFloat(player.getDynamicProperty("deaths") || 0) || 0;
    const kdr = deaths === 0 ? kills.toFixed(2) : (kills / deaths).toFixed(2);

    const prestigeVal = player.getDynamicProperty("prestige") || 0;
    const prestige = toRomanNumeral(prestigeVal);
    const mult = 1 + prestigeVal * 0.25;

    const warnings = player.getDynamicProperty("warnings") || 0;

    player.onScreenDisplay.setTitle(
      `§r§r${dashLine}\n§3 Balance: §b$${metricScores(player.getDynamicProperty("balance") || 0)}\n§3 Time: §b${formatTime(player)}
§3 Warnings: §b${warnings}/4
§3 Prestige: §b${prestige} [${mult}x]
§3 Kills: §b${metricScores(kills)} [${kdr}]
§3 Deaths: §b${metricScores(deaths)}
${dashLine}\n §3Online: §b${world.getAllPlayers().length}/25\n §3Discord: §bn75YfSxCJF\n §3Add to Join: §bNotVyse`,
      { 
        subtitle: `   ${armorHealth}${effectsPrefix}${activeEffects}`,
        fadeInDuration: 1,
        stayDuration: 1,
        fadeOutDuration: 1,
      }
    );

    currentDashLineIndex = (currentDashLineIndex + 1) % dashLines.length;
  });
}, 20);

function formatEffectName(str) {
  const name = str.includes(":") ? str.split(":")[1] : str;
  return name
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function addScore(player, score, amount) {
  const currentScore = player.getDynamicProperty(score) || 0;
  player.setDynamicProperty(score, currentScore + amount);
}

function formatTime(player) {
  const days = player.getDynamicProperty("days") || 0;
  const hours = player.getDynamicProperty("hours") || 0;
  const minutes = player.getDynamicProperty("minutes") || 0;

  return `${days}d ${hours}h ${minutes}m`;
}


system.runInterval(() => {
  world.getAllPlayers().forEach(player => {

    let minutes = Number(player.getDynamicProperty("minutes")) || 0;
    let hours   = Number(player.getDynamicProperty("hours")) || 0;
    let days    = Number(player.getDynamicProperty("days")) || 0;

    minutes++;

    if (minutes >= 60) {
      minutes = 0;
      hours++;
      if (hours >= 24) {
        hours = 0;
        days++;
      }
    }

    player.setDynamicProperty("minutes", minutes);
    player.setDynamicProperty("hours", hours);
    player.setDynamicProperty("days", days);

  });
}, 1200);

function getDevice(player) {
  const mode = player.inputInfo.lastInputModeUsed
  if (mode === "KeyboardAndMouse") return "Keyboard"
  if (mode === "MotionController" || mode === "Gamepad") return "Controller"
  return mode
}
function getPlatform(player) {
  const { platformType } = player.clientSystemInfo;
  switch (platformType) {
    case "Desktop":
      return "";

    case "Console":
      return "";

    case "Mobile":
      return "";
  }
}

world.afterEvents.pressurePlatePush.subscribe((event) => {
    const { block, source } = event

    if (block.x !== 173 || block.y !== 118 || block.z !== -6) return
    if (source.typeId !== "minecraft:player") return

    const view = source.getViewDirection()

    const horizontal = { x: view.x, y: 0, z: view.z }
    const length = Math.hypot(horizontal.x, horizontal.z)

    if (length === 0) return

    horizontal.x /= length
    horizontal.z /= length

    source.applyKnockback(
        { x: horizontal.x * 12, y: 12, z: horizontal.z * 25 },
        1
    )
})

system.runInterval(() => {
  const overworld = world.getDimension("overworld");
  const entities = overworld.getEntities();

  const players = world.getPlayers();

  for (const entity of entities) {
    if (entity.typeId !== "da:floating_text") continue;

    const showMoney = entity.hasTag("moneylb");
    const showKills = entity.hasTag("killslb");

    if (!showMoney && !showKills) continue;

    const leaderboardKey = showMoney
      ? "moneyLeaderboard4"
      : "killsLeaderboard3";

    let leaderboard = {};
    const raw = world.getDynamicProperty(leaderboardKey);
    if (typeof raw === "string") {
      try { leaderboard = JSON.parse(raw); } catch {}
    }

    for (const player of players) {
      if (showMoney) {
        const val = player.getDynamicProperty("balance") || 0;
        leaderboard[player.name] = val;
      } else if (showKills) {
        const val = player.getDynamicProperty("kills") || 0;
        leaderboard[player.name] = val;
      }
    }

    world.setDynamicProperty(leaderboardKey, JSON.stringify(leaderboard));

    const sorted = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]);

    let title = showMoney ? "Balance Leaderboard" : "Kills Leaderboard";
    let text = `§3§l ${title} \n§r§3--------------------------------`;

    for (let i = 0; i < 10; i++) {
      const entry = sorted[i];
      if (entry) {
        const val = entry[1];
        let displayVal;
        if (showMoney) {
          if (val >= 1_000_000_000) displayVal = "$" + (val / 1_000_000_000).toFixed(1) + "B";
          else if (val >= 1_000_000) displayVal = "$" + (val / 1_000_000).toFixed(1) + "M";
          else if (val >= 1_000) displayVal = "$" + (val / 1_000).toFixed(1) + "K";
          else displayVal = "$" + val;
        } else {
          displayVal = val.toString();
        }

        text += `\n§b${i + 1}. §3${entry[0]} §b${displayVal}`;
      } else {
        text += `\n§b${i + 1}. §3N/A`;
      }
    }

    text += `\n§r§3--------------------------------`;
    entity.nameTag = text;
  }
}, 3600);