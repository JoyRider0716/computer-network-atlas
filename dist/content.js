// 各层说明、协议简介和传输实验数据。
const protocol = (name, title, brief, topics, meta = '', source = '') => ({name,title,brief,topics,meta,source});
const topic = (title, text) => ({title,text});
export const PROTOCOLS = {
  http: protocol('HTTP','超文本传输协议','客户端发送请求，服务器返回响应。HTTP规定请求方法、状态码、字段语义和消息格式。',[
    topic('请求与响应','请求包括方法、目标资源与头字段，可能带消息体。响应包括状态码、头字段和可选消息体。GET通常读取资源，POST通常提交数据。'),
    topic('状态码','2xx表示成功，3xx用于重定向或复用缓存结果，4xx表示客户端请求错误，5xx表示服务器错误。404表示资源未找到，500表示服务器内部错误。'),
    topic('版本与承载','HTTP/1.1和HTTP/2通常使用TCP；HTTP/3使用基于UDP的QUIC。HTTPS通过TLS保护HTTP通信，HTTP/3的TLS机制集成在QUIC中。'),
    topic('无状态与登录','HTTP语义本身不要求服务器记住此前请求。应用可用Cookie、会话标识等管理登录状态；一个登录会话可以跨多个TCP连接。')
  ],'默认端口 HTTP 80 / HTTPS 443','https://www.rfc-editor.org/rfc/rfc9110.html'),
  dns: protocol('DNS','域名系统','查询名称对应的资源记录。A和AAAA记录提供IP地址，其他类型还可提供邮件服务器、别名等信息。',[
    topic('递归与迭代','客户端通常向递归解析器查询。解析器使用缓存，或通过迭代查询根、顶级域和相应域名的权威服务器取得答案。'),
    topic('常见记录','A对应IPv4地址，AAAA对应IPv6地址，CNAME表示别名，MX用于邮件路由。TTL控制记录在缓存中可保留多久。'),
    topic('传输方式','传统DNS使用UDP或TCP的53端口。UDP响应被截断时，客户端通常改用TCP重试；完整区域传送使用TCP。DoT（DNS over TLS）和DoH（DNS over HTTPS）提供加密传输。')
  ],'UDP / TCP 53','https://www.rfc-editor.org/rfc/rfc1035.html'),
  smtp: protocol('SMTP','简单邮件传输协议','在邮件客户端与邮件服务器，以及邮件服务器之间提交和转发邮件。',[
    topic('发送和收取','SMTP负责提交和转发邮件；IMAP和POP3供客户端访问或获取服务器中的邮件。'),
    topic('端口与安全','服务器间转发通常使用TCP 25；客户端提交常见587，隐式TLS提交常见465。是否加密取决于具体配置和协商。')
  ],'TCP 25 / 587 / 465','https://www.rfc-editor.org/rfc/rfc5321.html'),
  dhcp: protocol('DHCP','动态主机配置协议','DHCPv4可为主机提供IP地址、掩码、默认网关、DNS等配置。',[
    topic('首次获取租约','典型流程是DHCPDISCOVER（发现）、DHCPOFFER（提供）、DHCPREQUEST（请求）、DHCPACK（确认），简称DORA。客户端此时尚无可用地址，流程中会使用广播。'),
    topic('续租与IPv6','客户端需要在租约到期前续租，续租不必重复完整DORA流程。DHCPv6使用UDP 546（客户端）和547（服务器）；IPv6也可用SLAAC配置地址，默认路由通常来自路由器通告。')
  ],'UDP 67（服务器）/ 68（客户端）','https://www.rfc-editor.org/rfc/rfc2131.html'),
  ssh: protocol('SSH','安全外壳协议','提供加密的远程登录、命令执行与相关通道。',[
    topic('认证与加密','通常先协商密钥并验证服务器身份，再进行用户认证。服务器主机密钥与用户公钥承担不同作用。'),
    topic('逻辑通道','一个SSH连接可以承载多个逻辑通道，例如终端、SFTP文件传输和端口转发。')
  ],'TCP 22','https://www.rfc-editor.org/rfc/rfc4251.html'),
  tls: protocol('TLS','传输层安全协议','为通信提供机密性、完整性保护和身份认证。OSI视图按其数据保护功能展示在表示层；TLS的名称不表示它属于OSI传输层。',[
    topic('握手','双方协商参数、建立密钥并完成身份认证。使用证书时，客户端通常验证服务器证书和目标主机名；某些场景还需要认证客户端。'),
    topic('HTTPS的关系','常见HTTPS栈为HTTP → TLS → TCP → IP。QUIC集成TLS 1.3握手机制，其结构不同于把TLS记录直接放在TCP上。'),
    topic('与TCP的分工','TCP提供可靠字节流，TLS保护通信内容。证书校验失败和TCP连接失败需要分别排查。')
  ],'功能对应','https://www.rfc-editor.org/rfc/rfc8446.html'),
  encoding: protocol('UTF-8','字符编码','将字符转换为字节，接收方按照相同编码规则解释字节。属于表示功能，不是网络传输协议。',[
    topic('编码不一致','接收方用不同于发送方的字符编码解释字节，可能出现乱码。协议应规定编码，或在消息中明确标示编码。'),
    topic('字符与字节','UTF-8用1至4个字节编码一个Unicode码点。用户看到的一个字符也可能由多个码点组成，因此字符数、码点数和字节数可能不同。')
  ],'数据表示','https://www.rfc-editor.org/rfc/rfc3629.html'),
  json: protocol('JSON','数据序列化格式','用文本表达对象、数组、数值等结构，使不同语言的程序交换数据。JSON本身不是传输协议。',[
    topic('序列化与反序列化','序列化把数据结构转换为规定格式；JSON生成文本，再按字符编码转为字节。反序列化按格式恢复数据，字段含义由应用约定。'),
    topic('格式与传输分工','JSON可以由HTTP、WebSocket等协议承载；使用JSON并不会自动解决TCP字节流的消息边界问题。')
  ],'数据格式','https://www.rfc-editor.org/rfc/rfc8259.html'),
  rpc: protocol('RPC','远程过程调用','让程序以类似函数调用的方式请求远端执行操作。会话管理相关功能常由具体RPC系统承担。',[
    topic('请求关联与状态','调用标识可把响应与请求对应起来。超时后不能仅凭“没收到响应”判断远端是否执行，需要考虑幂等性与重试。'),
    topic('分层归属','RPC在TCP/IP中通常属于应用层。OSI视图用它说明请求关联等会话功能，具体RPC系统还包含其他层的功能。')
  ],'会话功能示例','https://www.rfc-editor.org/rfc/rfc5531.html'),
  session: protocol('Session','应用会话管理','在多次请求之间保留或识别交互状态，例如登录状态和协作任务。这是一类机制，没有名为Session的统一网络协议。',[
    topic('会话与连接','OSI会话层、网站登录会话和TCP连接是不同概念。一次登录会话可以跨多个连接，一个连接也可以承载多次请求。'),
    topic('同步与恢复','应用可通过检查点、任务标识等记录进度，以便中断后恢复。TCP提供可靠传输，应用仍需自行设计恢复机制。')
  ],'机制示例'),
  tcp: protocol('TCP','传输控制协议','建立连接后，在两个传输端点之间提供可靠、有序的字节流服务。连接是一组状态，不是专用物理线路。',[
    topic('seq、ACK与ack','本项目用seq表示序列号，ACK表示确认标志位，ack表示确认号。序列号按字节计数；ACK=1时，确认号指出接收方期望的下一个字节序号。SYN和FIN各消耗一个序号。'),
    topic('三次握手','A发送SYN(seq=100)，B回复SYN+ACK(seq=500, ack=101)，A回复ACK(seq=101, ack=501)。双方建立连接状态并同步序号；第三次确认让B确认自己的SYN已被收到。'),
    topic('四次挥手','TCP两个方向分别关闭。典型流程为FIN、ACK、FIN、ACK；某些情况下ACK与FIN可以合并。主动关闭一方通常进入TIME-WAIT，等待旧报文消失，并在收到重传的FIN时再次确认。'),
    topic('可靠传输','TCP通过序列号、确认、重传、排序和去重提供可靠交付。连接故障仍可能导致传输失败，应用需要处理错误。'),
    topic('流量与拥塞控制','流量控制按接收方可用缓冲空间限制发送量；拥塞控制按网络状况调整发送量。未确认的数据量同时受接收窗口和拥塞窗口等限制。'),
    topic('应用消息边界','TCP提供字节流。两次send的内容可能被一次read读到，一次send的内容也可能需要多次read读取，俗称“粘包”和“拆包”。应用应规定长度字段、分隔符或其他消息格式。')
  ],'首部≥20字节','https://www.rfc-editor.org/rfc/rfc9293.html'),
  udp: protocol('UDP','用户数据报协议','无需TCP式握手，以数据报为单位传输；协议自身不保证送达、顺序或去重。',[
    topic('首部四字段','源端口、目的端口、长度、校验和，各占16位，总首部8字节。UDP校验和用于差错检测，不提供纠错或重传。'),
    topic('消息边界','UDP按独立数据报交付。一次接收调用提供的缓冲区太小时，数据报可能被截断，具体行为取决于API；套接字接收队列满时，还可能丢弃整份数据报。'),
    topic('丢失与乱序','发送1、2、3可能收到3、1，或完全没有收到。UDP自身不会自动补发2，应用可以自己增加序号、确认和重传。'),
    topic('性能与应用','UDP常承载DNS查询、实时媒体和QUIC。首部较小，但实际性能还受网络状况和应用设计影响；应用需考虑拥塞控制、路径MTU和分片。')
  ],'首部8字节','https://www.rfc-editor.org/rfc/rfc768.html'),
  quic: protocol('QUIC','基于UDP的安全传输','使用UDP承载，提供可靠字节流、加密和多流复用，是HTTP/3使用的传输协议。',[
    topic('可靠传输','QUIC负责确认、丢失检测、数据重传和拥塞控制，UDP只负责承载数据报。QUIC重传丢失的数据，使用新的分组号发送。'),
    topic('多流与迁移','各流按自身顺序交付数据，一条流缺失数据不要求其他流等待它重传。各流仍共享连接的拥塞控制；连接ID在满足条件时支持路径迁移。')
  ],'UDP之上的传输','https://www.rfc-editor.org/rfc/rfc9000.html'),
  ipv4: protocol('IPv4','跨网络寻址与转发','以32位地址标识接口，通过路由器逐跳转发IP分组，提供尽力而为服务。',[
    topic('地址、前缀与网关','主机根据路由表确定目的地址是否可以直接到达，以及应选择哪个下一跳。发往其他网络的分组通常交给网关。示例主机A为192.168.1.10/24。'),
    topic('路由与TTL','路由查找按最长前缀匹配选择路由。路由器转发时将TTL至少减1；TTL耗尽则丢弃分组，防止分组在转发环路中无限循环。'),
    topic('分片与MTU','IPv4在允许分片时可由源端或路由器分片，重组在目的端进行。分片增加开销，现代传输通常尽量依据路径MTU避免它。'),
    topic('地址转换','普通IP转发保留源地址和目的地址；NAT改写地址，NAPT还改写端口。本演示不包含地址转换。')
  ],'32位地址','https://www.rfc-editor.org/rfc/rfc791.html'),
  ipv6: protocol('IPv6','128位地址的网际协议','使用更大的地址空间、40字节基本首部和扩展首部机制。',[
    topic('地址写法','地址分为8组16位十六进制数，以冒号分隔。各组前导零可以省略，一段连续的全零组可缩写为::，且一个地址中最多使用一次。2001:db8::1是文档示例地址。'),
    topic('邻居发现','IPv6使用基于ICMPv6的邻居发现获得邻居链路地址、发现路由器等，不使用IPv4的ARP。'),
    topic('与IPv4不同的分片','IPv6路由器不执行分片；需要时由源端使用分片扩展首部。Hop Limit承担类似IPv4 TTL的跳数限制作用。')
  ],'128位地址','https://www.rfc-editor.org/rfc/rfc8200.html'),
  icmp: protocol('ICMP','网络差错与诊断','用于报告某些IP处理问题并支持诊断，例如不可达、超时与回显。',[
    topic('ping与traceroute','ping通常使用ICMP回显请求与应答；traceroute利用逐步增加TTL/Hop Limit与超时报文推断路径，具体探测协议可以不同。'),
    topic('诊断的范围','ICMP提供差错报告和诊断，不负责重传IP分组。ping失败可能源于过滤策略；ping成功只能说明回显探测得到应答，目标TCP端口和应用仍可能无法访问。')
  ],'没有TCP/UDP端口','https://www.rfc-editor.org/rfc/rfc792.html'),
  ospf: protocol('OSPF','链路状态路由协议','路由器交换拓扑信息，计算到目的网络的路径。它是控制平面的协议。',[
    topic('控制与转发','OSPF交换链路状态信息并计算路径，用于生成路由。IP转发查询已有的转发表，逐个分组的转发不需要重新计算整个网络的路径。'),
    topic('OSPF与BGP','OSPFv2直接由IP承载，协议号为89。BGP也用于路由控制，但使用TCP 179端口，在TCP/IP模型中属于应用层。')
  ],'IP协议号89','https://www.rfc-editor.org/rfc/rfc2328.html'),
  ethernet: protocol('Ethernet','以太网帧与MAC寻址','在以太网链路上传送帧。以太网标准涵盖数据链路层和物理层。',[
    topic('帧头与帧尾','常见帧包括目的MAC、源MAC、EtherType、载荷和FCS。FCS检测帧错误，不代表以太网一定会自动重传。'),
    topic('交换机如何学习','二层交换机根据源MAC学习接口位置，根据目的MAC转发。目的未知时可能泛洪；广播帧也在对应广播域内传播。'),
    topic('逐跳封装','A向其他网段的B发送分组时，第一跳帧的目的MAC通常是网关的MAC。路由器转发IP分组时，为下一条链路重新生成帧头和帧尾。')
  ],'MAC通常48位'),
  wifi: protocol('Wi-Fi','无线局域网','Wi-Fi基于IEEE 802.11标准，涉及无线介质访问、帧格式和物理传输。',[
    topic('共享无线介质','常采用CSMA/CA协调访问，包括侦听、退避和确认等机制。无线链路确认不同于TCP端到端确认。'),
    topic('地址字段','常见802.11数据帧包含3或4个MAC地址字段，分别承担接收、发送、源、目的等角色，具体含义取决于帧类型和传输方向。')
  ],'链路+物理'),
  arp: protocol('ARP','IPv4下一跳地址解析','在本地链路上把下一跳IPv4地址解析为链路地址；处于网络层与链路层的边界。',[
    topic('查询下一跳','目的主机在本地链路上时，查询目的主机的MAC；目的主机位于其他网段时，通常查询网关的MAC。ARP广播不能跨路由器查询远端主机。'),
    topic('请求与缓存','以太网中ARP请求通常广播，应答通常单播；主机缓存映射以减少查询。ARP由链路直接承载，不装在普通IP分组里面。')
  ],'不使用TCP/UDP端口','https://www.rfc-editor.org/rfc/rfc826.html'),
  vlan: protocol('IEEE 802.1Q','虚拟局域网','VLAN划分二层广播域；IEEE 802.1Q规定相关桥接机制和VLAN标签格式。接入口上的帧通常不带标签。',[
    topic('广播域与路由','不同VLAN通常需要三层转发才能互通。VLAN是二层分段机制，不等于加密。'),
    topic('接入口与干道链路','Access端口通常把终端接入一个VLAN；Trunk链路可承载多个VLAN。帧是否携带标签取决于端口配置，例如原生VLAN可能使用无标签帧。')
  ],'二层分段'),
  phy: protocol('PHY','物理传输与编码','规定信号、电气或光学特性、时序、调制和编码，使接收端恢复比特。',[
    topic('传输对象','物理层通过信号传送比特，上层协议负责解释这些比特组成的帧、分组和消息。'),
    topic('速率、带宽与时延','链路速率表示单位时间可传送的比特数量，不等于端到端可用吞吐量。传播时延还与距离和介质有关。'),
    topic('双工方式','全双工支持两个方向同时通信；半双工在同一时刻只允许一个方向发送。现代交换式以太网通常使用全双工。')
  ],'信号与比特'),
  medium: protocol('Transmission media','网线、光纤与无线','传输介质影响信号传播方式、传输距离、抗干扰能力和部署条件。这里介绍介质特性，而非通信协议。',[
    topic('铜缆','双绞线用电信号传输，绞合结构帮助抑制干扰；距离和速率受标准、线缆与环境影响。'),
    topic('光纤','以光传输，适合长距离和较高容量链路；仍需匹配相应光模块和链路规范。'),
    topic('无线','以电磁波传播，受到频段、障碍物、干扰和介质共享的影响。即使信号较强，干扰或拥塞仍可能降低吞吐量。')
  ],'传输介质')
};

