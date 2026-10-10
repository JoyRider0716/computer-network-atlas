// 教学内容独立于交互与3D场景，可直接扩充每层的协议和知识点。
const protocol = (name, title, brief, topics, meta = '', source = '') => ({name,title,brief,topics,meta,source});
const topic = (title, text) => ({title,text});
export const PROTOCOLS = {
  http: protocol('HTTP','网页与API的交流规则','客户端发出请求，服务器返回响应；HTTP规定语义、方法、状态码和消息格式。',[
    topic('请求与响应','请求包括方法、目标资源与头字段，可能带消息体。响应包括状态码、头字段和可选消息体。GET通常读取资源，POST通常提交数据。'),
    topic('状态码','2xx表示成功，3xx表示重定向，4xx表示客户端侧请求问题，5xx表示服务器侧问题。404是资源未找到，500是服务器内部错误。'),
    topic('版本与承载','HTTP/1.1和HTTP/2通常使用TCP；HTTP/3使用QUIC，而QUIC通常运行在UDP上。HTTPS意味着HTTP受到TLS等机制的保护，不是TCP自带加密。'),
    topic('无状态与登录','HTTP语义本身不要求服务器记住此前请求。应用可用Cookie、会话标识等管理登录状态；一个登录会话可以跨多个TCP连接。')
  ],'80 / 443','https://www.rfc-editor.org/rfc/rfc9110.html'),
  dns: protocol('DNS','域名系统','按名称查询资源记录，例如通过A或AAAA记录获得IP地址。DNS并不只提供“域名转IP”。',[
    topic('递归与迭代','客户端通常请求递归解析器获得最终答案；解析器可逐级查询根、顶级域与权威服务器，也可利用缓存。'),
    topic('常见记录','A对应IPv4地址，AAAA对应IPv6地址，CNAME表示别名，MX用于邮件路由。TTL控制记录在缓存中可保留多久。'),
    topic('UDP还是TCP？','传统DNS同时支持UDP和TCP的53端口。某些查询先用UDP，响应截断时可改用TCP；区域传送常使用TCP。DoT与DoH为DNS提供加密传输。')
  ],'UDP / TCP 53','https://www.rfc-editor.org/rfc/rfc1035.html'),
  smtp: protocol('SMTP','邮件提交与转发','在邮件客户端与邮件服务器，以及邮件服务器之间传递邮件。',[
    topic('发送和收取的分工','SMTP负责提交和转发邮件；IMAP与POP3用于访问、获取服务器中的邮件，不能把三者混为一谈。'),
    topic('端口与安全','服务器间转发通常使用TCP 25；客户端提交常见587，隐式TLS提交常见465。是否加密取决于具体配置和协商。')
  ],'TCP 25 / 587 / 465','https://www.rfc-editor.org/rfc/rfc5321.html'),
  dhcp: protocol('DHCP','自动获取网络配置','DHCPv4可为主机提供IP地址、掩码、默认网关、DNS等配置。',[
    topic('DORA四步','典型流程为Discover发现、Offer提供、Request请求、ACK确认。初始阶段主机尚无可用地址，因此会使用广播等机制。'),
    topic('租约与续租','地址通常有租约时间，客户端需要续租。DHCPv6是另一套协议，使用UDP 546/547；IPv6也可以通过SLAAC配置地址。')
  ],'UDP 67 / 68','https://www.rfc-editor.org/rfc/rfc2131.html'),
  ssh: protocol('SSH','安全远程访问','提供加密的远程登录、命令执行与相关通道。',[
    topic('认证与加密','通常先协商密钥并验证服务器身份，再进行用户认证。服务器主机密钥与用户公钥承担不同作用。'),
    topic('不只是远程终端','SSH连接可以承载多个逻辑通道，包括终端、SFTP和端口转发；这些通道共享底层连接。')
  ],'TCP 22','https://www.rfc-editor.org/rfc/rfc4251.html'),
  tls: protocol('TLS','通信加密与身份认证','为应用数据提供机密性、完整性保护和身份认证。放在此层是按表示功能解释，并非严格的OSI归属。',[
    topic('握手做什么','双方协商参数、建立密钥并进行必要的身份认证。客户端通常验证服务器证书和目标名称；某些场景还认证客户端。'),
    topic('HTTPS的关系','常见HTTPS栈为HTTP → TLS → TCP → IP。QUIC集成TLS 1.3握手机制，其结构不同于把TLS记录直接放在TCP上。'),
    topic('可靠不等于安全','TCP可靠性不会自动隐藏数据内容。TLS证书校验失败与TCP连接失败是不同问题。')
  ],'功能对应','https://www.rfc-editor.org/rfc/rfc8446.html'),
  encoding: protocol('UTF-8','字符编码','将字符转换为字节，接收方按照相同编码规则解释字节。属于表示功能，不是网络传输协议。',[
    topic('乱码怎样产生','发送方与接收方采用不同字符编码解释同一组字节，可能出现乱码。协议需要规定编码或提供明确的编码信息。'),
    topic('字符与字节','一个字符不一定等于一个字节。UTF-8使用可变长编码，统计长度时需区分字符数与字节数。')
  ],'数据表示','https://www.rfc-editor.org/rfc/rfc3629.html'),
  json: protocol('JSON','数据序列化格式','用文本表达对象、数组、数值等结构，使不同语言的程序交换数据。JSON本身不是传输协议。',[
    topic('序列化与反序列化','把程序内对象编码为可传送的字节是序列化；按格式恢复数据结构是反序列化。字段含义仍需由应用约定。'),
    topic('格式与传输分工','JSON可以由HTTP、WebSocket等协议承载；使用JSON并不会自动解决TCP字节流的消息边界问题。')
  ],'数据格式','https://www.rfc-editor.org/rfc/rfc8259.html'),
  rpc: protocol('RPC','远程过程调用','让程序以类似函数调用的方式请求远端执行操作。会话管理相关功能常由具体RPC系统承担。',[
    topic('请求关联与状态','调用标识可把响应与请求对应起来。超时后不能仅凭“没收到响应”判断远端是否执行，需要考虑幂等性与重试。'),
    topic('分层归属提醒','RPC在实际TCP/IP中通常视为应用层机制。这里用于理解会话管理，不表示所有RPC协议都严格属于OSI第五层。')
  ],'会话功能示例','https://www.rfc-editor.org/rfc/rfc5531.html'),
  session: protocol('SESSION','应用会话管理','在多次请求之间识别一段持续的交互，例如登录状态或协同任务。它是一类机制，不是单一标准协议。',[
    topic('三个不同概念','OSI会话层、网站登录Session和TCP连接不能画等号。一次登录可以跨多个连接，一个连接也可以处理多次请求。'),
    topic('同步与恢复','某些会话机制使用检查点、任务标识等恢复通信；是否支持断点恢复取决于应用设计，而不是存在TCP就自动实现。')
  ],'机制示例'),
  tcp: protocol('TCP','可靠、有序的字节流','建立连接后，在两个传输端点之间提供可靠、有序的字节流服务。连接是一组状态，不是专用物理线路。',[
    topic('seq、ACK与ack','seq是序列号，按字节计数。大写ACK是控制标志位，表示确认字段有效；小写ack是确认号，通常表示下一期待的字节序号。SYN和FIN各消耗一个序号。'),
    topic('三次握手','A发送SYN(seq=100)，B回复SYN+ACK(seq=500, ack=101)，A回复ACK(seq=101, ack=501)。双方建立连接状态并同步序号；第三次确认让B确认自己的SYN已被收到。'),
    topic('四次挥手','TCP两个方向分别关闭。典型流程为FIN、ACK、FIN、ACK；某些情况下ACK与FIN可以合并。主动关闭一方通常进入TIME-WAIT，等待旧报文消失并支持重发最终ACK。'),
    topic('可靠传输','通过序列号、确认、重传、排序与去重实现可靠性。超时或连接故障仍会返回给应用，可靠服务不意味着网络永不失败。'),
    topic('流量与拥塞控制','流量控制限制发送方不要超过接收方容量；拥塞控制限制对网络的压力。实际可发送量受接收窗口与拥塞窗口等约束。'),
    topic('为什么会“粘包”','TCP没有应用消息边界。两次send可能被一次read读到，也可能一次send被多次read读取。应用应定义长度字段、分隔符或其他消息格式。')
  ],'首部≥20字节','https://www.rfc-editor.org/rfc/rfc9293.html'),
  udp: protocol('UDP','保留消息边界的数据报','无需TCP式握手，以数据报为单位传输；协议自身不保证送达、顺序或去重。',[
    topic('首部四字段','源端口、目的端口、长度、校验和，各占16位，总首部8字节。UDP校验和用于差错检测，不提供纠错或重传。'),
    topic('消息边界','两份UDP数据报不会因为UDP本身而合并为一条字节流。接收缓冲区不足时，具体API可能截断数据报，应用需正确设置缓冲区。'),
    topic('丢失与乱序','发送1、2、3可能收到3、1，或完全没有收到。UDP自身不会自动补发2，应用可以自己增加序号、确认和重传。'),
    topic('性能与应用','常用于DNS查询、实时媒体和QUIC承载。UDP头小不等于所有场景都更快；应用仍需考虑拥塞控制、路径MTU与分片风险。')
  ],'首部8字节','https://www.rfc-editor.org/rfc/rfc768.html'),
  quic: protocol('QUIC','基于UDP的安全传输','在UDP上实现可靠传输、加密、多路复用等机制，是HTTP/3使用的传输协议。',[
    topic('可靠性来自哪里','UDP提供数据报承载，QUIC实现确认、丢失检测、重传相关恢复和拥塞控制。使用UDP并不意味着应用必须不可靠。'),
    topic('多流与迁移','不同流可独立交付数据，减少跨流的传输层队头阻塞；连接ID可支持一定条件下的路径迁移。流内仍有顺序要求。')
  ],'UDP之上的传输','https://www.rfc-editor.org/rfc/rfc9000.html'),
  ipv4: protocol('IPv4','跨网络寻址与转发','以32位地址标识接口，通过路由器逐跳转发IP分组，提供尽力而为服务。',[
    topic('地址、掩码与网关','前缀用于判断目的地址是否属于本地网络；发往远端网络的分组通常先交给下一跳网关。示例主机A为192.168.1.10/24。'),
    topic('路由与TTL','路由表采用最长前缀匹配等规则选择下一跳。路由器转发时减小TTL，避免分组无限循环。路由器并不检查每个分组的全部应用内容。'),
    topic('分片与MTU','IPv4在允许分片时可由源端或路由器分片，重组在目的端进行。分片增加开销，现代传输通常尽量依据路径MTU避免它。'),
    topic('NAT的例外','普通路由中源与目的IP通常不变；NAT会改写地址，NAPT还可改写端口。本模型为简化示意，不模拟NAT。')
  ],'32位地址','https://www.rfc-editor.org/rfc/rfc791.html'),
  ipv6: protocol('IPv6','128位地址的网际协议','使用更大的地址空间、40字节基本首部和扩展首部机制。',[
    topic('地址写法','地址以十六进制和冒号表示，连续零可按规则压缩。例如2001:db8::1是文档示例地址；同一地址中只能使用一次双冒号压缩。'),
    topic('邻居发现','IPv6使用基于ICMPv6的邻居发现获得邻居链路地址、发现路由器等，不使用IPv4的ARP。'),
    topic('与IPv4不同的分片','IPv6路由器不执行分片；需要时由源端使用分片扩展首部。Hop Limit承担类似IPv4 TTL的跳数限制作用。')
  ],'128位地址','https://www.rfc-editor.org/rfc/rfc8200.html'),
  icmp: protocol('ICMP','网络差错与诊断','用于报告某些IP处理问题并支持诊断，例如不可达、超时与回显。',[
    topic('ping与traceroute','ping通常使用ICMP回显请求与应答；traceroute利用逐步增加TTL/Hop Limit与超时报文推断路径，具体探测协议可以不同。'),
    topic('不是可靠性补丁','ICMP不负责保证所有IP分组到达。ping失败可能是策略阻止；ping成功也不证明目标TCP端口或应用正常。')
  ],'没有TCP/UDP端口','https://www.rfc-editor.org/rfc/rfc792.html'),
  ospf: protocol('OSPF','链路状态路由协议','路由器交换拓扑信息，计算到目的网络的路径。它是控制平面的协议。',[
    topic('控制与转发','OSPF等协议帮助生成路由信息，IP转发使用得到的路由表。不是每转发一个分组都重新运行一遍全网路由计算。'),
    topic('OSPF与BGP','OSPFv2直接由IP承载，协议号89。BGP虽用于路由控制，但运行在TCP 179端口上，不能因为“负责路由”就一律归为网络层协议。')
  ],'IP协议号89','https://www.rfc-editor.org/rfc/rfc2328.html'),
  ethernet: protocol('ETHERNET','以太网帧与MAC寻址','在以太网链路上传送帧；以太网标准同时涉及链路层与物理层。',[
    topic('帧头与帧尾','常见帧包括目的MAC、源MAC、EtherType、载荷和FCS。FCS检测帧错误，不代表以太网一定会自动重传。'),
    topic('交换机如何学习','二层交换机根据源MAC学习接口位置，根据目的MAC转发。目的未知时可能泛洪；广播帧也在对应广播域内传播。'),
    topic('逐跳重新封装','A给远端B发分组时，第一帧的目的MAC通常是网关MAC。路由器解析IP后，在下一条链路使用新的链路层头部。')
  ],'MAC通常48位'),
  wifi: protocol('WI-FI','无线局域网','IEEE 802.11体系同时规定无线介质访问、帧格式与无线物理传输。',[
    topic('共享无线介质','常采用CSMA/CA协调访问，包括侦听、退避和确认等机制。无线链路确认不同于TCP端到端确认。'),
    topic('多种地址字段','802.11帧可能包含多个MAC地址字段，其意义取决于帧方向和类型，不能直接照搬以太网只有源与目的两个字段的印象。')
  ],'链路+物理'),
  arp: protocol('ARP','IPv4下一跳地址解析','在本地链路上把下一跳IPv4地址解析为链路地址；处于网络层与链路层的边界。',[
    topic('查谁的MAC？','本地目的主机：查询它的MAC。远端目的主机：通常查询网关的MAC，而不是广播寻找远端服务器的MAC。'),
    topic('请求与缓存','以太网中ARP请求通常广播，应答通常单播；主机缓存映射以减少查询。ARP由链路直接承载，不装在普通IP分组里面。')
  ],'不使用TCP/UDP端口','https://www.rfc-editor.org/rfc/rfc826.html'),
  vlan: protocol('802.1Q','虚拟局域网','在交换网络中划分二层广播域，标记帧所属VLAN。',[
    topic('广播域与路由','不同VLAN通常需要三层转发才能互通。VLAN是二层分段机制，不等于加密。'),
    topic('Access与Trunk','Access口通常为终端接入一个VLAN；Trunk链路可携带多个VLAN，具体是否带标签取决于端口配置。')
  ],'二层分段'),
  phy: protocol('PHY','物理传输与编码','规定信号、电气或光学特性、时序、调制和编码，使接收端恢复比特。',[
    topic('比特不是字符','物理层传送的是编码后的信号。它不解析HTTP状态码，不依据端口把数据交给应用。'),
    topic('速率、带宽与时延','链路速率表示单位时间可传送的比特数量，不等于端到端可用吞吐量。传播时延还与距离和介质有关。'),
    topic('双工方式','全双工支持两个方向同时通信；半双工在同一时刻只允许一个方向发送。现代交换式以太网通常使用全双工。')
  ],'信号与比特'),
  medium: protocol('MEDIA','网线、光纤与无线','传输介质决定信号怎样传播，也影响距离、抗干扰与部署方式。介质本身不是应用协议。',[
    topic('铜缆','双绞线用电信号传输，绞合结构帮助抑制干扰；距离和速率受标准、线缆与环境影响。'),
    topic('光纤','以光传输，适合长距离和较高容量链路；仍需匹配相应光模块和链路规范。'),
    topic('无线','以电磁波传播，受频段、障碍、干扰与共享介质影响。信号强并不一定等于应用吞吐量高。')
  ],'传输介质')
};

