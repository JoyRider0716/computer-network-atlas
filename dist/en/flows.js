// 各层在Sender依次封装，经过一次路由转发后在Receiver解封装。
export function buildJourney(ls, scenario) {
  const udp = scenario === 'dns';
  const trans = udp ? 'UDP' : 'TCP';
  const app = udp ? 'DNS query' : 'HTTP request';
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
        ? 'Create a DNS A-record query and pass it to UDP. The DNS server IP address is already known; this example shows only transmission of the query.'
        : 'Create an HTTP request and pass it to an established TCP connection. This example uses cleartext HTTP without a TLS handshake.';
    } else if (transport(l)) {
      headers.unshift({text: `${trans} header · 53000 → ${udp ? 53 : 80}`, kind: 'transport'});
      description = `Add the ${trans} header with source port 53000 and destination port ${udp ? 53 : 80}. ${udp
        ? 'UDP preserves datagram boundaries but supplies no acknowledgments or retransmission.'
        : 'TCP carries an ordered byte stream; the application defines its message boundaries.'}`;
    } else if (network(l)) {
      headers.unshift({text: 'IP header · TTL 64', kind: 'network'});
      description = 'Add an IPv4 header with source 192.168.1.10 and destination 192.168.2.20. Host A uses /24, so this destination is on another subnet and the packet goes to the local gateway. No fragmentation is shown.';
    } else if (link(l)) {
      headers.unshift({text: 'Frame header · A → R-left', kind: 'link'});
      headers.push({text: 'FCS', kind: 'link'});
      description = 'Build the first Ethernet frame: host A is the source MAC and the left router interface is the destination MAC. ARP has already supplied the gateway MAC; the exchange is omitted.';
      if (l.id === 'interface') description += ' The network interface layer also encodes frame bits as signals on the link.';
    } else if (l.id === 'physical') {
      description = 'Encode frame bits as electrical or optical signals and transmit them on the first Ethernet link.';
    } else {
      description = l.id === 'presentation'
        ? 'Represent data using the protocol encoding and format. This example has no separate presentation header.'
        : 'Manage interaction state. Here the application and related protocols implement session functions, without a separate session header.';
    }
    steps.push({title: `Sender · ${l.name}`, description, layer: i, host: 0, headers: headers.map(x => ({...x})), tag: packetTag(headers, l.id === 'physical')});
  }

  const ipHeaders = headers.filter(h => h.kind !== 'link').map(h => h.kind === 'network' ? {...h, text: 'IP header · TTL 63'} : {...h});
  steps.push({
    title: 'Router · Inspect IP and select next hop',
    description: 'Check and remove the first frame header and FCS, then look up the destination IP route. Reduce TTL from 64 to 63 and update the IPv4 header checksum. No NAT is used, so source and destination IP addresses stay the same.',
    router: true,
    layer: ls.findIndex(network),
    headers: ipHeaders,
    tag: 'IP routing · TTL 63'
  });
  const secondHeaders = [{text: 'Frame header · R-right → B', kind: 'link'}, ...ipHeaders, {text: 'FCS', kind: 'link'}];
  steps.push({
    title: 'Second link · Re-encapsulate and send',
    description: 'ARP has supplied the MAC of host B on the next subnet. Use the right router interface as source MAC and B as destination MAC, build a new frame, recompute FCS and send on the second Ethernet link.',
    bridge: true,
    host: 1,
    layer: n - 1,
    headers: secondHeaders,
    tag: 'New frame · R-right → B'
  });
  headers = secondHeaders.map(x => ({...x}));

  for (let i = n - 1; i >= 0; i--) {
    const l = ls[i];
    let description;
    if (l.id === 'physical') {
      description = 'Host B receives signals, recovers bits and passes them to the data link layer for frame processing.';
    } else if (link(l)) {
      headers = headers.filter(h => h.kind !== 'link');
      description = 'Check destination MAC and FCS, remove the link header and trailer, and pass the payload to IPv4.';
      if (l.id === 'interface') description = 'Host B receives signals and recovers the frame, checks destination MAC and FCS, removes the link header and trailer, and passes the payload to IPv4.';
    } else if (network(l)) {
      headers = headers.filter(h => h.kind !== 'network');
      description = `Verify the destination IP belongs to B and check the IPv4 header. Extract the packet using Total Length to exclude Ethernet padding, then deliver its payload to ${trans} using protocol number ${udp ? 17 : 6}.`;
    } else if (transport(l)) {
      headers = headers.filter(h => h.kind !== 'transport');
      description = udp
        ? 'UDP checks the datagram and passes it to the DNS service on destination port 53. This query arrived successfully; UDP itself does not guarantee delivery.'
        : 'TCP checks the checksum, processes sequence numbers, sends acknowledgments and delivers the ordered stream to the HTTP service on port 80. Return ACKs are omitted.';
    } else if (appLayer(l)) {
      description = udp
        ? 'The DNS service parses the query and prepares an answer. The animation ends at request delivery; the response travels in the reverse direction.'
        : 'The HTTP service parses the request and handles the target resource. The animation ends at request delivery; the response travels in the reverse direction.';
    } else {
      description = l.id === 'session'
        ? 'Update session state according to application rules.'
        : 'Interpret received data using the agreed encoding and format.';
    }
    steps.push({title: `Receiver · ${l.name}`, description, layer: i, host: 1, headers: headers.map(x => ({...x})), tag: appLayer(l) ? `${app} · Delivered successfully` : packetTag(headers, l.id === 'physical')});
  }
  return steps;
}

