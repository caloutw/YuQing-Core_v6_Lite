import fs from 'fs';
import readline from 'readline';
import { stdin, stdout } from 'process';
import { login } from './api_discord.js';

async function main() {
    //清空控制台
    console.clear();

    //讀取顯示標題的檔案，用 utf-8 標準編碼開啟
    let title = fs.readFileSync(`./title.txt`, 'utf-8');

    //顯示標題
    console.log(title);

    //掃描資料夾
    let data = fs.readdirSync(`./data/`);

    //確認所有資料夾的正確性
    console.log("正在檢查所有檔案的正確性...");
    data = data.filter(v => {
        //資料夾所需格式
        const config_format = ["api.json"];

        //逐一確認，然後取得該資料夾錯誤檔案的數量
        let fail_load = config_format.filter(x => {
            //檢查檔案存在
            if (!fs.existsSync(`./data/${v}/${x}`))
                return true;

            //檢查檔案格式正確性，是JSON則移出，不是則留著 (因為是計算錯誤量，所以要留著表示錯誤)
            const file = fs.readFileSync(`./data/${v}/${x}`, 'utf8');
            try {
                JSON.parse(file);
                return false;
            } catch (e) {
                console.log(`讀取./data/${v}/${x} 時發生錯誤。`);
                return true;
            }
        }).length;

        //如果長度不是0，就代表有錯誤，返回false，然後就會被過濾
        if (fail_load != 0)
            return false;

        //長度是0，沒問題，不被過濾
        else if (fail_load == 0)
            return true;
    })

    //如果都沒有東西
    if(data.length == 0)
        throw new Error("我找不到任何符合標準的檔案啊。");

    //顯示所有檔案
    console.log("已找到可用的選項。");
    data.forEach((v, i) => {
        console.log(`[${i}] - ${v}`);
    })

    //建立詢問
    let answer = await new Promise(res => {
        const rl = readline.createInterface({input: stdin,output: stdout});
        rl.question("選項: ", (ans) => {rl.close(); res(ans);});
    });

    //如果讀取正確
    if(data[answer]) {
        console.log(`正在加載 ${data[answer]} 的設定...`);
        let config = JSON.parse(fs.readFileSync(`./data/${data[answer]}/api.json`, 'utf-8'));

        console.log(`正在初始化...`);
        config.folder = data[answer];
        
        console.log(`正在登入終端...`);
        login(config);
    } else {
        throw new Error("這是個致命的選擇。");
    }
}

main();