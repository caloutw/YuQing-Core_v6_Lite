# Discord Bot AI 完整部署文件
採用 YuQing v6 Lite 架構部署<br>
透過 OpenAI API 連接 LLM 服務

## 前置準備
* [Discord Dev](https://discord.com/developers/applications)
* [AiStudio LLM Service](https://aistudio.google.com/app/u/2/prompts/new_chat)

## 注意
* ⚠️ **AiStudio LLM Service** **建議**使用個人帳號。
* ⚠️ **Discord** 請**開啟** 「使用者設定 > 進階 > 開發者模式」。

## 環境
隨便你，只要有nodejs或者python其一就好，我使用的環境如下<br>
nodejs > 24.0<br>
python > 3.12<br>

## Discord Dev 前置
好，接下來要來建立機器人，首先先前往 **Discord Dev** 建立一個 **新的應用(New Application)**<br>
填入名稱，同意條款後下一步<br>
接下來就是介紹一下側邊欄了<br>

| 名稱 | 中譯 | 其他 |
|---|---|---|
| General Information | 基本資訊 | 專案名稱，自我介紹，對我不知為啥自介在這 |
| Installation | 安裝 | 不用管他，邀請連結用 |
| OAuth2 | 安全認證 | 除非你腦袋撞到，要不然別動它 |
| Bot | 機器人 | 這裡的東西很重要，等下會用到，算是最高機密 |

剩下的就算了，太多了，也用不到<br>
接下來要說的都是機器人關鍵訊息，聽好了<br>

| 功能 | 在哪 | 其他 |
|---|---|---|
| 自介 | General Information > Description | 就他特別 |
| 頭像 | Bot > Icon | 沒辦法調位置，請先調好 |
| 橫幅 | Bot > Banner | 我不知道為什麼機器人沒Nitro但可以用這個嗚嗚嗚嗚 |
| 名稱 | Bot > UserName | 名字在這裡 |
| 專案名稱 | General Information > Name | 這個是專案名稱，不是機器人名稱 |
| 專案圖片 | General Information > App Icon | 這個是專案圖片，不是機器人大頭貼 |

好 :)<br>
搞定了吧<br>
接下來幫我去 ** Bot **，然後將 **Presence Intent**、**Server Members Intent**、**Message Content Intent** 打開<br>
如果你不想讓別人邀請你的機器人就順手將 **Public Bot** 關掉。<br>

好，你已經完成一小部分了，接下來幫我將 **Bot** 的 **Token** 複製下來(可能你要認證啥的，就認證吧)。<br>
然後複製，貼上到某個地方都OK，但覺對不能公開，除非是你信任的地方或人。<br>

# AiStudio 前置
好，接下來就是大語言模型了，進去登入後，直接攻打右上角 Get API Key <br>
然後 + Create API Key，照著他按，最後把 API Key 複製下來。

# 接下來
回到資料夾<br>
好了接下來你要在 ``data`` 裡面新增一個資料夾，名稱隨便你，建議取自己機器人的英文名稱，中文真的不優，雖然可以跑就是<br>
然後裡面新增一個api.json的檔案

將這東西複製進去
```json
{
    "bot":{
        "name": "機器人叫啥",
        "gender": 0,
        "personality": "機器人個性",
        "like": {
            "food": "機器人喜歡吃啥，大概是機油吧...",
            "color": "機器人喜歡啥顏色"
        },
        "info": {
            "height": 0,
            "weight": 0,
            "birthday": {
                "year": 2000,
                "month": 1,
                "day": 1
            },
            "CWH":{
                "C": 0,
                "Cd":0,
                "W": 0,
                "H": 0
            }
        },
        "master": {
            "id": "去Discord，點左下角的名字那個匡，複製ID",
            "call": "機器人怎麼叫你",
            "name": "你叫什麼",
            "position": "你是這個機器人的誰"
        },
        "language": "會說啥語言",
        "example":[
            "說話範例1",
            "說話範例2",
            "說話範例3",
            "你還需要下一個就自己加上，用英文逗號隔開"
        ]
    },
    "token": "剛剛拿到Discord Dev的token",
    "llm_key": "剛剛拿到AiStudio的API Key"
}
```

info 裡面的 height weight 英文夠好應該不用我翻譯吧？<br>
CWH 是指三圍，自己Google那些魅魔數據，反正Cd就是下胸圍，嘿，我知道你在想什麼。<br>
gender 0是女生 1是男生，合乎常理<br>

# 結尾
好了，搞定了，你就存檔然後回到底層資料夾，就是你會看到data template啥的那個介面，右鍵「在終端開啟」還是「使用powershell開啟」，我不知道我太久沒用Windows<br>
MacOS 跟 Linux 就用 cd 進資料夾吧<br>
<br>
然後Linux:
```shell
chmod 777 ./start.sh
./start.sh
```

如果是windows(nodejs):
```shell
npm i
node main.js
```

如果是windows(python):
```shell
pip install -r requirements
python main.py
```

# 順帶一提
喔對了歷史紀錄會在 ``data/機器人資料夾`` 裡面，要跑路記得刪他，換地方運行也是帶著他就對了