export const OSI = [
  {
    id:'application',number:7,name:'应用层',en:'Application',color:'#68bba5',
    question:'应用之间如何交换消息？',unit:'消息 / 应用数据',scope:'应用到应用',
    definition:'应用层为应用提供网络服务，规定消息格式、字段含义和交互规则。HTTP、DNS、SMTP分别支持网页访问、域名查询和邮件传递。浏览器等应用程序通过这些协议通信。',
    analogy:'例如，HTTP请求中的方法和目标资源告诉服务器要执行什么操作，响应状态码说明处理结果。',
    features:[['消息语义','规定请求方法、资源、状态码和消息字段。'],['网络服务','支持网页访问、域名查询、邮件和远程访问。'],['使用下层服务','根据需要使用TCP、UDP或其他传输机制。']],
    protocols:['http','dns','smtp','dhcp','ssh'],
    process:'发送端生成HTTP请求或DNS查询，接收端解析消息并交给对应服务。TCP/IP系统中的应用协议和库还承担数据表示、会话管理等功能。',
    mistakes:[['应用层与应用程序','浏览器是应用程序，HTTP是它使用的应用层协议。'],['应用协议的传输方式','DNS支持UDP和TCP；HTTP/3使用QUIC。']]
  },
  {
    id:'presentation',number:6,name:'表示层',en:'Presentation',color:'#91bba2',
    question:'双方如何按相同格式解释数据？',unit:'数据',scope:'数据表示与转换',
    definition:'表示层协调通信双方的数据表示，包括编码、格式转换、序列化、压缩和加密。在TCP/IP系统中，这些功能通常由应用协议或库完成，无须实现为独立的第六层模块。',
    analogy:'例如，JSON规定数据结构的文本格式，UTF-8规定文本怎样编码为字节；双方需要采用一致的规则。',
    features:[['编码与序列化','把字符和数据结构转换为可传输的表示形式。'],['压缩与转换','按约定转换格式，或压缩数据并在接收端恢复。'],['数据保护','加密等功能的实现位置取决于具体协议栈。']],
    protocols:['encoding','json','tls'],
    process:'本演示将数据表示处理单列为一个功能阶段，没有为它添加固定首部。TLS等具体协议有自身的报文结构。',
    mistakes:[['格式与协议','JSON是数据格式，UTF-8是字符编码，二者可用于说明表示层功能。'],['TLS的功能对应','TLS常运行在应用协议与TCP之间；OSI视图按其数据保护功能展示。']]
  },
  {
    id:'session',number:5,name:'会话层',en:'Session',color:'#b4bd8b',
    question:'一次持续的交互如何管理？',unit:'数据',scope:'对话管理',
    definition:'OSI会话层组织通信会话、协调对话，并提供同步点等机制以支持恢复。在实际互联网系统中，相关功能通常分布在应用协议和程序中，具体能力取决于实现。',
    analogy:'例如，应用可以记录任务进度和检查点，连接中断后从双方确认的位置继续。',
    features:[['会话生命周期','建立、管理和结束会话。'],['对话与同步','协调交互，并按需要设置同步点。'],['恢复机制','根据协议和应用设计恢复中断的交互。']],
    protocols:['rpc','session'],
    process:'本演示将会话管理单列为一个功能阶段，没有为它添加固定首部。HTTP应用的登录会话管理，在TCP/IP中属于应用层功能。',
    mistakes:[['登录会话与TCP连接','一次登录会话可能跨多条TCP连接。'],['功能与实现','OSI会话层描述功能，互联网应用不一定有独立的会话层组件。']]
  },
  {
    id:'transport',number:4,name:'传输层',en:'Transport',color:'#a4a6d0',
    question:'数据交给哪个端点，如何交付？',unit:'TCP报文段 / UDP数据报',scope:'端到端 / 传输端点',
    definition:'传输层在主机上的传输端点之间提供通信服务，通过端口等机制进行复用与分用。TCP提供可靠、有序的字节流，UDP按独立数据报交付，不保证到达、顺序或去重。',
    analogy:'例如，IP把分组送到主机，TCP或UDP再依据端口和连接信息把数据交给相应套接字。',
    features:[['端口与分用','端口是16位整数，TCP与UDP使用独立的端口空间。'],['交付服务','可靠性、顺序和消息边界取决于所选协议。'],['连接与控制','TCP维护连接状态，并进行流量控制和拥塞控制。']],
    protocols:['tcp','udp','quic'],
    process:'HTTP示例添加TCP首部，源端口为53000，目的端口为80；DNS示例添加UDP首部，目的端口为53。接收端处理首部后将数据交给对应端点。',
    mistakes:[['TCP消息边界','应用需要通过长度、分隔符或协议格式识别字节流中的消息。'],['UDP的性能','实际性能取决于网络、应用和上层实现，不能只比较首部大小。'],['可靠传输与加密','TCP保证字节流的可靠性；通信内容保护需要TLS等机制。']]
  },
  {
    id:'network',number:3,name:'网络层',en:'Network',color:'#81b7cc',
    question:'跨网络的分组如何选择下一跳？',unit:'IP分组',scope:'主机到主机 / 路由',
    definition:'网络层通过逻辑地址实现跨网络寻址和分组转发。本项目以IP为例：路由器根据路由信息选择下一跳；IP提供尽力而为服务，不保证到达、顺序或去重。',
    analogy:'例如，A向另一个网段的B发送IP分组时，先交给本地网关，再由路由器向B所在网络转发。',
    features:[['逻辑寻址','IPv4地址为32位，IPv6地址为128位。'],['路由与转发','按最长前缀匹配查找路由，确定下一跳和出口。'],['限制转发次数','TTL或Hop Limit限制分组可继续转发的跳数。']],
    protocols:['ipv4','ipv6','icmp','ospf'],
    process:'A为192.168.1.10/24，B为192.168.2.20/24，中间路由器连接两个网段。示例不使用NAT，源和目的IP地址保持不变，TTL从64减为63。',
    mistakes:[['IP地址与MAC地址','IP用于跨网络寻址，MAC用于相应链路上的帧交付。'],['IP路由的依据','普通IP转发主要根据目的IP查找路由，随后封装下一跳的链路帧。']]
  },
  {
    id:'datalink',number:2,name:'数据链路层',en:'Data Link',color:'#75b8b9',
    question:'当前链路上的帧如何交付？',unit:'帧 / Frame',scope:'同一链路 / 二层网络',
    definition:'数据链路层负责成帧、链路寻址、介质访问和差错检测等功能。以太网用MAC地址交付帧；不同链路协议提供的确认、重传等能力有所不同。',
    analogy:'例如，跨网段通信的第一跳帧发给网关；路由器取出IP分组，再为下一条链路生成新的帧。',
    features:[['成帧与寻址','封装当前链路所需的帧头和帧尾。'],['介质访问','协调共享介质上的发送行为。'],['差错检测','FCS等机制检测错误；检测后如何处理由链路协议决定。']],
    protocols:['ethernet','wifi','arp','vlan'],
    process:'第一跳的MAC地址为A → 路由器左接口，第二跳为路由器右接口 → B。路由器为下一条链路重新生成帧头和帧尾。',
    mistakes:[['下一跳的MAC地址','跨网段时，第一跳通常使用本地网关的MAC，而非远端服务器的MAC。'],['交换机的能力','二层交换机按MAC转发，三层交换机还可执行IP路由。']]
  },
  {
    id:'physical',number:1,name:'物理层',en:'Physical',color:'#a6b4c2',
    question:'比特如何通过信号传送？',unit:'比特 / 信号',scope:'传输介质',
    definition:'物理层规定用电、光或无线信号传送比特所需的接口、编码、调制和时序。接收端依据相同规范恢复比特，上层再解释帧、地址和应用消息。',
    analogy:'例如，同样的帧可以在铜缆上通过电信号传送，在光纤上通过光信号传送。',
    features:[['信号与介质','使用铜缆、光纤或无线介质传送信号。'],['编码与同步','按链路规范生成信号并恢复比特。'],['接口与速率','规定接口、电气或光学特性以及传输速率。']],
    protocols:['phy','medium'],
    process:'第一段链路把帧编码为信号，路由器接收并处理后，在第二段链路上重新发送。各层的逻辑通信都依赖这些实际链路。',
    mistakes:[['速率与吞吐量','协议开销、拥塞和端点能力会影响端到端吞吐量。'],['信号处理与报文首部','物理层负责信号传输和相关编码；线路可能还有训练序列、同步信息等物理层开销。']]
  }
];

