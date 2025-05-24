import { OpenAI } from 'openai';

export async function process_LLM(system_prompt, message_prompt, history, config){
    //轉換為openai API格式
    let openai_format = [];
    
    //系統提示詞
    openai_format.push({
        role: "system",
        content: system_prompt
    });

    //歷史紀錄
    history.forEach(v => {
        //取得歷史紀錄的鍵值，input/output/timeStamp
        const io = Object.keys(v);
        io.forEach(x => {
            //排除timeStamp
            if(x == "timeStamp")
                return;

            openai_format.push({
                role: (x == "input")?"user":"assistant",
                content: v[x]
            });
        })
    });

    //使用者訊息
    openai_format.push({
        role: "user",
        content: message_prompt
    });

    return await LLM_service(openai_format, config);
}

async function LLM_service(chat, config){
    //連接LLM服務器
    const LLS = new OpenAI({
        apiKey: config.llm_key,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    });

    //取得回應
    const response = await LLS.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: chat,
    });

    //移除特殊字符
    let fixed_res = response.choices[0].message.content;
    fixed_res = fixed_res.trim();

    //回傳
    return fixed_res;
}