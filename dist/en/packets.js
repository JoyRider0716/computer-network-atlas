const f = (id, label, bits, description, example) => ({id, label, bits, description, example});

export const PACKETS = {
  tcp: {
    name: 'TCP header',
    layer: 'transport',
    note: 'Each row spans 32 bits. The base RFC 9293 format has four reserved bits and eight flags. The options row is a placeholder; its actual length is 0–40 bytes.',
    rows: [
      [
        f('tcp-src', 'Source port', 16, 'Source Port identifies the sending transport endpoint together with the IP address and transport protocol.', '53000'),
        f('tcp-dst', 'Destination port', 16, 'Destination Port directs data to the receiving socket; a port number alone does not establish application identity.', '80 / 443')
      ],
      [f('tcp-seq', 'Sequence number seq', 32, 'Sequence Number identifies the first data byte in this segment. With SYN=1 it is the initial sequence number; data begins at seq+1. SYN and FIN each consume one number, modulo 2³².', '1001')],
      [f('tcp-ack', 'Acknowledgment ack', 32, 'Acknowledgment Number is valid when ACK=1 and identifies the next expected sequence number. Cumulative acknowledgment advances only over contiguous data, SYN and FIN.', '1501')],
      [
        f('tcp-offset', 'Data offset', 4, 'Data Offset gives the TCP header length in four-byte units. Values 5–15 represent 20–60 bytes.', '5 → 20 bytes'),
        f('tcp-reserved', 'Reserved bits', 4, 'Reserved bits are zero in this base format; extension protocols may define other uses.', '0'),
        f('tcp-flags', 'Control flags', 8, 'Flags are CWR, ECE, URG, ACK, PSH, RST, SYN and FIN. SYN synchronizes sequence numbers, FIN closes the sending direction, RST resets the connection, and ECE/CWR support ECN.', 'SYN=1 / ACK=1'),
        f('tcp-window', 'Receive window', 16, 'Window advertises the receive window for flow control. A negotiated window scale changes its interpretation, but window fields in SYN segments are not scaled. The sender maintains the separate congestion window, cwnd.', '32768')
      ],
      [
        f('tcp-checksum', 'Checksum', 16, 'Checksum covers the TCP header, data and IP pseudo-header to detect transmission errors. The pseudo-header contributes to the calculation but is not sent as part of the TCP header.', '16-bit checksum'),
        f('tcp-urgent', 'Urgent pointer', 16, 'Urgent Pointer is valid with URG=1. Added to the segment sequence number, it identifies the first byte after urgent data. Urgent data remains in the same TCP byte stream.', 'seq=1000, pointer=10 → sequence number 1010')
      ],
      [{...f('tcp-options', 'Options and padding', 32, 'Options may include MSS, window scaling, SACK permission and timestamps. Padding aligns the header to four bytes; options and padding together occupy 0–40 bytes.', 'MSS=1460 in SYN'), lengthLabel: '0–40 bytes'}]
    ]
  },
  udp: {
    name: 'UDP header',
    layer: 'transport',
    note: 'The UDP header is eight bytes, shown as two 32-bit rows. It has no sequence number, acknowledgment number or receive window.',
    rows: [
      [
        f('udp-src', 'Source port', 16, 'Source Port normally identifies the sending endpoint. UDP permits omission of a source port, represented by zero.', '53000'),
        f('udp-dst', 'Destination port', 16, 'Destination Port directs the datagram to a receiving socket. DNS servers normally use port 53.', '53')
      ],
      [
        f('udp-length', 'Length', 16, 'Length counts the UDP header and data in bytes, normally 8–65535. IPv6 jumbograms have separate rules.', '28 = 8-byte header + 20 bytes of data'),
        f('udp-checksum', 'Checksum', 16, 'Checksum covers the IP pseudo-header, UDP header and data. In IPv4, zero means no checksum. IPv6 normally requires a checksum, with narrowly specified exceptions.', 'Error detection, not retransmission')
      ]
    ]
  },
  ipv4: {
    name: 'IPv4 header',
    layer: 'network',
    note: 'Shows the 20-byte base header without optional options or padding. Fragment offsets use eight-byte units; total length uses bytes.',
    rows: [
      [
        f('ip-version', 'Version', 4, 'Version identifies the IP version; its value is 4 for IPv4.', '4'),
        f('ip-ihl', 'IHL', 4, 'Internet Header Length uses four-byte units. Values 5–15 represent 20–60 bytes.', '5 → 20 bytes'),
        f('ip-dscp', 'DSCP', 6, 'Differentiated Services Code Point marks a service class; actual forwarding treatment depends on network policy.', 'DSCP=0: best effort'),
        f('ip-ecn', 'ECN', 2, 'Explicit Congestion Notification lets capable routers mark congestion and a transport protocol report it to the sender.', 'CE=11: congestion experienced'),
        f('ip-length', 'Total length', 16, 'Total Length includes this IPv4 packet header and data, up to 65535 bytes. Every fragment has its own total length.', '1500 bytes')
      ],
      [
        f('ip-id', 'Identification', 16, 'Identification, source address, destination address and protocol number associate fragments with an original packet.', 'Fragments of one packet share an identification value'),
        f('ip-flags', 'Flags', 3, 'Flags contain one reserved bit, DF (do not fragment) and MF (more fragments). MF=1 means further fragments follow; the last fragment or an unfragmented packet has MF=0.', 'DF=0，MF=1'),
        f('ip-offset', 'Fragment offset', 13, 'Fragment Offset identifies where this data starts in the original IP payload, in eight-byte units.', '185 → 1480 bytes')
      ],
      [
        f('ip-ttl', 'TTL', 8, 'Time to Live decreases by at least one at each router. A router discards a packet when it reaches zero and normally reports ICMP Time Exceeded.', '64 → 63'),
        f('ip-protocol', 'Protocol', 8, 'Protocol identifies the IP payload protocol, such as TCP=6, UDP=17 or ICMP=1.', '6'),
        f('ip-checksum', 'Header checksum', 16, 'Header Checksum covers only the IPv4 header and must be updated when fields such as TTL change.', 'TTL changes → update checksum')
      ],
      [f('ip-src', 'Source IP address', 32, 'Source Address identifies the sender; source NAT rewrites it.', '192.168.1.10')],
      [f('ip-dst', 'Destination IP address', 32, 'Destination Address identifies the target. Routers use it for route lookup and preserve it during ordinary forwarding.', '192.168.2.20')]
    ]
  },
  ethernet: {
    name: 'Ethernet frame',
    layer: 'datalink',
    note: 'Uses Ethernet II field order; card widths are not proportional to field sizes. Preamble, start frame delimiter (SFD) and VLAN tags are omitted. The interframe gap is not part of a frame.',
    sequence: [
      f('eth-dst', 'Destination MAC', 48, 'Destination MAC Address identifies a receiver on this link and may be unicast, multicast or broadcast. The first hop to another subnet normally targets the gateway MAC.', 'Router left-interface MAC'),
      f('eth-src', 'Source MAC', 48, 'Source MAC Address identifies the sending interface on this link. A switch learns the corresponding switch port from it.', 'MAC of host A'),
      f('eth-type', 'EtherType', 16, 'EtherType identifies the payload protocol: IPv4=0x0800, ARP=0x0806, IPv6=0x86DD.', '0x0800'),
      f('eth-data', 'Payload and padding', 0, 'Payload carries higher-layer data. In untagged Ethernet without jumbo frames, payload plus padding occupies 46–1500 bytes; shorter data is padded to 46 bytes.', 'IP packet + any required padding'),
      f('eth-fcs', 'FCS', 32, 'Frame Check Sequence uses CRC to detect transmission errors. Encapsulation at a new hop requires a new FCS for the new frame.', '4-byte CRC value')
    ]
  }
};
