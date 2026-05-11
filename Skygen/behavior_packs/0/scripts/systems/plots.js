const plots = {

  plot_1: {

    plotCords: {

      from: { x: 4977, y: 100, z: 4977 },

      to: { x: 4963, y: 198, z: 4963 },

    },

    claimPlotButton: { x: 4979, y: 102, z: 4970 },

    closePlotCords: {

      from: { x: 4978, y: 101, z: 4971 },

      to: { x: 4978, y: 170, z: 4969 },

    },

    floatingTag: "plot1",

    entrance: { x: 4982, y: 101, z: 4970 },

  },

  plot_2: {

    plotCords: {

      from: { x: 4977, y: 100, z: 4993 },

      to: { x: 4963, y: 198, z: 4979 },

    },

    claimPlotButton: { x: 4979, y: 102, z: 4986 },

    closePlotCords: {

      from: { x: 4978, y: 101, z: 4987 },

      to: { x: 4978, y: 170, z: 4985 },

    },

    floatingTag: "plot2",

    entrance: { x: 4982, y: 101, z: 4986 },

  },

  plot_3: {

    plotCords: {

      from: { x: 4977, y: 100, z: 5009 },

      to: { x: 4963, y: 198, z: 4995 },

    },

    claimPlotButton: { x: 4979, y: 102, z: 5002 },

    closePlotCords: {

      from: { x: 4978, y: 101, z: 5003 },

      to: { x: 4978, y: 170, z: 5001 },

    },

    floatingTag: "plot3",

    entrance: { x: 4982, y: 101, z: 5002 },

  },

  plot_4: {

    plotCords: {

      from: { x: 4977, y: 100, z: 5025 },

      to: { x: 4963, y: 198, z: 5011 },

    },

    claimPlotButton: { x: 4979, y: 102, z: 5018 },

    closePlotCords: {

      from: { x: 4978, y: 101, z: 5019 },

      to: { x: 4978, y: 170, z: 5017 },

    },

    floatingTag: "plot4",

    entrance: { x: 4982, y: 101, z: 5018 },

  },

  plot_5: {

    plotCords: {

      from: { x: 4977, y: 100, z: 5041 },

      to: { x: 4963, y: 198, z: 5027 },

    },

    claimPlotButton: { x: 4979, y: 102, z: 5034 },

    closePlotCords: {

      from: { x: 4978, y: 101, z: 5035 },

      to: { x: 4978, y: 170, z: 5033 },

    },

    floatingTag: "plot5",

    entrance: { x: 4982, y: 101, z: 5034 },

  },

  plot_6: {

    plotCords: {

      from: { x: 4977, y: 100, z: 5057 },

      to: { x: 4963, y: 198, z: 5043 },

    },

    claimPlotButton: { x: 4979, y: 102, z: 5050 },

    closePlotCords: {

      from: { x: 4978, y: 101, z: 5051 },

      to: { x: 4978, y: 170, z: 5049 },

    },

    floatingTag: "plot6",

    entrance: { x: 4982, y: 101, z: 5050 },

  },

  plot_7: {

    plotCords: {

      from: { x: 4977, y: 100, z: 5073 },

      to: { x: 4963, y: 198, z: 5059 },

    },

    claimPlotButton: { x: 4979, y: 102, z: 5066 },

    closePlotCords: {

      from: { x: 4978, y: 101, z: 5067 },

      to: { x: 4978, y: 170, z: 5065 },

    },

    floatingTag: "plot7",

    entrance: { x: 4982, y: 101, z: 5066 },

  },

  plot_8: {

    plotCords: {

      from: { x: 5015, y: 100, z: 4977 },

      to: { x: 5001, y: 198, z: 4963 },

    },

    claimPlotButton: { x: 4999, y: 102, z: 4970 },

    closePlotCords: {

      from: { x: 5000, y: 101, z: 4971 },

      to: { x: 5000, y: 170, z: 4969 },

    },

    floatingTag: "plot8",

    entrance: { x: 4996, y: 101, z: 4970 },

  },

  plot_9: {

    plotCords: {

      from: { x: 5015, y: 100, z: 4993 },

      to: { x: 5001, y: 198, z: 4979 },

    },

    claimPlotButton: { x: 4999, y: 102, z: 4986 },

    closePlotCords: {

      from: { x: 5000, y: 101, z: 4987 },

      to: { x: 5000, y: 170, z: 4985 },

    },

    floatingTag: "plot9",

    entrance: { x: 4996, y: 101, z: 4986 },

  },

  plot_10: {

    plotCords: {

      from: { x: 5015, y: 100, z: 5057 },

      to: { x: 5001, y: 198, z: 5043 },

    },

    claimPlotButton: { x: 4999, y: 102, z: 5050 },

    closePlotCords: {

      from: { x: 5000, y: 101, z: 5051 },

      to: { x: 5000, y: 170, z: 5049 },

    },

    floatingTag: "plot10",

    entrance: { x: 4996, y: 101, z: 5050 },

  },

  plot_11: {

    plotCords: {

      from: { x: 5015, y: 100, z: 5073 },

      to: { x: 5001, y: 198, z: 5059 },

    },

    claimPlotButton: { x: 4999, y: 102, z: 5066 },

    closePlotCords: {

      from: { x: 5000, y: 101, z: 5067 },

      to: { x: 5000, y: 170, z: 5065 },

    },

    floatingTag: "plot11",

    entrance: { x: 4996, y: 101, z: 5066 },

  },

};

