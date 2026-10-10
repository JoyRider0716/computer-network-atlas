# Teaching content and coverage

A 3D learning website for computer networks, organized as layer → definition → diagram and steps → mechanisms and fields → relationships. Protocol pages connect to the 3D scene; deeper lessons, fields, calculators and troubleshooting remain available in both Chinese and English.

## Illustrated catalogue

| OSI functional placement | Entries | Typical diagrams |
| --- | --- | --- |
| Application | HTTP, DNS, SMTP, DHCPv4, SSH, FTP, IMAP, POP3, WebSocket, BGP | Requests, resolution, mail relay, DORA, remote authentication, separate file connections, routing control |
| Presentation | TLS 1.3, UTF-8, JSON | Secure handshake, encoding, serialization and parsing |
| Session | RPC, application sessions | Request correlation, execution and login state |
| Transport | TCP, UDP, QUIC | Cumulative ACK, recovery, loss and secure streams |
| Network | IPv4, IPv6, ICMP, OSPF, ICMPv6/NDP, IPsec | Forwarding, MTU feedback, echo, link-state computation, neighbors and ESP tunnels |
| Data link | Ethernet, Wi-Fi, ARP, 802.1Q VLAN, STP/RSTP, PPP | MAC learning, wireless access, next-hop resolution, tags, loop prevention and negotiation |
| Physical | PHY, media and delay | Coding/modulation, synchronization, transmission and propagation |

There are 32 entries and 133 selectable steps. Each also has a navigable relationship diagram for transport, format or functional cooperation. Types distinguish protocols, families, formats, mechanisms, link technologies and physical standards.

The TCP/IP application catalogue combines OSI application, presentation and session functions; network access combines link and physical functions. There is no separate model-comparison screen.

## Classification and diagram boundaries

- OSI is a reference model, not an exact map of modern protocols. TLS illustrates presentation; RPC and login illustrate sessions. TCP/IP groups these under application-related functions.
- BGP is a TCP-carried application control protocol serving routing. OSPFv2 runs directly over IP protocol 89.
- ARP lies between IPv4 addressing and local delivery and appears under link functions. IPv6 uses ICMPv6-based NDP.
- UTF-8, JSON, sessions, PHY and media are different kinds of entries.
- Diagrams are teaching sequences rather than measured sizes or timing. Notes describe omissions and branches.
- HTTP/3 uses QUIC over UDP with an integrated TLS 1.3 handshake, not traditional TLS records stacked directly on UDP.
- Common entries are not an exhaustive protocol catalogue. Complete behavior requires standards, implementations and configuration.

## Further learning

29 lessons, eight troubleshooting cases and five calculators cover CIDR, TCP acknowledgment, transmission/propagation and BDP, simplified MSS, and IPv4 fragmentation. TCP, UDP, IPv4 and Ethernet fields are selectable.

Pages state assumptions: contiguous reception for ACK, no extra encapsulation for simplified MSS, no queuing/processing for delay, and permitted IPv4 fragmentation. UDP loss/reordering is deterministic teaching material. There are no quizzes or interview questions.

Principal references include RFC 1122, 9293, 768, 9000, 9110, 9114, 8446, 791, 8200, 4861, 2328, 4271 and 4301, plus relevant IEEE 802.1/802.11 standards. Explanations and diagrams are original summaries.
