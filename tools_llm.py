from openai import OpenAI

async def process_LLM(system_prompt, message_prompt, history, config):
    #轉換為openai API格式
    openai_format = []

    #系統提示詞
    openai_format.append({
        "role": "system",
        "content": system_prompt
    })

    #歷史紀錄
    for v in history:
        #取得歷史紀錄的鍵值，input/output/timeStamp
        io = list(v.keys())
        for x in io:
            #排除timeStamp
            if(x == "timeStamp"):
                continue

            openai_format.append({
                "role": "user" if (x == "input") else "assistant",
                "content": v[x]
            })
        
    #使用者訊息
    openai_format.append({
        "role": "user",
        "content": message_prompt
    })

    return await LLM_service(openai_format, config)

async def LLM_service(chat, config):
    #連接LLM服務器
    LLS = OpenAI(
        api_key= config["llm_key"],
        base_url= "https://generativelanguage.googleapis.com/v1beta/openai/"
    )

    #取得回應
    response = LLS.chat.completions.create(
        model= "gemini-2.0-flash",
        messages= chat
    )

    #移除特殊字符
    fixed_res = response.choices[0].message.content
    fixed_res = fixed_res.strip(" ")

    #回傳
    return fixed_res