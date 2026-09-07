# Streaming Buffer Simulator

互動式展示串流播放器如何讀取 HLS manifest、下載 segment，以及在網路速度低於播放速度時耗盡 buffer 並進入重新緩衝。

## 使用方式

直接開啟 `index.html`，或在此目錄啟動任何靜態檔案伺服器。

- **Play / Pause**：開始或暫停模擬。
- **Restart**：清空 manifest 與 buffer 狀態，回到起點。
- **Network**：自動播放高 → 低 → 中 → 高的網路情境；這是速度指示條，無須拖曳。低速顯示橘色，buffer 會逐漸縮小。Pause 會凍結情境時間，Restart 會重播。

播放流程依序為 `Buffering → Reading Manifest → Buffering → Playing`。播放器會先累積 2 個 segment 才開始播放，並將預載上限維持在 5 個 segment；耗盡後也會重新累積到 2 個才繼續。

播放線以每秒約 1.6 個 segment 前進。Network 依序自動切換三種速度；低於播放速率時轉為橘色，高於播放速率時則為藍色。播放到最後會顯示 `Done`。各階段時長為依照提供影片近似設定。

工具不需要套件、建置流程或後端服務。
