rtcsignalr
==========

基于 Signalr 的 WebRTC 包
==========

使用方法

创建会话房间
            var localStream;
            $(document).ready(function () {

                trace("请求本地多媒体流");
                // Call into getUserMedia via the polyfill (adapter.js).
                getUserMedia({ audio: false, video: true },
                              gotStream, function () { });
            })

            function start() {

                var webRtc = WebRTC.createRoom($('#roomName').val(), localStream, function () { })
            }

            function gotStream(stream) {
                trace("收到本地多媒体流");
                // Call the polyfill wrapper to attach the media stream to this element.
                attachMediaStream($('#local')[0], stream);
                localStream = stream;
            }

加入会话房间
            var webRtc;
            function call() {
                webRtc = WebRTC.joinRoom($('#userName').val(), $('#roomName').val(), gotRemoteStream1);
            }

            function gotRemoteStream1(e) {
                // Call the polyfill wrapper to attach the media stream to this element.
                attachMediaStream($('#remote')[0], e.stream);
                trace("客户端已收到远程视频流");
            }
