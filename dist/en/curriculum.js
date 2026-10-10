// Layers原理和故障案例；仅包含Principles与故障案例。
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
        "title": "What happens during a web visit, and in what order?",
        "paragraphs": [
          "Parse the URL, check caches and obtain the destination address. Select a next hop from the routing table and resolve its link address with ARP or Neighbor Discovery if necessary. HTTPS over TCP then establishes TCP and performs a TLS handshake before exchanging HTTP messages.",
          "This is a typical sequence, not a full restart for every request. DNS and HTTP caches, connection reuse and TLS resumption change the cost. HTTP/3 uses QUIC, so a TCP-first sequence does not apply.",
          "Application protocols cooperate with lower layers without directly reading every switch MAC table. Explain web access through name resolution, path selection, connection establishment, security and request/response exchange."
        ],
        "formula": "",
        "example": "Example: if DNS works but access fails, check the destination port, TLS and HTTP rather than repeatedly clearing the DNS cache."
      },
      {
        "title": "DNS: recursion, iteration, caching and truncation",
        "paragraphs": [
          "A recursive query asks for a final answer or error; an iterative query can return another server to query. Hosts normally use a recursive resolver, which queries the authoritative hierarchy.",
          "Record TTL is cache lifetime, not IP packet TTL. Caching reduces queries but can retain old records after changes. Negative caching can also remember temporarily nonexistent names.",
          "Traditional DNS uses both UDP and TCP 53. A truncated UDP response can be retried over TCP; zone transfers usually use TCP. DNS does not always use UDP."
        ],
        "formula": "",
        "example": "Record examples: A/AAAA contain addresses, CNAME points to an alias, and MX specifies mail exchangers."
      },
      {
        "title": "HTTP: idempotency, persistent connections and caching",
        "paragraphs": [
          "Safe methods primarily read data. An idempotent method has the same intended effect when repeated, not necessarily identical response bytes. GET is usually safe and idempotent; PUT and DELETE are idempotent by definition; POST generally is not guaranteed to be.",
          "Persistent connections serve multiple HTTP exchanges. HTTP/2 multiplexes streams on one connection, but TCP loss can still affect multiple streams sharing it.",
          "Cache-Control controls caching; ETag and Last-Modified support conditional requests. A 304 generally permits reuse of an existing representation rather than returning the full resource again."
        ],
        "formula": "",
        "example": "Retrying a payment requires application idempotency keys or similar design. TCP reliability alone cannot prevent duplicate processing."
      },
      {
        "title": "HTTP versions and HTTPS layering",
        "paragraphs": [
          "HTTP/1.1 commonly uses TCP; HTTP/2 adds binary framing and multiplexing; HTTP/3 uses QUIC. These are common transports, not a claim that HTTP semantics permit only one transport.",
          "TLS protects integrity and confidentiality and usually authenticates the server. A successful TCP connection does not establish certificate trust; successful TLS does not prevent HTTP 500 responses.",
          "HTTP statelessness does not prevent sign-in. Applications maintain login state using cookies, session identifiers or tokens. Sessions and TCP connections are not one-to-one."
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
        "title": "Characters, bytes and encoding are different concepts",
        "paragraphs": [
          "Characters are text concepts, bytes are data units, and encoding maps between them. UTF-8 is variable-length; character counts cannot directly determine transmitted byte counts.",
          "Lengths such as Content-Length normally count bytes. Encode first, then count bytes, to avoid incorrect receive boundaries with multibyte characters.",
          "Decoding requires consistent rules; encoding mismatches often cause garbled text. Base64 represents binary as text; it is not encryption."
        ],
        "formula": "",
        "example": "A pair of three-byte UTF-8 characters occupies 6 bytes while containing only 2 characters."
      },
      {
        "title": "Serialization requires matching meaning as well as format",
        "paragraphs": [
          "JSON and Protocol Buffers represent objects for exchange. Peers must agree on field meanings, types and versions, not merely parse the syntax.",
          "Integer byte order matters in binary protocols. Many network fields use big-endian network byte order; individual serialization formats can define different rules.",
          "Serialization does not resolve TCP message boundaries. Length-prefix designs must specify header size, payload length units, maximum message size and malformed-data handling."
        ],
        "formula": "Message = length header + payload encoded in the agreed format",
        "example": "A big-endian 32-bit length of “00 00 00 06” calls for 6 bytes, not 6 characters."
      },
      {
        "title": "TLS handshakes and certificate validation",
        "paragraphs": [
          "The handshake negotiates cryptographic parameters, establishes session keys and verifies identities as needed. TLS 1.3 commonly uses ephemeral key exchange, not server-public-key encryption of the entire page.",
          "Browsers check certificate chains, validity periods and server names. A trusted signature alone does not establish a match with the domain being visited.",
          "Symmetric keys efficiently protect application data; asymmetric mechanisms handle authentication and key establishment. TCP sequence numbers are not encryption, and checksums are not cryptographic integrity guarantees."
        ],
        "formula": "",
        "example": ""
      },
      {
        "title": "Compression, encryption and layer boundaries",
        "paragraphs": [
          "Compression removes redundancy; encryption hides content. Compressing data does not make it secure.",
          "Compression is usually more effective before encryption because ciphertext has little useful redundancy. Protocols must also consider side channels from combining compression and secrets.",
          "OSI presentation is a functional viewpoint. TLS, JSON and encoding libraries occupy different places in TCP/IP; they do not all run in a separate sixth-layer process."
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
        "title": "Connection, session and request lifecycles",
        "paragraphs": [
          "A TCP connection is defined by endpoints and protocol state; a user session is an ongoing application interaction; a request is one operation. Their lifecycles may differ completely.",
          "HTTP/2 can carry concurrent streams on one connection; a login can span connections or network changes. A server cannot substitute the existence of a TCP connection for user authentication.",
          "OSI explains dialogue management. In practice, identify the application, protocol or library responsible rather than looking for a universal session-layer device."
        ],
        "formula": "",
        "example": ""
      },
      {
        "title": "A timeout does not mean the operation never ran",
        "paragraphs": [
          "A timeout means no sufficient result arrived before the deadline. The request may have failed to arrive, or it may have executed with its response lost. Immediate retry can duplicate the operation.",
          "Reliable transport governs data delivery, not exactly-once business execution. Applications need idempotency identifiers, deduplication records, transactions or status queries.",
          "Idempotent requests have the same intended effect when repeated. Designs must still consider concurrency, storage failures, deduplication windows and recovery."
        ],
        "formula": "Timeout ≠ not executed; retry ≠ automatically safe",
        "example": "After a transfer submission times out, query its operation ID instead of unconditionally creating a new transfer request."
      },
      {
        "title": "Heartbeats, keepalive and liveness",
        "paragraphs": [
          "Application heartbeats can test business processing; TCP keepalive mainly probes an idle connection. They do not directly replace each other.",
          "Network failure detection uses deadlines and assumptions. Short timeouts detect failures sooner but can misclassify temporary congestion; long timeouts respond more slowly.",
          "Some NATs, proxies and load balancers remove long-idle connections. Choose keepalive according to path and service policies."
        ],
        "formula": "",
        "example": ""
      },
      {
        "title": "Checkpoints and recovery",
        "paragraphs": [
          "Checkpoints record recoverable positions or application state. Resumable downloads usually require both application protocol support and local state.",
          "Recovery must verify file versions, completed ranges and checksums. Do not blindly concatenate different versions based only on a downloaded byte count.",
          "OSI session synchronization and recovery do not mean every TCP application automatically has resumable checkpoints."
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
        "title": "TCP byte numbering and cumulative acknowledgment",
        "paragraphs": [
          "TCP numbers bytes. seq identifies the first data byte in a segment; ack usually identifies the next expected sequence number. The space wraps modulo 2³². SYN and FIN each consume one number; pure ACK consumes none.",
          "Cumulative acknowledgment covers a contiguous received range. If 1001 is expected but data from 1501 arrives first, ack may remain 1001. SACK can additionally report noncontiguous ranges.",
          "Consider data length, SYN/FIN flags and reordering. Incrementing ack by one for every packet is not a general rule."
        ],
        "formula": "For contiguous reception: ack = seq + data bytes + SYN + FIN (mod 2³²)",
        "example": "seq=1001 plus 500 contiguous bytes without SYN/FIN gives ack=1501. With FIN it gives ack=1502."
      },
      {
        "title": "Sliding windows: receiver capacity and network capacity",
        "paragraphs": [
          "The receiver advertises rwnd to protect its buffer; the sender maintains cwnd from network feedback. They solve different problems.",
          "In-flight data is constrained by quantities such as min(rwnd,cwnd). New sending allowance also subtracts unacknowledged in-flight bytes, subject to state and recovery rules.",
          "Bandwidth-delay product estimates the data needed to fill a path. A window much smaller than BDP can prevent one flow from reaching potential path throughput."
        ],
        "formula": "Simplified new sending allowance = max(0, min(rwnd,cwnd) − in-flight bytes)",
        "example": "With rwnd=64KB, cwnd=32KB and 20KB in flight, the simplified allowance is 12KB."
      },
      {
        "title": "Loss recovery, RTO and congestion control",
        "paragraphs": [
          "Retransmission timers use estimated RTT and its variation; timeouts usually trigger backoff. Duplicate ACKs and SACK can support earlier recovery. Modern implementations use several algorithms.",
          "Classic Reno teaching covers slow start, congestion avoidance, fast retransmit and fast recovery. Ideal slow start approximately doubles cwnd per RTT; congestion avoidance grows more gently. Thresholds, initial windows and recovery rules vary by system.",
          "Three duplicate ACKs triggering fast retransmit is a classic mechanism, not any three ACKs or the sole modern loss detector. Timeout and fast-retransmit congestion responses also differ."
        ],
        "formula": "Ideal teaching model: roughly exponential slow start; roughly linear congestion avoidance",
        "example": "If an exercise assumes initial cwnd=1 MSS, doubling each RTT below the threshold, four rounds yield 16 MSS. Real initial windows need not be 1 MSS."
      },
      {
        "title": "Handshake, close, TIME-WAIT and RST",
        "paragraphs": [
          "The handshake synchronizes initial sequence numbers and establishes state. The third ACK confirms receipt of the passive peer SYN. Explain sequence numbers and states, not just the ability to send and receive.",
          "Directions close independently, typically in four segments; ACK and FIN may combine. FIN normally closes a direction; RST resets, refuses or abnormally terminates a connection.",
          "The active closer usually enters TIME-WAIT for 2MSL, allowing old duplicates to expire and recovery from final ACK loss. Four minutes is not universal; simultaneous closing requires state-machine analysis."
        ],
        "formula": "",
        "example": ""
      },
      {
        "title": "UDP, QUIC and message boundaries",
        "paragraphs": [
          "UDP has an 8-byte header containing two ports, length and checksum. It preserves datagram boundaries but does not guarantee reliability, ordering or deduplication, nor provide TCP-style congestion control itself.",
          "IPv4 permits omission of UDP checksums under protocol rules. IPv6 generally requires them, with limited specified exceptions. Checksums do not authenticate data cryptographically.",
          "QUIC implements reliability, congestion control and encryption over UDP. Distinguish UDP itself from complete application protocols built on it when comparing TCP and UDP."
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
        "title": "CIDR, masks and usable addresses",
        "paragraphs": [
          "In IPv4, /p means the first p bits form the network prefix. Bitwise AND with the mask gives the network address; setting host bits to one gives a conventional subnet broadcast address.",
          "Conventional broadcast subnets have 2^(32−p)−2 usable addresses, but /31 and /32 are exceptions. /31 supports point-to-point links; /32 identifies one host address.",
          "RFC 1918 ranges are 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. Private addressing does not automatically provide security; reachability depends on routing and policy."
        ],
        "formula": "Network address = IPv4 address AND subnet mask",
        "example": "192.168.10.130/26: network 192.168.10.128, broadcast 192.168.10.191, conventional usable hosts 129–190, totaling 62."
      },
      {
        "title": "Longest-prefix matching and default routes",
        "paragraphs": [
          "Of routes matching a destination, prefer the longest and most specific prefix. Default route 0.0.0.0/0 applies when no more-specific match exists.",
          "Among routes with the same prefix, priorities, metrics and multipath policies also matter. Longest-prefix matching is not the entire selection process.",
          "A forwarding table selects the next hop without requiring each router to know application content. Control protocols such as OSPF obtain routes; forwarding uses the resulting information."
        ],
        "formula": "/24 is more specific than /16; /16 is more specific than /8",
        "example": "For 10.1.2.8 matching 10/8, 10.1/16 and 10.1.2/24, choose /24."
      },
      {
        "title": "MTU, MSS and IPv4 fragmentation",
        "paragraphs": [
          "MTU limits the network-layer packet a link can carry. MSS limits TCP data. In simplified Ethernet/IPv4 without options, 1500−20−20=1460 bytes.",
          "IPv4 Total Length includes each fragment header. Fragment offsets use 8-byte units; nonfinal payloads normally align to 8 bytes. Identification and other fields associate fragments of one packet.",
          "IPv6 routers do not fragment; sources may use a Fragment extension header. Path MTU Discovery helps avoid oversized packets. MSS is not IP fragment size."
        ],
        "formula": "Simplified without options: MSS = path MTU − IP header − TCP header",
        "example": "IPv4 payload 4000 bytes, MTU 1500, header 20: payloads 1480/1480/1040; offsets 0/185/370; total lengths 1500/1500/1060."
      },
      {
        "title": "Routing, NAT, TTL and diagnostics",
        "paragraphs": [
          "Routers remove old link encapsulation, decrement IPv4 TTL or IPv6 Hop Limit and re-encapsulate on the next link. Without NAT, IP addresses usually remain unchanged. The IPv4 header checksum must be updated.",
          "NAPT rewrites IP addresses and ports to share public addresses. It is not a required routing step, firewall or encryption. IP and transport checksums may need adjustment.",
          "ping tests a form of reachability with echo messages; traceroute uses TTL/Hop Limit and time-exceeded responses. A silent intermediate device may still forward application traffic."
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
        "title": "Ethernet frames: minimum length and boundaries",
        "paragraphs": [
          "Common untagged frames measure 64–1518 bytes from destination MAC through FCS, excluding preamble, SFD and interframe gap. Short payloads require padding.",
          "Source and destination MACs each use 6 bytes, EtherType usually 2, and FCS usually 4. VLAN tags and other encapsulation change lengths; define the measurement boundary when comparing frame sizes.",
          "CRC-based FCS detects many transmission errors but provides neither cryptographic authentication nor guaranteed correction. Modern full-duplex switched Ethernet does not use shared half-duplex collision behavior."
        ],
        "formula": "Untagged frame: 6 + 6 + 2 + payload/padding + 4 bytes",
        "example": "A 46-byte minimum payload plus 18 bytes of header/trailer gives 64 bytes; a 1500-byte payload gives a 1518-byte frame."
      },
      {
        "title": "Switch learning, forwarding and flooding",
        "paragraphs": [
          "Switches learn MAC → interface mappings from source MAC addresses, not destinations. Entries normally age out.",
          "Known unicast usually goes to one port; unknown unicast and broadcast may flood within the VLAN, normally excluding ingress. Flooding does not mean sending across the entire Internet.",
          "Layer-two loops can cause broadcast storms and MAC-table instability. STP/RSTP address loops. Layer-three switches also route; device names are not absolute layer assignments."
        ],
        "formula": "",
        "example": ""
      },
      {
        "title": "ARP and IPv6 Neighbor Discovery",
        "paragraphs": [
          "ARP resolves IPv4 to link addresses. Resolve the destination interface for local traffic, usually the gateway for remote traffic. ARP broadcasts do not cross normal routers to remote networks.",
          "Ethernet ARP requests are usually broadcast and replies unicast. Caches reduce queries. ARP runs directly over Ethernet, EtherType 0x0806, rather than using a UDP port.",
          "IPv6 uses ICMPv6-based Neighbor Discovery instead of IPv4 ARP. It also handles router discovery and duplicate address detection."
        ],
        "formula": "",
        "example": ""
      },
      {
        "title": "Collision domains, broadcast domains and VLANs",
        "paragraphs": [
          "Devices on shared half-duplex media contend for transmission. Switched full-duplex links handle collisions differently. Traditional claims about switches separating collision domains need historical and medium context.",
          "A broadcast domain is the reach of layer-two broadcasts. VLANs separate broadcast domains; communication between them normally needs layer-three forwarding.",
          "Access and trunk define endpoint attachment and VLAN carriage. Trunking is not encryption. VLAN configuration and routing policies jointly affect reachability."
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
          "Transmission delay is time to push packet bits onto the link, depending on packet size and link rate. Propagation delay is signal travel time, depending on distance and propagation speed.",
          "Total delay may also include queuing and processing. Longer packets take longer to transmit but do not reduce signal propagation speed in the same medium.",
          "Each link in a store-and-forward path transmits the packet; routers may wait for reception before forwarding. Pipelining, packet count and switching methods affect end-to-end time."
        ],
        "formula": "t_transmission = L/R; t_propagation = d/v; total ≈ transmission + propagation + queuing + processing",
        "example": "1500 bytes at 100Mb/s: 0.12ms transmission. Over 1000km at 2×10⁸m/s: 5ms propagation."
      },
      {
        "title": "Bit rate, baud rate and bandwidth",
        "paragraphs": [
          "Bit rate counts bits per second; baud rate counts symbols per second. Ideally log₂M bits per symbol relates them through modulation order. They are not always equal.",
          "Analog bandwidth commonly uses Hz; digital link rates use bit/s. Application throughput subtracts overhead and is constrained by congestion and endpoints.",
          "Nyquist and Shannon formulas require their stated assumptions. Coding, noise and implementation determine how closely practical systems approach the limits."
        ],
        "formula": "Ideal noiseless Nyquist: R≤2B log₂M; Shannon: C=B log₂(1+S/N)",
        "example": "S/N must be a linear ratio. SNR=30dB gives S/N=10^(30/10)=1000."
      },
      {
        "title": "Duplex, media and bit errors",
        "paragraphs": [
          "Simplex permits one direction; half duplex permits both at different times; full duplex permits both simultaneously. Shared wireless channels should not be assumed to behave like full-duplex Ethernet.",
          "Copper, fiber and wireless differ in distance, interference, deployment and cost. Replacing a cable will not necessarily fix slowness caused by a remote service or congestion.",
          "Bit error rate describes the probability or observed proportion of erroneous bits. Coding and detection affect usable service; FCS does not guarantee an error-free link."
        ],
        "formula": "",
        "example": ""
      },
      {
        "title": "How physical faults affect higher layers",
        "paragraphs": [
          "Disconnection or interference can cause link failures, frame errors or loss, seen above as timeouts, retransmissions and reduced throughput. An application error may be a symptom of a lower-layer cause.",
          "Check interface state, negotiated rate and error counters before network and application layers. Good wireless RSSI does not rule out interference or shared-channel congestion.",
          "Repeaters primarily restore or forward signals; hubs are traditional shared connection devices. Real devices may span layers; explain their functions."
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
    "title": "IP access works, domain access fails",
    "symptom": "The same service accepts a connection by known IP, but the system reports name-resolution failure.",
    "hints": [
      "Distinguish resolution failure from TLS hostname-validation failure.",
      "Inspect resolver configuration, DNS responses and caches."
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
    "conclusion": "For resolver timeouts or errors, inspect DNS configuration and reachability before blaming TCP. HTTPS by IP may also fail hostname validation or virtual-host selection; diagnose separately."
  },
  {
    "id": "port",
    "layer": "transport",
    "title": "ping works, web port times out",
    "symptom": "ICMP echo succeeds, but curl times out connecting to port 443.",
    "hints": [
      "ping does not test whether a TCP port is open.",
      "Check listening addresses, port policy and whether connection packets arrive."
    ],
    "commands": [
      [
        "Linux / macOS",
        "curl -v --connect-timeout 5 https://example.com\nss -lnt  # Linux: inspect listening sockets"
      ],
      [
        "Windows",
        "Test-NetConnection example.com -Port 443"
      ]
    ],
    "conclusion": "Possible causes include incorrect listening configuration or dropped traffic. Timeouts differ from RST connection refusals. Use packet captures and server listeners; ping alone does not prove service availability."
  },
  {
    "id": "route",
    "layer": "network",
    "title": "Local communication works, remote subnet fails",
    "symptom": "A reaches its local subnet but cannot reach 192.168.2.20.",
    "hints": [
      "Check the mask and default gateway on A and the selected next hop.",
      "Check the return route on B; communication needs both directions."
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
    "conclusion": "A wrong mask may make A treat a remote host as local and ARP incorrectly. Missing gateways or return routes also fail. Verify addressing, routes, next hops and return paths."
  },
  {
    "id": "arp",
    "layer": "datalink",
    "title": "Correct gateway address, unreachable gateway",
    "symptom": "A default route exists, but the gateway neighbor entry remains unresolved and the gateway is unreachable.",
    "hints": [
      "Look for INCOMPLETE or FAILED neighbor entries.",
      "Check the link, VLAN and gateway interface before remote applications."
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
    "conclusion": "Possible causes are local layer-two isolation, incorrect VLANs, an offline gateway or link faults. An expired neighbor entry alone is not a fault; inspect resolution and interface state."
  },
  {
    "id": "tls",
    "layer": "presentation",
    "title": "TCP connects, HTTPS certificate fails",
    "symptom": "The client reaches port 443 but reports an expired certificate or hostname mismatch.",
    "hints": [
      "Separate transport reachability from identity validation.",
      "Check the domain, certificate validity, trust chain and system clock."
    ],
    "commands": [
      [
        "Linux / macOS / Windows (curl installed)",
        "curl -v https://example.com"
      ],
      [
        "An environment with OpenSSL",
        "openssl s_client -connect example.com:443 -servername example.com"
      ]
    ],
    "conclusion": "Investigate TLS identity or configuration. Permanently disabling validation hides the cause; fix the domain, certificate, trust chain or clock."
  },
  {
    "id": "mtu",
    "layer": "network",
    "title": "Small requests work, large transfers stall",
    "symptom": "Connections establish, but larger transfers through a tunnel stall or repeatedly retransmit.",
    "hints": [
      "Consider path MTU, encapsulation overhead and blocked PMTUD feedback.",
      "This is one hypothesis; also exclude congestion and server rate limiting."
    ],
    "commands": [
      [
        "Linux",
        "tracepath example.com\nip link"
      ],
      [
        "Windows (target must permit ICMP)",
        "ping example.com -f -l 1472"
      ]
    ],
    "conclusion": "1472 is a teaching probe size: MTU 1500 minus IPv4 header 20 and ICMP header 8. It is not universal. Adjust for encapsulation and measured paths; inspect Packet Too Big/Fragmentation Needed feedback."
  },
  {
    "id": "retry",
    "layer": "session",
    "title": "Retry after timeout executes an operation twice",
    "symptom": "A submitted operation times out; a retry creates two business records.",
    "hints": [
      "The first request may have executed while its response was lost.",
      "Check operation identifiers, idempotency keys and deduplication records."
    ],
    "commands": [
      [
        "Application investigation",
        "Correlate request IDs, operation IDs and server logs\nQuery the status and result of the same operation"
      ]
    ],
    "conclusion": "This is an application-semantics issue. TCP reliability does not guarantee exactly-once execution. Define idempotency, result queries and atomic deduplication."
  },
  {
    "id": "cable",
    "layer": "physical",
    "title": "Intermittent link and rising error counters",
    "symptom": "Slow transfers accompany interface errors, disconnections or reconnects.",
    "hints": [
      "First check the medium, port and negotiation parameters.",
      "Distinguish error-related loss from normal network congestion."
    ],
    "commands": [
      [
        "Linux",
        "ip -s link\nethtool eth0  # Requires the tool and correct interface name"
      ],
      [
        "Windows",
        "Get-NetAdapter\nGet-NetAdapterStatistics"
      ]
    ],
    "conclusion": "Use device error counters, media checks and interface logs. Replacing faulty cables or ports can help but will not fix application, congestion or remote rate-limit problems."
  }
];
