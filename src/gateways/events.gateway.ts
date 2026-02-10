import { Global } from '@nestjs/common'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@Global()
@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  handleConnection() {
    console.log('handleConnection')
  }

  handleDisconnect(client: Socket) {
    console.log('handleDisconnect')
  }

  @SubscribeMessage('joinRoom')
  joinRoom(client: Socket, roomId: string): string {
    client.join(roomId)
    return 'ok'
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(client: Socket, roomId: string): string {
    client.leave(roomId)
    return 'ok'
  }

  refresh() {
    this.server.emit('message', {
      data: 'refresh',
    })
  }
}
