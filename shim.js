// 안드로이드 앱의 Android 브리지가 없는 환경(iPhone·PC 브라우저·Windows 앱)용 대체 구현
if (!window.Android) {
  const L = localStorage;
  const P = (typeof NEIS_PROXY === "string" && NEIS_PROXY) ? NEIS_PROXY : "";
  window.Android = {
    get: u => fetch(P ? u.replace("https://open.neis.go.kr/hub/", P) : u).then(r => r.text()).catch(e => JSON.stringify({error: e.name || "fetch"})),
    load: () => L.getItem("school") || "",
    save: (o, c, n, k) => L.setItem("school", [o, c, n].join("|")),
    clear: () => L.removeItem("school")
  };
}
