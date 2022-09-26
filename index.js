const path = require("path");
const fs = require("fs").promises;

const delay = require("delay");
const chalk = require("chalk");

const mineflayer = require("mineflayer");
const autoeat = require("mineflayer-auto-eat");

const { builder, Build } = require("mineflayer-builder");
const { Schematic } = require("prismarine-schematic");

const pathfinder = require("mineflayer-pathfinder").pathfinder;
const Movements = require("mineflayer-pathfinder").Movements;
const { GoalBlock } = require("mineflayer-pathfinder").goals;

const config = require("./config.json");
const msg = config.message;
const botConfig = {
  host: config.host,
  username: config.username,
  version: config.version,
  port: config.port,
};

const mcData = require("minecraft-data")(config.version);
const bot = mineflayer.createBot(botConfig);

bot.loadPlugin(pathfinder);
bot.loadPlugin(builder);
bot.loadPlugin(autoeat);

bot.on("login", async () => {
  console.log(chalk.bgRed("bot is connected"));

  await delay(15000);
  bot.chat(msg.login);

  await delay(5000);
  bot.chat(msg.skyblock);
});

bot.once("spawn", () => {
  bot.autoEat.options.priority = "foodPoints";
  bot.autoEat.options.bannedFood = [
    "golden_apple",
    "enchanted_golden_apple",
    "rotten_flesh",
  ];
  bot.autoEat.options.eatingTimeout = 3;
});

bot.on("chat", async (username, message) => {
  console.log(chalk.bgMagenta(username));

  if (username === config.author) {
    const realMsg = message.split("»");
    const realRealMsg = realMsg[1].split("-");
    const cmd = realRealMsg[0];
    const rMsg = realRealMsg[1];
    const returnMsg = `${msg.msg}${rMsg}`;

    switch (cmd) {
      case " say":
        bot.chat(rMsg);
        break;
      case " msg":
        bot.chat(returnMsg);
        break;
      case " forward":
        var delayTime = parseInt(rMsg);
        bot.setControlState("forward", true);
        await delay(delayTime);
        bot.setControlState("forward", false);
        break;
      case " back":
        var delayTime = parseInt(rMsg);
        bot.setControlState("back", true);
        await delay(delayTime);
        bot.setControlState("back", false);
        break;
      case " left":
        var delayTime = parseInt(rMsg);
        bot.setControlState("left", true);
        await delay(delayTime);
        bot.setControlState("left", false);
        break;
      case " right":
        var delayTime = parseInt(rMsg);
        bot.setControlState("right", true);
        await delay(delayTime);
        bot.setControlState("right", false);
        break;
      case " jump":
        bot.setControlState("jump", true);
        bot.setControlState("jump", false);
        break;
      case " build":
        build();
        break;
      case " come":
        come(username);
        break;
      default:
        bot.chat("I don't understand");
        break;
    }
  } else if (
    username === config.servername &&
    message === config.servermassage
  ) {
    // It is for the bot to react to certain server messages. Make changes according to the server you are playing on.
    console.log(chalk.bgRed(message));
    bot.setControlState("forward", true);
    await delay(100);
    bot.setControlState("forward", false);
  }
});

bot.on("autoeat_started", () => {
  console.log("Auto Eat started!");
});

bot.on("autoeat_stopped", () => {
  console.log("Auto Eat stopped!");
});

bot.on("health", () => {
  if (bot.food <= 14) bot.autoEat.disable();
  else bot.autoEat.enable();
});

const come = (username) => {
  const defaultMove = new Movements(bot, mcData);
  const target = bot.players[username] || null;
  const p = target.entity.position;

  bot.pathfinder.setMovements(defaultMove);
  bot.pathfinder.setGoal(new GoalBlock(p.x, p.y, p.z));
};

const build = async () => {
  const schematic = await Schematic.read(
    await fs.readFile(path.resolve(__dirname, "./schematics/testSchem.schem")),
    bot.version
  );
  while (!bot.entity.onGround) {
    await delay(100);
  }
  const at = bot.entity.position.floored();
  console.log("Building at ", at);
  const build = new Build(schematic, bot.world, at);
  bot.builder.build(build);
};

bot.on("message", (message) => {
  console.log(message.toAnsi());
});

bot.on("kicked", console.log);
bot.on("error", console.log);
