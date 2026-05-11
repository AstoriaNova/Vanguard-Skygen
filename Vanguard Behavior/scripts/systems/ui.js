import { world, system, ItemStack, EnchantmentTypes, InputPermissionCategory, GameMode } from "@minecraft/server";
import { ActionFormData, ModalFormData, uiManager } from "@minecraft/server-ui";
import { redeemCodes } from "../main.js";
// import { getPlayerPlot, getTeammatePlots, plots, getPlots } from "./plots.js";
import "../protos/main"
import { Plots } from "../modules/plots.js";


world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
  const { player, target } = event;

  if (target.hasTag("vanguard:shop")) {
    event.cancel = true;

    system.run(() => {
      player.playSound("ui.unlock");
      player.teleport({ x: 159, y: 114, z: 30 });
      const loc = player.location;
      player.spawnParticle("tropical:crate_explosion", {
        x: loc.x,
        y: loc.y + 0.5,
        z: loc.z,
      });
    });
  }

  if (target.hasTag("vanguard:plots")) {
    event.cancel = true;

    system.run(() => {
      player.playSound("ui.unlock");
      player.teleport({ x: 5017, y: 104, z: 5018 });
      player.sendMessage(
        `§a You have warped to Plots. To go back, use GUI > Warps.`,
      );
      player.addTag("inPlots");
    });
  }

  if (target.hasTag("vanguard:discord")) {
    event.cancel = true;

    system.run(() => {
      player.playSound("random.pop");
      discordUI(player);
    });
  }
  if (target.hasTag("vanguard:stats")) {
    event.cancel = true;

    system.run(() => {
      player.playSound("random.pop");
      statisticsMenu(player)
    });
  }
  if (target.hasTag("vanguard:gambleMenu")) {
    event.cancel = true;

    system.run(() => {
      player.playSound("random.pop");
      gamblingMenu(player);
    });
  }
  if (target.hasTag("vanguard:prestige")) {
    event.cancel = true;

    system.run(() => {
      showPrestigeForm(player);
    });
  }
  if (target.hasTag("vanguard:gen_shop")) {
    event.cancel = true;

    system.run(() => {
      player.playSound("random.pop");
      openGenShop(player);
    });
  }
  if (target.hasTag("vanguard:sell_ui")) {
    event.cancel = true;

    system.run(() => {
      player.playSound("random.pop");
      openSellUI(player);
    });
  }
});

function metricScores(value) {
  const types = ["", "k", "m", "b", "t", "p", "e", "z", "y"];
  const selectType = (Math.log10(value) / 3) | 0;
  if (selectType == 0) return value;
  let scaled = value / Math.pow(10, selectType * 3);
  return scaled.toFixed(2) + types[selectType];
}

function SlotGrab(slot, x, y, z) {
  const chest = world.getDimension("overworld").getBlock({ x, y, z });
  const container = chest.getComponent("minecraft:inventory").container;
  return container.getItem(slot);
}

export function openSellUI(player) {
  const form = new ModalFormData()
    .title("Sell Items")
    .dropdown("   \n§bSelect an item to sell.\n   ", [
      "§7Sell All",
      ...sells.map((s) => `§7${s.name} §a$${metricScores(s.price)}`),
    ]);

  form.show(player).then((r) => {
    if (r.canceled) return;

    const selection = r.formValues[0];
    const inv = player.getComponent("minecraft:inventory")?.container;
    if (!inv) return;

    const prestige = player.getDynamicProperty("prestige") || 0;
    const multiplier = 1 + prestige * 0.25;

    function getItemCount(typeId) {
      let total = 0;
      for (let i = 0; i < inv.size; i++) {
        const slot = inv.getItem(i);
        if (slot && slot.typeId === typeId) total += slot.amount;
      }
      return total;
    }

    function removeItemType(typeId, amount) {
      for (let i = 0; i < inv.size; i++) {
        const slot = inv.getItem(i);
        if (slot && slot.typeId === typeId) {
          if (slot.amount > amount) {
            slot.amount -= amount;
            inv.setItem(i, slot);
            return;
          } else {
            amount -= slot.amount;
            inv.setItem(i, undefined);
            if (amount <= 0) return;
          }
        }
      }
    }

    if (selection === 0) {
      let total = 0;
      sells.forEach((s) => {
        const count = getItemCount(s.typeId);
        if (count > 0) {
          removeItemType(s.typeId, count);
          total += count * s.price;
        }
      });
      if (total === 0) {
        player.sendMessage(" §4§lError§r§c You have nothing to sell.");
        player.playSound("item.shield.block", { pitch: 0.8 });
        return;
      }
      total = Math.floor(total * multiplier);
      const bal = player.getDynamicProperty("balance") || 0;
      player.setDynamicProperty("balance", bal + total);
      player.sendMessage(
        `§a Sold all items for §l$${metricScores(total)}§r§a.`,
      );
      player.playSound("random.orb");
    } else {
      const s = sells[selection - 1];
      const count = getItemCount(s.typeId);
      if (count === 0) {
        player.sendMessage(` §4§lError§r§c You don't have any ${s.name}.`);
        player.playSound("item.shield.block", { pitch: 0.8 });
        return;
      }
      removeItemType(s.typeId, count);
      let total = Math.floor(count * s.price * multiplier);
      const bal = player.getDynamicProperty("balance") || 0;
      player.setDynamicProperty("balance", bal + total);
      player.sendMessage(
        `§a Sold ${count}x ${s.name} for §l$${metricScores(total)}§r§a.`,
      );
      player.playSound("random.orb");
    }
  });
}

function discordUI(player) {
  const form = new ModalFormData()
    .title("Discord Code")
    .header("§bJoin our Discord!")
    .label("§3discord.gg/xZBGyUYX8G")
    .label("§3Go to §b#discord-code §3to get your code.")
    .divider()
    .textField("§bEnter Code:", "discord.gg/xZBGyUYX8G")
    .submitButton("§b§lClaim");

  form.show(player).then((res) => {
    if (res.canceled) return;

    const code = res.formValues[4]?.trim();

    if (player.hasTag("dc_claimed")) {
      player.playSound("random.break");
      player.sendMessage(" §4§lError§r§c Already Claimed");
      return;
    }

    if (code !== "DC5000") {
      player.sendMessage(" §4§lError§r§c Invalid Code");
      player.playSound("item.shield.block", { pitch: 0.8 });
      return;
    }

    let bal = player.getDynamicProperty("balance") ?? 0;
    player.setDynamicProperty("balance", bal + 1000);
    player.addTag("dc_claimed");

    player.playSound("random.levelup");
    player.sendMessage(
      "§3§lDiscord Code §r§7» §b+§3$1,000 §badded to your balance.",
    );
  });
}

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  const { block, player } = event;
  const { x, y, z } = block.location;

  if (
    x === 165 &&
    y === 116 &&
    z === -6 &&
    block.typeId === "minecraft:lectern"
  ) {
    event.cancel = true;
    system.run(() => serverRules(player));
  }

  if (
    x === 139 &&
    y === 117 &&
    z === -22 &&
    block.typeId === "minecraft:anvil"
  ) {
    event.cancel = true;
    system.run(() => feedbackMain(player));
  }

  if (
    x === 139 &&
    y === 117 &&
    z === 10 &&
    block.typeId === "minecraft:ender_chest"
  ) {
    event.cancel = true;
    system.run(() => {
      donatorShopMain(player);
      player.playSound("random.enderchestopen");
    });
  }

  if (
    x === 150 &&
    y === 115  &&
    z === 41 &&
    block.typeId === "minecraft:brewing_stand"
  ) {
    event.cancel = true;
    system.run(() => {
      player.playSound("random.pop");
      achievementsMain(player);
    });
  }

  if (
    x === 159 &&
    y === 115 &&
    z === 39 &&
    block.typeId === "minecraft:chest"
  ) {
    event.cancel = true;
    system.run(() => {
      player.playSound("random.chestopen");
      itemShop(player)
    });
  }

  if (
    x === 142 &&
    y === 115 &&
    z === 40 &&
    block.typeId === "minecraft:enchanting_table"
  ) {
    event.cancel = true;
    system.run(() => {
      enchantShop(player)
    });
  }

});

 const items = [
    {
      id: "minecraft:totem_of_undying",
      amount: 1,
      price: 350000,
      name: "Totem of Undying",
      icon: "textures/items/totem"
    },
    {
      id: "minecraft:netherite_upgrade_smithing_template",
      amount: 1,
      price: 125000,
      name: "Netherite Upgrade Template",
      icon: "textures/items/netherite_upgrade_smithing_template"
    },
    {
      id: "minecraft:experience_bottle",
      amount: 32,
      price: 35000,
      name: "Exp Bottles 32x",
      icon: "textures/items/experience_bottle"
    },
    {
      id: "minecraft:golden_apple",
      amount: 16,
      price: 20000,
      name: "Golden Apples 16x",
      icon: "textures/items/apple_golden"
    },
    {
      id: "minecraft:snowball",
      amount: 16,
      price: 500,
      name: "Snowballs 16x",
      icon: "textures/items/snowball"
    }
  ];

function itemShop(player) {
  const form = new ActionFormData().title("Item Shop");

  for (const item of items) {
    form.button(`§b${item.name}\n§a$${metricScores(item.price)}`, item.icon);
  }

  form.show(player).then((r) => {
    if (r.canceled) return;

    const selected = items[r.selection];
    const bal = Number(player.getDynamicProperty("balance")) || 0;

    if (bal < selected.price) {
      player.sendMessage(" §4§lError§r§c Insufficient funds!");
      player.playSound("item.shield.block", { pitch: 0.8 });
      return;
    }

    const invComp = player.getComponent("minecraft:inventory");
    if (!invComp) return;
    const container = invComp.container;
    if (!container) return;

    const stack = new ItemStack(selected.id, selected.amount);
    const leftover = container.addItem(stack);

    if (leftover) {
      player.sendMessage(" §4§lError§r§c Your inventory is full.");
      player.playSound("item.shield.block", { pitch: 0.8 });
      return;
    }

    player.setDynamicProperty("balance", bal - selected.price);

    player.sendMessage(
      `§a Purchased §l${selected.name}§r§a for §l$${metricScores(selected.price)}§r§a.`
    );
    player.playSound("random.orb");
  });
}

function reachPicker(staff) {

    if (!staff.hasTag("Staff") || staff.hasTag("Prot")) {
        staff.sendMessage("§cYou don't have permission.");
        return;
    }

    const players = world.getPlayers().filter(p => p.id !== staff.id);

    if (players.length === 0) {
        staff.sendMessage("§cNo players available.");
        return;
    }

    const options = players.map(p => p.name);

    const form = new ModalFormData()
        .title("Reach Test")
        .dropdown(" \nSelect player to test\n ", options);

    form.show(staff).then(res => {

        if (res.canceled) return;

        const target = players[res.formValues[0]]
        reachTest(staff, target)

    });
}

