/// <reference path="jquery-2.1.0.min.js" />
/// <reference path="adapter.js" />
/// <reference path="jquery.signalR-2.0.3.min.js" />

var createIceServer;
var OPTIONS = {
    optional: [
      { DtlsSrtpKeyAgreement: true },
      { RtpDataChannels: true }
    ]
};
var SERVERS = {
    iceServers: [
        { url: "stun:23.21.150.121" },
        { url: "stun:stun.l.google.com:19302" },
        createIceServer("turn:numb.viagenie.ca", "OuTine@Gmail.com", "star1234")
    ]
};

var sdpConstraints = {
    'mandatory': {
        'OfferToReceiveAudio': true,
        'OfferToReceiveVideo': true
    }
};
var chat;
// 外部公共调用API对象
var WebRTC = {
    // 创建一个指定名称的会话服务
    createRoom: function (roomName, localstream, gotRemoteStream) {
        // 参数检查
        if (roomName == undefined) {
            trace('必须设置参数 roomName 的值！');
            return null;
        }
        var webRTC = {};
        webRTC.leaveRoom = function () {

        }
        webRTC.closeRoom = function () {

        }

        var server = {};
        server.name = roomName;
        this.roomName = roomName;
        // 客户端 ID 集合
        var clients = new Array();   // 结构：索引 为 客户端名称，值 为 客户端 Id
        // 客户端连接对象集合
        var clientNames = new Array(); // 结构：索引 为 客户端Id，值 为 对等连接

        chat = $.connection.webRTC;

        // 注册本机为服务器
        chat.client.getLocalServerId = function (connectionId, serverName) {
            server.Id = connectionId;
            trace('获得服务器 ID 为' + server.Id);
        }
        // 监听查找服务器请求
        chat.client.findServerId = function (clientId, clientName, serverName) {
            trace('查找服务器请求路经此地！');
            if (roomName == serverName) {
                chat.server.sendServerId(server.Id, clientId);
                // 记录客户端 ID 和 Name
                clients[clientName] = clientId;
            }
        }
        // 监听远程连接请求
        chat.client.onRequestConnection = function (clientId) {
            videoTracks = localstream.getVideoTracks();
            audioTracks = localstream.getAudioTracks();
            if (videoTracks.length > 0)
                trace("正使用视频设备: " + videoTracks[0].label);
            if (audioTracks.length > 0)
                trace("正使用音频设备: " + audioTracks[0].label);

            //currentClientId = clientId;
            var servers = {
                iceServers: [
                    { url: "stun:23.21.150.121" },
                    { url: "stun:stun.l.google.com:19302" },
                    createIceServer("turn:numb.viagenie.ca", "OuTine@Gmail.com", "star1234")
                ]
            };
            // 创建对等连接，并加入客户端集合
            var pc = new RTCPeerConnection(servers, OPTIONS);
            // 监听服务端对等连接候选设置事件
            pc.onicecandidate = function (event) {
                // 请求客户端候选设置
                chat.server.requestClientCandidate(clientId, event);
            };
            pc.addStream(localstream);
            trace("添加本地流到服务器");
            pc.createOffer(function (desc) {
                pc.setLocalDescription(desc, function () {
                    trace("从服务端发起连接 SDP信息为： \n" + desc.sdp);
                    chat.server.requestClientAnswer(clientId, desc);
                });
            }, onCreateSessionDescriptionError);
            
            clientNames[clientId] = pc;
        }
        chat.client.onServerIceCandidateSet = function (clientId) {
            trace('收到Ice候选设置请求！');
            clientNames[clientId].onicecandidate = function (event) {
                chat.server.requestClientCandidate(clientId, event)
            };
            chat.server.clientIceCandidateSet(clientId);
        }
        chat.client.onSetServerRemoteDescription = function (clientId, desc) {
            clientNames[clientId].setRemoteDescription(new RTCSessionDescription(desc));
        }
        chat.client.onRequestServerCandidate = function (clientId, event) {
            trace('已创建服务器Ice候选！');
            handleCandidate(event.candidate, clientNames[clientId], "客户端: ", "远程");
        }

        $.connection.hub.start().done(function () {
            trace('信令服务启动成功！');
            trace('注册本机 ' + roomName + ' 为服务器');
            chat.server.registerServer(roomName);
        });

        return webRTC;
    },
    // 加入一个指定名称的会话服务
    joinRoom: function (userName, roomName, gotStream) {
        // 参数检查
        if (userName == undefined || roomName == undefined) {
            trace('参数 userName 与 roomName 均必须有值！');
            return null;
        }
        if (userName == roomName) {
            trace('参数 userName 不能与 roomName 相同！');
            return null;
        }
        // 开始执行
        var webRTC = {};
        webRTC.leaveRoom = function () {

        }
        webRTC.closeRoom = function () {

        }
        var pc;
        // 启动通讯
        var start = function () {
            trace("开始呼叫");
            // 设置本地连接的同时，请求服务器端设置对应连接
            chat.server.requestConnection(server.Id, client.Id);
            pc = new RTCPeerConnection(SERVERS, OPTIONS);
            // 监听捕获远程流事件设置到 gotStream 函数
            pc.onaddstream = gotStream;
            // 监听客户端候选设置事件
            pc.onicecandidate = function (event) {
                trace("请求服务器候选设置1");
                chat.server.requestServerCandidate(server.Id, client.Id, event);
            };
            trace("客户端: 已创建客户端对等连接对象");
        }

        var server = {};
        // 客户端 ID
        var client = {};
        client.Name = userName;

        chat = $.connection.webRTC;
        // 处理查找服务器请求
        chat.client.findServerId = function (clientId, clientName, serverName) {
            trace('查找服务器请求路经此地！');
            if (userName == serverName)
                chat.server.sendServerId(client.Id, clientId);
            if (userName == clientName) {
                trace('已成功获取客户端 Id ' + clientId + '！');
                client.Id = clientId;
            }
        }
        // 已得到服务器ID
        chat.client.onOrderServerId = function (serId) {
            trace('已成功获取服务器 Id ' + serId + '！');
            server.Id = serId; start();
        }
        chat.client.onRequestClientAnswer = function (desc) {
            trace('已成功收到服务器描述 \n' + desc.sdp);
            pc.setRemoteDescription(new RTCSessionDescription(desc), function () {
                pc.createAnswer(function (desc) {
                    pc.setLocalDescription(desc);
                    trace("从客户端应答 \n" + desc.sdp);
                    // 传递 SDP 信息到服务器
                    chat.server.setServerRemoteDescription(server.Id, client.Id, desc);
                }, onCreateSessionDescriptionError, sdpConstraints);
            });
        }
        chat.client.onRequestClientCandidate = function (event) {
            handleCandidate(event.candidate, pc, "服务端 ", "本地");
        }
        $.connection.hub.start().done(function () {
            trace('信令服务启动成功！\r\n注册本机 ' + userName + ' 为客户端');
            // 注册客户端
            chat.server.registerClient(userName, roomName);
        });

        return webRTC;
    }
}

function onCreateSessionDescriptionError(error) {
    trace('创建会话描述失败: ' + error.toString());
}

function handleCandidate(candidate, dest, prefix, type) {
    if (candidate) {
        dest.addIceCandidate(new RTCIceCandidate(candidate),
                             onAddIceCandidateSuccess, onAddIceCandidateError);
        trace(prefix + "新的 " + type + " ICE 候选: " + candidate.candidate);
    }
}

function onAddIceCandidateSuccess() {
    trace("添加 Ice 候选成功.");
}

function onAddIceCandidateError(error) {
    trace("添加 Ice 候选失败: " + error.toString());
}
