# IPPure 節點純淨度

在 Loon 的節點清單長按或右鍵點選節點，選擇「檢測 IP 純淨度」。查詢會經過該節點，結果會顯示 IPPure 實際看到的出口 IP、風險分數，以及可取得的位置、ASN 和網絡類型。

## 從網址匯入

適用於 Loon 3.5.1（Build 983）或更新版本。

1. 在 Loon 的「插件」頁按「＋」，將下方網址貼入網址欄，儲存並啟用插件。
2. 確認腳本功能及 Loon 連線已開啟，在節點清單長按或右鍵點選節點，選擇「檢測 IP 純淨度」。

```text
https://raw.githubusercontent.com/Vianssr/Loon-pure/main/IPPure.plugin
```

## 安裝本機插件

1. 將 [IPPure.plugin](Plugins/IPPure.plugin) 複製到「iCloud 雲碟 → Loon → Plugins」。
2. 將 [ippure.js](Scripts/ippure.js) 複製到「iCloud 雲碟 → Loon → Scripts」。
3. 在 Loon 的「插件」頁按「＋」，於網址欄輸入完整檔名 `IPPure.plugin`，儲存並啟用。確認 Loon 的腳本功能已開啟。
4. 開啟 Loon 連線，在節點清單長按或右鍵點選要測試的節點，選擇「檢測 IP 純淨度」。

## 如何看分數

分數越低，代表 IPPure 評估的濫用風險越低。若出口是 IPv6，仍會顯示出口 IP，但 IPPure 目前只為 IPv4 計算風險分數。[IPPure 公開 API](https://ippure.com/MyIP-Info-API) · [IPPure 評分說明](https://ippure.com/faq)
