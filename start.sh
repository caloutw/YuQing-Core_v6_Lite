#!/bin/bash

echo "啟動語言:"
echo "[0] - node.js"
echo "[1] - python"
read -p "選項: " option

case "$option" in
    0)
        echo ""
        echo "正在初始化 node.js 環境..."
        npm install
        node main.js
        ;;
    1)
        echo ""
        echo "正在初始化 python 環境..."
        python -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        python main.py
        ;;
    *)
        echo ""
        echo "無效的選項。"
        ;;
esac