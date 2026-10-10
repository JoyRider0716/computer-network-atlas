const integer = (value, min, max, name) => {
  const input = String(value).trim();
  if (!/^\d+$/.test(input)) throw new Error(`${name}必须是整数`);
  const n = Number(input);
  if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error(`${name}应在${min}～${max}范围内`);
  return n;
};

const decimal = (value, min, max, name) => {
  const input = String(value).trim();
  if (!input) throw new Error(`${name}不能为空`);
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(input)) throw new Error(`${name}必须是十进制数`);
  const n = Number(input);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${name}应在${min}～${max}范围内`);
  return n;
};

const ipString = n => [24, 16, 8, 0].map(s => (n >>> s) & 255).join('.');

export function subnet(ip, prefix) {
  const parts = String(ip).trim().split('.');
  if (parts.length !== 4 || parts.some(p => !/^\d+$/.test(p))) throw new Error('请输入点分十进制IPv4地址，例如192.168.10.130');
  const octets = parts.map(p => integer(p, 0, 255, '地址段'));
  const p = integer(prefix, 0, 32, '前缀长度');
  const n = octets.reduce((a, v) => a * 256 + v, 0) >>> 0;
  const mask = p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
  const network = (n & mask) >>> 0;
  const end = (network | (~mask >>> 0)) >>> 0;
  const total = 2 ** (32 - p);
  const standard = p < 31;
  return {
    prefix: p,
    mask: ipString(mask),
    network: ipString(network),
    broadcast: standard ? ipString(end) : '无子网广播地址',
    first: ipString(standard ? network + 1 : network),
    last: ipString(standard ? end - 1 : end),
    total,
    usable: standard ? total - 2 : total,
    binary: octets.map(v => v.toString(2).padStart(8, '0')).join('.'),
    note: p === 31
      ? '/31按RFC 3021的点对点链路解释，两个地址均可用作端点地址。'
      : p === 32
        ? '/32表示单个IPv4地址。'
        : '按广播子网计算，排除网络地址和广播地址；未扣除地址块内的保留或特殊用途地址。'
  };
}

export function tcpAck(seq, payload, syn = false, fin = false) {
  const n = integer(seq, 0, 4294967295, '序列号');
  const bytes = integer(payload, 0, 4294967295, '连续数据字节数');
  const used = bytes + Number(syn) + Number(fin);
  return {
    ack: (n + used) % 4294967296,
    used,
    formula: `(${n} + ${bytes} + ${Number(syn)} + ${Number(fin)}) mod 2³²`,
    note: '从给定序列号开始连续接收这些字节。SYN和FIN各占1个序号，纯ACK不占序号；若此前仍有缺口，累计确认号不能按此公式前移。'
  };
}

export function delays(bytes, mbps, km, velocity) {
  const b = integer(bytes, 1, 1e12, '分组字节数');
  const rate = decimal(mbps, .000001, 1e9, '链路速率');
  const distance = decimal(km, 0, 1e9, '距离');
  const v = decimal(velocity, 1, 3e8, '传播速度');
  const transmission = b * 8 / (rate * 1e6) * 1000;
  const propagation = distance * 1000 / v * 1000;
  const bdp = rate * 1e6 * (2 * propagation / 1000) / 8;
  return {
    transmission,
    propagation,
    total: transmission + propagation,
    bdp,
    note: '按单链路计算，忽略处理和排队时延；Mb/s使用十进制单位。BDP按带宽×往返传播时延计算，假设来回距离相同，以2×单程传播时延估算RTT。'
  };
}

// 保留mss字段供界面使用；结果是给定首部长度下的TCP载荷上限。
// MSS选项的通告值只减去固定IP首部和20字节TCP首部，不预先扣除TCP选项。
export function mss(mtu, ipVersion, tcpHeader) {
  if (!['4', '6'].includes(String(ipVersion))) throw new Error('IP版本应为4或6');
  const ipv6 = String(ipVersion) === '6';
  const m = integer(mtu, ipv6 ? 1280 : 68, ipv6 ? 65575 : 65535, 'MTU（字节）');
  const header = integer(tcpHeader, 20, 60, 'TCP首部长度');
  if (header % 4) throw new Error('TCP首部长度需为4字节的倍数');
  const ip = ipv6 ? 40 : 20;
  if (m <= ip + header) throw new Error('MTU必须大于IP与TCP首部之和');
  return {
    ipHeader: ip,
    tcpHeader: header,
    mss: m - ip - header,
    note: '结果是当前首部长度下单段可承载的TCP数据，不等同于MSS选项通告值。假设没有IP选项、IPv6扩展首部、超大载荷或隧道开销；实际还受对端MSS限制。'
  };
}

export function fragment(payload, mtu, header = 20) {
  const h = integer(header, 20, 60, 'IPv4首部长度');
  if (h % 4) throw new Error('IPv4首部长度需为4字节的倍数');
  const b = integer(payload, 1, 65535 - h, '原始IP载荷');
  const m = integer(mtu, 68, 65535, 'MTU（字节）');
  const chunk = Math.floor((m - h) / 8) * 8;
  const result = [];
  let offset = 0;
  while (offset < b) {
    const remaining = b - offset;
    const size = remaining <= m - h ? remaining : chunk;
    result.push({number: result.length + 1, payload: size, total: size + h, offset: offset / 8, mf: offset + size < b ? 1 : 0});
    offset += size;
  }
  return result;
}
