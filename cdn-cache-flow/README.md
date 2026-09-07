# CDN 快取流程模擬器

純前端互動工具，示範使用者請求如何經過區域 Edge Cache、Origin Shield 與 Origin Storage。

按下播放後，模擬器會依序送出不同區域對兩個影片的請求，呈現：

- 冷快取的第一次回源讀取
- Origin Shield 對跨區域請求的快取命中
- Edge Cache 對重複請求的快取命中
- 請求數、Origin 讀取次數與總快取命中率的變化