export const OSI = [
 {id:'application',number:7,name:'应用层',en:'Application',color:'#68bba5',question:'应用之间，按照什么规则交流？',unit:'消息 / 应用数据',scope:'应用到应用',definition:'应用层定义面向特定业务的通信规则，包括请求与响应的格式、字段语义以及错误处理。它为应用提供网络服务，但不等于浏览器或聊天软件本身。',analogy:'像写信时约定信件格式和内容：收件人读到后知道你在请求什么。',features:[['规定消息语义','定义请求方法、资源、状态码和消息字段。'],['服务与资源访问','支持网页、域名查询、邮件和远程访问等任务。'],['使用下层服务','根据需求使用TCP、UDP或其他传输机制。']],protocols:['http','dns','smtp','dhcp','ssh'],process:'发送端生成HTTP请求或DNS查询；接收端解析消息并交给对应应用。在TCP/IP中，表示和会话相关功能也通常由应用、协议和库完成。',mistakes:[['应用层不等于应用程序','浏览器是程序，HTTP是它使用的应用层协议。'],['应用协议不一定使用TCP','DNS可以使用UDP或TCP；HTTP/3运行于QUIC之上。']]},
 {id:'presentation',number:6,name:'表示层',en:'Presentation',color:'#91bba2',question:'相同的字节，双方怎样一致地理解？',unit:'数据',scope:'数据表示与转换',definition:'表示层负责数据表示的协调，例如编码、序列化、压缩和加密。OSI按功能划分；实际TCP/IP系统常由应用协议或库完成这些工作，并没有独立的第六层模块。',analogy:'像统一文字和格式：把内容翻译成双方都能解读的表达方式。',features:[['编码与序列化','把字符、对象等转换为可传输字节。'],['压缩与转换','在需要时减少数据量，并按一致规则恢复。'],['加密相关功能','保护内容，具体位置取决于协议栈。']],protocols:['encoding','json','tls'],process:'本演示只把“编码/表示处理”作为功能阶段。表示层不必为每条消息增加一个独立、固定的网络头部；TLS等真实协议另有自身结构。',mistakes:[['不能把格式当成网络协议','JSON、UTF-8是格式或编码，功能上可用于解释表示层。'],['TLS归属不是绝对的','TLS通常在应用协议与TCP之间运行；这里是功能对应。']]},
 {id:'session',number:5,name:'会话层',en:'Session',color:'#b4bd8b',question:'一段持续的交互，怎样组织和管理？',unit:'数据',scope:'对话管理',definition:'会话层在OSI中负责组织通信会话、协调对话、设置同步点及支持某些恢复过程。在实际互联网系统中，这些能力往往分布在应用协议和程序中。',analogy:'像一次会议：建立议程、安排发言，并在中断后从约定位置继续。',features:[['会话生命周期','组织会话建立、管理和结束。'],['对话与同步','协调交互，并按需要设置同步点。'],['恢复机制','能否恢复取决于具体协议和应用。']],protocols:['rpc','session'],process:'本演示把“会话管理”作为功能阶段，不虚构固定的会话层首部。使用HTTP完成登录管理也仍是实际TCP/IP应用层行为。',mistakes:[['登录Session不是TCP连接','一次登录会话可能跨多条TCP连接。'],['会话层没有统一互联网模块','不能给每个OSI功能都机械分配一个实际软件组件。']]},
 {id:'transport',number:4,name:'传输层',en:'Transport',color:'#a4a6d0',question:'数据该交给哪个应用？需要怎样的交付保证？',unit:'TCP段 / UDP数据报',scope:'端到端 / 进程间',definition:'传输层在主机上的传输端点之间提供通信服务，通过端口等机制进行复用与分用。TCP提供可靠有序字节流，UDP提供保留消息边界的数据报服务。',analogy:'IP把信送到一栋楼，端口帮助交给楼里对应的部门。',features:[['端口与分用','端口是16位整数，TCP与UDP有独立端口空间。'],['不同服务取舍','可靠性、顺序和开销取决于所选协议。'],['连接与控制','TCP具备连接状态、流量控制及拥塞控制。']],protocols:['tcp','udp','quic'],process:'HTTP示例添加TCP首部，源端口53000、目的端口80；DNS示例添加UDP首部，目的端口53。接收端去除首部并分用到对应端点。',mistakes:[['TCP并不保留消息边界','应用必须自行定义消息长度、分隔或协议格式。'],['UDP不等于永远更快','实际性能还取决于网络、应用和上层实现。'],['可靠传输不等于加密','TCP本身不提供TLS那样的内容保护。']]},
 {id:'network',number:3,name:'网络层',en:'Network',color:'#81b7cc',question:'跨越多个网络，下一跳应该走哪里？',unit:'IP分组',scope:'主机到主机 / 路由',definition:'网络层使用IP等逻辑地址实现跨网络寻址与分组转发。路由器依据路由信息选择下一跳；IP采用尽力而为服务，不保证到达、顺序或去重。',analogy:'像根据城市和街道地址确定路线，每个路口选择下一段路。',features:[['逻辑寻址','IPv4地址32位，IPv6地址128位。'],['路由与转发','使用路由表，通常按最长前缀匹配选择下一跳。'],['限制分组寿命','TTL或Hop Limit避免转发环路无限持续。']],protocols:['ipv4','ipv6','icmp','ospf'],process:'A为192.168.1.10，B为192.168.2.20，位于不同/24子网。中间路由器连接两网段；本示例没有NAT，源目的IP不变，TTL从64减到63。',mistakes:[['IP地址不等于MAC地址','IP用于跨网络寻址，MAC主要用于本地链路交付。'],['路由器不会只看MAC转发','普通IP路由主要依据目的IP与路由表。']]},
 {id:'datalink',number:2,name:'数据链路层',en:'Data Link',color:'#75b8b9',question:'当前这一跳，怎样把帧送给相邻设备？',unit:'帧 Frame',scope:'同一链路 / 二层网络',definition:'数据链路层把网络层分组封装为帧，处理链路寻址、介质访问及差错检测等问题。以太网使用MAC地址投递帧；不同链路协议的可靠性能力并不相同。',analogy:'像每一段接力运输的交接单，只写这一段的交出方和接收方。',features:[['成帧与寻址','为这一跳添加链路头部和必要的帧尾。'],['介质访问','协调共享介质上的发送行为。'],['差错检测','FCS等机制检测错误，未必自动纠错或重传。']],protocols:['ethernet','wifi','arp','vlan'],process:'第一跳是A-MAC → 路由器左接口MAC；第二跳是路由器右接口MAC → B-MAC。路由器为新的链路重新封装，链路地址随跳变化。',mistakes:[['远程服务器的MAC不是第一跳目的MAC','跨网段时通常先把帧交给本地网关。'],['所有交换机不一定都是纯二层','三层交换机还可以进行IP路由。']]},
 {id:'physical',number:1,name:'物理层',en:'Physical',color:'#a6b4c2',question:'怎样把比特变成真正能传播的信号？',unit:'比特 / 信号',scope:'传输介质',definition:'物理层规定通过电、光或无线信号传送比特所需的接口、编码、调制、时序等条件。它不解析IP地址、端口或应用内容。',analogy:'像真正运输信件的道路和车辆，承载上面各层组织好的信息。',features:[['信号与介质','铜缆用电，光纤用光，无线用电磁波。'],['编码与同步','发送和接收双方按相应规范恢复比特。'],['物理接口与速率','规范连接、电气/光学特性和传输能力。']],protocols:['phy','medium'],process:'帧被编码为信号穿过第一段链路，再由路由器处理并在另一段链路发送。两台主机的上层协议不会跨空中“直接相连”。',mistakes:[['速率不等于实际吞吐量','协议开销、拥塞和端点能力都会影响吞吐量。'],['物理层也不加一个普通协议头','其功能是信号传输与相关编码，而不是消息语义。']]}
];

