const f = (id, label, bits, description, example) => ({id, label, bits, description, example});

export const PACKETS = {
  tcp: {
    name: 'TCP首部',
    layer: 'transport',
    note: '每行32位。按RFC 9293展示4位保留位和8个控制标志；选项行只作占位，实际长度为0～40字节。',
    rows: [
      [
        f('tcp-src', '源端口', 16, '源端口（Source Port）标识发送端的传输端点，需结合IP地址和传输协议解释。', '53000'),
        f('tcp-dst', '目的端口', 16, '目的端口（Destination Port）用于把数据交给接收端的相应套接字；端口号本身不能证明应用身份。', '80 / 443')
      ],
      [f('tcp-seq', '序列号 seq', 32, '序列号（Sequence Number）标识本段第一个数据字节的位置。若SYN=1，这里是初始序列号，第一个数据字节从seq+1开始。SYN和FIN各占1个序号，按2³²取模。', '1001')],
      [f('tcp-ack', '确认号 ack', 32, '确认号（Acknowledgment Number）在ACK=1时有效，表示下一期待接收的序号。累计确认只越过已连续收到的数据和SYN、FIN。', '1501')],
      [
        f('tcp-offset', '数据偏移', 4, '数据偏移（Data Offset）给出TCP首部长度，单位为4字节。取值5～15，对应20～60字节。', '5 → 20字节'),
        f('tcp-reserved', '保留位', 4, '保留位（Reserved）在本图采用的基础格式中置0；扩展协议可另行定义其用途。', '0'),
        f('tcp-flags', '控制标志', 8, '控制标志（Flags）包括CWR、ECE、URG、ACK、PSH、RST、SYN和FIN。SYN同步序列号，FIN表示发送方不再发送数据，RST复位连接；ECE和CWR用于ECN。', 'SYN=1 / ACK=1'),
        f('tcp-window', '接收窗口', 16, '窗口字段（Window）通告接收窗口大小，用于流量控制。协商窗口扩大选项后需按比例换算，但SYN段中的窗口字段不放大；拥塞窗口cwnd由发送方维护。', '32768')
      ],
      [
        f('tcp-checksum', '校验和', 16, '校验和（Checksum）覆盖TCP首部、数据和IP伪首部，用于检测传输错误。伪首部参与计算，但不作为TCP首部发送。', '16位校验值'),
        f('tcp-urgent', '紧急指针', 16, '紧急指针（Urgent Pointer）在URG=1时有效；它与本段序列号相加，指出紧急数据后第一个字节的序号。紧急数据仍在同一TCP字节流中传输。', 'seq=1000，指针=10 → 序号1010')
      ],
      [{...f('tcp-options', '选项与填充', 32, '选项（Options）可包含MSS、窗口扩大、SACK许可和时间戳等。填充（Padding）使首部长度成为4字节的倍数；选项与填充共占0～40字节。', 'SYN中的MSS=1460'), lengthLabel: '0～40 字节'}]
    ]
  },
  udp: {
    name: 'UDP首部',
    layer: 'transport',
    note: 'UDP首部固定8字节，每行32位，共两行。UDP首部没有序列号、确认号或接收窗口。',
    rows: [
      [
        f('udp-src', '源端口', 16, '源端口（Source Port）通常标识发送端点。UDP允许不提供源端口，此时该字段为0。', '53000'),
        f('udp-dst', '目的端口', 16, '目的端口（Destination Port）用于把数据报交给接收端的相应套接字。DNS服务通常使用53端口。', '53')
      ],
      [
        f('udp-length', '长度', 16, '长度（Length）是UDP首部与数据的总字节数，普通UDP数据报的取值为8～65535。IPv6超大载荷另有规定。', '28 = 8字节首部 + 20字节数据'),
        f('udp-checksum', '校验和', 16, '校验和（Checksum）覆盖IP伪首部、UDP首部和数据。IPv4中为0表示省略校验；IPv6通常必须校验，只有特定规范允许例外。', '差错检测，不负责重传')
      ]
    ]
  },
  ipv4: {
    name: 'IPv4首部',
    layer: 'network',
    note: '图中展示20字节基本首部，未画出可选的选项与填充。分片偏移以8字节为单位，总长度以字节为单位。',
    rows: [
      [
        f('ip-version', '版本', 4, '版本（Version）指明IP协议版本，IPv4的值为4。', '4'),
        f('ip-ihl', 'IHL', 4, 'IP首部长度（Internet Header Length），单位为4字节。取值5～15，对应20～60字节。', '5 → 20字节'),
        f('ip-dscp', 'DSCP', 6, '差分服务代码点（Differentiated Services Code Point）标记分组的服务类别，转发处理取决于网络策略。', 'DSCP=0：尽力而为'),
        f('ip-ecn', 'ECN', 2, '显式拥塞通知（Explicit Congestion Notification）可由支持ECN的路由器标记拥塞，再由传输协议通知发送方。', 'CE=11：已发生拥塞'),
        f('ip-length', '总长度', 16, '总长度（Total Length）包含当前IPv4分组的首部和数据，最大65535字节。分片后，每片都有自己的总长度。', '1500字节')
      ],
      [
        f('ip-id', '标识', 16, '标识（Identification）与源地址、目的地址和协议号一起，用于关联同一个原始分组的分片。', '同一组分片使用相同标识'),
        f('ip-flags', '标志', 3, '标志（Flags）包括1位保留位、DF（禁止分片）和MF（更多分片）。MF=1表示后面还有分片；末片或未分片的分组MF=0。', 'DF=0，MF=1'),
        f('ip-offset', '片偏移', 13, '片偏移（Fragment Offset）给出本片数据在原始IP载荷中的位置，单位为8字节。', '185 → 1480字节')
      ],
      [
        f('ip-ttl', 'TTL', 8, '生存时间（Time to Live）在每次路由转发时至少减1；若减至0，路由器丢弃分组，通常返回ICMP时间超过消息。', '64 → 63'),
        f('ip-protocol', '协议', 8, '协议号（Protocol）标识IP载荷的协议，例如TCP=6、UDP=17、ICMP=1。', '6'),
        f('ip-checksum', '首部校验和', 16, '首部校验和（Header Checksum）只覆盖IPv4首部。TTL等首部字段改变后需要更新。', 'TTL变化 → 更新校验和')
      ],
      [f('ip-src', '源IP地址', 32, '源地址（Source Address）标识分组的发送方；进行源地址转换时，NAT会改写它。', '192.168.1.10')],
      [f('ip-dst', '目的IP地址', 32, '目的地址（Destination Address）标识分组的目标。路由器据此查路由表，普通转发时保持该地址不变。', '192.168.2.20')]
    ]
  },
  ethernet: {
    name: '以太网帧',
    layer: 'datalink',
    note: '采用Ethernet II格式，按字段顺序排列；卡片宽度不表示字节比例。未展示前导码、帧起始定界符（SFD）和VLAN标签；帧间间隔不属于帧。',
    sequence: [
      f('eth-dst', '目的MAC', 48, '目的MAC地址（Destination MAC Address）标识本链路的接收者，可为单播、组播或广播。跨网段单播的第一跳通常使用网关接口的MAC地址。', 'R左接口MAC'),
      f('eth-src', '源MAC', 48, '源MAC地址（Source MAC Address）标识当前链路的发送接口。交换机据此学习该地址所在的交换机端口。', '主机A的MAC'),
      f('eth-type', 'EtherType', 16, '以太网类型（EtherType）标识帧载荷协议：IPv4=0x0800、ARP=0x0806、IPv6=0x86DD。', '0x0800'),
      f('eth-data', '载荷与填充', 0, '载荷（Payload）承载上层数据。在未加标签、未使用巨型帧的以太网中，载荷与填充共占46～1500字节；数据不足46字节时补齐。', 'IP分组 + 必要的填充'),
      f('eth-fcs', 'FCS', 32, '帧校验序列（Frame Check Sequence）使用CRC检测帧的传输错误。逐跳重新封装时，按新帧内容重新计算。', '4字节CRC校验值')
    ]
  }
};
