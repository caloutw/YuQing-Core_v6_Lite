import { Client, Partials, GatewayIntentBits } from 'discord.js';

//建立 Discord客戶端，並且開啟調用 伺服器&私人 的權限
const dc_client = new Client({
    intents: Object.keys(GatewayIntentBits).map(v=>GatewayIntentBits[v]),
    partials: Object.keys(Partials).map(v=>Partials[v])
})

//建立config變數，用於存放機器人參數
let config;

//當機器人開機
dc_client.on("ready", () => {
    console.log("終端已經登入。");
    console.log(`使用者 : ${dc_client.user.username}。\n`);
});

//當有訊息接入
dc_client.on("messageCreate", async msg => {
    //如果是機器人則丟棄
    if(msg.author.bot) return false;

    //檢查訊息中的呼叫位置，大於10則是true，沒有則是false
    const call_Pos = (msg.content.indexOf(config.bot.name) < 10 && msg.content.includes(config.bot.name));
    //檢查訊息是否用mention
    const mention_Include = msg.content.includes(`<@${dc_client.user.id}>`);
    //檢查是否被回應
    const reference = (msg?.reference)?(await msg.channel.messages.fetch(msg.reference.messageId)):false;
    const is_reference = (reference?reference.author.id:reference) == dc_client.user.id;
    //檢查是否為私訊
    const is_dm = msg.guildId?false:true;

    //如果四個條件達成一個，則觸發訊息回應模式
    if(call_Pos || mention_Include || is_reference || is_dm){
        console.log("偵測到訊息輸入。");

        //送出正在輸入
        await msg.channel.sendTyping();
        const typingTimer = setInterval(async ()=>{await msg.channel.sendTyping()}, 8000);

        //將所有標籤替換成名稱
        msg.mentions.users.forEach(v => msg.content = msg.content.replaceAll(`<@${v.id}>`, (v.id == config.bot.master.id)?config.bot.master.name:v.globalName||v.username));

        //前往訊息處理入口
        const tools_process = await import("./tools_process.js");
        const reply = await tools_process.main(msg, config, reference);

        //結束正在輸入
        clearInterval(typingTimer);

        //回應
        msg.reply(reply);
    }
})

//登入接口
export async function login(_config) {
    //導入config，然後登入
    console.log("正在初始化終端...");
    config = _config;

    console.log("初始化完成。\n");
    dc_client.login(config.token);
};