// 各层说明、Protocol简介和传输实验Data。
const protocol = (name, title, brief, topics, meta = '', source = '') => ({name,title,brief,topics,meta,source});
const topic = (title, text) => ({title,text});
export const PROTOCOLS = {
  http: protocol('HTTP','Hypertext Transfer Protocol','Clients send requests and servers return responses. HTTP defines methods, status codes, field semantics and message formats.',[
    topic('Requests and responses','A request contains a method, target resource and headers, with an optional body. A response contains a status code, headers and an optional body. GET usually reads resources; POST usually submits data.'),
    topic('Status codes','2xx indicates success; 3xx covers redirection and reuse of cached responses; 4xx indicates a client request error; 5xx indicates a server error. 404 means the resource was not found; 500 means an internal server error.'),
    topic('Versions and transport','HTTP/1.1 and HTTP/2 commonly use TCP; HTTP/3 uses QUIC over UDP. HTTPS protects HTTP with TLS, whose handshake is integrated into QUIC for HTTP/3.'),
    topic('Statelessness and sign-in','HTTP semantics do not require servers to remember earlier requests. Applications can manage sign-in with cookies and session identifiers. One login session can span several TCP connections.')
  ],'Default ports: HTTP 80 / HTTPS 443','https://www.rfc-editor.org/rfc/rfc9110.html'),
  dns: protocol('DNS','Domain Name System','Looks up resource records by name. A and AAAA records supply IP addresses; other record types describe mail servers, aliases and other information.',[
    topic('Recursion and iteration','Clients usually query a recursive resolver. The resolver uses its cache or queries root, top-level domain and authoritative servers iteratively.'),
    topic('Common records','A records contain IPv4 addresses, AAAA records IPv6 addresses, CNAME records aliases, and MX records mail routing information. TTL controls how long a record can remain cached.'),
    topic('Transport','Traditional DNS uses UDP or TCP port 53. A truncated UDP response normally prompts a TCP retry; full zone transfers use TCP. DoT (DNS over TLS) and DoH (DNS over HTTPS) provide encrypted transport.')
  ],'UDP / TCP 53','https://www.rfc-editor.org/rfc/rfc1035.html'),
  smtp: protocol('SMTP','Simple Mail Transfer Protocol','Submits and relays mail between clients and mail servers, and between mail servers.',[
    topic('Sending and retrieving','SMTP handles submission and relay; IMAP and POP3 let clients access or retrieve mail stored on a server.'),
    topic('Ports and security','Server-to-server relay commonly uses TCP 25, client submission 587, and implicit TLS submission 465. Encryption depends on configuration and negotiation.')
  ],'TCP 25 / 587 / 465','https://www.rfc-editor.org/rfc/rfc5321.html'),
  dhcp: protocol('DHCP','Dynamic Host Configuration Protocol','DHCPv4 can supply IP addresses, subnet masks, default gateways, DNS servers and other configuration.',[
    topic('Obtaining the first lease','The usual sequence is DHCPDISCOVER, DHCPOFFER, DHCPREQUEST and DHCPACK, abbreviated DORA. The client initially has no usable address, so the exchange uses broadcasts where needed.'),
    topic('Renewal and IPv6','Clients renew before the lease expires; renewal need not repeat DORA. DHCPv6 uses UDP 546 for clients and 547 for servers. IPv6 can also use SLAAC to configure addresses; default routes normally come from router advertisements.')
  ],'UDP 67 (server) / 68 (client)','https://www.rfc-editor.org/rfc/rfc2131.html'),
  ssh: protocol('SSH','Secure Shell','Provides encrypted remote login, command execution and related channels.',[
    topic('Authentication and encryption','Key negotiation and server identity verification normally precede user authentication. Server host keys and user public keys serve different purposes.'),
    topic('Logical channels','One SSH connection can carry several logical channels, including terminals, SFTP transfers and port forwarding.')
  ],'TCP 22','https://www.rfc-editor.org/rfc/rfc4251.html'),
  tls: protocol('TLS','Transport Layer Security','Provides confidentiality, integrity protection and authentication. The OSI view places it under presentation functions for data protection; its name does not mean it belongs to the OSI transport layer.',[
    topic('Handshake','Peers negotiate parameters, establish keys and authenticate as required. With certificates, the client normally checks the server certificate and target hostname; some deployments also authenticate clients.'),
    topic('Relation to HTTPS','A common HTTPS stack is HTTP → TLS → TCP → IP. QUIC integrates the TLS 1.3 handshake, rather than simply carrying TLS records over TCP.'),
    topic('Roles of TCP and TLS','TCP supplies a reliable byte stream; TLS protects its contents. Certificate validation failures and TCP connection failures require different checks.')
  ],'Functional mapping','https://www.rfc-editor.org/rfc/rfc8446.html'),
  encoding: protocol('UTF-8','Character encoding','Converts characters to bytes that the receiver interprets using the same encoding. This is a presentation function, not a network transport protocol.',[
    topic('Encoding mismatches','Decoding bytes with a different character encoding may produce garbled text. A protocol should specify the encoding or identify it in the message.'),
    topic('Characters and bytes','UTF-8 encodes a Unicode code point in one to four bytes. One visible character may contain several code points, so character, code point and byte counts can differ.')
  ],'Data representation','https://www.rfc-editor.org/rfc/rfc3629.html'),
  json: protocol('JSON','Data serialization format','Represents objects, arrays and numbers as text so programs in different languages can exchange data. JSON itself is not a transport protocol.',[
    topic('Serialization and deserialization','Serialization converts a data structure into a specified format. JSON produces text, which a character encoding converts into bytes. Deserialization reconstructs the data; the application defines field meanings.'),
    topic('Format versus transport','HTTP, WebSocket and other protocols can carry JSON. JSON does not automatically resolve message boundaries in a TCP byte stream.')
  ],'Data format','https://www.rfc-editor.org/rfc/rfc8259.html'),
  rpc: protocol('RPC','Remote procedure call','Lets programs request remote operations much like function calls. Concrete RPC systems often handle session-related functions.',[
    topic('Correlating requests and state','Call identifiers associate responses with requests. A timeout does not reveal whether the remote operation ran; consider idempotency and retries.'),
    topic('Layer placement','RPC normally belongs to the TCP/IP application layer. The OSI view uses it to illustrate session functions such as call correlation, although an RPC system also performs other functions.')
  ],'Session-function example','https://www.rfc-editor.org/rfc/rfc5531.html'),
  session: protocol('Session','Application session management','Maintains or identifies state across requests, such as a login session or collaborative task. This is a family of mechanisms, not a single network protocol named Session.',[
    topic('Sessions and connections','The OSI session layer, a website login session and a TCP connection are different concepts. A login may span several connections, while one connection may carry many requests.'),
    topic('Synchronization and recovery','Applications can record progress with checkpoints and task identifiers to recover after interruption. TCP provides reliable transport, but application recovery still needs its own design.')
  ],'Mechanism example'),
  tcp: protocol('TCP','Transmission Control Protocol','After connection establishment, provides a reliable, ordered byte stream between transport endpoints. A connection is protocol state, not a dedicated physical circuit.',[
    topic('seq, ACK and ack','Here, seq means sequence number, ACK means the acknowledgment flag, and ack means acknowledgment number. Sequence numbers count bytes. When ACK=1, ack identifies the next expected sequence number. SYN and FIN each consume one number.'),
    topic('Three-way handshake','A sends SYN(seq=100), B replies SYN+ACK(seq=500, ack=101), and A replies ACK(seq=101, ack=501). Both establish state and synchronize sequence numbers. The third acknowledgment confirms to B that its SYN arrived.'),
    topic('Four-segment close','TCP closes each direction separately. A common sequence is FIN, ACK, FIN, ACK; an ACK and FIN may be combined. The active closer normally enters TIME-WAIT so old segments can expire and a retransmitted FIN can be acknowledged again.'),
    topic('Reliable delivery','TCP uses sequence numbers, acknowledgments, retransmission, ordering and duplicate suppression for reliable delivery. A failed connection can still prevent delivery, so applications must handle errors.'),
    topic('Flow and congestion control','Flow control limits sending according to receiver capacity; congestion control adjusts it to network conditions. Unacknowledged data is constrained by the receive window, congestion window and other limits.'),
    topic('Application message boundaries','TCP supplies a byte stream. Two send calls may be read together, and one send may require several reads. Applications must define message framing with lengths, delimiters or another format.')
  ],'Header ≥20 bytes','https://www.rfc-editor.org/rfc/rfc9293.html'),
  udp: protocol('UDP','User Datagram Protocol','Transfers datagrams without a TCP-style handshake. UDP itself guarantees neither delivery, order nor duplicate removal.',[
    topic('Four header fields','Source port, destination port, length and checksum are each 16 bits, giving an 8-byte header. The checksum detects errors; it does not correct them or retransmit data.'),
    topic('Message boundaries','UDP delivers separate datagrams. An undersized receive buffer may truncate a datagram, depending on the API; a full socket receive queue may discard an entire datagram.'),
    topic('Loss and reordering','Sending 1, 2, 3 may yield 3, 1 or no arrivals. UDP does not automatically resend 2; applications may add sequence numbers, acknowledgments and retransmission.'),
    topic('Performance and applications','UDP often carries DNS queries, real-time media and QUIC. Its short header does not determine overall performance; applications must consider congestion control, path MTU and fragmentation.')
  ],'8-byte header','https://www.rfc-editor.org/rfc/rfc768.html'),
  quic: protocol('QUIC','Secure transport over UDP','A UDP-based transport providing reliable streams, encryption and multiplexing, used by HTTP/3.',[
    topic('Reliable delivery','QUIC handles acknowledgments, loss detection, data retransmission and congestion control; UDP carries its datagrams. Retransmitted data uses a new packet number.'),
    topic('Multiple streams and migration','Each stream delivers data in its own order; a gap in one stream need not block delivery on another. Streams still share connection congestion control. Connection IDs support path migration when permitted.')
  ],'Transport over UDP','https://www.rfc-editor.org/rfc/rfc9000.html'),
  ipv4: protocol('IPv4','Addressing and forwarding across networks','Identifies interfaces with 32-bit addresses and forwards IP packets hop by hop through routers, providing best-effort service.',[
    topic('Addresses, prefixes and gateways','The host uses its routing table to determine whether a destination is directly reachable and which next hop to use. Traffic to other networks commonly goes through a gateway. Host A is 192.168.1.10/24 in this example.'),
    topic('Routing and TTL','Route lookup uses longest-prefix matching. A forwarding router decrements TTL by at least one; it discards a packet when TTL expires, preventing indefinite forwarding loops.'),
    topic('Fragmentation and MTU','When allowed, IPv4 fragmentation may occur at the source or routers; reassembly occurs at the destination. Fragmentation adds overhead, so modern transports usually try to avoid it using path MTU information.'),
    topic('Address translation','Ordinary forwarding preserves source and destination IP addresses. NAT changes addresses; NAPT also changes ports. This demonstration does not use address translation.')
  ],'32-bit addresses','https://www.rfc-editor.org/rfc/rfc791.html'),
  ipv6: protocol('IPv6','Internet Protocol with 128-bit addresses','Uses a larger address space, a 40-byte base header and extension headers.',[
    topic('Address notation','An address has eight colon-separated groups of 16-bit hexadecimal values. Leading zeros may be omitted, and one run of zero groups may be written as ::. An address may use :: only once. 2001:db8::1 is a documentation address.'),
    topic('Neighbor discovery','IPv6 uses ICMPv6-based Neighbor Discovery to resolve link addresses and discover routers, rather than IPv4 ARP.'),
    topic('Different fragmentation rules','IPv6 routers do not fragment. The source can use a Fragment extension header when needed. Hop Limit serves a role similar to IPv4 TTL.')
  ],'128-bit addresses','https://www.rfc-editor.org/rfc/rfc8200.html'),
  icmp: protocol('ICMP','Network errors and diagnostics','Reports some IP processing problems and supports diagnostics, including unreachable destinations, time exceeded and echo messages.',[
    topic('ping and traceroute','ping usually uses ICMP Echo Request/Reply. traceroute increases TTL/Hop Limit and observes time-exceeded messages to infer a path; its probe protocol may vary.'),
    topic('Limits of diagnostics','ICMP reports errors and supports diagnostics; it does not retransmit IP packets. Filtering may make ping fail. A successful echo reply does not prove that a TCP port or application is available.')
  ],'No TCP/UDP ports','https://www.rfc-editor.org/rfc/rfc792.html'),
  ospf: protocol('OSPF','Link-state routing protocol','Routers exchange topology information and compute paths to destination networks. This is a control-plane protocol.',[
    topic('Control versus forwarding','OSPF exchanges link-state information and computes routes. IP forwarding uses an existing forwarding table; it does not recalculate the whole topology for each packet.'),
    topic('OSPF and BGP','OSPFv2 runs directly over IP protocol 89. BGP also controls routing, but uses TCP port 179 and belongs to the TCP/IP application layer.')
  ],'IP protocol 89','https://www.rfc-editor.org/rfc/rfc2328.html'),
  ethernet: protocol('Ethernet','Ethernet frames and MAC addressing','Carries frames on Ethernet links. Ethernet standards cover both data link and physical functions.',[
    topic('Frame header and trailer','Common frames contain destination MAC, source MAC, EtherType, payload and FCS. FCS detects errors; it does not guarantee automatic Ethernet retransmission.'),
    topic('How switches learn','Layer-two switches learn interfaces from source MAC addresses and forward using destination MAC addresses. Unknown destinations may be flooded; broadcasts stay within the relevant broadcast domain.'),
    topic('Encapsulation at each hop','When A sends to B on another subnet, the first frame normally targets the gateway MAC. The router creates a new link header and trailer for the next link.')
  ],'MAC usually 48 bits'),
  wifi: protocol('Wi-Fi','Wireless LAN','Wi-Fi is based on IEEE 802.11, which covers wireless medium access, frame formats and physical transmission.',[
    topic('A shared wireless medium','CSMA/CA commonly coordinates access through sensing, backoff and acknowledgments. Wireless link acknowledgments differ from end-to-end TCP acknowledgments.'),
    topic('Address fields','Common 802.11 data frames contain three or four MAC address fields for receiver, transmitter, source and destination roles. Their meanings depend on frame type and direction.')
  ],'Link + physical'),
  arp: protocol('ARP','IPv4 next-hop address resolution','Resolves a next-hop IPv4 address to a link address on the local link, at the network/link-layer boundary.',[
    topic('Resolving the next hop','For a local destination, resolve its MAC. For a remote destination, normally resolve the gateway MAC. ARP broadcasts cannot cross a router to query a remote host.'),
    topic('Requests and caching','Ethernet ARP requests are usually broadcast and replies usually unicast. Cached mappings reduce queries. ARP is carried directly by the link, not inside a normal IP packet.')
  ],'Does not use TCP/UDP ports','https://www.rfc-editor.org/rfc/rfc826.html'),
  vlan: protocol('IEEE 802.1Q','Virtual LAN','VLANs divide Layer 2 broadcast domains. IEEE 802.1Q defines bridging mechanisms and VLAN tags; access-port frames are commonly untagged.',[
    topic('Broadcast domains and routing','Communication between VLANs usually needs layer-three forwarding. VLANs provide layer-two segmentation, not encryption.'),
    topic('Access ports and trunk links','An access port commonly connects a host to one VLAN. A trunk may carry several VLANs. Tagging depends on configuration; a native VLAN may use untagged frames.')
  ],'Layer-two segmentation'),
  phy: protocol('PHY','Physical transmission and encoding','Defines signals, electrical or optical properties, timing, modulation and coding so receivers can recover bits.',[
    topic('What is transmitted','The physical layer carries bits as signals. Higher layers interpret those bits as frames, packets and messages.'),
    topic('Rate, bandwidth and delay','Link rate is the number of bits transferable per unit time, not available end-to-end throughput. Propagation delay also depends on distance and medium.'),
    topic('Duplex modes','Full duplex supports simultaneous transmission in both directions; half duplex permits only one direction at a time. Modern switched Ethernet normally uses full duplex.')
  ],'Signals and bits'),
  medium: protocol('Transmission media','Copper, fiber and wireless','A medium affects signal propagation, reach, interference resistance and deployment. This entry describes its properties rather than a communication protocol.',[
    topic('Copper cable','Twisted pairs carry electrical signals; twisting reduces interference. Standards, cables and conditions constrain distance and rate.'),
    topic('Optical fiber','Carries light, suitable for long distances and high-capacity links. Compatible optical modules and link specifications are still required.'),
    topic('Wireless','Uses electromagnetic waves and is affected by frequency, obstacles, interference and shared access. Strong signals alone do not prevent interference or congestion from reducing throughput.')
  ],'Transmission medium')
};

