rtcsignalr
==========

基于 Signalr 的 WebRTC 包
==========

使用方法
==========
创建会话房间


            var localStream;
            $(document).ready(function () {
                getUserMedia({ audio: false, video: true },
                              gotStream, function () { });
            })

            function start() {
                var webRtc = WebRTC.createRoom(房间名, localStream, function () { })
            }

            function gotStream(stream) {
                attachMediaStream(显示元素, stream);
                localStream = stream;
            }
==========
加入会话房间


            var webRtc;
            function call() {
                webRtc = WebRTC.joinRoom(用户名, 房间名, gotRemoteStream1);
            }

            function gotRemoteStream1(e) {
                attachMediaStream(显示元素, e.stream);
            }
