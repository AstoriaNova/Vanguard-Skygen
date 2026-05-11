import { world, system, CustomCommandStatus, InputPermissionCategory } from "@minecraft/server";

const activeTests = new Map();
let unsubscribe = null;

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function directionRotation(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const yaw = Math.atan2(-dx, dz) * (180 / Math.PI);
  const pitch = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * (180 / Math.PI);
  return { x: pitch, y: yaw };
}

function cleanupTest(attacker, tester, test) {
  attacker.teleport(test.attackerOriginalLocation, { dimension: tester.dimension, rotation: test.attackerOriginalRotation });
  tester.teleport(tester.location, { dimension: tester.dimension, rotation: test.testerOriginalRotation });
  attacker.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, true);
  attacker.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, true);
  tester.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, true);
  tester.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, true);
  activeTests.delete(attacker.id);
  if (activeTests.size === 0 && unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

function subscribe() {
  if (unsubscribe) return;

  unsubscribe = world.afterEvents.entityHitEntity.subscribe((ev) => {
    try {
      const attacker = ev.damagingEntity;
      const victim = ev.hitEntity;

      if (!attacker || attacker.typeId !== "minecraft:player") return;
      if (!victim) return;

      const test = activeTests.get(attacker.id);
      if (!test) return;
      const tester = test.tester;

      if (test.stage === 0) {
        test.attackerOriginalLocation = { ...attacker.location };
        test.attackerOriginalRotation = attacker.getRotation();
        test.testerOriginalRotation = tester.getRotation();
        test.stage = 1;

        attacker.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, false);
        attacker.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, false);
        tester.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, false);
        tester.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, false);

        const yaw = (tester.getRotation().y * Math.PI) / 180;
        const offset = {
          x: tester.location.x - Math.sin(yaw) * 3.4,
          y: tester.location.y,
          z: tester.location.z + Math.cos(yaw) * 3.4,
        };

        const rotToTester = directionRotation(offset, tester.location);
        attacker.teleport(offset, { dimension: tester.dimension, rotation: rotToTester });
        const rotToTarget = directionRotation(tester.location, offset);
        tester.teleport(tester.location, { dimension: tester.dimension, rotation: rotToTarget });

        test.timeout = system.runTimeout(() => {
          if (!activeTests.has(attacker.id) || test.stage !== 1) return;
          tester.sendMessage(`§bReach Test §b§l>§3>§b> §r§3${attacker.name}§b passed the Reach Test.`);
          cleanupTest(attacker, tester, test);
        }, 10);
        return;
      }

      if (test.stage === 1) {
        if (victim.id !== tester.id) return;
        system.clearRun(test.timeout);
        const d = distance(attacker.getHeadLocation(), tester.getHeadLocation());
        if (d > 3.95) {
          tester.sendMessage(`§bReach Test §b§l>§3>§b> §r§4${attacker.name}§c failed the Reach Test.\n(${d})`);
        } else {
          tester.sendMessage(`§bReach Test §b§l>§3>§b> §r§3${attacker.name}§b passed the Reach Test.`);
        }
        cleanupTest(attacker, tester, test);
      }
    } catch (e) {
    }
  });
}

export function reachTestCommand(origin, players) {
  const source = origin.sourceEntity;
  if (!source.hasTag("staff")) {
    return { status: CustomCommandStatus.Failure, message: "You do not have permission to use this command." };
  }

  const target = players[0];
  if (!target) {
    return { status: CustomCommandStatus.Failure, message: "No player provided." };
  }

  source.sendMessage(`§bReach Test §b§l>§3>§b> §r§3${target.name}§b is queued for a Reach Test.`);
  activeTests.set(target.id, { tester: source, stage: 0 });
  system.run(() => { subscribe(); });

  return { status: CustomCommandStatus.Success, message: "Queued." };
}