export const OSI = [
  {
    id:'application',number:7,name:'Application layer',en:'Application',color:'#68bba5',
    question:'How do applications exchange messages?',unit:'Messages / application data',scope:'Application to application',
    definition:'The application layer provides network services and defines message formats, field meanings and interaction rules. HTTP, DNS and SMTP support web access, name lookup and mail delivery. Applications such as browsers communicate through these protocols.',
    analogy:'For example, an HTTP method and request target describe the requested operation, while the response status code reports its outcome.',
    features:[['Message semantics','Defines methods, resources, status codes and message fields.'],['Network services','Supports web access, name lookup, mail and remote access.'],['Using lower-layer services','Uses TCP, UDP or other transport mechanisms as needed.']],
    protocols:['http','dns','smtp','dhcp','ssh'],
    process:'The sender creates an HTTP request or DNS query; the receiver parses it and passes it to the service. TCP/IP applications and libraries also handle data representation and session management.',
    mistakes:[['Application layer and applications','A browser is an application; HTTP is an application-layer protocol it uses.'],['Application protocol transport','DNS supports UDP and TCP; HTTP/3 uses QUIC.']]
  },
  {
    id:'presentation',number:6,name:'Presentation layer',en:'Presentation',color:'#91bba2',
    question:'How do both ends interpret the same format?',unit:'Data',scope:'Data representation and conversion',
    definition:'The presentation layer coordinates data representation, including encoding, conversion, serialization, compression and encryption. TCP/IP applications and libraries commonly perform these functions without a separate Layer 6 module.',
    analogy:'For example, JSON specifies a text format for data structures, while UTF-8 specifies how text becomes bytes. Both ends must use compatible rules.',
    features:[['Encoding and serialization','Converts characters and data structures into transferable representations.'],['Compression and conversion','Converts formats or compresses data and restores it at the receiver.'],['Data protection','Where encryption is implemented depends on the protocol stack.']],
    protocols:['encoding','json','tls'],
    process:'The demonstration shows representation as a separate function without adding a fixed header. Specific protocols such as TLS have their own message structures.',
    mistakes:[['Formats and protocols','JSON is a data format and UTF-8 a character encoding; both illustrate presentation functions.'],['TLS as a functional example','TLS commonly sits between an application protocol and TCP; the OSI view places it under data protection functions.']]
  },
  {
    id:'session',number:5,name:'Session layer',en:'Session',color:'#b4bd8b',
    question:'How is a continuing interaction managed?',unit:'Data',scope:'Dialogue management',
    definition:'The OSI session layer organizes sessions, coordinates dialogue and supplies synchronization points for recovery. Internet applications and protocols usually share these functions; capabilities depend on the implementation.',
    analogy:'For example, an application may record progress and checkpoints, then resume from an agreed position after disconnection.',
    features:[['Session lifecycle','Establishes, manages and ends sessions.'],['Dialogue and synchronization','Coordinates interactions and synchronization points as needed.'],['Recovery mechanisms','Recovers interrupted interactions according to protocol and application design.']],
    protocols:['rpc','session'],
    process:'The demonstration shows session management as a separate function without a fixed header. HTTP login session management belongs to the TCP/IP application layer.',
    mistakes:[['Login sessions and TCP connections','One login session may span multiple TCP connections.'],['Function and implementation','The OSI session layer describes functions; an Internet application need not have a separate session component.']]
  },
  {
    id:'transport',number:4,name:'Transport layer',en:'Transport',color:'#a4a6d0',
    question:'Which endpoint receives data, and how?',unit:'TCP segment / UDP datagram',scope:'End to end / transport endpoints',
    definition:'The transport layer supplies communication between host transport endpoints, using ports for multiplexing and demultiplexing. TCP provides reliable ordered streams; UDP delivers datagrams without guarantees of arrival, order or duplicate suppression.',
    analogy:'For example, IP brings a packet to a host, then TCP or UDP uses ports and connection information to deliver data to a socket.',
    features:[['Ports and demultiplexing','Ports are 16-bit integers. TCP and UDP have separate port spaces.'],['Delivery services','Reliability, ordering and message boundaries depend on the selected protocol.'],['Connections and control','TCP maintains connection state and performs flow and congestion control.']],
    protocols:['tcp','udp','quic'],
    process:'The HTTP example adds a TCP header with source port 53000 and destination port 80. The DNS example adds UDP with destination port 53. The receiver processes the header and delivers data to the endpoint.',
    mistakes:[['TCP message boundaries','Applications identify stream messages using lengths, delimiters or protocol formats.'],['UDP performance','Performance depends on the network, application and higher-layer implementation, not just header size.'],['Reliable transport and encryption','TCP provides reliable streams; protecting their contents requires a mechanism such as TLS.']]
  },
  {
    id:'network',number:3,name:'Network layer',en:'Network',color:'#81b7cc',
    question:'How does a packet choose its next hop across networks?',unit:'IP packets',scope:'Host to host / routing',
    definition:'The network layer uses logical addresses for inter-network addressing and forwarding. Here routers use IP routing information to select next hops. IP is best effort and does not guarantee arrival, ordering or duplicate suppression.',
    analogy:'For example, A sends a packet for B on another subnet to its local gateway, which forwards it toward the destination network.',
    features:[['Logical addressing','IPv4 addresses are 32 bits; IPv6 addresses are 128 bits.'],['Routing and forwarding','Looks up the longest matching prefix to select a next hop and outgoing interface.'],['Limiting forwarding hops','TTL or Hop Limit limits how many more hops a packet can traverse.']],
    protocols:['ipv4','ipv6','icmp','ospf'],
    process:'A is 192.168.1.10/24 and B is 192.168.2.20/24, with a router connecting both subnets. Without NAT, source and destination IP addresses remain unchanged while TTL drops from 64 to 63.',
    mistakes:[['IP addresses and MAC addresses','IP addresses identify destinations across networks; MAC addresses support frame delivery on a link.'],['What IP routing uses','Ordinary forwarding looks up the destination IP route, then encapsulates the packet for its next link.']]
  },
  {
    id:'datalink',number:2,name:'Data-link layer',en:'Data Link',color:'#75b8b9',
    question:'How is a frame delivered on this link?',unit:'Frame',scope:'One link / layer-two network',
    definition:'The data link layer handles framing, link addressing, medium access and error detection. Ethernet uses MAC addresses for delivery; acknowledgment and retransmission capabilities vary between link protocols.',
    analogy:'For example, a first-hop frame targets the gateway. The router extracts the IP packet and builds a new frame for the next link.',
    features:[['Framing and addressing','Adds the header and trailer required by the current link.'],['Medium access','Coordinates transmissions on shared media.'],['Error detection','FCS and similar mechanisms detect errors; the link protocol determines how they are handled.']],
    protocols:['ethernet','wifi','arp','vlan'],
    process:'The first hop uses A → left router interface, and the second uses right router interface → B. The router creates a new header and trailer for the next link.',
    mistakes:[['Next-hop MAC address','The first hop to another subnet normally targets the local gateway MAC, not the remote server MAC.'],['Switch capabilities','A Layer 2 switch forwards by MAC; a Layer 3 switch can also route IP.']]
  },
  {
    id:'physical',number:1,name:'Physical layer',en:'Physical',color:'#a6b4c2',
    question:'How do signals carry bits?',unit:'Bits / signals',scope:'Transmission medium',
    definition:'The physical layer specifies interfaces, coding, modulation and timing for carrying bits as electrical, optical or radio signals. The receiver recovers bits using the same specification; higher layers interpret frames, addresses and application messages.',
    analogy:'For example, the same frame may travel as electrical signals on copper or optical signals in fiber.',
    features:[['Signals and media','Carries signals through copper, fiber or wireless media.'],['Encoding and synchronization','Generates signals and recovers bits according to the link specification.'],['Interfaces and rates','Specifies interfaces, electrical or optical characteristics, and transmission rates.']],
    protocols:['phy','medium'],
    process:'The first link encodes a frame as signals. After receiving and processing it, the router sends on the second link. Logical communication at every layer relies on these physical links.',
    mistakes:[['Rate and throughput','Protocol overhead, congestion and endpoint capacity affect end-to-end throughput.'],['Signal processing and packet headers','The physical layer handles signal transmission and coding. Training sequences and synchronization information may add physical overhead.']]
  }
];

