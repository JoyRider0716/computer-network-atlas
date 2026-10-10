// 各层在发送端依次封装，经过一次路由转发后在接收端解封装。
export function buildJourney(ls, scenario) {
  const udp = scenario === 'dns';
  const trans = udp ? 'UDP' : 'TCP';
  const app = udp ? 'DNS查询' : 'HTTP请求';
  const n = ls.length;
  let headers = [{text: app, kind: 'payload'}];
  const steps = [];

  const appLayer = l => l.id === 'application' || l.id === 'tcp-application';
  const transport = l => l.id.includes('transport');
  const network = l => l.id === 'network' || l.id === 'internet';
  const link = l => l.id === 'datalink' || l.id === 'interface';

  for (let i = 0; i < n; i++) {
    const l = ls[i];
    let description;
    if (appLayer(l)) {
      description = udp
        ? '生成DNS A记录查询，交给UDP。本例已知DNS服务器的IP地址，只演示一次查询的发送过程。'
        : '生成HTTP请求，交给已建立的TCP连接。本例使用明文HTTP，不包含TLS握手。';
    } else if (transport(l)) {
      headers.unshift({text: `${trans}头 · 53000 → ${udp ? 53 : 80}`, kind: 'transport'});
      description = `添加${trans}首部，源端口为53000，目的端口为${udp ? 53 : 80}。${udp
        ? 'UDP保留数据报边界，自身不提供确认或重传。'
        : 'TCP传输有序字节流，应用需要按自己的规则划分消息。'}`;
    } else if (network(l)) {
      headers.unshift({text: 'IP头 · TTL 64', kind: 'network'});
      description = '添加IPv4首部，源地址为192.168.1.10，目的地址为192.168.2.20。主机A使用/24前缀，目的地址在另一子网，先交给本地网关。本例不分片。';
    } else if (link(l)) {
      headers.unshift({text: '帧头 · A → R左', kind: 'link'});
      headers.push({text: 'FCS', kind: 'link'});
      description = '封装第一跳以太网帧：源MAC是主机A，目的MAC是路由器左接口。网关的MAC地址已通过ARP获得，此处不展开ARP交换。';
      if (l.id === 'interface') description += ' 网络接口层还将帧中的比特编码为链路上的信号。';
    } else if (l.id === 'physical') {
      description = '把帧中的比特编码为电信号或光信号，在第一段以太网链路上传送。';
    } else {
      description = l.id === 'presentation'
        ? '按协议约定的编码和格式表示数据。本例没有独立的表示层首部。'
        : '管理本次交互的状态；在这个示例中，会话功能由应用及相关协议实现，没有独立的会话层首部。';
    }
    steps.push({title: `发送端 · ${l.name}`, description, layer: i, host: 0, headers: headers.map(x => ({...x})), tag: l.unit});
  }

  const ipHeaders = headers.filter(h => h.kind !== 'link').map(h => h.kind === 'network' ? {...h, text: 'IP头 · TTL 63'} : {...h});
  steps.push({
    title: '路由器 · 检查IP并选择下一跳',
    description: '检查并去掉第一跳的帧头与FCS，按目的IP查路由表。将TTL从64减为63，并更新IPv4首部校验和。本例不使用NAT，源、目的IP保持不变。',
    router: true,
    layer: ls.findIndex(network),
    headers: ipHeaders,
    tag: 'IP路由 · TTL 63'
  });
  const secondHeaders = [{text: '帧头 · R右 → B', kind: 'link'}, ...ipHeaders, {text: 'FCS', kind: 'link'}];
  steps.push({
    title: '第二段链路 · 重新封装并发送',
    description: '路由器已通过ARP获得同一子网上主机B的MAC地址。用右接口MAC作源地址、主机B的MAC作目的地址，封装新帧并重新计算FCS，经第二段以太网链路发送。',
    bridge: true,
    layer: n - 1,
    headers: secondHeaders,
    tag: '新帧 · R右 → B'
  });
  headers = secondHeaders.map(x => ({...x}));

  for (let i = n - 1; i >= 0; i--) {
    const l = ls[i];
    let description;
    if (l.id === 'physical') {
      description = '主机B接收信号，恢复比特，再交给数据链路层识别帧。';
    } else if (link(l)) {
      headers = headers.filter(h => h.kind !== 'link');
      description = '检查目的MAC地址和FCS，通过后去掉帧头、帧尾，把载荷交给IPv4处理。';
      if (l.id === 'interface') description = '主机B接收信号并恢复帧，检查目的MAC地址和FCS，通过后去掉帧头、帧尾，把载荷交给IPv4处理。';
    } else if (network(l)) {
      headers = headers.filter(h => h.kind !== 'network');
      description = `确认目的IP为主机B并检查IPv4首部，按总长度取出分组，排除可能的以太网填充，再根据协议号${udp ? 17 : 6}把IP载荷交给${trans}。`;
    } else if (transport(l)) {
      headers = headers.filter(h => h.kind !== 'transport');
      description = udp
        ? 'UDP检查数据报，根据目的端口53交给DNS服务。本例成功收到查询；UDP本身不保证交付。'
        : 'TCP检查校验和、处理序列号并发送确认，将按序重组的字节流交给端口80上的HTTP服务。这里省略返回的确认报文。';
    } else if (appLayer(l)) {
      description = udp
        ? 'DNS服务解析查询内容，准备查询结果。本动画到请求交付为止，响应沿反方向发送。'
        : 'HTTP服务解析请求并处理目标资源。本动画到请求交付为止，响应沿反方向发送。';
    } else {
      description = l.id === 'session'
        ? '按应用的交互规则更新会话状态。'
        : '按约定的编码和格式解释收到的数据。';
    }
    steps.push({title: `接收端 · ${l.name}`, description, layer: i, host: 1, headers: headers.map(x => ({...x})), tag: appLayer(l) ? '成功交付' : l.unit});
  }
  return steps;
}
