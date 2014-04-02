using Microsoft.AspNet.SignalR;
using Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// WebRTC 的摘要说明
/// </summary>
public class WebRTC : Hub
{
    public void Send(string UserName, string Message)
    {
        Clients.All.sendMessage(UserName, Message);      // 所有连接
        //Clients.Caller.sendMessage(UserName, Message);  // 当前连接
        //Clients.Others.sendMessage(UserName, Message); //当前连接以外的客户端
    }
    /// <summary>
    /// 请求服务器连接
    /// </summary>
    /// <param name="serverId"></param>
    public void RequestConnection(string serverId, string clientId)
    {
        Clients.Client(serverId).startConnection(clientId);
    }
    /// <summary>
    /// 注册某端作为服务器
    /// </summary>
    /// <param name="serverName"></param>
    public void RegisterServer(string serverName)
    {
        var id = Context.ConnectionId;
        Clients.Caller.getLocalServerId(id, serverName);
    }
    /// <summary>
    /// 注册某端作为客户端
    /// </summary>
    /// <param name="clientName"></param>
    public void RegisterClient(string clientName, string serverName)
    {
        var id = Context.ConnectionId;
        Clients.All.findServerId(id, clientName, serverName);
        //Clients.Caller.getLocalClientId(id, clientName);
    }
    /// <summary>
    /// 为客户端请求发送服务器 Id
    /// </summary>
    /// <param name="serverId"></param>
    /// <param name="clientId"></param>
    public void SendServerId(string serverId, string clientId)
    {
        Clients.Client(clientId).onOrderServerId(serverId);
    }
    /// <summary>
    /// 触发服务器 ICE 候选设置
    /// </summary>
    /// <param name="serverId"></param>
    /// <param name="clientId"></param>
    public void ServerIceCandidate(string serverId, string clientId)
    {
        Clients.Client(serverId).onServerIceCandidateSet(clientId);
    }

    public void RequestClientAnswer(string clientId, object desc)
    {
        Clients.Client(clientId).onRequestClientAnswer(desc);
    }
    /// <summary>
    /// 设置服务器端远程信息描述
    /// </summary>
    /// <param name="serverId"></param>
    /// <param name="desc"></param>
    public void SetServerRemoteDescription(string serverId, object desc)
    {
        Clients.Client(serverId).onSetServerRemoteDescription(desc);
    }
    /// <summary>
    /// 请求客户端候选执行
    /// </summary>
    /// <param name="clientId"></param>
    /// <param name="e"></param>
    public void RequestClientCandidate(string clientId, object e)
    {
        Clients.Client(clientId).onRequestClientCandidate(e);
    }
    /// <summary>
    /// 请求服务器候选执行
    /// </summary>
    public void RequestServerCandidate(string serverId, object e)
    {
        Clients.Client(serverId).onRequestServerCandidate(e);
    }

    public void ClientIceCandidateSet(string clientId)
    {
        Clients.Client(clientId).onClientIceCandidateSet();
    }
}

public class Startup
{
    public void Configuration(IAppBuilder app)
    {
        app.MapSignalR();
    }
}