export const TCPIP = [
  {
    ...OSI[0],id:'tcp-application',number:4,en:'Application',
    definition:'The TCP/IP application layer defines application protocols. Applications and libraries also handle representation, sessions and communication protection. These functions roughly correspond to OSI application, presentation and session functions; the models organize functions differently.',
    scope:'Application protocols and related mechanisms',protocols:['http','dns','smtp','dhcp','ssh','tls','json'],
    process:'Applications create messages, perform encoding and session handling, then use transport services. The OSI/TCP-IP correspondence compares functions; the models are not merely different layer counts for the same system.',
    mistakes:[['Model names','TCP/IP is the Internet protocol suite; TCP and UDP both belong to its transport layer.'],['Model correspondence','OSI upper-layer functions roughly correspond to the TCP/IP application layer. A protocol implementation may span several functions.']]
  },
  {...OSI[3],id:'tcp-transport',number:3},
  {...OSI[4],id:'internet',number:2,name:'Internet layer',en:'Internet'},
  {
    ...OSI[5],id:'interface',number:1,name:'Network interface layer',en:'Network Interface',
    unit:'Frames / bits',scope:'Link and physical transmission',
    definition:'The network interface layer sends and receives IP packets over a network, including framing, link addressing, medium access and signal transmission. It roughly corresponds to OSI data link and physical functions; each link may use different technology.',
    question:'How is data encapsulated and transmitted on this hop?',
    analogy:'For example, Ethernet encapsulates an IP packet as a frame and sends it over copper or fiber using the appropriate physical specification.',
    features:[['Frames and link addresses','Encapsulates an IP packet and identifies the receiver on the current link.'],['Encoding and media','Generates signals and transmits them over wired or wireless media.'],['Hop-by-hop delivery','Each link handles its own encapsulation, transmission and reception.']],
    protocols:['ethernet','wifi','arp','vlan','phy','medium'],
    process:'The A-to-router and router-to-B links each handle framing and physical transmission. The router creates a new link frame. No NAT is used, so IP source and destination addresses remain unchanged.'
  }
];

