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
    steps.push({title: `Sender · ${l.name}`, description, layer: i, host: 0, headers: headers.map(x => ({...x})), tag: l.unit});
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
    steps.push({title: `Receiver · ${l.name}`, description, layer: i, host: 1, headers: headers.map(x => ({...x})), tag: appLayer(l) ? 'Delivered successfully' : l.unit});
  }
  return steps;
}
