import discord
import asyncio
import importlib
import logging
from threading import Timer

#建立 Discord客戶端，並且開啟調用 伺服器&私人 的權限
dc_client = discord.Client(intents = discord.Intents.all())

#建立config變數，用於存放機器人參數
config = None

#當機器人開機
@dc_client.event
async def on_ready():
    print(f"終端已經登入。")
    print(f"使用者 : {dc_client.user.name}。\n")

#當有訊息接入 
@dc_client.event
async def on_message(msg):
    #如果是機器人則丟棄
    if(msg.author.bot): 
        return False
    
    #檢查訊息中呼叫位置，大於10則是True，沒有則是False
    call_pos = True if (msg.content.find(config["bot"]["name"]) > -1 and msg.content.find(config["bot"]["name"]) < 10) else False
    #檢查訊息是否啟用mention
    mention_Include = msg.content.find(f"<@{dc_client.user.id}>") > -1
    #檢查是否被回應
    reference = await msg.channel.fetch_message(msg.reference.message_id) if (msg.reference != None) else None
    is_reference = (reference.author.id if(reference != None) else reference) == dc_client.user.id
    #檢查是否為私訊
    is_dm = True if(msg.guild == None) else False

    #如果四個條件達成一個，則觸發訊息回應模式
    if(call_pos or mention_Include or is_reference or is_dm):
        print(f"偵測到訊息輸入。")

        #送出正在輸入
        async def typingTimer_def(s):
            while True:
                async with msg.channel.typing():
                    await asyncio.sleep(s)
        typingTimer = asyncio.create_task(typingTimer_def(8))

        #將所有標籤替換成名稱
        for v in msg.mentions:
            msg.content = msg.content.replace(f"<@{v.id}>", f"{config["bot"]["master"]["name"] if (v.id == int(config["bot"]["master"]["id"])) else (v.global_name if(v.global_name != None) else v.name)}")

        #前往訊息處理入口
        tools_process = importlib.import_module("tools_process")
        reply = await tools_process.main(msg, config, reference)
        
        #結束正在輸入
        typingTimer.cancel()

        #回應
        await msg.reply(reply)

def login(_config):
    #導入變數
    global config

    #導入config，然後登入
    print("正在初始化終端...")
    config = _config

    print("初始化完成。\n")
    dc_client.run(config["token"], log_level=logging.ERROR)