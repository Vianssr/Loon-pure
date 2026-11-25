function showResult(title, lines) {
  const content = lines.join("\n");
  const htmlMessage = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
  $done({ title, content, htmlMessage });
}

function riskSummary(info) {
  if (info.ip.includes(":")) return "風險分數　IPPure 暫未為 IPv6 評分";
  const score = info.fraudScore;
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return "風險分數　IPPure 未提供有效分數";
  }
  return `風險分數　${score} / 100（越低代表風險越低）`;
}

function report(node, info) {
  const lines = [riskSummary(info), `出口 IP　${info.ip}`, `節點　${node}`];
  const location = [...new Set([info.country, info.region, info.city].filter(Boolean))];
  if (location.length) lines.push(`位置　${location.join(" · ")}`);
  const network = [info.asn ? `AS${info.asn}` : "", info.asOrganization].filter(Boolean);
  if (network.length) lines.push(`網絡　${network.join(" · ")}`);
  if (typeof info.isResidential === "boolean") {
    lines.push(`IP 類型　${info.isResidential ? "住宅" : "機房"}`);
  }
  showResult("IPPure 節點純淨度", lines);
}

function run() {
  const params = typeof $environment === "undefined" ? null : $environment?.params;
  const node = [params?.nodeInfo?.name, params?.node].find(
    name => typeof name === "string" && name.trim().length > 0
  );
  if (!node) {
    showResult("請先選擇節點", ["長按或右鍵點選一個節點，再選「檢測 IP 純淨度」。"]);
    return;
  }

  const request = {
    url: "https://my.ippure.com/v1/info",
    node,
    timeout: 12000,
    headers: { Accept: "application/json", "Cache-Control": "no-cache, no-store" },
    insecure: false,
    "auto-cookie": false,
    "auto-redirect": false,
  };
  function fail(reason) {
    showResult("IPPure 檢測失敗", [`節點　${node}`, reason]);
  }

  $httpClient.get(request, (error, response, body) => {
    if (response?.status === 429) return fail("IPPure 查詢次數已達上限，請稍後再試。");
    if (error) return fail("無法透過此節點連線至 IPPure，請檢查節點連線後重試。");
    if (response?.status !== 200) {
      return fail(response?.status ? `IPPure 回傳 HTTP ${response.status}。` : "未收到 HTTP 回應。");
    }
    let info;
    try {
      info = JSON.parse(body);
    } catch {
      return fail("IPPure 回傳的內容無法解析。");
    }
    if (typeof info?.ip !== "string" || !info.ip.trim()) return fail("IPPure 未回傳出口 IP。");
    report(node, info);
  });
}

run();
