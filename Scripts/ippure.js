const translations = {
  "zh-Hant": {
    title: "IPPure 節點純淨度",
    score: "風險分數",
    lowerRisk: "越低代表風險越低",
    ipv6: "IPPure 暫未為 IPv6 評分",
    noScore: "IPPure 未提供有效分數",
    ip: "出口 IP",
    node: "節點",
    location: "位置",
    network: "網絡",
    type: "IP 類型",
    residential: "住宅",
    datacenter: "機房",
    selectNode: "請先選擇節點",
    selectHint: "長按或右鍵點選一個節點，再選「IPPure」。",
    failed: "IPPure 檢測失敗",
    rateLimit: "IPPure 查詢次數已達上限，請稍後再試。",
    connection: "無法透過此節點連線至 IPPure，請檢查節點連線後重試。",
    httpError: status => `IPPure 回傳 HTTP ${status}。`,
    noResponse: "未收到 HTTP 回應。",
    invalidBody: "IPPure 回傳的內容無法解析。",
    noIP: "IPPure 未回傳出口 IP。",
  },
  "zh-Hans": {
    title: "IPPure 节点纯净度",
    score: "风险分数",
    lowerRisk: "分数越低，风险越低",
    ipv6: "IPPure 暂未为 IPv6 评分",
    noScore: "IPPure 未提供有效分数",
    ip: "出口 IP",
    node: "节点",
    location: "位置",
    network: "网络",
    type: "IP 类型",
    residential: "住宅",
    datacenter: "机房",
    selectNode: "请先选择节点",
    selectHint: "长按或右键点击一个节点，再选择“IPPure”。",
    failed: "IPPure 检测失败",
    rateLimit: "IPPure 查询次数已达上限，请稍后再试。",
    connection: "无法通过此节点连接到 IPPure，请检查节点连接后重试。",
    httpError: status => `IPPure 返回 HTTP ${status}。`,
    noResponse: "未收到 HTTP 响应。",
    invalidBody: "无法解析 IPPure 返回的内容。",
    noIP: "IPPure 未返回出口 IP。",
  },
  en: {
    title: "IPPure IP reputation",
    score: "Risk score",
    lowerRisk: "lower means less risk",
    ipv6: "IPPure does not score IPv6 addresses yet",
    noScore: "Score unavailable",
    ip: "Exit IP",
    node: "Node",
    location: "Location",
    network: "Network",
    type: "IP type",
    residential: "Residential",
    datacenter: "Data center",
    selectNode: "Select a node",
    selectHint: "Long-press or right-click a node and choose IPPure.",
    failed: "IPPure check failed",
    rateLimit: "IPPure’s request limit was reached. Try again later.",
    connection: "Couldn’t reach IPPure through this node. Check the connection and try again.",
    httpError: status => `IPPure returned HTTP ${status}.`,
    noResponse: "No HTTP response received.",
    invalidBody: "Couldn’t read the IPPure response.",
    noIP: "IPPure did not return an exit IP.",
  },
  ru: {
    title: "IPPure · Репутация IP",
    score: "Оценка риска",
    lowerRisk: "чем меньше балл, тем ниже риск",
    ipv6: "IPPure пока не оценивает адреса IPv6",
    noScore: "Оценка недоступна",
    ip: "Выходной IP",
    node: "Узел",
    location: "Местоположение",
    network: "Сеть",
    type: "Тип IP",
    residential: "Домашний",
    datacenter: "Дата-центр",
    selectNode: "Выберите узел",
    selectHint: "Нажмите и удерживайте узел или щёлкните по нему правой кнопкой мыши и выберите IPPure.",
    failed: "Не удалось проверить IP",
    rateLimit: "Достигнут лимит запросов к IPPure. Попробуйте позже.",
    connection: "Не удалось подключиться к IPPure через этот узел. Проверьте соединение и повторите попытку.",
    httpError: status => `Сервер IPPure вернул код HTTP ${status}.`,
    noResponse: "Нет ответа HTTP.",
    invalidBody: "Не удалось прочитать ответ IPPure.",
    noIP: "Сервис IPPure не вернул выходной IP.",
  },
};

function runtimeLanguage() {
  try {
    const locale = new Intl.Locale(Intl.DateTimeFormat().resolvedOptions().locale);
    if (locale.language === "zh") {
      return locale.maximize().script === "Hant" ? "zh-Hant" : "zh-Hans";
    }
    if (locale.language === "ru") return "ru";
  } catch {
    // Some script runtimes do not expose Intl.
  }
  return "en";
}

const language = runtimeLanguage();
const t = translations[language];
const isChinese = language.startsWith("zh");

function field(label, value) {
  return label + (isChinese ? "　" : ": ") + value;
}

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
  if (info.ip.includes(":")) return t.ipv6;
  const score = info.fraudScore;
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return t.noScore;
  }
  return `${score} / 100` + (isChinese ? `（${t.lowerRisk}）` : ` (${t.lowerRisk})`);
}

function locationSummary(info) {
  let country = info.country;
  if (/^[A-Z]{2}$/.test(info.countryCode) && typeof Intl !== "undefined" && Intl.DisplayNames) {
    const regions = new Intl.DisplayNames([language], { type: "region", fallback: "none" });
    country = regions.of(info.countryCode) || country;
  }
  const subdivisions = [info.region, info.city].filter(place => place && place !== info.country);
  return [...new Set([country, ...subdivisions].filter(Boolean))].join(" · ");
}

function report(node, info) {
  const lines = [field(t.score, riskSummary(info)), field(t.ip, info.ip), field(t.node, node)];
  const location = locationSummary(info);
  if (location) lines.push(field(t.location, location));
  const network = [info.asn ? `AS${info.asn}` : "", info.asOrganization].filter(Boolean);
  if (network.length) lines.push(field(t.network, network.join(" · ")));
  if (typeof info.isResidential === "boolean") {
    lines.push(field(t.type, info.isResidential ? t.residential : t.datacenter));
  }
  showResult(t.title, lines);
}

function run() {
  const params = typeof $environment === "undefined" ? null : $environment?.params;
  const node = [params?.nodeInfo?.name, params?.node].find(
    name => typeof name === "string" && name.trim().length > 0
  );
  if (!node) {
    showResult(t.selectNode, [t.selectHint]);
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
    showResult(t.failed, [field(t.node, node), reason]);
  }

  $httpClient.get(request, (error, response, body) => {
    if (response?.status === 429) return fail(t.rateLimit);
    if (error) return fail(t.connection);
    if (response?.status !== 200) {
      return fail(response?.status ? t.httpError(response.status) : t.noResponse);
    }
    let info;
    try {
      info = JSON.parse(body);
    } catch {
      return fail(t.invalidBody);
    }
    if (typeof info?.ip !== "string" || !info.ip.trim()) return fail(t.noIP);
    report(node, info);
  });
}

run();