export const LABS = {
 handshake:{title:'TCP three-way handshake',subtitle:'Synchronize sequence numbers · Establish connection state',footnote:'A actively opens the connection without application data. Each step shows states after the receiver processes the segment. SYN consumes one sequence number; a pure ACK consumes none.',steps:[
  {title:'A → B: Send SYN',description:'A chooses initial sequence number 100 and requests a connection, entering SYN-SENT. B receives SYN, enters SYN-RECEIVED and prepares a reply.',direction:1,wire:'SYN=1  ACK=0\nseq=100',states:['SYN-SENT','SYN-RECEIVED'],tag:'SYN · seq 100'},
  {title:'B → A: Reply SYN + ACK',description:'B acknowledges the SYN from A with ack=101 and chooses initial sequence number 500. A enters ESTABLISHED and sends an acknowledgment; B stays in SYN-RECEIVED until that acknowledgment arrives.',direction:-1,wire:'SYN=1  ACK=1\nseq=500  ack=101',states:['ESTABLISHED','SYN-RECEIVED'],tag:'SYN+ACK · ack 101'},
  {title:'A → B: Acknowledge B SYN',description:'A acknowledges with 501 because the SYN from B consumed sequence number 500. B receives the ACK and enters ESTABLISHED, completing the handshake.',direction:1,wire:'SYN=0  ACK=1\nseq=101  ack=501',states:['ESTABLISHED','ESTABLISHED'],tag:'ACK · ack 501'}
 ]},
 close:{title:'TCP four-segment close',subtitle:'Close each direction separately · Half-close supported',footnote:'Both peers start in ESTABLISHED and send no extra data during closing. Each step shows processing and any required reply; resulting ACKs are displayed separately. Actual ACK and FIN segments may be combined.',steps:[
  {title:'A → B: close the sending direction of A',description:'A sends FIN(seq=1000) and enters FIN-WAIT-1; B receives it and enters CLOSE-WAIT. A can still receive, and the application on B can still send.',direction:1,wire:'FIN=1  ACK=1\nseq=1000  ack=2000',states:['FIN-WAIT-1','CLOSE-WAIT'],tag:'FIN · seq 1000'},
  {title:'B → A: Acknowledge A FIN',description:'B enters CLOSE-WAIT and replies ack=1001. A enters FIN-WAIT-2; B may continue sending remaining data.',direction:-1,wire:'ACK=1\nseq=2000  ack=1001',states:['FIN-WAIT-2','CLOSE-WAIT'],tag:'ACK · ack 1001'},
  {title:'B → A: close the sending direction of B',description:'B sends FIN(seq=2000) and enters LAST-ACK. A receives it, sends an acknowledgment and enters TIME-WAIT; the next step shows that ACK. With no extra data, the sequence number from B remains 2000.',direction:-1,wire:'FIN=1  ACK=1\nseq=2000  ack=1001',states:['TIME-WAIT','LAST-ACK'],tag:'FIN · seq 2000'},
  {title:'A → B: acknowledge the FIN from B',description:'A acknowledges with 2001; B receives the ACK and enters CLOSED. A stays in TIME-WAIT for 2MSL so old segments expire. If the final ACK is lost, A can acknowledge a retransmitted FIN from B.',direction:1,wire:'ACK=1\nseq=1001  ack=2001',states:['TIME-WAIT','CLOSED'],tag:'ACK · ack 2001'}
 ]},
 udp:{title:'UDP datagram transfer',subtitle:'Preserve message boundaries · No delivery or ordering guarantee',footnote:'This example delays datagram 1, drops datagram 2 and delivers datagram 3 first to illustrate UDP behavior. Actual loss and reordering depend on the network.',steps:[
  {title:'A sends datagram ①',description:'The application submits an independent datagram without a TCP-style handshake. It is delayed in this example. Numbering is application-defined; the UDP header has no sequence number.',direction:1,wire:'UDP 53000 → 9000\nApplication ID=1  Content=HELLO',states:['No TCP connection state','Waiting for a datagram'],tag:'Datagram ① · delayed',delay:true},
  {title:'Datagram ② is lost on the link',description:'The second datagram is deliberately discarded. UDP does not automatically acknowledge or retransmit it; the receiver may never know it existed.',direction:1,wire:'UDP 53000 → 9000\nApplication ID=2  Content=NETWORK',states:['No automatic retransmission','Not received yet'],tag:'Datagram ② · lost',drop:true},
  {title:'B receives datagram ③ first',description:'The third datagram arrives first, so the application can read ID 3 first. UDP does not sort datagrams into 1, 2, 3; message boundaries remain intact.',direction:1,wire:'UDP 53000 → 9000\nApplication ID=3  Content=WORLD',states:['Sending continues','Received: ③'],tag:'Datagram ③ · arrived'},
  {title:'B receives delayed datagram ①',description:'The final receive order is ③ then ①; ② never arrives. Applications needing reliable ordered delivery must add those mechanisms over UDP or choose a transport that provides them.',direction:1,wire:'Arrival order: ③ → ①\nMissing: ②; no automatic UDP retransmission',states:['Sending complete','Received: ③, ①'],tag:'Datagram ① · arrived'}
 ]}
};