import { world, system, BlockVolume } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";

const defaultClaimPlotText = "   \n §r   \n   ";

system.run(() => {
  if (!world.getDynamicProperty("plots_data"))
    world.setDynamicProperty("plots_data", JSON.stringify({}));
  if (!world.getDynamicProperty("plots_flipped"))
    world.setDynamicProperty("plots_flipped", JSON.stringify({}));
});

function getPlots() {
  return JSON.parse(world.getDynamicProperty("plots_data"));
}
function setPlots(data) {
  world.setDynamicProperty("plots_data", JSON.stringify(data));
}

function getFlippedDB() {
  return JSON.parse(world.getDynamicProperty("plots_flipped"));
}
function setFlippedDB(data) {
  world.setDynamicProperty("plots_flipped", JSON.stringify(data));
}

function minMax(a, b) {
  return [Math.min(a, b), Math.max(a, b)];
}

function fillAreaAPI(dim, from, to, block, parts = 6) {
  const minX = Math.min(from.x, to.x);
  const maxX = Math.max(from.x, to.x);
  const minY = Math.max(Math.min(from.y, to.y), -64);
  const maxY = Math.min(Math.max(from.y, to.y), 300);
  const minZ = Math.min(from.z, to.z);
  const maxZ = Math.max(from.z, to.z);
  const totalWidth = maxX - minX + 1;

  for (let i = 0; i < parts; i++) {
    const startX = minX + Math.ceil((totalWidth / parts) * i);
    let endX = minX + Math.ceil((totalWidth / parts) * (i + 1)) - 1;
    if (i === parts - 1 || endX > maxX) endX = maxX;
    if (startX > maxX) break;

    try {
      dim.fillBlocks(
        new BlockVolume(
          { x: startX, y: minY, z: minZ },
          { x: endX, y: maxY, z: maxZ }
        ),
        block
      );
    } catch {}
  }
}

function setGrassFloorAPI(dim, from, to) {
  const [minX, maxX] = minMax(from.x, to.x);
  const [minZ, maxZ] = minMax(from.z, to.z);
  const y = Math.min(from.y, to.y);
  try {
    dim.fillBlocks(
      new BlockVolume({ x: minX, y, z: minZ }, { x: maxX, y, z: maxZ }),
      "minecraft:grass_block"
    );
  } catch {}
}

function getPlotByButton(loc) {
  for (const key in plots) {
    const b = plots[key].claimPlotButton;
    if (b.x === loc.x && b.y === loc.y && b.z === loc.z) return key;
  }
}

function getPlayerPlot(playerId) {
  const data = getPlots();
  for (const key in data) if (data[key].plot_owner === playerId) return key;
}