export const TCPIP = [
  {
    ...OSI[0],id:'tcp-application',number:4,en:'Application',
    definition:'TCP/IP应用层定义应用通信协议，相关应用和库还负责数据表示、会话管理和通信保护等功能。这些功能大致对应OSI应用层、表示层和会话层。两种模型按不同方式组织功能。',
    scope:'应用协议与相关机制',protocols:['http','dns','smtp','dhcp','ssh','tls','json'],
    process:'应用生成消息，完成必要的编码和会话处理，再交给传输服务。OSI与TCP/IP的对应关系用于比较功能，两者不是同一套模型的不同层数版本。',
    mistakes:[['模型名称','TCP/IP是互联网协议体系；TCP和UDP都属于传输层。'],['模型的对应关系','上三层功能大致对应TCP/IP应用层，具体协议的实现边界可能跨越多个功能。']]
  },
  {...OSI[3],id:'tcp-transport',number:3},
  {...OSI[4],id:'internet',number:2,name:'网际层',en:'Internet'},
  {
    ...OSI[5],id:'interface',number:1,name:'网络接口层',en:'Network Interface',
    unit:'帧 / 比特',scope:'链路与物理传输',
    definition:'网络接口层负责通过具体网络发送和接收IP分组，包括帧封装、链路寻址、介质访问和信号传输等功能，大致对应OSI数据链路层和物理层。各链路采用的技术可以不同。',
    question:'这一跳如何封装并传送数据？',
    analogy:'例如，以太网把IP分组封装为帧，再按相应物理规范通过铜缆或光纤传送。',
    features:[['帧与链路地址','封装IP分组，并确定当前链路上的接收端。'],['编码与介质','生成信号，通过有线或无线介质传送。'],['逐跳交付','每条链路独立完成封装、传输和接收。']],
    protocols:['ethernet','wifi','arp','vlan','phy','medium'],
    process:'A至路由器、路由器至B两段链路分别完成帧封装和物理传输。路由器重新生成链路帧；示例不使用NAT，IP分组保留源和目的地址。'
  }
];