function reachTest(player, playerFound) {

    if (!player.hasTag("Staff") || player.hasTag("Prot")) return;

    if (!playerFound) {
        player.sendError(`Player No Longer Valid.`);
        return;
    }

    playerFound.runCommand(`inputpermission set @s movement disabled`)
    playerFound.runCommand(`inputpermission set @s camera disabled`)
    player.runCommand(`inputpermission set @s movement disabled`)
    player.runCommand(`inputpermission set @s camera disabled`)

    const playerLoc = player.location
    const playerTestLoc = playerFound.location

    let spectator = false
    if (player.getGameMode() == GameMode.Spectator) {
        spectator = true
        player.setGameMode(GameMode.Adventure)
    }

    const tpInPlace = system.runInterval(() => {

        const loc = player.location
        const locPl = playerFound.location

        playerFound.teleport(
            { x: loc.x + 3.35, y: loc.y, z: loc.z },
            { facingLocation: { x: loc.x - 3.35, y: loc.y, z: loc.z } }
        )

        player.teleport(
            { x: loc.x, y: loc.y, z: loc.z },
            { facingLocation: locPl }
        )

    })

    let timeOut
    let findHit
    let detected = false

    system.runTimeout(() => {

        findHit = world.afterEvents.entityHitEntity.subscribe((data) => {

            if (data.damagingEntity.id === playerFound.id && data.hitEntity.id === player.id) {

                const dx = player.location.x - playerFound.location.x
                const dy = player.location.y - playerFound.location.y
                const dz = player.location.z - playerFound.location.z

                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

                if (distance >= 3.31) {
                    detected = true

                    for (const player of world.getPlayers({ tags: ["Staff"] })) {
    player.sendMessage(
        `\n§l§3--------------------\n` +
        `Reach Detected: ${playerFound.name}.\n` +
        `§l§3--------------------`
    );
}
                }

                cleanup()
            }

        })

        timeOut = system.runTimeout(() => {

            const dx = player.location.x - playerFound.location.x
            const dy = player.location.y - playerFound.location.y
            const dz = player.location.z - playerFound.location.z

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

            if (!detected) {

                const message =
    `\n§l§3--------------------\n` +
    `Passed Reach C: ${playerFound.name}.\n` +
    `§l§3--------------------`;

for (const staff of world.getPlayers({ tags: ["Staff"] })) {
    staff.sendMessage(message);
}

            }

            cleanup()

        }, 40)

    }, 5)

    function cleanup() {

        system.clearRun(tpInPlace)
        system.clearRun(timeOut)

        if (findHit) {
            world.afterEvents.entityHitEntity.unsubscribe(findHit)
        }

        player.teleport(playerLoc)
        playerFound.teleport(playerTestLoc)

        if (spectator) {
            player.setGameMode(GameMode.Spectator)
        }

        playerFound.runCommand(`inputpermission set @s movement enabled`)
        playerFound.runCommand(`inputpermission set @s camera enabled`)
        player.runCommand(`inputpermission set @s movement enabled`)
        player.runCommand(`inputpermission set @s camera enabled`)
    }
}
function aimPicker(staff) {
    const players = world.getPlayers().filter(p => p.id !== staff.id);

    if (!players.length) {
        staff.sendMessage("§cNo players online to check.");
        return;
    }

    const options = players.map(p => p.name);

    const form = new ModalFormData()
        .title("Aimlock Detection")
        .dropdown(" \nSelect a player to check:\n ", options)
        .show(staff)
        .then((response) => {
            if (!response || response.isCanceled) return;

            const selectedIndex = response.formValues[0];
            const target = players[selectedIndex];

            if (!target) {
                staff.sendMessage("§cInvalid selection.");
                return;
            }

            runAimlockDetection(staff, target);
        })
        .catch((err) => {
            console.error(err);
            staff.sendMessage("§cAn error occurred while opening the aimlock picker.");
        });
}

async function runAimlockDetection(staff, target) {
    const startLoc = { x: target.location.x, y: target.location.y, z: target.location.z };
    const startRot = target.getRotation();

    const categories = [
        InputPermissionCategory.Jump,
        InputPermissionCategory.Movement,
        InputPermissionCategory.Sneak,
        InputPermissionCategory.LateralMovement,
        InputPermissionCategory.Mount,
        InputPermissionCategory.Camera,
    ];

    try {
        categories.forEach((c) => target.inputPermissions.setPermissionCategory(c, false));
        const overworld = world.getDimension("overworld");
        const topmost = overworld.getTopmostBlock({ x: startLoc.x, z: startLoc.z });
        target.teleport({ x: topmost.x, y: startLoc.y, z: topmost.z}, { rotation: startRot });

        let snapFlags = 0;
        const dist = 0.55;
        const offset = 0.5;

        for (const dir of [1, -1]) {
            const view = target.getViewDirection();
            const sideX = -view.z * dir;
            const sideZ = view.x * dir;

            staff.teleport(
                {
                    x: startLoc.x + view.x * dist + sideX * offset,
                    y: startLoc.y + 1.2,
                    z: startLoc.z + view.z * dist + sideZ * offset,
                },
                { facingLocation: target.location },
            );

            await new Promise((r) => system.runTimeout(r, 12));

            if (target.getEntitiesFromViewDirection().some((e) => e.entity.id === staff.id)) {
                snapFlags++;
            }
        }

        const endRot = target.getRotation();
const rotDelta = Math.abs(startRot.x - endRot.x) + Math.abs(startRot.y - endRot.y);

if (rotDelta > 0.8) {
    console.log("Flagged");

    const message =
        `\n§l§3--------------------\n` +
        `AA Detected: ${target.name}\n` +
        `ROT: ${rotDelta.toFixed(2)}°\n` +
        `§l§3--------------------`;

    for (const staff of world.getPlayers({ tags: ["Staff"] })) {
        staff.sendMessage(message);
    }
}

if (snapFlags < 2 && rotDelta <= 0.8) {
    const message =
        `\n§l§3--------------------\n` +
        `Passed AA Check: ${target.name}.\n` +
        `§l§3--------------------`;

    for (const staff of world.getPlayers({ tags: ["Staff"] })) {
        staff.sendMessage(message);
    }
}
    } finally {
        categories.forEach((c) => target.inputPermissions.setPermissionCategory(c, true));
    }
}

function donatorShopMain(player) {
  const credits = player.getDynamicProperty("credits") || 0;
  const usd = (credits / 100).toFixed(2);

  new ActionFormData()
    .title("Donator Shop")
    .body(
      `\n§bDonations are used to help keep the server up!\n\n` +
        `§fContact §lVanguard Inc§r§f on xbox to donate. We accept Xbox, Amazon, Cash App, PayPal, & Venmo.\n\n` +
        `§bYou have ${metricScores(credits)} Credits ($${usd} usd).`,
    )
    .button("§bItems\n§7Boost your gameplay!", "textures/ui/icon_blackfriday")
    .button("§bCosmetics\n§7Stylish appearances!", "textures/items/name_tag")
    .show(player)
    .then((response) => {
      switch (response.selection) {
        case 0:
          openItemShop(player);
          break;
        case 1:
          donatorCosmeticsShopMain(player);
          break;
      }
    });
}



function donatorCosmeticsShopMain(player) {
  const credits = Number(player.getDynamicProperty("credits")) || 0;
  const usd = (credits / 100).toFixed(2);

  new ActionFormData()
    .title("Donator Shop")
    .body(
      ` \n§bThese cosmetics give no competitive advantage!\n `
    )
    .button("§bCustom Rank\n§7250 Credits ($2.50)", "textures/items/book_portfolio")
    .button("§bCustom Nickname\n§7250 Credits ($2.50)", "textures/items/book_writable")
    .button("§bUsername Colors\n§7125 Credits ($1.25)", "textures/items/egg_npc")
    .show(player)
    .then((res) => {
      if (res.canceled) return;

      switch (res.selection) {
        case 0:
          openRank(player);
          break;
        case 1:
          openNickname(player);
          break;
        case 2:
          openNameColor(player);
          break;
      }
    });
}
function openItemShop(player) {
    const credits = Number(player.getDynamicProperty("credits")) || 0;
    const usd = (credits / 100).toFixed(2);

    const form = new ActionFormData()
        .title("Item Shop")
        .body(`\n§bBoost your gameplay!\n\n§bYou have ${metricScores(credits)} Credits ($${usd} usd).`)
        .button("§bAuto Miner\n§7300 Credits ($3.00)", "textures/items/custom/autominer");

    if (!player.hasTag('perm_haste')) {
        form.button("§bPermanent Haste\n§71,000 Credits ($10.00)", "textures/ui/haste_effect");
    }

    if (!player.hasTag('repair')) {
        form.button("§bRepair Command\n§71,500 Credits ($15.00)", "textures/items/experience_bottle");
    }

    form.show(player).then((res) => {
        if (res.selection === undefined || res.canceled) return;

        let i = 0;

        if (res.selection === i++) {
            openAutoMiner(player);
            return;
        }

        if (!player.hasTag('perm_haste')) {
            if (res.selection === i++) {
                openPermEffect(player);
                return;
            }
        }

        if (!player.hasTag('repair')) {
            if (res.selection === i++) {
                openRepairCommand(player);
                return;
            }
        }
    });
}

