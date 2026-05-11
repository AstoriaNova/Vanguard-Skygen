import { system, CommandPermissionLevel, CustomCommandParamType } from "@minecraft/server";
import { editValueCommand } from "./editValue";
import { reachTestCommand } from "./reachTest";
import { baltopCommand } from "./baltop";
import { repairCommand } from "./repair";


const commandsRegistered = Symbol("vanguard:commands_registered");

system.beforeEvents.startup.subscribe((init) => {
  const registry = init.customCommandRegistry;

  if (!globalThis[commandsRegistered]) {

    registry.registerCommand(
      {
        name: "vanguard:edit-value",
        description: "Set, add, or remove a dynamic property.",
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
          { name: "operation", type: CustomCommandParamType.String },
          { name: "key", type: CustomCommandParamType.String },
          { name: "value", type: CustomCommandParamType.Integer },
          { name: "target", type: CustomCommandParamType.PlayerSelector },
        ],
      },
      editValueCommand
    );

    registry.registerCommand(
      {
        name: "vanguard:reach-test",
        description: "Test if a player is using reach.",
        permissionLevel: CommandPermissionLevel.Any,
        mandatoryParameters: [
          { name: "target", type: CustomCommandParamType.PlayerSelector },
        ],
      },
      reachTestCommand
    );

    registry.registerCommand(
      {
        name: "vanguard:bal-top",
        description: "See the richest players!",
        permissionLevel: CommandPermissionLevel.Any,
      },
      baltopCommand
    );

    registry.registerCommand(
      {
        name: "vanguard:repair",
        description: "Fully repair your armor.",
        permissionLevel: CommandPermissionLevel.Any,
      },
      repairCommand
    );



    globalThis[commandsRegistered] = true;
  }
});