function packetTag(headers, physical = false) {
  if (physical) return 'Bits / signals';
  if (headers.some(h => h.kind === 'link')) return 'Ethernet frame';
  if (headers.some(h => h.kind === 'network')) return 'IP packets';
  const transport = headers.find(h => h.kind === 'transport');
  if (transport) return transport.text.startsWith('UDP') ? 'UDP datagram' : 'TCP segment';
  return headers.find(h => h.kind === 'payload').text;
}

// Use the model's actual layers for every lab message, in either direction.
export function buildTransportJourney(ls, lab, key) {
  const transport = ls.findIndex(l => l.id.includes('transport'));
  const network = ls.findIndex(l => l.id === 'network' || l.id === 'internet');
  const protocol = key === 'udp' ? 'UDP' : 'TCP';
  const initial = key === 'close' ? ['ESTABLISHED', 'ESTABLISHED']
    : key === 'udp' ? ['No TCP connection state', 'Waiting for a datagram'] : ['CLOSED', 'LISTEN'];
  const sentStates = {
    handshake: [['SYN-SENT', 'LISTEN'], ['SYN-SENT', 'SYN-RECEIVED'], ['ESTABLISHED', 'SYN-RECEIVED']],
    close: [['FIN-WAIT-1', 'ESTABLISHED'], ['FIN-WAIT-1', 'CLOSE-WAIT'], ['FIN-WAIT-2', 'LAST-ACK'], ['TIME-WAIT', 'LAST-ACK']]
  };
  const steps = [];
  lab.steps.forEach((message, messageIndex) => {
    const from = message.direction === -1 ? 1 : 0, to = 1 - from;
    const transit = sentStates[key]?.[messageIndex] || [message.states[0], ...(messageIndex ? lab.steps[messageIndex - 1].states.slice(1) : initial.slice(1))];
    const transportHeaders = [{text: `${protocol} · ${message.tag.split(' · ')[0]}`, kind: 'transport'}];
    const ipHeaders = ttl => [{text: `IP header · TTL ${ttl}`, kind: 'network'}, ...transportHeaders];
    const frameHeaders = (ttl, second) => [{text: second ? (to ? 'Frame header · R-right → B' : 'Frame header · R-left → A') : (from ? 'Frame header · B → R-right' : 'Frame header · A → R-left'), kind: 'link'}, ...ipHeaders(ttl), {text: 'FCS', kind: 'link'}];
    const add = (location, phase, headers, completed = false) => steps.push({
      ...location, messageIndex, wire: message.wire,
      title: `${protocol} · ${completed ? message.title : `${from ? 'B → A' : 'A → B'} · ${message.tag.split(' · ')[0]}`} · ${phase}`,
      description: completed ? message.description : `${phase}：${message.wire.replace(/\n/g, ' · ')}。`,
      headers, tag: `${packetTag(headers, !location.router && !location.bridge && !location.link && ls[location.layer]?.id === 'physical')} · ${key === 'udp' && !completed ? message.tag.split(' · ')[0] : message.tag}`,
      states: completed ? [...message.states] : [...transit], completed,
      drop: completed && Boolean(message.drop), delay: completed && Boolean(message.delay)
    });
    // A delayed datagram resumes on the second link, rather than being sent again.
    const resume = key === 'udp' && messageIndex === 3;
    if (!resume) {
      for (let layer = transport; layer < ls.length; layer++) {
        const headers = layer === transport ? transportHeaders : layer === network ? ipHeaders(64) : frameHeaders(64, false);
        add({host: from, layer}, `Sender · ${ls[layer].name}`, headers);
      }
      if (message.drop) {
        add({host: from, layer: ls.length - 1, link: true}, 'Lost on the link', frameHeaders(64, false), true);
        return;
      }
      add({router: true, layer: network}, 'Router · Inspect IP and select next hop', ipHeaders(63));
    }
    add({host: to, bridge: true, layer: ls.length - 1}, message.delay ? 'Delayed on the link' : 'Second link · Re-encapsulate and send', frameHeaders(63, true), Boolean(message.delay));
    if (message.delay) return;
    for (let layer = ls.length - 1; layer >= transport; layer--) {
      const id = ls[layer].id;
      // Receiving layers show their output: frame → IP → transport message.
      const headers = id === 'physical' ? frameHeaders(63, true) : layer > network ? ipHeaders(63) : transportHeaders;
      add({host: to, layer}, `Receiver · ${ls[layer].name}`, headers, layer === transport);
    }
  });
  return steps;
}