function openAutoMiner(player) {
  const credits = Number(player.getDynamicProperty("credits")) || 0;
  const usd = (credits / 100).toFixed(2);

  new ModalFormData()
    .title("Purchase Auto Miner")
    .label(`\n§bYou have ${metricScores(credits)} Credits ($${usd} usd).\n `)
    .slider("§bAmount to buy", 1, 10, { step: 1, defaultValue: 1 })
    .show(player)
    .then((r) => {
      if (r.canceled) return;

      const amount = Math.floor(r.formValues[1]);
      const totalPrice = amount * 300;

      const error = (msg) => {
        player.sendMessage(` §4§lError§r§c ${msg}`);
        player.playSound("item.shield.block", { pitch: 0.8 });
      };

      if (credits < totalPrice) return error(`Insufficient credits!`);

      const inventory = player.getComponent("minecraft:inventory")?.container;
      if (!inventory) return error("Inventory not found!");

      confirmPurchase(
        player,
        "Purchase Auto Miner",
        `§bAmount: ${amount}`,
        totalPrice,
        () => {
          let current = Number(player.getDynamicProperty("credits")) || 0;
          if (current < totalPrice) return;

          const item = new ItemStack("vanguard:autominer", amount);
          const leftover = inventory.addItem(item);

          if (leftover && leftover.count > 0) return error("Not enough inventory space!");

          player.setDynamicProperty("credits", current - totalPrice);
          player.sendMessage(`§a Purchased ${amount} Auto Miner(s).`);
          player.playSound("random.orb");
        }
      );
    });
}
function openRepairCommand(player) {
  const credits = Number(player.getDynamicProperty("credits")) || 0;
  const usd = (credits / 100).toFixed(2);

  if (player.hasTag("repair")) {
    player.sendMessage(" §4§lError§r§c You have already bought this.");
    return;
  }

  new ActionFormData()
    .title("Purchase Repair Command")
    .body(
      `\n§bPermanently unlock /repair command to repair all items in your inventory instantly.\n\n` +
      `§bYou have ${metricScores(credits)} Credits ($${usd} usd).\n\n`
    )
    .button("§bConfirm", "textures/ui/confirm")
    .button("§bCancel", "textures/ui/realms_red_x")
    .show(player)
    .then((r) => {
      if (r.canceled || r.selection !== 0) return;

      const error = (msg) => {
        player.sendMessage(` §4§lError§r§c ${msg}`);
        player.playSound("item.shield.block", { pitch: 0.8 });
      };

      if (credits < 1500) return error("Insufficient credits!");

      confirmPurchase(
        player,
        "Purchase Repair Command",
        "§3Permanent access to /repair",
        1500,
        () => {
          let current = Number(player.getDynamicProperty("credits")) || 0;
          if (current < 1500) return;

          player.addTag("repair");
          player.setDynamicProperty("credits", current - 1500);

          player.sendMessage("§a You now have access to §l/repair§r§a!");
          player.playSound("random.levelup");
        }
      );
    });
}

function openPermEffect(player) {
  const credits = Number(player.getDynamicProperty("credits")) || 0;
  const usd = (credits / 100).toFixed(2);

  if (player.hasTag("repair")) {
    player.sendMessage(" §4§lError§r§c You have already bought this.");
    return;
  }

  new ActionFormData()
    .title("Purchase Permanent Haste")
    .body(
      `\n§bPermanently unlock haste forever!\n\n` +
      `§bYou have ${metricScores(credits)} Credits ($${usd} usd).\n\n`
    )
    .button("§bConfirm", "textures/ui/confirm")
    .button("§bCancel", "textures/ui/realms_red_x")
    .show(player)
    .then((r) => {
      if (r.canceled || r.selection !== 0) return;

      const error = (msg) => {
        player.sendMessage(` §4§lError§r§c ${msg}`);
        player.playSound("item.shield.block", { pitch: 0.8 });
      };

      if (credits < 1000) return error("Insufficient credits!");

      confirmPurchase(
        player,
        "Purchase Permanent Haste",
        "§3Permanent Haste",
        1000,
        () => {
          let current = Number(player.getDynamicProperty("credits")) || 0;
          if (current < 1000) return;

          player.addTag("perm_haste");
          player.setDynamicProperty("credits", current - 1000);

          player.sendMessage("§a You now have permanent haste!");
          player.playSound("random.levelup");
        }
      );
    });
}

function confirmPurchase(player, title, description, price, onConfirm) {
  new ActionFormData()
    .title("Confirm Purchase")
    .body(
      ` \n§b${title}?\n\n${description}\n\n§b§l${price} §r§bcredits will be deducted.\n `
    )
    .button("§bConfirm", "textures/ui/confirm")
    .button("§bCancel", "textures/ui/realms_red_x")
    .show(player)
    .then((r) => {
      if (r.canceled || r.selection !== 0) return;
      onConfirm();
    });
}

function openRank(player) {
  const credits = Number(player.getDynamicProperty("credits")) || 0;
  const usd = (credits / 100).toFixed(2);

  new ModalFormData()
    .title("Custom Rank")
    .label("§bCreate a custom rank (1-8 characters).\n§7Previous rank will be replaced.")
    .label(`§bYou have ${metricScores(credits)} Credits ($${usd} usd).`,)
    .textField("§bEnter Rank Name:", "")
    .show(player)
    .then((r) => {
      if (r.canceled) return;

      const name = String(r.formValues[2] ?? "").trim();

      const error = (msg) => {
        player.sendMessage(` §4§lError§r§c ${msg}`);
        player.playSound("item.shield.block", { pitch: 0.8 });
      };

      if (credits < 250) return error("Insufficient credits!");
      if (!name) return error("Rank cannot be empty.");
      if (name.length < 1 || name.length > 8)
        return error("Rank must be 1-8 characters long.");
      if (name.includes("")) return error("Invalid character used.");

      confirmPurchase(
        player,
        "Purchase Custom Rank",
        `§b${name}`,
        250,
        () => {
          let current = Number(player.getDynamicProperty("credits")) || 0;
          if (current < 250) return;

          for (const tag of player.getTags()) {
            if (tag.startsWith("rank:")) player.removeTag(tag);
          }

          player.addTag(`rank:${name}`);
          player.setDynamicProperty("credits", current - 250);

          player.sendMessage("§a Custom rank applied successfully.");
          player.playSound("random.orb");
        }
      );
    });
}

function openNickname(player) {
  const credits = Number(player.getDynamicProperty("credits")) || 0;
  const usd = (credits / 100).toFixed(2);

  new ModalFormData()
    .title("Custom Nickname")
    .label("§bLetters and numbers only.\n§7Your previous nickname will be replaced.")
    .label(`§bYou have ${metricScores(credits)} Credits ($${usd} usd).`,)
    .textField("§bEnter Nickname:", "")
    .show(player)
    .then((r) => {
      if (r.canceled) return;

      const name = String(r.formValues[2] ?? "").trim();

      const error = (msg) => {
        player.sendMessage(` §4§lError§r§c ${msg}`);
        player.playSound("item.shield.block", { pitch: 0.8 });
      };

      if (credits < 250) return error("Insufficient credits!");
      if (!/^[A-Za-z0-9]+$/.test(name))
        return error("Nickname must only contain letters and numbers.");

      confirmPurchase(
        player,
        "Purchase Custom Nickname",
        `§b${name}`,
        250,
        () => {
          let current = Number(player.getDynamicProperty("credits")) || 0;
          if (current < 250) return;

          for (const tag of player.getTags()) {
            if (tag.startsWith("nick:")) player.removeTag(tag);
          }

          player.addTag(`nick:${name}`);
          player.setDynamicProperty("credits", current - 250);

          player.sendMessage("§a Custom nickname applied successfully.");
          player.playSound("random.orb");
        }
      );
    });
}

function openNameColor(player) {
  const credits = Number(player.getDynamicProperty("credits")) || 0;
  const usd = (credits / 100).toFixed(2);

const colors = [
  { name: "§0Black", code: "§0" },
  { name: "§1Dark Blue", code: "§1" },
  { name: "§2Dark Green", code: "§2" },
  { name: "§3Dark Aqua", code: "§3" },
  { name: "§4Dark Red", code: "§4" },
  { name: "§5Dark Purple", code: "§5" },
  { name: "§6Gold", code: "§6" },
  { name: "§7Gray", code: "§7" },
  { name: "§8Dark Gray", code: "§8" },
  { name: "§9Blue", code: "§9" },
  { name: "§aGreen", code: "§a" },
  { name: "§bAqua", code: "§b" },
  { name: "§cRed", code: "§c" },
  { name: "§dLight Purple", code: "§d" },
  { name: "§eYellow", code: "§e" },
  { name: "§6Gold", code: "§6" },
  { name: "§fWhite", code: "§f" },
];

  new ModalFormData()
    .title("Username Colors")
    .label(` \n§bYou have ${metricScores(credits)} Credits ($${usd} usd).\n `,)
    .dropdown(
      "§bSelect Color:",
      colors.map((c) => c.name)
    )
    .show(player)
    .then((r) => {
      if (r.canceled) return;

      const error = (msg) => {
        player.sendMessage(` §4§lError§r§c ${msg}`);
        player.playSound("item.shield.block", { pitch: 0.8 });
      };

      if (credits < 125) return error("Insufficient credits!");

      const selected = colors[r.formValues[1]];

      confirmPurchase(
        player,
        "Purchase Username Color",
        `${selected.name}`,
        125,
        () => {
          let current = Number(player.getDynamicProperty("credits")) || 0;
          if (current < 125) return;

          for (const tag of player.getTags()) {
            if (tag.startsWith("nc:")) player.removeTag(tag);
          }

          player.addTag(`nc:${selected.code}`);
          player.setDynamicProperty("credits", current - 125);

          player.sendMessage("§a Username color applied successfully.");
          player.playSound("random.orb");
        }
      );
    });
}


function serverRules(player) {
  player.playSound("random.orb");
  new ActionFormData()
    .title("Vanguard Rules")
    .body(
      `     
§b§l1.§r§3 No hacking or exploiting.
§b§l2.§r§3 No body blocking / switching kits mid fight.
§b§l3.§r§3 No killing two armor tiers below. (Unless hit, or inside base. p.s Weapons count as your tier)
§b§l4.§r§3 Max teams of 5.
§b§l5.§r§3 No combat logging.
§b§l6.§r§3 No 1v3ing.
§b§l7.§r§3 No griefing plots.
§b§l8.§r§3 No invis/small/no armor skins.
 
`,
    )
    .button(
      "§bNo Rule Exceptions\n§7Warn limit bans are 2 weeks.",
      "textures/items/book_written",
    )
    .show(player)
    .then((response) => {
      switch (response.selection) {
        case 0:
          player.playSound("random.orb");
          break;
      }
    });
}

function getFeedbackData() {
  const raw = world.getDynamicProperty("global_feedback_data2");
  if (!raw) return [];
  try {
    return JSON.parse(String(raw));
  } catch {
    return [];
  }
}

function setFeedbackData(data) {
  world.setDynamicProperty("global_feedback_data2", JSON.stringify(data));
}

function feedbackMain(player) {
  player.playSound("random.pop");

  const data = getFeedbackData();

  let avgText = "§7No reviews yet";
  if (data.length) {
    const total = data.reduce((sum, f) => sum + Number(f.stars || 0), 0);
    const avg = total / data.length;
    avgText = `§7(${avg.toFixed(1)} stars)`;
  }

  new ActionFormData()
    .title("Feedback")
    .body("  \n§bHelp improve the server!\n  ")
    .button(
      "§bWrite a Review\n§7Share your thoughts",
      "textures/ui/icon_book_writable",
    )
    .button(
      `§bView Feedback\n§7${avgText}`,
      "textures/ui/chat_send",
    )
    .show(player)
    .then((res) => {
      if (res.canceled) return;
      if (res.selection === 0) feedbackWrite(player);
      if (res.selection === 1) feedbackView(player, 0);
    });
}

