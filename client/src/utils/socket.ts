import { io } from 'socket.io-client'
import { SOCKET_SERVER } from 'config'

class SocketController {
  instance: any;

  constructor() {
    this.instance = io(SOCKET_SERVER, {
        auth: {
          token: 'secrettoken'
        }
    })
  }
}

const Socket = new SocketController();

export default Socket;