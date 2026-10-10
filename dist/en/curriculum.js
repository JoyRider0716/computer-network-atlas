// 各层Principles与故障Troubleshooting。
export const CHAPTERS = {
  "application": {
    "name": "Application layer",
    "goals": [
      "Explain the complete path of a web visit",
      "Distinguish DNS, HTTP, TLS and transport protocols",
      "Understand caching, state and application message boundaries"
    ],
    "lessons": [
      {
        "title": "What happens during a web visit?",
        "paragraphs": [
          "The browser parses the URL and checks usable caches. If network access is needed, it resolves the hostname, then the system chooses a next hop from its routes. On links such as Ethernet, ARP or IPv6 neighbor discovery may also be needed to resolve the next-hop link address.",
          "HTTPS over TCP usually establishes TCP, completes TLS and then exchanges HTTP messages. HTTP/3 uses QUIC, which coordinates connection establishment with the TLS handshake.",
          "DNS caching, connection reuse and TLS resumption can omit steps; a fresh HTTP cache entry can satisfy a request without network access. Troubleshooting starts by finding how far the request actually progressed."
        ],
        "formula": "",
        "example": "If name resolution succeeds but the page still fails, check the target port connection, TLS handshake and HTTP response."
      },
      {
        "title": "DNS: recursive queries, iterative queries and caching",
        "paragraphs": [
          "A recursive query asks a resolver for the final answer or an error. An iterative response may refer it to other name servers. Clients usually query a recursive resolver, which queries root, top-level domain and authoritative servers as needed after a cache miss.",
          "A resource-record TTL specifies its cache lifetime and differs from an IP TTL. Cached old values may remain valid after an update; nonexistent names or records may also be negatively cached.",
          "Traditional DNS supports UDP and TCP, usually on server port 53. A truncated UDP reply normally prompts a TCP retry; zone transfers commonly use TCP. Encrypted DNS can use TLS, HTTPS or QUIC."
        ],
        "formula": "",
        "example": "A records provide IPv4 addresses, AAAA records IPv6 addresses, CNAME maps an alias to a canonical name, and MX identifies mail exchange servers."
      },
      {
        "title": "HTTP: method semantics, persistent connections and caching",
        "paragraphs": [
          "Safe methods have read-only intended semantics, though side effects such as logging may occur. Idempotent requests have the same intended effect when repeated, even if responses differ. GET is defined as safe and idempotent; PUT and DELETE as idempotent; POST has no general idempotency guarantee.",
          "Persistent connections allow reuse across HTTP exchanges. HTTP/2 interleaves multiple streams on one connection; TCP loss still blocks delivery of subsequent bytes and may affect several streams.",
          "Cache-Control specifies caching policy; ETag and Last-Modified support conditional requests. A 304 Not Modified response has no resource body, allowing reuse of the cached representation and updates to its metadata."
        ],
        "formula": "",
        "example": "Payment APIs often use an idempotency key to identify one operation. TCP byte delivery does not ensure that a retried request has only one business effect."
      },
      {
        "title": "HTTP versions and HTTPS",
        "paragraphs": [
          "HTTP/1.1 uses text start lines and headers and commonly runs over TCP. HTTP/2 uses binary framing and multiplexing; HTTP/3 runs over QUIC. Versions retain major HTTP semantics such as methods and status codes.",
          "HTTPS uses TLS for confidentiality and integrity and normally authenticates the server. TLS may fail after TCP connects because of certificates or configuration; an application may still return errors such as 500 after TLS succeeds.",
          "HTTP stateless semantics do not prevent application login state. Cookies, session identifiers and tokens associate requests with a user; an application session has a different lifetime from a TCP connection."
        ],
        "formula": "",
        "example": ""
      }
    ]
  },
  "presentation": {
    "name": "Presentation layer",
    "goals": [
      "Distinguish characters, bytes and encoding",
      "Explain serialization and message boundaries",
      "Explain TLS certificate validation and content protection"
    ],
    "lessons": [
      {
        "title": "Characters, bytes and character encoding",
        "paragraphs": [
          "Characters are text symbols; bytes are data units; an encoding represents text as bytes. UTF-8 is variable length, so a Chinese character count normally differs from a transmitted byte count.",
          "HTTP Content-Length counts message-content bytes. For compressed content, it counts the compressed bytes; using a character count gives the wrong length.",
          "Encoding and decoding must use compatible rules to avoid garbled text. Base64 represents binary as text and can be decoded by anyone, so it is not encryption."
        ],
        "formula": "",
        "example": "The word for network contains two Chinese characters, U+7F51 and U+7EDC, which occupy six bytes in UTF-8."
      },
      {
        "title": "Serialization and message boundaries",
        "paragraphs": [
          "Formats such as JSON and Protocol Buffers represent structured data as transferable bytes. Peers must also agree on field meanings, types and version compatibility; valid syntax alone does not ensure correct interpretation.",
          "Binary protocols must specify integer byte order. Network byte order is big endian and is used by many protocol fields, but serialization formats may specify other byte orders.",
          "TCP supplies a stream; a serialization format may not identify message boundaries by itself. Length-prefix framing must define field size, byte order, counting rules, limits and invalid-input handling."
        ],
        "formula": "Message = length field + content encoded in the agreed format",
        "example": "For a big-endian 32-bit length, 00 00 00 06 specifies six following bytes regardless of character count."
      },
      {
        "title": "TLS handshakes and certificate validation",
        "paragraphs": [
          "TLS negotiates parameters, establishes traffic keys and authenticates as configured. TLS 1.3 commonly uses ephemeral key exchange for a shared secret. With certificate authentication, the certificate public key verifies a handshake signature; symmetric keys encrypt web content.",
          "Browsers check the certificate chain, validity dates and server name. A certificate issued by a trusted authority may still be invalid for the requested hostname.",
          "TLS protects data with encryption and authentication. TCP sequence numbers support ordering and its checksum detects transmission errors; neither replaces TLS confidentiality or cryptographic integrity."
        ],
        "formula": "",
        "example": ""
      },
      {
        "title": "Compression, encryption and the presentation layer",
        "paragraphs": [
          "Compression reduces redundancy; encryption protects confidentiality. Compressed data can still be decompressed, so compression is not a security guarantee.",
          "Encrypted data is usually difficult to compress, so compression normally precedes encryption when used. Combining secrets with attacker-controlled compressed data may leak information through ciphertext lengths and requires protocol-level consideration.",
          "The OSI presentation layer describes encoding and conversion functions. TCP/IP applications, libraries and protocols perform these functions, usually without a separate presentation-layer process."
        ],
        "formula": "",
        "example": ""
      }
    ]
  },
  "session": {
    "name": "Session layer",
    "goals": [
      "Distinguish connections, sessions and requests",
      "Explain ambiguity after timeouts and retries",
      "Understand idempotency and checkpoints"
    ],
    "lessons": [
      {
        "title": "Connections, sessions and requests",
        "paragraphs": [
          "TCP connections maintain protocol state between transport endpoints. Application sessions associate a continuing interaction, while a request starts an operation. They may begin and end at different times.",
          "HTTP/2 allows concurrent streams on one connection, while login state may survive across connections. Servers normally identify users through session identifiers or tokens rather than the TCP connection alone.",
          "The OSI session layer describes dialogue management, synchronization and recovery. In an actual system, identify which application protocol or component supplies these functions."
        ],
        "formula": "",
        "example": ""
      },
      {
        "title": "An operation may have completed before a timeout",
        "paragraphs": [
          "A timeout means the client did not obtain the result within its deadline. The request may never have arrived, or it may have completed with a lost response; resubmission can duplicate an operation.",
          "TCP reliability does not confirm business processing. Operation identifiers, idempotency keys, deduplication records, transactions and result queries help handle uncertainty.",
          "Idempotency gives repeated requests the same intended effect. Implementations must also consider concurrent requests, durable deduplication, record retention and failure recovery."
        ],
        "formula": "Request timeout ≠ operation not executed",
        "example": "After a transfer request times out, query its original operation identifier first. A retry should retain that identifier so it is not treated as a new transfer."
      },
      {
        "title": "Heartbeats, keepalive and failure detection",
        "paragraphs": [
          "TCP keepalive primarily tests whether an idle connection peer remains reachable. An application heartbeat tests application responsiveness; its business-state coverage depends on its design.",
          "Network failure detection generally uses timeouts. Short deadlines may mistake temporary congestion for failure; long deadlines delay failure detection.",
          "NATs, proxies and load balancers may discard idle connections. Choose keepalive intervals using device idle timeouts, network overhead and service requirements."
        ],
        "formula": "",
        "example": ""
      },
      {
        "title": "Checkpoints and recovery after interruption",
        "paragraphs": [
          "A checkpoint records a recoverable position or state. Resumable downloads usually rely on range requests in the application protocol and a client record of completed parts.",
          "Before resuming, verify the file version, completed ranges and checksums. Resuming solely by byte count may splice together different versions.",
          "The OSI session layer includes synchronization and recovery, but TCP does not store application checkpoints. Applications must define recoverable state and verify restored results."
        ],
        "formula": "",
        "example": ""
      }
    ]
  },
  "transport": {
    "name": "Transport layer",
    "goals": [
      "Calculate sequence and acknowledgment numbers",
      "Analyze windows, retransmission and congestion",
      "Explain connection state and message boundaries"
    ],
    "lessons": [
      {
        "title": "TCP sequence numbers and cumulative acknowledgment",
        "paragraphs": [
          "TCP numbers stream bytes modulo 2³². For an ordinary data segment, seq identifies its first byte. With SYN, seq identifies the SYN and data begins at seq+1. SYN and FIN each consume one number; pure ACKs consume none.",
          "When ACK is set, ack gives the next expected sequence number. Cumulative acknowledgment advances only through contiguous reception. If 1001 is expected and data starts at 1501, ack stays at 1001; SACK can separately report noncontiguous ranges.",
          "Acknowledgment advancement depends on newly received contiguous bytes and SYN/FIN. Out-of-order data and duplicate segments need not advance the cumulative ACK."
        ],
        "formula": "For complete reception starting at the expected sequence: ack = seq + data bytes + SYN consumption + FIN consumption (mod 2³²)",
        "example": "With expected seq=1001, 500 contiguous bytes and no SYN/FIN produce ack=1501; adding a FIN at the end produces ack=1502."
      },
      {
        "title": "Receive window, congestion window and data in flight",
        "paragraphs": [
          "The receiver advertises rwnd to avoid receive-buffer overflow. The sender maintains cwnd to control how much data enters the network.",
          "In a simplified model, unacknowledged data in flight cannot exceed min(rwnd, cwnd); new sending must subtract data already in flight. Recovery state, pacing and application supply also affect transmission.",
          "Bandwidth-delay product (BDP) estimates data needed in flight to fill a path. TCP commonly uses bottleneck bandwidth times RTT. A much smaller window may prevent one connection from using the available bandwidth."
        ],
        "formula": "New send allowance ≈ max(0, min(rwnd, cwnd) − bytes in flight)",
        "example": "With rwnd=64 KiB, cwnd=32 KiB and 20 KiB in flight, the simplified allowance is another 12 KiB."
      },
      {
        "title": "Retransmission timeout and congestion control",
        "paragraphs": [
          "RTO reflects estimated round-trip time and its variation; repeated timeouts normally increase the wait by backoff. Duplicate ACKs, SACK and packet timing can also detect loss earlier.",
          "Classic TCP Reno uses slow start, congestion avoidance, fast retransmit and fast recovery. Under ideal acknowledgments, slow-start cwnd roughly doubles per RTT and congestion avoidance adds about one MSS per RTT. Algorithms such as CUBIC use different growth and recovery rules.",
          "Classic fast retransmit treats three qualifying duplicate ACKs as a loss signal. Three ordinary ACKs are not equivalent. Modern implementations may also detect loss by elapsed time."
        ],
        "formula": "Ideal Reno: approximately exponential slow start, then approximately linear congestion avoidance",
        "example": "Starting at 1 MSS and doubling each RTT below the threshold gives 16 MSS after four rounds. That initial window is an exercise assumption; real implementations often start larger."
      },
      {
        "title": "Connection establishment, closing and TIME-WAIT",
        "paragraphs": [
          "The usual handshake exchanges SYN, SYN+ACK and ACK to synchronize initial sequence numbers and acknowledge them. The third ACK lets the passive opener confirm that its SYN was received.",
          "TCP closes each direction separately, commonly using four segments; ACK and FIN may be combined. FIN ends sending in one direction; RST rejects a connection or resets it immediately.",
          "The active closer normally waits 2MSL in TIME-WAIT to reduce old-segment interference and acknowledge retransmitted FINs. MSL settings vary, and cases such as simultaneous close require state-machine analysis."
        ],
        "formula": "",
        "example": ""
      },
      {
        "title": "UDP datagrams and QUIC streams",
        "paragraphs": [
          "The eight-byte UDP header contains source port, destination port, length and checksum. UDP preserves datagram boundaries but supplies no delivery, ordering or deduplication guarantee and no congestion control.",
          "IPv4 permits omission of the UDP checksum; IPv6 normally requires it, with narrowly specified exceptions. The checksum detects transmission errors, not cryptographic authenticity.",
          "QUIC runs over UDP and provides encryption, congestion control and reliable ordered streams. A gap in one stream does not block delivery in another; the QUIC datagram extension also supports unreliable datagrams."
        ],
        "formula": "",
        "example": ""
      }
    ]
  },
  "network": {
    "name": "Network / Internet layer",
    "goals": [
      "Calculate CIDR and address ranges",
      "Select routes using longest-prefix matching",
      "Distinguish MTU, MSS and IP fragmentation"
    ],
    "lessons": [
      {
        "title": "CIDR, subnet masks and address ranges",
        "paragraphs": [
          "In IPv4 /p, the first p bits are the network prefix. Address AND mask gives the network address. In a broadcast subnet, setting all host bits yields the broadcast address.",
          "A normal broadcast subnet commonly has 2^(32−p)−2 assignable host addresses. A point-to-point /31 can use both addresses; /32 identifies a single address, so subtracting two does not apply.",
          "RFC 1918 private ranges are 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. Reachability still depends on routing and access policy."
        ],
        "formula": "Network address = IPv4 address AND subnet mask",
        "example": "192.168.10.130/26 has network 192.168.10.128, broadcast 192.168.10.191 and 62 assignable addresses from 192.168.10.129 through 192.168.10.190."
      },
      {
        "title": "Longest-prefix matching and default routes",
        "paragraphs": [
          "Within a selected routing table, forwarding chooses the longest matching prefix. The default route 0.0.0.0/0 matches all IPv4 addresses and supplies a next hop when no more specific entry matches.",
          "Routing protocols and configuration determine which routes enter the forwarding table; one prefix may have equal-cost next hops. Route preferences, metrics and multipath policy serve different roles from longest-prefix matching.",
          "A forwarding table supplies next hop and interface information; ordinary IP forwarding does not inspect application requests. OSPF and other protocols exchange topology or route information, while packets use the resulting forwarding table."
        ],
        "formula": "For one destination: /24 is more specific than /16, and /16 more specific than /8",
        "example": "When 10.1.2.8 matches 10.0.0.0/8, 10.1.0.0/16 and 10.1.2.0/24, choose 10.1.2.0/24."
      },
      {
        "title": "MTU, MSS and IP fragmentation",
        "paragraphs": [
          "The interface MTU limits the size of an IP packet carried by the link, excluding the Ethernet header and FCS. The TCP MSS option advertises the maximum TCP data length the endpoint can receive; actual transmission is also limited by the path MTU and header lengths. With a 1500-byte MTU and no IPv4 or TCP options, at most 1500 − 20 − 20 = 1460 bytes remain for data.",
          "IPv4 permits fragmentation when DF is not set. Each fragment has its own IP header included in its total length. Fragment offsets use 8-byte units, and all but the final fragment must carry a multiple of 8 data bytes. Destination address, source address, protocol and identification associate the fragments.",
          "IPv6 routers do not fragment packets; a source may use a Fragment extension header. Path MTU discovery uses feedback to determine suitable packet sizes and avoid fragmentation. MSS describes TCP data length, which differs from IP fragment length."
        ],
        "formula": "Without options: TCP segment data limit ≤ min(peer MSS, path MTU − IP header − TCP header)",
        "example": "For 4000 bytes of IPv4 data, a 1500-byte MTU, 20-byte IP headers and fragmentation permitted: fragment data lengths are 1480, 1480 and 1040 bytes; offsets are 0, 185 and 370; total lengths are 1500, 1500 and 1060 bytes."
      },
      {
        "title": "Hop-by-hop forwarding, NAT and path diagnosis",
        "paragraphs": [
          "A router receives a link frame, extracts the IP packet and decrements the IPv4 TTL or IPv6 Hop Limit. If forwarding can continue, it encapsulates the packet for the outgoing link. When the hop count expires, it discards the packet and usually returns an ICMP Time Exceeded message. Ordinary forwarding preserves source and destination IP addresses, but updates the IPv4 header checksum.",
          "Network Address Port Translation (NAPT) rewrites addresses and ports so multiple internal endpoints can share a public address. Related checksums must be adjusted. NAT translates addresses; access control and encryption require other mechanisms.",
          "ping usually checks connectivity with ICMP Echo requests and replies. traceroute increases TTL or Hop Limit to infer hops from ICMP Time Exceeded responses. A missing or slow response from one hop does not necessarily mean that hop drops or delays application traffic."
        ],
        "formula": "",
        "example": ""
      }
    ]
  },
  "datalink": {
    "name": "Data-link layer",
    "goals": [
      "Understand frames, MAC tables and broadcast domains",
      "Explain ARP next-hop resolution",
      "Distinguish switching, VLANs and routing"
    ],
    "lessons": [
      {
        "title": "Ethernet frame length and boundaries",
        "paragraphs": [
          "A typical untagged Ethernet frame measures 64–1518 bytes from destination MAC address through FCS. This excludes the preamble, Start Frame Delimiter (SFD) and interframe gap. Short payloads require padding.",
          "Destination and source MAC addresses occupy 6 bytes each, the type/length field 2 bytes, and FCS 4 bytes. An 802.1Q tag adds 4 bytes, making the usual tagged maximum 1522 bytes. Jumbo-frame configurations change supported limits, so always identify which fields a length includes.",
          "The Frame Check Sequence (FCS) uses CRC to detect transmission errors; damaged frames are usually discarded. FCS neither corrects errors nor provides cryptographic authentication. Modern switched full-duplex Ethernet does not use CSMA/CD for collision handling."
        ],
        "formula": "Untagged frame = 6 + 6 + 2 + data and padding + 4 bytes",
        "example": "The minimum 46 bytes of data and padding plus 18 bytes of header and FCS make a 64-byte frame. A 1500-byte payload makes a 1518-byte frame."
      },
      {
        "title": "How switches learn and forward",
        "paragraphs": [
          "A switch learns the mapping from source MAC address to incoming port from received frames. Entries are usually separated by VLAN and age out over time.",
          "For a known destination MAC, a frame normally goes to the corresponding port; if that is the incoming port, it is filtered. Unknown unicasts and broadcasts normally flood the other forwarding ports in the same VLAN.",
          "Layer 2 loops can cause broadcast storms and repeated MAC-table changes. STP and Rapid Spanning Tree Protocol (RSTP) prevent loops by controlling forwarding paths. Layer 3 switches can also perform IP routing."
        ],
        "formula": "",
        "example": ""
      },
      {
        "title": "ARP and IPv6 Neighbor Discovery",
        "paragraphs": [
          "Before sending an IPv4 Ethernet frame, the system selects the next hop using its route and resolves that IP address to a MAC address with ARP. A local destination usually requires resolving the destination itself; a remote destination usually requires resolving the gateway.",
          "Ethernet ARP requests are usually broadcast and replies usually unicast. The neighbor cache reduces repeated queries. Ethernet carries ARP directly with EtherType 0x0806; ordinary routers do not forward ARP broadcasts.",
          "IPv6 uses the ICMPv6-based Neighbor Discovery Protocol (NDP) for address resolution, router discovery, Neighbor Unreachability Detection and Duplicate Address Detection."
        ],
        "formula": "",
        "example": ""
      },
      {
        "title": "Collision domains, broadcast domains and VLANs",
        "paragraphs": [
          "Devices on shared half-duplex Ethernet can transmit simultaneously and collide. Switch ports confine contention to individual links. Full-duplex links allow simultaneous sending and receiving without these collisions.",
          "A broadcast domain is the area a Layer 2 broadcast can reach. Different VLANs form different broadcast domains; communication between them normally requires a router or Layer 3 switch.",
          "An access port normally connects an endpoint; a trunk port can carry multiple VLANs using 802.1Q tags. Settings such as a native VLAN can allow some traffic to remain untagged. VLANs provide logical separation, not content encryption."
        ],
        "formula": "",
        "example": ""
      }
    ]
  },
  "physical": {
    "name": "Physical layer",
    "goals": [
      "Calculate transmission and propagation delay",
      "Distinguish bit rate, baud rate and throughput",
      "Explain link capacity and signal conditions"
    ],
    "lessons": [
      {
        "title": "Transmission and propagation delay",
        "paragraphs": [
          "Transmission delay is the time required to place all packet bits onto a link, determined by packet length and link rate. Propagation delay is the time a signal takes to reach the other end, determined by distance and propagation speed.",
          "Delay between adjacent nodes also includes processing and queuing. Longer packets increase transmission delay but do not change signal propagation speed in the same medium.",
          "In a store-and-forward network, a node receives the complete packet before forwarding it. Each hop adds transmission and propagation delay. Multiple packets can travel as a pipeline across links; end-to-end time also depends on switching behavior and queues."
        ],
        "formula": "Transmission = L/R; propagation = d/v; one-hop delay = processing + queuing + transmission + propagation",
        "example": "A 1500-byte packet takes 0.12 ms to transmit at 100 Mbit/s. Over 1000 km at a propagation speed of 2 × 10⁸ m/s, propagation takes 5 ms."
      },
      {
        "title": "Bit rate, baud rate and channel bandwidth",
        "paragraphs": [
          "Bit rate measures bits per second; baud rate measures symbols per second. If each symbol carries log₂M bits, bit rate equals baud rate multiplied by log₂M. Coding overhead also affects the useful data rate.",
          "Signal bandwidth is measured in Hz; link data rate in bit/s. Application throughput also depends on protocol overhead, congestion, errors and endpoint processing capacity.",
          "The Nyquist relation describes the rate limit of an ideal noiseless baseband channel. The Shannon formula gives the capacity of a band-limited additive white Gaussian noise channel. Practical modulation and coding can only approach these theoretical limits."
        ],
        "formula": "Nyquist：R ≤ 2B log₂M；Shannon：C = B log₂(1 + S/N)",
        "example": "B is frequency bandwidth, M is the number of symbol states, and S/N is the linear signal-to-noise ratio. For an SNR of 30 dB, S/N = 10^(30/10) = 1000."
      },
      {
        "title": "Duplex modes, media and bit errors",
        "paragraphs": [
          "Simplex permits one-way transmission; half-duplex alternates directions; full-duplex permits simultaneous transmission both ways. Typical Wi-Fi devices contend for the same channel when sending and receiving, unlike full-duplex Ethernet.",
          "Twisted pair, fiber and wireless differ in distance, interference resistance, installation requirements and cost. Choose a medium for the link requirements. Replacing a local cable will usually not resolve delays caused by a remote service or network congestion.",
          "Bit Error Rate (BER) is the ratio of erroneous bits to total bits and can estimate error probability. Error-correcting codes can recover some errors; mechanisms such as CRC detect errors. Their specific capabilities determine what they can handle."
        ],
        "formula": "",
        "example": ""
      },
      {
        "title": "How physical faults affect upper layers",
        "paragraphs": [
          "A disconnected cable or interference can interrupt the link or cause frame errors and loss. Upper layers may show connection timeouts, retransmissions and lower throughput, so an application error can originate in the physical link.",
          "Interface status, negotiated speed and error counters help identify link problems. Good wireless Received Signal Strength Indicator (RSSI) readings do not rule out interference or shared-channel congestion.",
          "Repeaters regenerate or amplify signals; a hub is a legacy Ethernet multiport repeater. Classify a device by the functions it performs, since one device can operate at several layers."
        ],
        "formula": "",
        "example": ""
      }
    ]
  }
};