function feedbackWrite(player) {
  new ModalFormData()
    .title("Write Feedback")
    .textField(
      "§7Your feedback is limited to 250 characters and will overwrite any previous feedback given. Your feedback is not anonymous.\n\n§bWe strive to make your experience as enjoyable as possible!",
      "Type your feedback here...",
    )
    .slider("§bServer rating (1-5 stars)?", 1, 5, { step: 1 })
    .submitButton("§bSubmit Feedback")
    .show(player)
    .then((res) => {
      if (res.canceled) return;

      const text = String(res.formValues[0] ?? "")
        .slice(0, 250)
        .trim();
      const stars = Number(res.formValues[1] ?? 1);

      if (!text.length) {
        player.sendMessage(" §4§lError§r§c Feedback cannot be empty");
        player.playSound("item.shield.block", { pitch: 0.8 });
        return;
      }

      if (text.length < 5) {
        player.sendMessage(" §4§lError§r§c Feedback is too short");
        player.playSound("item.shield.block", { pitch: 0.8 });
        return;
      }

      const data = getFeedbackData();
      const filtered = data.filter((f) => f.name !== player.name);
      filtered.push({ name: player.name, text, stars });
      setFeedbackData(filtered);

      player.sendMessage(
        "§3§lFeedback §r§7» §3Your feedback has been submitted.",
      );
      player.playSound("random.orb");
    });
}

function feedbackView(player, page) {
  const data = getFeedbackData();

  if (!data.length) {
    player.sendMessage(" §4§lError§r§c No feedback available");
    player.playSound("item.shield.block", { pitch: 0.8 });
    return;
  }

  const entries = data.map(
    (f) => `§b${f.name}: ${"".repeat(f.stars)}§f ${f.text}`,
  );

  const pages = [];
  let current = "";

  for (const entry of entries) {
    const block = `\n${entry}\n \n`;
    if ((current + block).length > 256) {
      pages.push(current);
      current = block;
    } else {
      current += block;
    }
  }

  if (current.length) pages.push(current);
  if (page >= pages.length) page = 0;

  const hasNext = page + 1 < pages.length;
  const isStaff = player.hasTag("staff");

  const form = new ActionFormData().title("View Feedback").body(pages[page]);

  if (hasNext) {
    form.button(`§bNext Page\n§7(${page + 1}/${pages.length})`);
  }

  if (isStaff) {
    form.button("§c§lDelete Suggestion");
  }

  form.show(player).then((res) => {
    if (res.canceled) return;

    let index = 0;

    if (hasNext) {
      if (res.selection === index) {
        feedbackView(player, page + 1);
        return;
      }
      index++;
    }

    if (isStaff) {
      if (res.selection === index) {
        deleteSuggestion(player);
      }
    }
  });
}

function deleteSuggestion(player) {
  const data = getFeedbackData();

  if (!data.length) {
    player.sendMessage(" §4§lError§r§c No feedback to delete");
    player.playSound("item.shield.block", { pitch: 0.8 });
    return;
  }

  const names = data.map((f) => f.name);

  new ModalFormData()
    .title("§3§lDelete Feedback")
    .dropdown("  \n§bSelect a player to delete feedback:", names)
    .submitButton("§cDelete")
    .show(player)
    .then((res) => {
      if (res.canceled) return;

      const index = Number(res.formValues[0] ?? 0);
      if (index < 0 || index >= data.length) return;

      data.splice(index, 1);
      setFeedbackData(data);

      player.sendMessage(" §4§lDeletion§r§c Feedback has been deleted");
      player.playSound("random.break");
    });
}

function formatTime(player) {
  const days = player.getDynamicProperty("days") || 0;
  const hours = player.getDynamicProperty("hours") || 0;
  const minutes = player.getDynamicProperty("minutes") || 0;

  return `${days}d ${hours}h ${minutes}m`;
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

function formatJoinAgo(player) {
  const join = player.getDynamicProperty("joinDate");
  if (!join) return "Unknown";
  const diff = Date.now() - join;
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
  const player = event.player;
  const target = event.target;

  if (target.typeId === "minecraft:player" && !target.hasTag("inPlots")) {
    event.cancel = true;

    system.run(() => {
    showPlayerStats(player, target);
    })
  }
});