export const TCPIP = [
 {...OSI[0],id:'tcp-application',number:4,en:'Application',definition:'TCP/IP应用层包含OSI应用、表示和会话层的大部分功能。它规定应用协议，同时由应用和相关库处理数据表示、会话管理及加密等功能。',scope:'应用协议与相关机制',protocols:['http','dns','smtp','dhcp','ssh','tls','json'],process:'应用生成消息并完成必要的编码与会话处理，再交给传输层。四层不是七层简单“删除三层”，而是功能组织方式不同。',mistakes:[['四层模型不是TCP/UDP模型','名称是TCP/IP；TCP和UDP都属于传输层。'],['对应关系是功能概括','TLS等机制无法机械固定为某一OSI层。']]},
 {...OSI[3],id:'tcp-transport',number:3},
 {...OSI[4],id:'internet',number:2,name:'网际层',en:'Internet'},
 {...OSI[5],id:'interface',number:1,name:'网络接口层',en:'Network Access',unit:'帧 / 比特',scope:'链路与物理传输',definition:'网络接口层负责在具体网络上接收和发送IP分组，涵盖OSI数据链路层与物理层功能。它处理帧、链路地址、介质访问及实际信号传输。',question:'这一跳的帧与信号，怎样真正送出去？',features:[['帧与链路地址','在当前链路封装IP分组并选择接收接口。'],['编码与介质','把帧转换为信号，通过有线或无线介质传播。'],['逐跳交付','每条链路的封装、地址和信号方式可以不同。']],protocols:['ethernet','wifi','arp','vlan','phy','medium'],process:'在A至路由器、路由器至B两段链路上分别进行帧封装与物理发送。路由器更换链路层头部，IP分组在无NAT的示例中保留源目的IP。'}
];

