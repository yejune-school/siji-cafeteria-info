const { app, BrowserWindow, session } = require("electron");
const path = require("path");

function createWindow() {
  const w = new BrowserWindow({
    width: 460, height: 820, title: "모급",
    icon: path.join(__dirname, "icon-512.png"),
    autoHideMenuBar: true
  });
  w.loadFile("index.html");
}

app.whenReady().then(() => {
  // file:// 에서 NEIS API 를 호출할 수 있도록 응답에 CORS 허용 헤더 추가
  session.defaultSession.webRequest.onHeadersReceived({ urls: ["https://open.neis.go.kr/*"] }, (d, cb) => {
    d.responseHeaders["Access-Control-Allow-Origin"] = ["*"];
    cb({ responseHeaders: d.responseHeaders });
  });
  createWindow();
});
app.on("window-all-closed", () => app.quit());