function commaFormat(value) {
  const num = Math.floor(Number(value) || 0);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

world.afterEvents.itemUse.subscribe(({ itemStack, source }) => {
  if (itemStack.typeId === "vanguard:gui") mainGUIForm(source);
});

function mainGUIForm(player) {
  const mainForm = new ActionFormData()
    .title("Vanguard SkyGen")
    .body(``)
    .button("§bWarps\n§r§7Go places!", "textures/items/map_locked")
    .button("§bPlots\n§r§7Manage your plot!", "textures/blocks/grass_side_carried")
    .button("§bQuick Utilities\n§r§7Fast actions!", "textures/items/echo_shard")
    .button(
      "§bServer Information\n§r§7Rules & support!",
      "textures/items/book_normal",
    )
    .button(
      "§bDonations\n§r§7Cosmetics & perks!",
      "textures/items/banner_pattern",
    )
    .button("§bStaff Menu\n§r§7Moderation tools!", "textures/ui/settings_glyph_color_2x")

  mainForm.show(player).then((mainResponse) => {
    if (mainResponse.canceled) return;

    switch (mainResponse.selection) {
      case 0:
        warpsMenu(player);
        break;
      case 1:
        openPlotSelectionMenu(player);
        break;
      case 2:
        quickUtilsMenu(player);
        break;
      case 3:
        serverInfoMenu(player);
        break;
      case 4:
        donatorShopMain(player);
        break;
      case 5:
        if (player.hasTag('Staff')) {
          staffMenu(player)
        } else {
          player.sendError(`You are not a moderator.`)
        }
        break
    }
  });
}

function openPlotSelectionMenu(player) {
  const myPlotId = Plots.getMyPlot(player);
  const teamPlotId = Plots.getTeammatePlot(player);
  
  if (!myPlotId && !teamPlotId) {
      player.sendError("First Create A Plot Using A Button On A Plot")
    return;
  }
  
  const form = new ActionFormData()
    .title("Select Plot")
    .body("§bChoose a plot to manage:");
    
  if (myPlotId) {
    const myPlot = Plots.getPlot(myPlotId);
    form.button(`§aYour Plot\n§7${myPlot.claimed_plot ? "§a[loaded]" : "§7[unloaded]"}`);
  }
  
  if (teamPlotId) {
    const teamPlot = Plots.getPlot(teamPlotId);
    form.button(`§b${teamPlot.owner_name}'s Plot\n§7${teamPlot.claimed_plot ? "§a[loaded]" : "§7[unloaded]"}`);
  }
  
  form.show(player).then(response => {
    if (response.canceled) return;
    
    let selectedPlotId = null;
    if (myPlotId && response.selection === 0) {
      selectedPlotId = myPlotId;
    } else if (teamPlotId && response.selection === (myPlotId ? 1 : 0)) {
      selectedPlotId = teamPlotId;
    }
    
    if (!selectedPlotId) return;
    
    const plot = Plots.getPlot(selectedPlotId);
    if (plot && plot.claimed_plot) {
      Plots.openPlotManager(player, selectedPlotId);
    } else {
      player.sendError("Plot is not loaded. Please use a plot button to load it first.");
    }
  });
}

function staffMenu(player) {
  const staffForm = new ActionFormData()
    .title("Staff Menu")
    .body(``)
    .button("§bReach Test\n§r§7[ click ]")
    .button("§bAimlock Test\n§r§7[ click ]")

  staffForm.show(player).then((mainResponse) => {
    if (mainResponse.canceled) return;

    switch (mainResponse.selection) {
      case 0:
        reachPicker(player);
        break;
      case 1:
        aimPicker(player);
        break;
    }
  });
}


function serverInfoMenu(player) {
  const mainForm = new ActionFormData()
    .title("Server Info")
    .body(``)
    .button("§bRules§r§7\nOur guidelines!", "textures/items/book_written")
    .button("§bCredits\n§r§7Developers & owners!", "textures/ui/debug_glyph_color")
    .button("§bFeedback\n§r§7Suggest your ideas!", "textures/ui/chat_send")

  mainForm.show(player).then((mainResponse) => {
    if (mainResponse.canceled) return;

    switch (mainResponse.selection) {
      case 0:
        serverRules(player);
        break;
      case 1:
        serverCreditsMenu(player);
        break;
      case 2:
        feedbackMain(player);
        break;
    }
  });
}

function serverCreditsMenu(player) {
  const mainForm = new ActionFormData()
    .title("Credits")
    .body(` \n§3§lOwner §r§7: Vanguard Inc / Vyse XYZ\n§3§lDeveloper §r§7: Vanguard Inc / Vyse XYZ\n§3§lAdmin §r§7: Sheluvaiiden\n\n§7note: this server is still in pre-release!\n`)
    .button("§bWant to apply?§r§7\nJoin our discord!")

  mainForm.show(player).then((mainResponse) => {
    if (mainResponse.canceled) return;

    switch (mainResponse.selection) {
      case 0:
        serverRules(player);
        break;
      case 1:
        serverCredits(player);
        break;
      case 2:
        feedbackMain(player);
        break;
    }
  });
}
function warpsMenu(player) {
  const form = new ActionFormData()
    .title("Warps")
    .body(" \n§bWhere do you want to go?\n ");

  const actions = [];

  form.button("§3Spawn\n§7[ click ]");
  actions.push({ type: "location", value: { x: 178, y: 118, z: -6 } });

  form.button("§3Shop\n§7[ click ]");
  actions.push({ type: "location", value: { x: 159, y: 114, z: 30 } });

  if (!player.hasTag("inPlots")) {
    form.button("§3Plots\n§7[ click ]");
    actions.push({ type: "plots" });
  }

  // const ownedPlotKey = getPlayerPlot(player.id);
  // const isDayTime = world.scoreboard.getObjective("isDayTime")?.getScore("isDayTime") === 1;
  // if (ownedPlotKey && isDayTime) {
  //   form.button("§3Your Plot\n§7[ click ]");
  //   actions.push({ type: "yourplot", key: ownedPlotKey });
  // }

  // const teammatePlots = getTeammatePlots(player.id);
  // if (teammatePlots && isDayTime) {
  //   const data = getPlots();
  //   teammatePlots.forEach(({ key, plot }) => {
  //     const ownerId = data[key]?.plot_owner;
  //     const ownerPlayer = world.getPlayers().find(p => p.id === ownerId);
  //     const ownerName = ownerPlayer?.name || "Unknown";

  //     form.button(`§3${ownerName}'s Plot\n§7[ click ]`);
  //     actions.push({ type: "teammateplot", plot });
  //   });
  // }

  form.show(player).then((res) => {
    if (res.canceled) return;

    const selection = actions[res.selection];

    function fadeTeleport(location, after) {
      player.camera.fade({
        fadeColor: { red: 0, green: 0.416, blue: 0.486 },
        fadeTime: { fadeInTime: 0.175, holdTime: 0, fadeOutTime: 0.175 },
      });

      system.runTimeout(() => {
        player.teleport(location);
        after?.();
      }, 7);
    }

    if (selection.type === "plots") {
      fadeTeleport({ x: 5017, y: 104, z: 5018 }, () => player.addTag("inPlots"));
      return;
    }

    if (selection.type === "yourplot") {
      const plot = plots[selection.key];
      if (!plot) return;
      fadeTeleport(plot.entrance, () => player.addTag("inPlots"));
      return;
    }

    if (selection.type === "teammateplot") {
      fadeTeleport(selection.plot.entrance, () => player.addTag("inPlots"));
      return;
    }

    if (selection.type === "location") {
      const isNight = world.scoreboard.getObjective("isDayTime")?.getScore("isDayTime") !== 1;

      if (player.hasTag("inPlots") && isNight) {
        let seconds = 10;
        const startLocation = player.location;
          if (!player.isValid) return
        const interval = system.runInterval(() => {
          const current = player.location;
          if (
            Math.floor(current.x) !== Math.floor(startLocation.x) ||
            Math.floor(current.y) !== Math.floor(startLocation.y) ||
            Math.floor(current.z) !== Math.floor(startLocation.z)
          ) {
            player.onScreenDisplay.setActionBar(" §7Warp cancelled.");
            player.playSound("random.break");
            system.clearRun(interval);
            return;
          }

          if (seconds > 0) {
            player.onScreenDisplay.setActionBar(` §b§lWarping\n§r§7 Don't move... ${seconds}  `);
            player.playSound("random.click", { pitch: 0.8 });
            seconds--;
          } else {
            fadeTeleport(selection.value, () => {
              player.removeTag("inPlots");
              player.onScreenDisplay.setActionBar(" §3§lSuccessfully warped!");
            });
            system.clearRun(interval);
          }
        }, 20);
        return;
      }

      fadeTeleport(selection.value);
      return;
    }
  });
}

function quickUtilsMenu(player) {
  const mainForm = new ActionFormData()
    .title("Quick Utilities")
    .body(``)
    .button(
      "§bMoney Transfer\n§r§7Bless someone!",
      "textures/ui/village_hero_effect",
    )
    .button(
      "§bRedeem Code\n§r§7Special rewards!",
      "textures/items/book_writable",
    )
    .button(
      "§bStatistics\n§r§7Player analytics!",
      "textures/ui/recipe_book_icon",
    )
    .button(
      "§bPrestige\n§r§7Rebirth stronger!",
      "textures/ui/jump_boost_effect",
    )
    .button("§bGambling\n§r§7Risk & rewards!", "textures/ui/random_dice");
  mainForm.show(player).then((mainResponse) => {
    if (mainResponse.canceled) return;

    switch (mainResponse.selection) {
      case 0:
        openMoneyTransfer(player);
        break;
      case 1:
        reedemCode(player);
        break;
      case 2:
        statisticsMenu(player);
        break;
      case 3:
        showPrestigeForm(player);
        break;
      case 4:
        gamblingMenu(player);
        break;
    }
  });
}

function showPlayerStats(viewer, target) {
  const balance = target.getDynamicProperty("balance") || 0;
  const warnings = target.getDynamicProperty("warnings") || 0;
  const kills = target.getDynamicProperty("kills") || 0;
  const blocksMined = target.getDynamicProperty("blocksMined") || 0;
  const deaths = target.getDynamicProperty("deaths") || 0;
  const prestigeVal = target.getDynamicProperty("prestige") || 0;
  const playerID = target.getDynamicProperty("player_id") || 0;
  const kdr = deaths === 0 ? kills : (kills / deaths).toFixed(2);

  new ActionFormData()
    .title(`${target.name}`)
    .body(
      `§3§lPLAYER STATISTICS

§r§bBalance: §7$${commaFormat(balance)}
§bPlay Time: §7${formatTime(target)}
§bBlocks Mined: §7${commaFormat(blocksMined)}
§bWarnings: §7${warnings}/4
§bKills: §7${commaFormat(kills)}
§bDeaths: §7${commaFormat(deaths)}
§bKDR: §7${kdr}
§bPrestige: §7${toRomanNumeral(prestigeVal)}`,
    )
    .button(
      `§bJoined ${formatJoinAgo(target)} Ago\n§7Player User ID: #${playerID}`,
    )
    .show(viewer);
}

function statisticsMenu(player) {
  const allPlayers = world.getPlayers();

  const form = new ModalFormData()
    .title("Player Statistics")
    .label("§bSelect a player to view their statistics:")
    .dropdown(
      "",
      allPlayers.map((p) => p.name),
    );

  form.show(player).then((res) => {
    if (res.canceled) return;

    const target = allPlayers[res.formValues[1]];
    if (!target) return;

    showPlayerStats(player, target);
  });
}

function reedemCode(player) {
  const raw = player.getDynamicProperty("usedCodes");
  const used = raw ? JSON.parse(raw) : [];

  const form = new ModalFormData()
    .title("Redeem Code")
    .label("§7Enter a redeem code below to claim your reward!\n ")
    .textField("§bEnter Code:", "Enter code");

  form.show(player).then((res) => {
    if (res.canceled) return;

    const input = String(res.formValues[1] ?? "").trim();

    const error = (msg) => {
      player.sendMessage(` §4§lError§r§c ${msg}`);
      player.playSound("item.shield.block", { pitch: 0.8 });
    };

    if (!input) return error("Invalid code.");
    if (!(input in redeemCodes)) return error("Code does not exist.");
    if (used.includes(input)) return error("Code already redeemed.");

    const reward = redeemCodes[input];
    const balance = Number(player.getDynamicProperty("balance")) || 0;

    player.setDynamicProperty("balance", balance + reward);

    used.push(input);
    player.setDynamicProperty("usedCodes", JSON.stringify(used));

    player.sendMessage(
      `§a Redeemed §l${input}§r§a and received §l$${metricScores(
        reward,
      )}§r§a.`,
    );

    player.playSound("random.levelup");
  });
}

function openMoneyTransfer(player) {
  const balance = Number(player.getDynamicProperty("balance")) || 0;
  const others = world.getPlayers().filter((p) => p.name !== player.name);

  const form = new ModalFormData()
    .title("Money Transfer")
    .label(`§bYour Balance: §a$${metricScores(balance)}`)
    .label("§7Send money to another player on the server.\n")
    .dropdown(
      "§bSelect Player:",
      others.length ? others.map((p) => p.name) : ["§7No Available Players"],
    )
    .textField("§bAmount to Send:", "e.g. 1k, 25000, 2.5m");

  form.show(player).then((res) => {
    if (res.canceled || !others.length) return;

    const target = others[res.formValues[2]];
    let input = String(res.formValues[3] ?? "")
      .toLowerCase()
      .replace(/,/g, "")
      .trim();

    const error = (msg) => {
      player.sendMessage(` §4§lError§r§c ${msg}`);
      player.playSound("item.shield.block", { pitch: 0.8 });
    };

    if (!input) return error("Invalid amount.");

    const suffixes = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 };
    const suffix = input.slice(-1);
    const multiplier = suffixes[suffix] ?? 1;
    if (suffixes[suffix]) input = input.slice(0, -1);

    const amount = Math.floor(Number(input) * multiplier);
    if (!amount || amount <= 0) return error("Invalid amount.");
    if (amount > balance) return error("Insufficient funds!");

    const targetBalance = Number(target.getDynamicProperty("balance")) || 0;

    player.setDynamicProperty("balance", balance - amount);
    target.setDynamicProperty("balance", targetBalance + amount);

    player.sendMessage(
      `§a Sent §l$${metricScores(amount)}§r§a to §l${target.name}§r§a.`,
    );
    target.sendMessage(
      `§a You received §l$${metricScores(amount)}§r§a from §l${player.name}§r§a.`,
    );

    player.playSound("random.orb");
    target.playSound("random.orb");
  });
}