export function chapterKeys(id){return id==='tcp-application'?['application','presentation','session']:id==='interface'?['datalink','physical']:id==='internet'?['network']:id==='tcp-transport'?['transport']:[id];}

export const CASES = [
  {
    "id": "dns",
    "layer": "application",
    "title": "An IP address works, but DNS lookup fails",
    "symptom": "A connection to the known service IP succeeds, but using its domain name produces a name-resolution error.",
    "hints": [
      "Confirm that the error occurs during name resolution rather than TLS certificate name verification.",
      "Check the resolver address, query responses and cached records."
    ],
    "commands": [
      [
        "Linux / macOS",
        "dig example.com A\nnslookup example.com"
      ],
      [
        "Windows",
        "nslookup example.com\nipconfig /all"
      ]
    ],
    "conclusion": "Resolver timeouts can indicate configuration or connectivity problems. Responses such as a nonexistent name require checking the name and DNS records. Direct HTTPS access by IP may also fail because of certificate names, SNI or virtual-host selection; diagnose these separately from DNS."
  },
  {
    "id": "port",
    "layer": "transport",
    "title": "ping succeeds, but the web port times out",
    "symptom": "ICMP Echo replies arrive, but connecting to port 443 times out.",
    "hints": [
      "Successful ping proves that ICMP Echo works, not that a TCP port is reachable.",
      "Check connection packets at the client, the server listening address, and port access rules along the path."
    ],
    "commands": [
      [
        "Client (Linux / macOS)",
        "curl -v --connect-timeout 5 https://example.com"
      ],
      [
        "Client (Windows PowerShell)",
        "Test-NetConnection example.com -Port 443"
      ],
      [
        "Server (Linux)",
        "ss -lnt"
      ],
      [
        "Server (macOS)",
        "lsof -nP -iTCP:443 -sTCP:LISTEN"
      ]
    ],
    "conclusion": "A timeout can result from dropped packets, path faults or an unresponsive server. An unfiltered port with no listener usually returns RST, producing a connection refusal. Use captures at both endpoints, listener status and access rules to locate the cause."
  },
  {
    "id": "route",
    "layer": "network",
    "title": "Local subnet works, remote subnet fails",
    "symptom": "Host A can reach devices in its subnet but cannot reach 192.168.2.20 in another subnet.",
    "hints": [
      "Verify the address, mask and routes on A, and determine the next hop actually selected.",
      "Check the destination return route and access rules in both directions."
    ],
    "commands": [
      [
        "Linux",
        "ip addr\nip route\nip route get 192.168.2.20"
      ],
      [
        "Windows",
        "ipconfig /all\nroute print\ntracert 192.168.2.20"
      ]
    ],
    "conclusion": "An incorrect mask may make A treat a remote destination as directly connected and send ARP for it. Missing next-hop or return routes can also block traffic. Check addresses, routes, neighbor resolution and access rules on both paths."
  },
  {
    "id": "arp",
    "layer": "datalink",
    "title": "Default route exists, but gateway resolution fails",
    "symptom": "A default route exists, but the gateway neighbor entry never resolves.",
    "hints": [
      "In the Linux neighbor table, INCOMPLETE means resolution is unfinished; FAILED means probing failed.",
      "Check the local link, VLAN, gateway address and gateway interface status."
    ],
    "commands": [
      [
        "Linux",
        "ip link\nip neigh\nip route"
      ],
      [
        "Windows",
        "arp -a\nipconfig /all"
      ]
    ],
    "conclusion": "Link faults, VLAN mismatches, an incorrect gateway address or an offline gateway can all prevent ARP resolution. A missing or old cache entry alone does not prove a fault; observe ARP requests and replies during an actual communication attempt."
  },
  {
    "id": "tls",
    "layer": "presentation",
    "title": "TCP connects, but HTTPS certificate verification fails",
    "symptom": "The client connects to port 443, then reports an expired certificate, name mismatch or trust-chain error.",
    "hints": [
      "Confirm that the connection was established, then inspect the specific TLS handshake error.",
      "Check the requested domain, certificate validity, trust chain and client system time."
    ],
    "commands": [
      [
        "Linux / macOS",
        "curl -v https://example.com"
      ],
      [
        "Windows (curl installed)",
        "curl.exe -v https://example.com"
      ],
      [
        "Environment with OpenSSL installed",
        "openssl s_client -connect example.com:443 -servername example.com -verify_hostname example.com -verify_return_error"
      ]
    ],
    "conclusion": "Fix certificate renewal, name matching, trust-chain configuration or system time as appropriate. When reviewing OpenSSL output, confirm that the tool uses the correct trust roots. Handshake output alone does not prove successful certificate and hostname verification."
  },
  {
    "id": "mtu",
    "layer": "network",
    "title": "Small transfers work, large transfers stall",
    "symptom": "The connection establishes, but large transfers through a tunnel stall or repeatedly retransmit.",
    "hints": [
      "Check the path MTU after tunnel encapsulation and whether ICMP feedback needed for path MTU discovery is filtered.",
      "Also inspect retransmissions, windows and server state to rule out congestion, receiver blocking or rate limiting."
    ],
    "commands": [
      [
        "Linux",
        "tracepath example.com\nip link"
      ],
      [
        "Windows (IPv4; destination must allow ICMP Echo)",
        "ping -4 example.com -f -l 1472"
      ]
    ],
    "conclusion": "With no IPv4 options, 1472 bytes of ICMP data plus a 20-byte IP header and an 8-byte ICMP header total 1500 bytes. This is only a starting point: adjust the size and inspect IPv4 Fragmentation Needed or IPv6 Packet Too Big feedback. If ICMP Echo is filtered, a probe timeout alone does not prove the MTU is too small."
  },
  {
    "id": "retry",
    "layer": "session",
    "title": "Retry after timeout executes an operation twice",
    "symptom": "The client times out after submitting an operation; resubmission creates two business records.",
    "hints": [
      "The first request may have been processed even though its response did not arrive.",
      "Check whether both requests share the same operation identifier and whether duplicate detection and the write are atomic."
    ],
    "commands": [
      [
        "Application logs and business storage",
        "Correlate request IDs, operation IDs and server logs\nQuery the status and result of the same operation"
      ]
    ],
    "conclusion": "Querying or retrying with the same operation identifier can reduce duplicate submissions when the outcome is uncertain. Duplicate records and business changes need consistency guarantees so concurrent requests cannot both pass the check. TCP reliability cannot replace this application design."
  },
  {
    "id": "cable",
    "layer": "physical",
    "title": "Link repeatedly drops and interface errors increase",
    "symptom": "Transfers slow down while interface errors, disconnects or reconnections occur.",
    "hints": [
      "Check cables, ports, negotiated speed and duplex status.",
      "Distinguish receive errors such as CRC failures from buffer drops and congestion; counter names vary by device."
    ],
    "commands": [
      [
        "Linux",
        "ip -s link\nethtool eth0  # Replace eth0 with the actual interface name"
      ],
      [
        "Windows PowerShell",
        "Get-NetAdapter\nGet-NetAdapterStatistics"
      ]
    ],
    "conclusion": "Use counter increases, link logs and comparative tests to locate the cause. Try replacing a faulty cable or port. If physical errors are absent, investigate congestion, endpoint performance and server rate limits."
  }
];