function setFloatingText(dim, tag, text) {
  const entities = dim.getEntities({ type: "da:floating_text", tags: [tag] });
  for (const e of entities) e.nameTag = text;
}

function tempTickAreaCommand(dim, from, to, callback) {
  const [minX, maxX] = minMax(from.x, to.x);
  const [minY, maxY] = minMax(from.y, to.y);
  const [minZ, maxZ] = minMax(from.z, to.z);
  const name = "temp_" + Math.floor(Math.random() * 999999);

  try {
    dim.runCommand(
      `tickingarea add ${minX} ${minY} ${minZ} ${maxX} ${maxY} ${maxZ} "${name}"`
    );
  } catch {}

  system.runTimeout(() => {
    try { callback(); } catch {}
    try { dim.runCommand(`tickingarea remove "${name}"`); } catch {}
  }, 20);
}

world.afterEvents.playerInteractWithBlock.subscribe((ev) => {
  const key = getPlotByButton(ev.block.location);
  if (!key) return;

  const player = ev.player;
  const dim = player.dimension;
  const data = getPlots();
  const plot = plots[key];

  const existing = data[key];

  if (existing?.plot_owner === player.id) {
    openPlotManager(player, key);
    return;
  }

  if (getPlayerPlot(player.id)) return;
  if (existing?.plot_owner) return;

  const flippedDB = getFlippedDB();
  const plotNumber = parseInt(key.split("_")[1]);
  const isTargetFlipped = plotNumber >= 8 && plotNumber <= 11;
  const wasSavedFlipped = flippedDB[player.id];

  let rotation = "0_degrees";

  if (wasSavedFlipped !== undefined && isTargetFlipped !== wasSavedFlipped) {
    rotation = "180_degrees";
  }

  if (wasSavedFlipped === undefined) {
    flippedDB[player.id] = isTargetFlipped;
    setFlippedDB(flippedDB);
  }

  data[key] = { plot_owner: player.id, members: [] };
  setPlots(data);

  setFloatingText(dim, plot.floatingTag, `§a§l${player.name}§r§a's Plot`);

  player.playSound("random.orb");
  player.sendMessage(`§a You have claimed §lPlot ${plotNumber}§r§a.\n\n§7Click your plot button to manage members.`);

  system.runTimeout(() => {
    tempTickAreaCommand(dim, plot.plotCords.from, plot.plotCords.to, () => {
      try {
        const minX = Math.min(plot.plotCords.from.x, plot.plotCords.to.x);
        const minY = Math.min(plot.plotCords.from.y, plot.plotCords.to.y);
        const minZ = Math.min(plot.plotCords.from.z, plot.plotCords.to.z);

        dim.runCommand(
          `structure load "${player.id}_plot" ${minX} ${minY} ${minZ} ${rotation}`
        );

        fillAreaAPI(
          dim,
          plot.closePlotCords.from,
          plot.closePlotCords.to,
          "minecraft:structure_void"
        );
      } catch {}
    });
  }, 5);
});

world.beforeEvents.playerLeave.subscribe((event) => {
  const playerId = event.player.id;
  const data = getPlots();

  for (const key in data) {
    const plotData = data[key];

    if (plotData.plot_owner === playerId) {
      system.run(() => {
        unloadPlot(event.player);
      });
      return;
    }

    if (plotData.members?.includes(playerId)) {
      plotData.members = plotData.members.filter(id => id !== playerId);
      setPlots(data);
    }
  }
});