const shops = [
  {
    id: "gen_shop",
    name: "Generator Shop",
    items: [
      { id: "vanguard:dirt_gen", icon: "textures/items/custom/dirt_gen/dirt_gen_icon", price: 100 },
      { id: "vanguard:sand_gen", icon: "textures/items/custom/sand_gen/sand_gen_icon", price: 250 },
      { id: "vanguard:moss_gen", icon: "textures/items/custom/moss_gen/moss_gen_icon", price: 1150 },
      { id: "vanguard:oak_log_gen", icon: "textures/items/custom/oak_log_gen/oak_log_gen_icon", price: 2200 },
      { id: "vanguard:cobblestone_gen", icon: "textures/items/custom/cobblestone_gen/cobblestone_gen_icon", price: 3400 },
      { id: "vanguard:coal_ore_gen", icon: "textures/items/custom/coal_ore_gen/coal_ore_gen_icon", price: 5500 },
      { id: "vanguard:iron_ore_gen", icon: "textures/items/custom/iron_ore_gen/iron_ore_gen_icon", price: 10500 },
      { id: "vanguard:redstone_ore_gen", icon: "textures/items/custom/redstone_ore_gen/redstone_ore_gen_icon", price: 16500 },
      { id: "vanguard:gold_ore_gen", icon: "textures/items/custom/gold_ore_gen/gold_ore_gen_icon", price: 45000 },
      { id: "vanguard:lapis_ore_gen", icon: "textures/items/custom/lapis_ore_gen/lapis_ore_gen_icon", price: 85000 },
      { id: "vanguard:diamond_ore_gen", icon: "textures/items/custom/diamond_ore_gen/diamond_ore_gen_icon", price: 145000 },
      { id: "vanguard:emerald_ore_gen", icon: "textures/items/custom/emerald_ore_gen/emerald_ore_gen_icon", price: 365000 }
    ]
  },
  {
    id: "gen_shop_prestige_1",
    name: "Generator Shop [P1]",
    items: [
      { id: "vanguard:ancient_debris_gen", icon: "textures/items/custom/ancient_debris_gen/ancient_debris_gen_icon", price: 550000 },
      { id: "vanguard:iron_block_gen", icon: "textures/items/custom/iron_block_gen/iron_block_gen_icon", price: 850000 },
      { id: "vanguard:gold_block_gen", icon: "textures/items/custom/gold_block_gen/gold_block_gen_icon", price: 1500000 },
      { id: "vanguard:diamond_block_gen", icon: "textures/items/custom/diamond_block_gen/diamond_block_gen_icon", price: 2750000 },
      { id: "vanguard:emerald_block_gen", icon: "textures/items/custom/emerald_block_gen/emerald_block_gen_icon", price: 5000000 },
      { id: "vanguard:netherite_block_gen", icon: "textures/items/custom/netherite_block_gen/netherite_block_gen_icon", price: 9000000 }
    ]
  },
  {
    id: "gen_shop_prestige_2",
    name: "Generator Shop [P2]",
    items: [
      { id: "vanguard:netherrack_gen", icon: "textures/items/custom/netherrack_gen/netherrack_gen_icon", price: 10000000 },
      { id: "vanguard:soul_soil_gen", icon: "textures/items/custom/soul_soil_gen/soul_soil_gen_icon", price: 16000000 },
      { id: "vanguard:nether_wart_gen", icon: "textures/items/custom/nether_wart_gen/nether_wart_gen_icon", price: 27000000 },
      { id: "vanguard:magma_gen", icon: "textures/items/custom/magma_gen/magma_gen_icon", price: 30000000 },
      { id: "vanguard:shroomlight_gen", icon: "textures/items/custom/shroomlight_gen/shroomlight_gen_icon", price: 45000000 }
    ]
  },
  {
    id: "gen_shop_prestige_3",
    name: "Generator Shop [P3]",
    items: [
      { id: "vanguard:end_stone_gen", icon: "textures/items/custom/end_stone_gen/end_stone_gen_icon", price: 50000000 },
      { id: "vanguard:amethyst_gen", icon: "textures/items/custom/amethyst_gen/amethyst_gen_icon", price: 65000000 },
      { id: "vanguard:purpur_gen", icon: "textures/items/custom/purpur_gen/purpur_gen_icon", price: 81000000 },
      { id: "vanguard:purpur_pillar_gen", icon: "textures/items/custom/purpur_pillar_gen/purpur_pillar_gen_icon", price: 100000000 }
    ]
  },
  {
    id: "gen_shop_prestige_4",
    name: "Generator Shop [P4]",
    items: [
      { id: "vanguard:lodestone_gen", icon: "textures/items/custom/lodestone_gen/lodestone_gen_icon", price: 250000000 },
      { id: "vanguard:chiseled_nether_gen", icon: "textures/items/custom/chiseled_nether_gen/chiseled_nether_gen_icon", price: 500000000 },
      { id: "vanguard:obsidian_gen", icon: "textures/items/custom/obsidian_gen/obsidian_gen_icon", price: 875000000 },
      { id: "vanguard:crying_obsidian_gen", icon: "textures/items/custom/crying_obsidian_gen/crying_obsidian_gen_icon", price: 1000000000 },
      { id: "vanguard:beacon_gen", icon: "textures/items/custom/beacon_gen/beacon_gen_icon", price: 1500000000 }
    ]
  }
];

function formatGeneratorName(id) {
  const raw = id.split(":")[1].replace("_gen", "");
  const words = raw
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return `${words.join(" ")} Generator`;
}

function openGenShop(player) {
  const prestige = player.getDynamicProperty("prestige") || 0;

  if (prestige === 0) {
    const shop = shops.find((s) => s.id === "gen_shop");
    if (shop) openShopMenu(player, shop);
    return;
  }

  const form = new ActionFormData().title("Generator Shop");

  for (let i = 0; i <= prestige; i++) {
    if (i === 5) continue;
    form.button(`§bPrestige ${i}\n§7[ click ]`);
  }

  form.show(player).then((r) => {
    if (r.canceled) return;

    const selectedPrestige = r.selection;
    const shopId =
      selectedPrestige === 0
        ? "gen_shop"
        : `gen_shop_prestige_${selectedPrestige}`;

    const shop = shops.find((s) => s.id === shopId);
    if (shop) openShopMenu(player, shop);
  });
}

function openShopMenu(player, shop) {
  const form = new ActionFormData().title(shop.name);

  shop.items.forEach((item) => {
    const displayName = formatGeneratorName(item.id);
    form.button(`§b${displayName}\n§a$${metricScores(item.price)}`, item.icon);
  });

  form.show(player).then((r) => {
    if (r.canceled) return;

    const itemData = shop.items[r.selection];
    const bal = player.getDynamicProperty("balance") || 0;

    if (bal < itemData.price) {
      player.sendMessage(" §4§lError§r§c Insufficient funds!");
      player.playSound("item.shield.block", { pitch: 0.8 });
      return;
    }

    const invComp = player.getComponent("minecraft:inventory");
    if (!invComp) return;
    const container = invComp.container;
    if (!container) return;

    const stack = new ItemStack(itemData.id, 1);
    const leftover = container.addItem(stack);

    if (leftover) {
      player.sendMessage(" §4§lError§r§c Your inventory is full.");
      player.playSound("item.shield.block", { pitch: 0.8 });
      return;
    }

    player.setDynamicProperty("balance", bal - itemData.price);
    player.sendMessage(
      `§a Purchased §l${formatGeneratorName(itemData.id)}§r§afor §l$${metricScores(itemData.price)}§r§a.`
    );
    player.playSound("random.orb");
  });
}

const sells = [
  { name: "Dirt", typeId: "minecraft:dirt", price: 1 },
  { name: "Sand", typeId: "minecraft:sand", price: 2 },
  { name: "Moss", typeId: "minecraft:moss_block", price: 4 },
  { name: "Oak Log", typeId: "minecraft:oak_log", price: 8 },
  { name: "Cobblestone", typeId: "minecraft:cobblestone", price: 16 },
  { name: "Coal", typeId: "minecraft:coal", price: 18 },
  { name: "Iron", typeId: "minecraft:raw_iron", price: 20 },
  { name: "Redstone", typeId: "minecraft:redstone", price: 13 },
  { name: "Gold", typeId: "minecraft:raw_gold", price: 80 },
  { name: "Lapis", typeId: "minecraft:lapis_lazuli", price: 20 },
  { name: "Diamond", typeId: "minecraft:diamond", price: 150 },
  { name: "Emerald", typeId: "minecraft:emerald", price: 350 },
  { name: "Ancient Debris", typeId: "minecraft:ancient_debris", price: 450 },
  { name: "Iron Block", typeId: "minecraft:iron_block", price: 750 },
  { name: "Gold Block", typeId: "minecraft:gold_block", price: 900 },
  { name: "Diamond Block", typeId: "minecraft:diamond_block", price: 1200 },
  { name: "Emerald Block", typeId: "minecraft:emerald_block", price: 2250 },
  { name: "Netherite Block", typeId: "minecraft:netherite_block", price: 3500 },
  { name: "Netherrack", typeId: "minecraft:netherrack", price: 3000 },
  { name: "Soul Soil", typeId: "minecraft:soul_soil", price: 3300 },
  { name: "Nether Wart", typeId: "minecraft:nether_wart_block", price: 3800 },
  { name: "Magma", typeId: "minecraft:magma", price: 4200 },
  { name: "Shroomlight", typeId: "minecraft:shroomlight", price: 4600 },
  { name: "End Stone", typeId: "minecraft:end_stone", price: 5000 },
  { name: "Amethyst", typeId: "minecraft:amethyst_block", price: 5400 },
  { name: "Purpur", typeId: "minecraft:purpur_block", price: 6000 },
  { name: "Purpur Pillar", typeId: "minecraft:purpur_pillar", price: 6500 },
  { name: "Lodestone", typeId: "minecraft:lodestone", price: 7500 },
  { name: "Chiseled Nether", typeId: "minecraft:chiseled_nether_bricks", price: 9000 },
  { name: "Obsidian", typeId: "minecraft:obsidian", price: 11000 },
  { name: "Crying Obsidian", typeId: "minecraft:crying_obsidian", price: 15000 },
  { name: "Beacon", typeId: "minecraft:beacon", price: 25000 },
];

function showPrestigeForm(player) {
  const prestige = player.getDynamicProperty("prestige") ?? 0;
  if (prestige >= 5) {
    player.sendMessage(` §4§lError§r§c You are already max prestige.`);
    player.playSound("item.shield.block", { pitch: 0.8 });
    return;
  }

  player.playSound("random.pop");

  const balance = player.getDynamicProperty("balance") ?? 0;
  const kills = player.getDynamicProperty("kills") ?? 0;

  const nextPrestige = prestige + 1;

  const balanceCosts = [550000, 12000000, 35000000, 250000000, 750000000];
  const killCosts = [75, 225, 400, 800, 1500];

  const requiredBalance = balanceCosts[prestige];
  const requiredKills = killCosts[prestige];

  const displayBalance = Math.min(balance, requiredBalance);
  const displayKills = Math.min(kills, requiredKills);

  const multiplierReward = 1 + 0.2 * nextPrestige;
  const creditReward = 50 * nextPrestige;

  const form = new ModalFormData()
    .title("Prestige")
    .label(
      "\n§bPrestiging will reset your money.\n\n" +
        `§7Balance: §a$${metricScores(displayBalance)}/$${metricScores(requiredBalance)}\n` +
        `§7Kills: §c${displayKills}/${requiredKills}\n\n` +
        `§bRewards for Reaching Prestige ${toRomanNumeral(nextPrestige)}:\n`
    )
    .textField(
      `§7${multiplierReward}x multiplier\n${creditReward} Credits`,
      "Enter CONFIRM to prestige"
    )
    .submitButton("Submit");

  form.show(player).then((r) => {
    if (r.canceled) return;

    const input = r.formValues[1];
    if (input !== "CONFIRM") return;

    if (balance < requiredBalance || kills < requiredKills) {
      player.sendMessage(` §4§lError§r§c You do not meet the requirements.`);
      player.playSound("item.shield.block", { pitch: 0.8 });
      return;
    }

    player.setDynamicProperty("balance", 0);
    player.setDynamicProperty("prestige", nextPrestige);

    const credits = player.getDynamicProperty("credits") ?? 0;
    player.setDynamicProperty("credits", credits + creditReward);

    player.sendMessage(`§d You are now §5Prestige ${toRomanNumeral(nextPrestige)}§d.`);
    player.playSound("ui.big_claim");
  });
}













