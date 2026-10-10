const integer = (value, min, max, name) => {
  const input = String(value).trim();
  if (!/^\d+$/.test(input)) throw new Error(`${name} must be an integer`);
  const n = Number(input);
  if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error(`${name} must be within ${min}～${max} range`);
  return n;
};

const decimal = (value, min, max, name) => {
  const input = String(value).trim();
  if (!input) throw new Error(`${name} cannot be empty`);
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(input)) throw new Error(`${name} must be a decimal number`);
  const n = Number(input);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${name} must be within ${min}～${max} range`);
  return n;
};

const ipString = n => [24, 16, 8, 0].map(s => (n >>> s) & 255).join('.');

export function subnet(ip, prefix) {
  const parts = String(ip).trim().split('.');
  if (parts.length !== 4 || parts.some(p => !/^\d+$/.test(p))) throw new Error('Enter a dotted-decimal IPv4 address, such as 192.168.10.130');
  const octets = parts.map(p => integer(p, 0, 255, 'Address octet'));
  const p = integer(prefix, 0, 32, 'Prefix length');
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
    broadcast: standard ? ipString(end) : 'No subnet broadcast address',
    first: ipString(standard ? network + 1 : network),
    last: ipString(standard ? end - 1 : end),
    total,
    usable: standard ? total - 2 : total,
    binary: octets.map(v => v.toString(2).padStart(8, '0')).join('.'),
    note: p === 31
      ? '/31 follows RFC 3021 for point-to-point links; both addresses can identify endpoints.'
      : p === 32
        ? '/32 identifies one IPv4 address.'
        : 'Uses a broadcast-subnet calculation, excluding network and broadcast addresses but not other reserved or special-purpose addresses in the block.'
  };
}

export function tcpAck(seq, payload, syn = false, fin = false) {
  const n = integer(seq, 0, 4294967295, 'Sequence number');
  const bytes = integer(payload, 0, 4294967295, 'Contiguous data bytes');
  const used = bytes + Number(syn) + Number(fin);
  return {
    ack: (n + used) % 4294967296,
    used,
    formula: `(${n} + ${bytes} + ${Number(syn)} + ${Number(fin)}) mod 2³²`,
    note: 'Assumes contiguous reception from this sequence number. SYN and FIN each consume one number; a pure ACK consumes none. An earlier gap prevents cumulative acknowledgment from advancing by this formula.'
  };
}

export function delays(bytes, mbps, km, velocity) {
  const b = integer(bytes, 1, 1e12, 'Packet byte count');
  const rate = decimal(mbps, .000001, 1e9, 'Link rate');
  const distance = decimal(km, 0, 1e9, 'Distance');
  const v = decimal(velocity, 1, 3e8, 'Propagation speed');
  const transmission = b * 8 / (rate * 1e6) * 1000;
  const propagation = distance * 1000 / v * 1000;
  const bdp = rate * 1e6 * (2 * propagation / 1000) / 8;
  return {
    transmission,
    propagation,
    total: transmission + propagation,
    bdp,
    note: 'Uses one link and ignores processing and queueing delay; Mb/s is decimal. BDP is bandwidth times round-trip propagation delay, assuming equal distances in both directions and RTT equal to twice the one-way propagation delay.'
  };
}

// Preservedmss字段供界面使用；结果是给定HeaderLength下的TCP payload limit。
// MSS选项的通告值只减去固定IPHeader和20 bytesTCP header，不预先扣除TCP选项。
export function mss(mtu, ipVersion, tcpHeader) {
  if (!['4', '6'].includes(String(ipVersion))) throw new Error('IP version must be 4 or 6');
  const ipv6 = String(ipVersion) === '6';
  const m = integer(mtu, ipv6 ? 1280 : 68, ipv6 ? 65575 : 65535, 'MTU (bytes)');
  const header = integer(tcpHeader, 20, 60, 'TCP header length');
  if (header % 4) throw new Error('TCP header length must be a multiple of 4 bytes');
  const ip = ipv6 ? 40 : 20;
  if (m <= ip + header) throw new Error('MTU must exceed the combined IP and TCP headers');
  return {
    ipHeader: ip,
    tcpHeader: header,
    mss: m - ip - header,
    note: 'This is the TCP data limit for one segment with the specified header length, not the advertised MSS option. Assumes no IP options, IPv6 extension headers, jumbograms or tunnel overhead. The peer MSS also limits actual data size.'
  };
}

export function fragment(payload, mtu, header = 20) {
  const h = integer(header, 20, 60, 'IPv4 header length');
  if (h % 4) throw new Error('IPv4 header length must be a multiple of 4 bytes');
  const b = integer(payload, 1, 65535 - h, 'Original IP payload');
  const m = integer(mtu, 68, 65535, 'MTU (bytes)');
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