export const LABS = {
 handshake:{title:'TCP 三次握手',subtitle:'同步序号 · 建立连接状态',footnote:'A主动连接，不携带应用数据。每步显示接收方处理报文后的状态。SYN消耗1个序号，纯ACK不消耗序号。',steps:[
  {title:'A → B：发出SYN',description:'A选择初始序号100，向B请求建立连接。A进入SYN-SENT；B收到SYN后进入SYN-RECEIVED，准备回复。',direction:1,wire:'SYN=1  ACK=0\nseq=100',states:['SYN-SENT','SYN-RECEIVED'],tag:'SYN · seq 100'},
  {title:'B → A：回复SYN + ACK',description:'B用ack=101确认A的SYN，并选择自己的初始序号500。A收到回复后进入ESTABLISHED并发送确认；B仍在SYN-RECEIVED等待该确认。',direction:-1,wire:'SYN=1  ACK=1\nseq=500  ack=101',states:['ESTABLISHED','SYN-RECEIVED'],tag:'SYN+ACK · ack 101'},
  {title:'A → B：确认B的SYN',description:'A的确认号为501，因为B的SYN消耗了序号500。B收到ACK后进入ESTABLISHED，双方完成握手。',direction:1,wire:'SYN=0  ACK=1\nseq=101  ack=501',states:['ESTABLISHED','ESTABLISHED'],tag:'ACK · ack 501'}
 ]},
 close:{title:'TCP 四次挥手',subtitle:'两个方向分别关闭 · 允许半关闭',footnote:'双方从ESTABLISHED开始，关闭期间没有额外数据。每步显示接收处理和必要回复后的状态，伴随产生的ACK单独展示。实际ACK与FIN可能合并。',steps:[
  {title:'A → B：关闭A的发送方向',description:'A发出FIN(seq=1000)，进入FIN-WAIT-1；B收到后进入CLOSE-WAIT。A仍可接收B的数据，B的应用可以继续发送。',direction:1,wire:'FIN=1  ACK=1\nseq=1000  ack=2000',states:['FIN-WAIT-1','CLOSE-WAIT'],tag:'FIN · seq 1000'},
  {title:'B → A：确认A的FIN',description:'B收到FIN后进入CLOSE-WAIT，回复ack=1001。A收到确认后进入FIN-WAIT-2；B仍可能继续发送剩余数据。',direction:-1,wire:'ACK=1\nseq=2000  ack=1001',states:['FIN-WAIT-2','CLOSE-WAIT'],tag:'ACK · ack 1001'},
  {title:'B → A：关闭B的发送方向',description:'B发出FIN(seq=2000)，进入LAST-ACK。A收到后发送确认并进入TIME-WAIT；这份确认在下一步展示。本例没有额外数据，所以B的seq仍为2000。',direction:-1,wire:'FIN=1  ACK=1\nseq=2000  ack=1001',states:['TIME-WAIT','LAST-ACK'],tag:'FIN · seq 2000'},
  {title:'A → B：确认B的FIN',description:'A的确认号为2001；B收到ACK后进入CLOSED。A在TIME-WAIT中按2MSL等待旧报文消失。若最终ACK丢失，A可在收到B重传的FIN时再次确认。',direction:1,wire:'ACK=1\nseq=1001  ack=2001',states:['TIME-WAIT','CLOSED'],tag:'ACK · ack 2001'}
 ]},
 udp:{title:'UDP 数据报传输',subtitle:'保留消息边界 · 不保证到达或顺序',footnote:'本例人为设置第1份延迟、第2份丢失、第3份先到，展示UDP对这些情况的处理边界。实际丢失和乱序取决于网络状况。',steps:[
  {title:'A发送数据报①',description:'应用提交第一份独立数据报，不进行TCP式握手。本例让它在网络中延迟；编号由应用添加，UDP首部没有序列号字段。',direction:1,wire:'UDP 53000 → 9000\n应用编号=1  内容=HELLO',states:['无TCP连接状态','等待数据报'],tag:'数据报 ① · 延迟',delay:true},
  {title:'数据报②在链路中丢失',description:'第二份数据报被模拟丢弃。UDP本身不会自动确认和重传，接收方可能一直不知道这份数据存在。',direction:1,wire:'UDP 53000 → 9000\n应用编号=2  内容=NETWORK',states:['不自动重传','尚未收到'],tag:'数据报 ② · 丢失',drop:true},
  {title:'B先收到数据报③',description:'第三份数据报先到达，应用可先读到编号3。UDP不负责把它按1、2、3排序；数据报消息边界仍被保留。',direction:1,wire:'UDP 53000 → 9000\n应用编号=3  内容=WORLD',states:['继续发送','已收到：③'],tag:'数据报 ③ · 到达'},
  {title:'B收到延迟的数据报①',description:'最终接收顺序为③、①，②没有到达。若应用需要可靠、有序的交付，应在UDP之上实现相应机制，或选择提供这些服务的传输协议。',direction:1,wire:'接收顺序：③ → ①\n缺失：②；无UDP自动补发',states:['发送结束','已收到：③、①'],tag:'数据报 ① · 到达'}
 ]}
};