const enchantData = {
  sharpness: {
    name: "Sharpness",
    max: 5,
    prices: { 
      1: 85000,
      2: 500000,
      3: 4500000,  
      4: 25000000,   
      5: 90000000     
    },
    minPrestige: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
    match: id => id.includes("_sword")
  },
  efficiency: {
    name: "Efficiency",
    max: 5,
    prices: { 
      1: 75000, 
      2: 400000, 
      3: 3500000, 
      4: 20000000, 
      5: 85000000 
    },
    minPrestige: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
    match: id => id.includes("_pickaxe") || id.includes("_axe") || id.includes("_shovel")
  },
  protection: {
    name: "Protection",
    max: 4,
    prices: { 
      1: 70000, 
      2: 350000, 
      3: 3000000, 
      4: 18000000 
    },
    minPrestige: { 1: 1, 2: 2, 3: 3, 4: 4 },
    match: id => id.includes("_helmet") || id.includes("_chestplate") || id.includes("_leggings") || id.includes("_boots")
  },
  fortune: {
    name: "Fortune",
    max: 3,
    prices: { 
      1: 1500000, 
      2: 9000000, 
      3: 45000000 
    },
    minPrestige: { 1: 2, 2: 3, 3: 4 },
    match: id => id.includes("_pickaxe")
  },
  unbreaking: {
    name: "Unbreaking",
    max: 3,
    prices: { 
      1: 55000, 
      2: 1200000, 
      3: 12000000 
    },
    minPrestige: { 1: 1, 2: 3, 3: 4 },
    match: id => id.includes("_")
  },
  fire_aspect: {
    name: "Fire Aspect",
    max: 2,
    prices: { 
      1: 9000000, 
      2: 30000000 
    },
    minPrestige: { 1: 3, 2: 4 },
    match: id => id.includes("_sword")
  },
  mending: {
    name: "Mending",
    max: 1,
    prices: { 
      1: 18000000 
    },
    minPrestige: { 1: 3 },
    match: id => id.includes("_")
  }
};

function enchantShop(player) {
  const prestige = Number(player.getDynamicProperty("prestige")) || 0

  const tiers = []
  const values = []

  for (let i = 1; i <= 5; i++) {
    if (prestige >= i) {
      tiers.push(`§bPrestige ${roman(i)}`)
      values.push(i)
    }
  }

  if (!tiers.length) {
    player.sendMessage("§4§lError§r§c No enchantments available for your prestige.")
    player.playSound("item.shield.block", { pitch: 0.8 })
    return
  }

  const form = new ModalFormData()
    .title("Enchant Shop")
    .dropdown("\n§bSelect enchant prestige\n", tiers)

  form.show(player).then(res => {
    if (res.canceled) return
    const selected = values[res.formValues[0]]
    openPrestigeEnchantShop(player, selected)
  })
}

function openPrestigeEnchantShop(player, prestigeLevel) {
  const form = new ModalFormData().title(`Prestige ${roman(prestigeLevel)} Enchants`)

  const options = []
  const map = []

  for (const key in enchantData) {
    const data = enchantData[key]
    for (let lvl = 1; lvl <= data.max; lvl++) {
      if (data.minPrestige[lvl] !== prestigeLevel) continue
      options.push(`§7${data.name} ${roman(lvl)} §a$${metricScores(data.prices[lvl])}`)
      map.push({ key, lvl, price: data.prices[lvl] })
    }
  }

  if (!options.length) {
    player.sendMessage("§4§lError§r§c No enchantments in this prestige.")
    player.playSound("item.shield.block", { pitch: 0.8 })
    return
  }

  form.dropdown("\n§bWhich enchant would you like?\n§7You cannot skip enchantment levels.\n \n", options)

  form.show(player).then(res => {
    if (res.canceled) return
    const choice = map[res.formValues[0]]
    openEnchantItemSelect(player, choice.key, choice.lvl, choice.price)
  })
}

function openEnchantItemSelect(player, key, lvl, price) {
  const data = enchantData[key]
  const balance = Number(player.getDynamicProperty("balance")) || 0
  const prestige = Number(player.getDynamicProperty("prestige")) || 0

  const container = player.getComponent("minecraft:inventory")?.container
  if (!container) return

  const enchantType = EnchantmentTypes.get(key)
  if (!enchantType) return

  const items = []
  const slots = []

  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i)
    if (!item) continue
    if (!data.match(item.typeId)) continue

    const enchantable = item.getComponent("minecraft:enchantable")
    if (!enchantable) continue

    const current = enchantable.getEnchantment(key)
    const currentLevel = current?.level || 0

    if (currentLevel + 1 !== lvl) continue

    const enchant = { type: enchantType, level: lvl }
    if (!enchantable.canAddEnchantment(enchant)) continue

    items.push(`§7${item.typeId.replace("minecraft:","").replace(/_/g," ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} §7(§f${data.name} ${roman(currentLevel)} > ${roman(lvl)} §7)`)
    slots.push(i)
  }

  if (!items.length) {
    player.sendMessage("§4§lError§r§c No valid items to enchant.")
    player.playSound("item.shield.block", { pitch: 0.8 })
    return
  }

  const form = new ModalFormData()
    .title("Confirm Enchant")
    .dropdown("\n§bWhich item would you like to enchant?\n", items)
    .toggle(`§bPurchase for §a$${metricScores(price)}`)

  form.show(player).then(res => {
    if (res.canceled) return
    if (!res.formValues[1]) return

    if (balance < price) {
      player.sendMessage("§4§lError§r§c Insufficient funds!")
      player.playSound("item.shield.block", { pitch: 0.8 })
      return
    }

    const slot = slots[res.formValues[0]]
    const original = container.getItem(slot)
    if (!original) return

    const cloned = original.clone()
    const enchantable = cloned.getComponent("minecraft:enchantable")
    if (!enchantable) return

    enchantable.addEnchantment({ type: enchantType, level: lvl })

    container.setItem(slot, cloned)
    player.setDynamicProperty("balance", balance - price)

    player.sendMessage(`§a Enchanted with §l${data.name} ${roman(lvl)}§r§a for §l$${metricScores(price)}§r§a.`)
    player.playSound("random.orb")
  })
}

function roman(num) {
  return ["","I","II","III","IV","V"][num] || num
}



function gamblingMenu(player) {
  const balance = Number(player.getDynamicProperty("balance")) || 0

  const modalForm = new ModalFormData()
  modalForm.title("Gambling")
  modalForm.textField(
    `§bHow much money do you want to gamble? §bYour Balance: §a$${metricScores(balance)}`,
    "Enter Amount: e.g. 1k, 25000, 2.5m, all"
  )
  modalForm.dropdown("§bSelect a game to gamble on below:", ["§fCoin Flip", "§fGuess The Number", "§fDice Roll"])
  modalForm.toggle("§bI agree to no refunds.")

  modalForm.show(player).then((res) => {
    if (res.canceled) return

    let input = String(res.formValues[0] ?? "").toLowerCase().replace(/,/g, "").trim()
    const gameIndex = res.formValues[1]
    const hasAgreed = res.formValues[2]

    const error = (msg) => {
      player.sendMessage(`§4§lError§r§c ${msg}`)
      player.playSound("item.shield.block", { pitch: 0.8 })
    }

    if (!hasAgreed) return
    if (!input) return error("Invalid amount.")

    let amount

    if (input === "all") {
      amount = balance
    } else {
      const suffixes = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }
      const suffix = input.slice(-1)
      const multiplier = suffixes[suffix] ?? 1
      if (suffixes[suffix]) input = input.slice(0, -1)
      amount = Math.floor(Number(input) * multiplier)
    }

    if (!amount || amount <= 0) return error("Invalid amount.")
    if (amount > balance) return error("Insufficient funds!")

    if (gameIndex === 0) return openCoinFlip(player, amount)
    if (gameIndex === 1) return openGuessNumber(player, amount)
    if (gameIndex === 2) return openDiceRoll(player, amount)
  })
}

function openCoinFlip(player, bet) {
  const form = new ActionFormData()

  form.title("Coin Flip")
  form.body(`\n§bSelect heads or tails below!\nYour gamble: §a$${metricScores(bet)}\n\n§4§lWARNING §r§cThis game is rigged 33/66.\n`)
  form.button("§bHeads\n§7Bet on heads!")
  form.button("§bTails\n§7Bet on tails!")

  form.show(player).then((res) => {
    if (res.canceled) return

    const balance = Number(player.getDynamicProperty("balance")) || 0
    if (bet > balance || bet <= 0) return

    const choice = res.selection
    const win = Math.random() < 0.33
    const result = win ? choice : choice === 0 ? 1 : 0
    const landed = result === 0 ? "Heads" : "Tails"

    if (win) {
      player.setDynamicProperty("balance", balance + bet)
      player.sendMessage(` §a§lWin§r§a It landed on ${landed}, and you won §l$${metricScores(bet)}§r§a!`)
      player.spawnParticle("minecraft:totem_particle", player.getHeadLocation())
      player.playSound("firework.launch")
    } else {
      player.setDynamicProperty("balance", balance - bet)
      player.sendMessage(`§4§lLose§r§c It landed on ${landed}, and you lost §l$${metricScores(bet)}§r§c!`)
      player.playSound("random.break")
    }
  })
}

const activeGames = new Map()

function openGuessNumber(player, bet) {
  if (activeGames.has(player.id)) return

  const balance = Number(player.getDynamicProperty("balance")) || 0
  if (bet <= 0 || bet > balance) return

  const target = Math.floor(Math.random() * 100) + 1

  player.setDynamicProperty("balance", balance - bet)

  activeGames.set(player.id, {
    bet,
    target,
    triesLeft: 5
  })

  showForm(player, "§fThe number is between 1-100.")
}

function showForm(player, feedback) {
  const game = activeGames.get(player.id)
  if (!game) return

  const form = new ModalFormData()
    .title("Guess The Number")
    .textField(
      `\n§bYour gamble: §a$${metricScores(game.bet)}\n§bYou have ${game.triesLeft} ${game.triesLeft === 1 ? "try" : "tries"} left.\n\n${feedback}\n\n§bEnter your number guess here:`,
      "1-100"
    )

  form.show(player).then((res) => {
    if (!activeGames.has(player.id)) return
    if (!res || res.canceled) return
    if (!res.formValues || res.formValues.length === 0) return

    const raw = res.formValues[0]

    if (typeof raw !== "string") {
      system.runTimeout(() => {
        showForm(player, "§cEnter a valid number between 1-100.")
      }, 6)
      return
    }

    const trimmed = raw.trim()
    
    if (!/^\d+$/.test(trimmed)) {
      system.runTimeout(() => {
        showForm(player, "§cEnter a valid number between 1-100.")
      }, 6)
      return
    }

    const input = Number(trimmed)

    if (input < 1 || input > 100) {
      system.runTimeout(() => {
        showForm(player, "§cEnter a valid number between 1-100.")
      }, 6)
      return
    }

    if (input === game.target) {
      const newBalance =
        (Number(player.getDynamicProperty("balance")) || 0) +
        game.bet * 2

      player.setDynamicProperty("balance", newBalance)

      player.sendMessage(
        `§a§lWin!§r §aThe number was ${game.target}, and you won §l$${metricScores(game.bet)}§r§a!`
      )

      player.spawnParticle(
        "minecraft:totem_particle",
        player.getHeadLocation()
      )

      player.playSound("firework.launch")

      activeGames.delete(player.id)
      return
    }

    game.triesLeft--

    if (game.triesLeft <= 0) {
      player.sendMessage(
        `§4§lLose!§r §cThe number was ${game.target}, and you lost §l$${metricScores(game.bet)}§r§c!`
      )

      player.playSound("random.break")

      activeGames.delete(player.id)
      return
    }

    const hint =
      input > game.target
        ? `§fThe number is lower than ${input}.`
        : `§fThe number is higher than ${input}.`

    system.runTimeout(() => {
      showForm(player, hint)
    }, 6)
  })
}

