import os
import sys
import json
import asyncio
from api_discord import login

def main():
    #清空控制台
    print("\033c", end="")

    #讀取顯示標題的檔案，用 utf-8 標準編碼開啟
    title = open("./title.txt").read()

    #顯示標題
    print(title)

    #掃描資料夾
    data = os.listdir("./data/")

    #確認所有資料夾的正確性
    print("正在檢查所有檔案的正確性...")
    def data_filter(v):
        #資料夾所需格式
        config_format = ["api.json"]

        #逐一確認，然後取得該資料夾錯誤的數量
        def fail_load_filter(x):
            #檢查檔案是否存在
            if(os.path.isfile(f"./data/{v}/{x}") != True):
                return True

            #檢查檔案格式正確性，是JSON則移出，不是則留著 (因為是計算錯誤量，所以要留著表示錯誤)
            file = open(f"./data/{v}/{x}").read()
            try:
                json.loads(file)
                return False
            except:
                print(f"讀取 ./data/{v}/{x} 時發生錯誤。")
                return True
        fail_load = len(list(filter(fail_load_filter, config_format)))

        #如果長度不是0，就代表有錯誤，返回False，然後就會被過濾
        if(fail_load != 0):
            return False

        #長度是0，沒問題，不被過濾
        elif(fail_load == 0):
            return True
    data = list(filter(data_filter, data))

    #如果都沒有東西
    if(len(data) == 0):
        raise TypeError("我找不到任何符合標準的檔案啊。")

    #顯示所有檔案
    print("已找到可用的選項。")
    for i, v in enumerate(data):
        print(f"[{i}] - {v}")

    #建立詢問
    answer = int(input("選項: "))

    #如果讀取正確
    if(answer >= 0 and answer <= len(data)):
        print(f"正在加載 {data[answer]} 的設定...")
        config = json.loads(open(f"./data/{data[answer]}/api.json").read())

        print(f"正在初始化...")
        config["folder"] = data[answer]

        print(f"正在登入終端...")
        login(config)
    else:
        raise TypeError("這是個致命的選擇。")

main()