export const LABS = {
 handshake:{title:'TCP 三次握手',subtitle:'同步序号 · 建立连接状态',footnote:'经典无数据握手示例，A主动连接；SYN消耗1个序号，纯ACK不消耗序号。',steps:[
  {title:'A → B：发出SYN',description:'A选择初始序号100，向B请求建立连接。A进入SYN-SENT；B收到SYN后进入SYN-RECEIVED，准备回复。',direction:1,wire:'SYN=1  ACK=0\nseq=100',states:['SYN-SENT','SYN-RECEIVED'],tag:'SYN · seq 100'},
  {title:'B → A：回复SYN + ACK',description:'B确认A的SYN，ack=101，并选择自己的初始序号500。A收到这份回复后进入ESTABLISHED；B仍在SYN-RECEIVED等待最后确认。',direction:-1,wire:'SYN=1  ACK=1\nseq=500  ack=101',states:['ESTABLISHED','SYN-RECEIVED'],tag:'SYN+ACK · ack 101'},
  {title:'A → B：确认B的SYN',description:'A收到SYN+ACK后进入ESTABLISHED，发送ack=501。B收到这份ACK后也进入ESTABLISHED，握手完成。',direction:1,wire:'SYN=0  ACK=1\nseq=101  ack=501',states:['ESTABLISHED','ESTABLISHED'],tag:'ACK · ack 501'}
 ]},
 close:{title:'TCP 四次挥手',subtitle:'两个方向分别关闭 · 允许半关闭',footnote:'典型分开的四个报文示例，无未完成数据；实际ACK与FIN可能合并。双方此前均已ESTABLISHED。',steps:[
  {title:'A → B：我不再发送了',description:'A发出FIN(seq=1000)，进入FIN-WAIT-1；B收到后进入CLOSE-WAIT。这仅关闭A的发送方向，A仍可接收B的数据。',direction:1,wire:'FIN=1  ACK=1\nseq=1000  ack=2000',states:['FIN-WAIT-1','CLOSE-WAIT'],tag:'FIN · seq 1000'},
  {title:'B → A：确认A的FIN',description:'B收到FIN后进入CLOSE-WAIT，回复ack=1001。A收到确认后进入FIN-WAIT-2；B仍可能继续发送剩余数据。',direction:-1,wire:'ACK=1\nseq=2000  ack=1001',states:['FIN-WAIT-2','CLOSE-WAIT'],tag:'ACK · ack 1001'},
  {title:'B → A：我也不再发送了',description:'B的应用完成发送并关闭后，B发出FIN，进入LAST-ACK。这个示例中间没有额外数据，因此seq仍是2000。',direction:-1,wire:'FIN=1  ACK=1\nseq=2000  ack=1001',states:['FIN-WAIT-2','LAST-ACK'],tag:'FIN · seq 2000'},
  {title:'A → B：最后一次确认',description:'A收到FIN并发送ack=2001，进入TIME-WAIT；B收到ACK后CLOSED。A通常等待2MSL后才CLOSED，可应对旧报文及最终ACK丢失。',direction:1,wire:'ACK=1\nseq=1001  ack=2001',states:['TIME-WAIT','CLOSED'],tag:'ACK · ack 2001'}
 ]},
 udp:{title:'UDP 数据报传输',subtitle:'保留消息边界 · 不保证到达或顺序',footnote:'人为设定的教学例子：第2份丢失，第3份先到。不代表UDP必然丢包，也不代表TCP底层不会丢包。',steps:[
  {title:'A发送数据报①',description:'应用提交第一份独立数据报，不进行TCP式握手。本例让它在网络中延迟；编号由应用添加，UDP首部没有序列号字段。',direction:1,wire:'UDP 53000 → 9000\n应用编号=1  内容=HELLO',states:['无TCP连接状态','等待数据报'],tag:'数据报 ① · 延迟',delay:true},
  {title:'数据报②在链路中丢失',description:'第二份数据报被模拟丢弃。UDP本身不会自动确认和重传，接收方可能一直不知道这份数据存在。',direction:1,wire:'UDP 53000 → 9000\n应用编号=2  内容=NETWORK',states:['不自动重传','尚未收到'],tag:'数据报 ② · 丢失',drop:true},
  {title:'B先收到数据报③',description:'第三份数据报先到达，应用可先读到编号3。UDP不负责把它按1、2、3排序；数据报消息边界仍被保留。',direction:1,wire:'UDP 53000 → 9000\n应用编号=3  内容=WORLD',states:['继续发送','已收到：③'],tag:'数据报 ③ · 到达'},
  {title:'延迟的数据报①终于到达',description:'B收到第一份，最终接收顺序为③、①，②没有到达。若业务需要可靠有序，必须由上层设计相应机制。',direction:1,wire:'接收顺序：③ → ①\n缺失：②；无UDP自动补发',states:['发送结束','已收到：③、①'],tag:'数据报 ① · 到达'}
 ]}
};

