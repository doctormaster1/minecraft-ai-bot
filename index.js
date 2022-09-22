const delay = require("delay");
const chalk = require("chalk");
const mineflayer = require("mineflayer");
const autoeat = require("mineflayer-auto-eat");
const vec3 = require("vec3");
const {
  pathfinder,
  Movements,
  goals: { GoalNear },
} = require("mineflayer-pathfinder");

const config = require("./config.json");
const msg = config.message;
const botConfig = {
  host: config.host,
  username: config.username,
  version: config.version,
};

const bot = mineflayer.createBot(botConfig);
bot.loadPlugin(pathfinder);
bot.loadPlugin(autoeat);

bot.on("login", async () => {
  console.log(chalk.bgRed("bot is connected"));
  await delay(15000);
  console.log(chalk.bgYellow(msg.login));
  bot.chat(msg.login);
  await delay(5000);
  console.log(chalk.bgYellow(msg.rebornskyblock));
  bot.chat(msg.rebornskyblock);
});

bot.once("spawn", () => {
  bot.autoEat.options = {
    priority: "saturation",
    startAt: 14,
    eatingTimeout: 3,
  };
});

bot.on("chat", async (username, message) => {
  console.log(chalk.bgMagenta(username));
  const loopMsgController = false;

  if (
    username === "vardibile" ||
    username === "MrPatates" ||
    username === "brktrz1" ||
    username === "Erdoli"
  ) {
    const realMsg = message.split("»");
    const realRealMsg = realMsg[1].split("-");
    const cmd = realRealMsg[0];
    const rMsg = realRealMsg[1];
    //console.log(chalk.bgBlue(`[${username}] - ${realMsg[1]}`));
    console.log(chalk.bgBlue(`[${cmd}] - ${rMsg}`));
    const returnMsg = `${msg.msg}${rMsg}`;
    //console.log(chalk.bgGreen(`[MSG] ${returnMsg}`));

    switch (cmd) {
      case " say":
        bot.chat(rMsg);
        break;
      case " msg":
        bot.chat(returnMsg);
        break;
      case " ileri":
        var delayTime = parseInt(rMsg);
        bot.setControlState("forward", true);
        await delay(delayTime);
        bot.setControlState("forward", false);
        break;
      case " geri":
        var delayTime = parseInt(rMsg);
        bot.setControlState("back", true);
        await delay(delayTime);
        bot.setControlState("back", false);
        break;
      case " sola":
        var delayTime = parseInt(rMsg);
        bot.setControlState("left", true);
        await delay(delayTime);
        bot.setControlState("left", false);
        break;
      case " sağa":
        var delayTime = parseInt(rMsg);
        bot.setControlState("right", true);
        await delay(delayTime);
        bot.setControlState("right", false);
        break;
      case " zıpla":
        bot.setControlState("jump", true);
        bot.setControlState("jump", false);
        break;
      case " build":
        build();
        break;
      default:
        bot.chat("Olmadı be ustam");
        break;
    }

    //bot.chat(returnMsg);
  } else if (
    username === "RebornCraft" &&
    message ===
      "Lütfen sohbeti kullanmadan önce hareket edin; bu spam botları önlemek içindir."
  ) {
    console.log(chalk.bgRed("log"));
    bot.setControlState("forward", true);
    await delay(100);
    bot.setControlState("forward", false);
  }
});

const build = () => {
  const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  const jumpY = Math.floor(bot.entity.position.y) + 1.0;
  bot.setControlState("jump", true);
  bot.on("move", placeIfHighEnough);

  let tryCount = 0;

  async function placeIfHighEnough() {
    if (bot.entity.position.y > jumpY) {
      try {
        await bot.placeBlock(referenceBlock, vec3(0, 1, 0));
        bot.setControlState("jump", false);
        bot.removeListener("move", placeIfHighEnough);
        console.log(chalk.bgMagenta("Başarıyla Tamamlandı"));
      } catch (err) {
        tryCount++;
        if (tryCount > 10) {
          console.log(chalk.red(err.message));
          bot.setControlState("jump", false);
          bot.removeListener("move", placeIfHighEnough);
        }
      }
    }
  }
};

bot.on("message", (message) => {
  console.log(message.toAnsi());
});

bot.on("kicked", console.log);
bot.on("error", console.log);