function openDiceRoll(player, bet, started) {
  const balance = Number(player.getDynamicProperty("balance")) || 0
  if (bet > balance || bet <= 0) return

  const form = new ModalFormData()
  form.title("Dice Roll")
  form.slider(
    ` \n§bYour gamble: §a$${metricScores(bet)}\n\n§fGuessing the wrong number the dice roll will lose your initial gamble.\n\n§bWhat is your dice roll guess?`,
    1,
    6,
    { step: 1, defaultValue: 1 }
  )

  form.show(player).then((res) => {
    if (res.canceled) {
      if (started) return openDiceRoll(player, bet, started)
      return
    }

    const guess = res.formValues[0]

    if (!started) {
      player.setDynamicProperty("balance", balance - bet)
      started = true
    }

    const roll = Math.floor(Math.random() * 6) + 1

    if (guess === roll) {
      const newBalance = (Number(player.getDynamicProperty("balance")) || 0) + bet * 2
      player.setDynamicProperty("balance", newBalance)
      player.sendMessage(` §a§lWin§r§a The dice rolled ${roll}!, and you won §l$${metricScores(bet)}§r§a!`)
      player.spawnParticle("minecraft:totem_particle", player.getHeadLocation())
      player.playSound("firework.launch")
    } else {
      player.sendMessage(`§4§lLose§r§c The dice rolled ${roll}, and you lost §l$${metricScores(bet)}§r§c!`)
      player.playSound("random.break")
    }
  })
}

const crates = [
  {
    name: "Common",
    key: "vanguard:uncommon_key",
    pos: { x: 178, y: 119, z: 4 },
    items: [
      { name: "Iron x16", typeId: "minecraft:iron_ingot", amount: 16, chance: 55 },
      { name: "Iron x32", typeId: "minecraft:iron_ingot", amount: 32, chance: 40 },
      { name: "Diamond x15", typeId: "minecraft:diamond", amount: 15, chance: 40 },
      { name: "Iron Ore Generator", typeId: "vanguard:iron_ore_gen", amount: 1, chance: 25 },
      { name: "Diamond x16", typeId: "minecraft:iron_ingot", amount: 16, chance: 15 },
      { name: "Redstone Ore Generator", typeId: "vanguard:redstone_ore_gen", amount: 1, chance: 10 },
      { name: "Lapis Ore Generator", typeId: "vanguard:lapis_ore_gen", amount: 1, chance: 5 },
    ]
  },
  {
    name: "Uncommon",
    key: "vanguard:common_key",
    pos: { x: 180, y: 119, z: 2 },
    items: [
      { name: "Diamond x32", typeId: "minecraft:diamond", amount: 32, chance: 40 },
      { name: "Diamond x64", typeId: "minecraft:diamond", amount: 64, chance: 35 },
      { name: "Golden Apple x10", typeId: "minecraft:golden_apple", amount: 10, chance: 30 },
      { name: "Diamond Ore Generator", typeId: "vanguard:diamond_ore_gen", amount: 1, chance: 10 },
      { name: "Emerald Ore Generator", typeId: "vanguard:emerald_ore_gen", amount: 1, chance: 5 },
    ]
  },
  {
    name: "Rare",
    key: "vanguard:rare_key",
    pos: { x: 182, y: 119, z: 0 },
    items: [
      { name: "Ancient Debris x16", typeId: "minecraft:ancient_debris", amount: 16, chance: 40 },
      { name: "Ancient Debris x32", typeId: "minecraft:ancient_debris", amount: 32, chance: 35 },
      { name: "Totem of Undying", typeId: "minecraft:totem_of_undying", amount: 1, chance: 30 },
      { name: "Ancient Debris Generator", typeId: "vanguard:ancient_debris_gen", amount: 1, chance: 25 },
      { name: "Diamond Block Generator", typeId: "vanguard:diamond_block_gen", amount: 1, chance: 15 },
      { name: "Emerald Block Generator", typeId: "vanguard:emerald_block_gen", amount: 1, chance: 5 },
    ]
  }
]

function getCrateAt(pos) {
  return crates.find(c => c.pos.x === pos.x && c.pos.y === pos.y && c.pos.z === pos.z)
}

function rollItem(items) {
  const total = items.reduce((a, b) => a + b.chance, 0)
  let roll = Math.random() * total
  for (const item of items) {
    if (roll < item.chance) return item
    roll -= item.chance
  }
  return items[0]
}

world.beforeEvents.playerInteractWithBlock.subscribe(event => {
  if (!event.isFirstEvent) return;
  const crate = getCrateAt(event.block.location)
  if (!crate) return

  const player = event.player
  const inv = player.getComponent("minecraft:inventory")?.container
  if (!inv) return

  if (player.isSneaking) {
    const form = new ActionFormData()
      .title(`${crate.name} Crate`)
      .body(` \n${crate.items.map(i => `§b${i.name} §7§l-§r §a${i.chance}%%`).join("\n")}\n  `)
    system.run(() => form.show(player))
    return
  }

  const held = inv.getItem(player.selectedSlotIndex)
  if (!held || held.typeId !== crate.key) {
    system.run(() => {
      player.playSound("item.shield.block", { pitch: 0.8 })
      player.sendMessage(` §4§lError§r§c You do not have ${crate.name} Key.`)
      const dir = player.getViewDirection()
      player.applyKnockback({ x: -dir.x, z: -dir.z }, 0.4)
    })
    return
  }

  system.run(() => {
    const reward = rollItem(crate.items)
    let rewardStack
    if (reward.typeId) rewardStack = new ItemStack(reward.typeId, reward.amount)
    else rewardStack = SlotGrab(reward.slot, reward.chest.x, reward.chest.y, reward.chest.z)
    if (!rewardStack) return

    const leftover = inv.addItem(rewardStack)
    if (leftover) {
      player.sendMessage(" §4§lError§r§c Your inventory is full.")
      player.playSound("item.shield.block", { pitch: 0.8 })
      return
    }

    if (held.amount > 1) {
      held.amount -= 1
      inv.setItem(player.selectedSlotIndex, held)
    } else {
      inv.setItem(player.selectedSlotIndex)
    }

    player.sendMessage(`§a You received: §l${reward.name}`)
    player.playSound("random.orb")
  })
})



const achievements = [
  {
    id: "kills",
    name: "Exterminator",
    icon: "textures/ui/strength_effect",
    description: (p,r)=>`§7Kill ${p}/${r} Players`,
    maxDescription: (p)=>`§7Kill ${p}/§kABCDE§r§7 Players`,
    levels: [
      { required: 15, rewards: { credits: 5 } },
      { required: 30, rewards: { credits: 10 } },
      { required: 50, rewards: { credits: 15 } },
      { required: 250, rewards: { credits: 25 } },
      { required: 500, rewards: { credits: 50 } }
    ]
  },
  {
    id: "prestige",
    name: "Ascension",
    icon: "textures/ui/jump_boost_effect",
    description: (p,r)=>`§7Reach Prestige ${p}/${r}`,
    maxDescription: (p)=>`§7Reach Prestige ${p}/§kABCDE§r§7`,
    levels: [
      { required: 1, rewards: { credits: 5 } },
      { required: 2, rewards: { credits: 10 } },
      { required: 3, rewards: { credits: 15 } },
      { required: 4, rewards: { credits: 20 } },
      { required: 5, rewards: { credits: 25 } },
    ]
  },
  {
    id: "blocksMined",
    name: "Miner",
    icon: "textures/ui/haste_effect",
    description: (p,r)=>`§7Mine ${p}/${r} Blocks`,
    maxDescription: (p)=>`§7Mine ${p}/§kABCDE§r§7 Blocks`,
    levels: [
      { required: 100, rewards: { credits: 5 } },
      { required: 500, rewards: { credits: 10 } },
      { required: 1000, rewards: { credits: 15 } },
      { required: 7500, rewards: { credits: 25 } },
      { required: 10000, rewards: { credits: 50 } }
    ]
  }
]

function achievementsMain(player){

  const form = new ActionFormData()
  form.title("Achievements")
  form.body(` \n§bComplete achievements for credits!\n `)

  const buttons = []

  for(const ach of achievements){

    const progress = player.getDynamicProperty(ach.id) ?? 0
    const claimed = player.getDynamicProperty(ach.id+"_claimed") ?? 0
    const max = ach.levels.length
    const isMax = claimed >= max

    let title
    let desc

    if(isMax){
      title = `§b${ach.name} (MAX)`
      desc = ach.maxDescription(progress)
    }else{
      title = `§b${ach.name} ${toRomanNumeral(claimed + 1)}`
      desc = ach.description(progress, ach.levels[claimed].required)
    }

    form.button(`${title}\n${desc}`, ach.icon)
    buttons.push({ ach, progress, claimed })
  }

  form.show(player).then(res=>{
    if(res.canceled) return

    const data = buttons[res.selection]
    const ach = data.ach
    const progress = data.progress
    const claimed = data.claimed

    if(claimed >= ach.levels.length){
      player.sendMessage(" §4§lError§r§c You already completed this achievement.")
      player.playSound("item.shield.block",{ pitch:0.8 })
      return
    }

    const req = ach.levels[claimed].required
    if(progress < req){
      player.sendMessage(" §4§lError§r§c You do not meet the requirements")
      player.playSound("item.shield.block",{ pitch:0.8 })
      return
    }

    const credits = ach.levels[claimed].rewards.credits ?? 0

    player.setDynamicProperty("credits",(player.getDynamicProperty("credits") ?? 0) + credits)
    player.setDynamicProperty(ach.id+"_claimed", claimed + 1)

    player.sendMessage(`§a You received §l${credits} Credits§r§a.`)

    player.playSound("random.orb")
  })
}