function unloadPlot(player) {
  const data = getPlots();
  const flippedDB = getFlippedDB();

  let key;
  for (const k in data) if (data[k].plot_owner === player.id) key = k;
  if (!key) return;

  const plot = plots[key];
  const dim = world.getDimension("overworld");
  const plotNumber = parseInt(key.split("_")[1]);
  const isCurrentlyFlipped = plotNumber >= 8 && plotNumber <= 11;

  flippedDB[player.id] = isCurrentlyFlipped;
  setFlippedDB(flippedDB);

  fillAreaAPI(dim, plot.closePlotCords.from, plot.closePlotCords.to, "minecraft:barrier");

  const [minX, maxX] = minMax(plot.plotCords.from.x, plot.plotCords.to.x);
  const [minY, maxY] = minMax(plot.plotCords.from.y, plot.plotCords.to.y);
  const [minZ, maxZ] = minMax(plot.plotCords.from.z, plot.plotCords.to.z);

  const playersInPlot = dim.getPlayers().filter(p => {
    const loc = p.location;
    return loc.x >= minX && loc.x <= maxX &&
           loc.y >= minY && loc.y <= maxY &&
           loc.z >= minZ && loc.z <= maxZ;
  });

  for (const p of playersInPlot) {
    p.teleport(plot.entrance, dim);
  }

  tempTickAreaCommand(dim, plot.plotCords.from, plot.plotCords.to, () => {
    try {
      const minX = Math.min(plot.plotCords.from.x, plot.plotCords.to.x);
      const minY = Math.min(plot.plotCords.from.y, plot.plotCords.to.y);
      const minZ = Math.min(plot.plotCords.from.z, plot.plotCords.to.z);
      const maxX = Math.max(plot.plotCords.from.x, plot.plotCords.to.x);
      const maxY = Math.max(plot.plotCords.from.y, plot.plotCords.to.y);
      const maxZ = Math.max(plot.plotCords.from.z, plot.plotCords.to.z);

      dim.runCommand(
        `structure save "${player.id}_plot" ${minX} ${minY} ${minZ} ${maxX} ${maxY} ${maxZ} false disk`
      );
    } catch {}

    system.runTimeout(() => {
      fillAreaAPI(dim, plot.plotCords.from, plot.plotCords.to, "minecraft:air");
    }, 10);

    system.runTimeout(() => {
      fillAreaAPI(dim, plot.plotCords.from, plot.plotCords.to, "minecraft:air");
      setGrassFloorAPI(dim, plot.plotCords.from, plot.plotCords.to);
      fillAreaAPI(dim, plot.closePlotCords.from, plot.closePlotCords.to, "minecraft:barrier");
      setFloatingText(dim, plot.floatingTag, defaultClaimPlotText);
    }, 20);
  });

  delete data[key];
  setPlots(data);
}


system.afterEvents.scriptEventReceive.subscribe((event) => {
  const { id, sourceEntity } = event;

  if (id === "t:leave") {
    if (!sourceEntity) return;
    const player = sourceEntity;
    unloadPlot(player)
  }

  if (id === "t:reset") {
    if (!sourceEntity) return;
    const player = sourceEntity;
    resetPlots(player)
  }
});


function resetPlots() {

  const dim = world.getDimension("overworld");

  world.setDynamicProperty("plots_data", JSON.stringify({}));

  for (const key in plots) {

    const plot = plots[key];

    tempTickAreaCommand(dim, plot.plotCords.from, plot.plotCords.to, () => {

      fillAreaAPI(dim, plot.plotCords.from, plot.plotCords.to, "minecraft:air");

      system.runTimeout(() => {

        fillAreaAPI(dim, plot.plotCords.from, plot.plotCords.to, "minecraft:air");
        setGrassFloorAPI(dim, plot.plotCords.from, plot.plotCords.to);
        fillAreaAPI(dim, plot.closePlotCords.from, plot.closePlotCords.to, "minecraft:barrier");
        setFloatingText(dim, plot.floatingTag, defaultClaimPlotText);

      }, 20);

    });

  }

}
system.runInterval(() => {
  const obj = world.scoreboard.getObjective("isDayTime");
  if (!obj) return;

  let isDay = 0;
  try {
    isDay = obj.getScore("isDayTime");
  } catch {
    return;
  }

  if (isDay !== 1) return;

  const data = getPlots();
  const dim = world.getDimension("overworld");
  const buffer = 1;

  for (const player of dim.getPlayers()) {
    for (const key in plots) {
      const plot = plots[key];
      const plotData = data[key];
      if (!plotData) continue;

      const ownerId = plotData.plot_owner;
      const members = plotData.members || [];
      if (!ownerId) continue;
      if (ownerId === player.id || members.includes(player.id)) continue;

      const loc = player.location;
      const mainFrom = plot.plotCords.from;
      const mainTo = plot.plotCords.to;

      let inside =
        loc.x >= Math.min(mainFrom.x, mainTo.x) - buffer && loc.x <= Math.max(mainFrom.x, mainTo.x) + buffer &&
        loc.y >= Math.min(mainFrom.y, mainTo.y) - buffer && loc.y <= Math.max(mainFrom.y, mainTo.y) + buffer &&
        loc.z >= Math.min(mainFrom.z, mainTo.z) - buffer && loc.z <= Math.max(mainFrom.z, mainTo.z) + buffer;

      if (!inside && plot.closePlotCords) {
        const cFrom = plot.closePlotCords.from;
        const cTo = plot.closePlotCords.to;

        inside =
          loc.x >= Math.min(cFrom.x, cTo.x) - buffer && loc.x <= Math.max(cFrom.x, cTo.x) + buffer &&
          loc.y >= Math.min(cFrom.y, cTo.y) - buffer && loc.y <= Math.max(cFrom.y, cTo.y) + buffer &&
          loc.z >= Math.min(cFrom.z, cTo.z) - buffer && loc.z <= Math.max(cFrom.z, cTo.z) + buffer;
      }

      if (inside && player.getGameMode() != "Creative" && player.getGameMode() != "Spectator") {
        player.teleport(plot.entrance, { dimension: dim });
        player.sendMessage(" §4§lError§r§c You can only enter during Raid Night.");
        player.playSound("random.break");
      }
    }
  }
}, 5);

