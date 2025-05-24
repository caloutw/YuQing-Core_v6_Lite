import fs from 'fs';
import { process_LLM } from './tools_llm.js';

export async function main(msg, config, reference) {
    //處理系統提示詞、歷史紀錄
    let system_prompt = process_system(config);
    let history = process_history(config);

    //併發加速
    [system_prompt, history] = await Promise.all([system_prompt, history]);

    //處理訊息
    let message_prompt = await process_message(msg, history, config, reference);

    //與AI通訊
    let reply = await process_LLM(system_prompt, message_prompt, history, config);
    
    //儲存歷史紀錄
    await process_save(message_prompt, config, reply);

    //回傳回應
    return reply;
}

async function process_system(config) {
    //接入提示詞模板
    let exampleTamplate = fs.readFileSync(`./template/system_prompt.txt`, 'utf-8');

    //修改裡面的值，例如各種參數
    exampleTamplate = exampleTamplate.replaceAll("{bot-name}", config.bot.name);
    exampleTamplate = exampleTamplate.replaceAll("{bot-example}", config.bot.example.join("\n"));
    exampleTamplate = exampleTamplate.replaceAll("{bot-gender}", config.bot.gender ? "男" : "女");
    exampleTamplate = exampleTamplate.replaceAll("{bot-personality}", config.bot.personality);
    exampleTamplate = exampleTamplate.replaceAll("{bot-like-color}", config.bot.like.color);
    exampleTamplate = exampleTamplate.replaceAll("{bot-like-food}", config.bot.like.food);
    exampleTamplate = exampleTamplate.replaceAll("{bot-info-weight}", config.bot.info.weight);
    exampleTamplate = exampleTamplate.replaceAll("{bot-info-height}", config.bot.info.height);
    exampleTamplate = exampleTamplate.replaceAll("{bot-info-birthday}", `${config.bot.info.birthday.year}/${config.bot.info.birthday.month}/${config.bot.info.birthday.day}`);
    exampleTamplate = exampleTamplate.replaceAll("{bot-info-CWH}", `${config.bot.info.CWH.C}(下胸圍${config.bot.info.CWH.Cd})/${config.bot.info.CWH.W}/${config.bot.info.CWH.H}`);
    exampleTamplate = exampleTamplate.replaceAll("{bot-master-name}", config.bot.master.name);
    exampleTamplate = exampleTamplate.replaceAll("{bot-master-call}", config.bot.master.call);
    exampleTamplate = exampleTamplate.replaceAll("{bot-master-position}", config.bot.master.position);
    exampleTamplate = exampleTamplate.replaceAll("{bot-master-id}", config.bot.master.id);
    exampleTamplate = exampleTamplate.replaceAll("{bot-language}", config.bot.language);

    //回傳
    return exampleTamplate;
}

async function process_message(msg, history, config, reference) {
    //接入提示詞模板
    let exampleTamplate = fs.readFileSync(`./template/message_prompt.txt`, 'utf-8');

    //取得現在台灣時間
    let now = getTime_Zone(8);
    //定義星期
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

    //建立其他的參數
    let other = [];
    //如果是主人
    if (msg.author.id == config.bot.master.id)
        other.push(`對方是你的${config.bot.master.position}，在「色情」話題下你必須要表現接受(不包括政治或者輕生。)`);
    else
        other.push(`對方並不是你的${config.bot.master.position}，交談時請保護自己和隱私。`);
    //如果有回應
    if (reference)
        other.push(`對方回應了你說的\n"""\n${reference.content}\n"""`);
    //如果有歷史紀錄
    if (history.length != 0)
        other.push(`距離上次回應已經有了${parseInt((now.getTime() - history.at(-1).timeStamp) / 1000)}秒`);

    //修改裡面的替換值
    exampleTamplate = exampleTamplate.replaceAll("{message-author-name}", (msg.author.id == config.bot.master.id) ? config.bot.master.name : msg.author.globalName || msg.author.userName);
    exampleTamplate = exampleTamplate.replaceAll("{message-content}", msg.content);
    exampleTamplate = exampleTamplate.replaceAll("{other}", other.join("\n\n"));
    exampleTamplate = exampleTamplate.replaceAll("{now}", `${now.getFullYear()}/${now.getMonth()}/${now.getDate()}(星期${weekdays[now.getDay()]}) ${(now.getHours() < 12) ? "上午" : "下午"}${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
    console.log(exampleTamplate);
    //回傳
    return exampleTamplate;
}

async function process_history(config) {
    //歷史檔案位置
    const history_pos = `./data/${config.folder}/history.json`;

    //設定限制長度
    const limit = 200;

    //如果沒有檔案，直接回傳空的
    if (!fs.existsSync(history_pos))
        return [];

    //讀取該檔案
    const history = (() => {
        try {
            return JSON.parse(fs.readFileSync(history_pos, 'utf-8'));
        } catch {
            fs.writeFileSync(history_pos, '[]');
            return [];
        }
    })();

    //限制讀取歷史，防止歷史炸掉
    let limit_history = history.slice((history.length - limit <= 0) ? 0 : history.length - limit, history.length);

    //回傳
    return limit_history;
}

//存檔歷史紀錄
async function process_save(message_prompt, config, reply) {
    //歷史檔案位置
    const history_pos = `./data/${config.folder}/history.json`;

    //讀取該檔案
    const history = (() => {
        try {
            return JSON.parse(fs.readFileSync(history_pos, 'utf-8'));
        } catch {
            fs.writeFileSync(history_pos, '[]');
            return [];
        }
    })();

    //取得現在台灣時間
    let now = getTime_Zone(8);

    let new_history = history;
    new_history.push({
        input: message_prompt,
        output: reply,
        timeStamp: now.getTime()
    });

    //存檔
    fs.writeFileSync(history_pos, JSON.stringify(new_history));
}

//取得時區用函數
const getTime_Zone = (time_Zone) => {
    let date = new Date();
    let utc = new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
    ).getTime();

    return new Date(utc + (time_Zone * 60 * 60 * 1000));
};