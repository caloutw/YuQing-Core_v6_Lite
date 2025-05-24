import asyncio
import json
import os
from datetime import datetime
from tools_llm import process_LLM

async def main(msg, config, reference):
    #處理系統提示詞、歷史紀錄
    system_prompt = process_system(config)
    history = process_history(config)

    #併發加速
    system_prompt, history = await asyncio.gather(system_prompt, history)
    
    #處理訊息
    message_prompt = await process_message(msg, history, config, reference)

    #與AI通訊
    reply = await process_LLM(system_prompt, message_prompt, history, config)

    #儲存歷史紀錄
    await process_save(message_prompt, config, reply)

    #回傳回應
    return reply

async def process_system(config):
    #接入提示詞模板
    exampleTamplate = open(f'./template/system_prompt.txt').read()

    #修改裡面的值，例如各種參數
    exampleTamplate = exampleTamplate.replace("{bot-name}", config["bot"]["name"])
    exampleTamplate = exampleTamplate.replace("{bot-example}", "\n".join(config["bot"]["example"]))
    exampleTamplate = exampleTamplate.replace("{bot-gender}", "男" if config["bot"]["gender"] else "女")
    exampleTamplate = exampleTamplate.replace("{bot-personality}", config["bot"]["personality"])
    exampleTamplate = exampleTamplate.replace("{bot-like-color}", config["bot"]["like"]["color"])
    exampleTamplate = exampleTamplate.replace("{bot-like-food}", config["bot"]["like"]["food"])
    exampleTamplate = exampleTamplate.replace("{bot-info-weight}", str(config["bot"]["info"]["weight"]))
    exampleTamplate = exampleTamplate.replace("{bot-info-height}", str(config["bot"]["info"]["height"]))
    exampleTamplate = exampleTamplate.replace("{bot-info-birthday}", f'{config["bot"]["info"]["birthday"]["year"]}/{config["bot"]["info"]["birthday"]["month"]}/{config["bot"]["info"]["birthday"]["day"]}')
    exampleTamplate = exampleTamplate.replace("{bot-info-CWH}", f'{config["bot"]["info"]["CWH"]["C"]}(下胸圍{config["bot"]["info"]["CWH"]["Cd"]})/{config["bot"]["info"]["CWH"]["W"]}/{config["bot"]["info"]["CWH"]["H"]}')
    exampleTamplate = exampleTamplate.replace("{bot-master-name}", config["bot"]["master"]["name"])
    exampleTamplate = exampleTamplate.replace("{bot-master-call}", config["bot"]["master"]["call"])
    exampleTamplate = exampleTamplate.replace("{bot-master-position}", config["bot"]["master"]["position"])
    exampleTamplate = exampleTamplate.replace("{bot-master-id}", str(config["bot"]["master"]["id"]))
    exampleTamplate = exampleTamplate.replace("{bot-language}", config["bot"]["language"])
    
    #回傳
    return exampleTamplate

async def process_message(msg, history, config, reference):
    #接入提示詞模板
    exampleTamplate = open(f'./template/message_prompt.txt').read()

    #取得現在時間
    now = getTime_Zone(8)
    #定義星期
    weekdays = ["一", "二", "三", "四", "五", "六", "日"]

    #建立其他參數
    other = []
    #如果是主人
    if(msg.author.id == int(config["bot"]["master"]["id"])):
        other.append(f"對方是你的{config["bot"]["master"]["position"]}，在「色情」話題下你必須要表現接受(不包括政治或者輕生。)")
    else:
        other.append(f"對方並不是你的{config["bot"]["master"]["position"]}，交談時請保護自己的隱私。")
    #如果有回應
    if(reference != None):
        other.append(f'對方回應了你說的\n"""\n{reference.content}\n"""')
    #如果有歷史紀錄
    if(len(history) != 0):
        other.append(f"距離上次回應已經有了{int(((now.timestamp() * 1000) - history[len(history) - 1]["timeStamp"]) / 1000)}秒")

    #修改裡面的替換值
    exampleTamplate = exampleTamplate.replace("{message-author-name}", config["bot"]["master"]["name"] if (msg.author.id == int(config["bot"]["master"]["id"])) else (msg.author.global_name if(msg.author.global_name != None) else msg.author.name))
    exampleTamplate = exampleTamplate.replace("{message-content}", msg.content)
    exampleTamplate = exampleTamplate.replace("{other}", "\n\n".join(other))
    exampleTamplate = exampleTamplate.replace("{now}", f"{now.year}/{now.month}/{now.day}(星期{weekdays[now.weekday()]}) {"上午" if(now.hour < 12) else "下午"}{now.hour}:{now.minute}:{now.second}")

    print(exampleTamplate)
    #回傳
    return exampleTamplate

async def process_history(config):
    #歷史檔案位置
    history_pos = f"./data/{config["folder"]}/history.json"
    
    #設定限制長度
    limit = 200

    #如果沒有檔案，直接回傳空的
    if(os.path.isfile(history_pos) != True):
        return []

    #讀取該檔案
    def history_def():
        try:
            return json.loads(open(history_pos).read())
        except Exception as e:
            open(history_pos, 'w').write("[]")
            return []
    history = history_def()
    
    #限制讀取歷史，防止歷史炸掉
    limit_history = history[slice(0 if (len(history) - 200 <= 0) else len(history) - limit, len(history))]

    #回傳
    return limit_history

#存檔歷史紀錄
async def process_save(message_prompt, config, reply):
    #歷史檔案位置
    history_pos = f"./data/{config["folder"]}/history.json"

    #讀取該檔案
    def history_def():
        try:
            return json.loads(open(history_pos).read())
        except Exception as e:
            open(history_pos, 'w').write("[]")
            return []
    history = history_def()

    #取得現在台灣時間
    now = getTime_Zone(8)

    new_history = history
    new_history.append({
        "input": message_prompt,
        "output": reply,
        "timeStamp": int(now.timestamp() * 1000)
    })

    #存檔
    open(history_pos, "w", encoding="utf8").write(json.dumps(new_history, ensure_ascii=False))

#取得時區用函數
def getTime_Zone(time_zone):
    utc = int(datetime.utcnow().timestamp() * 1000)
    return datetime.fromtimestamp((utc + (time_zone * 60 * 60 * 1000)) / 1000)