function openPlotManager(player, key) {
  const form = new ActionFormData()
    .title("Plot Manager")
    .body(" \n§bManage your base members below.\n ")
    .button("§bAdd Plot Members\n§7Allow players into your base!", "textures/ui/icon_recipe_nature")
    .button("§bRemove Members\n§7Remove players from your base!", "textures/ui/icon_recipe_item");

  form.show(player).then(r => {
    if (r.canceled) return;
    if (r.selection === 0) openAddPlotMember(player, key);
    if (r.selection === 1) openRemovePlotMember(player, key);
  });
}

function openAddPlotMember(player, key) {
  const data = getPlots();
  const plotData = data[key];
  if (!plotData) return;

  const members = plotData.members || [];

  const available = world.getPlayers().filter(p => {
    if (p.id === player.id) return false;
    if (members.includes(p.id)) return false;
    return true;
  });

  const form = new ModalFormData()
    .title("Add Plot Member")
    .label("\n§bSelect a player to allow into your base.\n \n")
    .dropdown("§bPlayers:", available.length ? available.map(p => p.name) : ["§7No Available Players"]);

  form.show(player).then(r => {
    if (r.canceled) return;
    if (!available.length) return;

    const target = available[r.formValues[1]];

    plotData.members.push(target.id);
    setPlots(data);

    player.sendMessage(`§a ${target.name} was added to your plot.`);
    player.playSound("random.orb");

    target.sendMessage(`§a You were added to §l${player.name}§r§a's Plot.`);
    target.playSound("random.orb");
  });
}

function openRemovePlotMember(player, key) {
  const data = getPlots();
  const plotData = data[key];
  if (!plotData) return;

  const members = plotData.members || [];

  const onlineMembers = members
    .map(id => world.getPlayers().find(p => p.id === id))
    .filter(Boolean);

  const form = new ModalFormData()
    .title("Remove Plot Member")
    .label("\n§bSelect a member to remove from your base.\n \n")
    .dropdown("§bMembers:", onlineMembers.length ? onlineMembers.map(p => p.name) : ["§7No Members"]);

  form.show(player).then(r => {
    if (r.canceled) return;
    if (!onlineMembers.length) return;

    const target = onlineMembers[r.formValues[1]];

    plotData.members = plotData.members.filter(id => id !== target.id);
    setPlots(data);

    player.sendMessage(`§a ${target.name} was removed from your plot.`);
    player.playSound("random.orb");

    target.sendMessage(`§c You were removed from §l${player.name}§r§c's Plot.`);
    target.playSound("item.shield.block", { pitch: 0.8 });
  });
}