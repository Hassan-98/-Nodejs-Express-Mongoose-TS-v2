//= Models
import USER_MODEL from '../components/User/user.model';
//= Types
import { Server, Socket } from 'socket.io';
import { User } from '../components/User/user.types';

class ChatSockets {
  private io: Server;
  private socket: Socket;
  private current_user: User | null = null;

  constructor(io: Server, socket: Socket) {
    this.io = io;
    this.socket = socket;

    // /************** User Connected Event **************/
    socket.on('user-connected', this.userConnected);

    // /************** Action On Disconnect **************/
    socket.on('disconnect', this.disconnect)
  }

  /*******************************************************/
  /********|*|*|********| Actions |*************|*|*|*****/
  /*******************************************************/

  //= User Connected Event
  async userConnected(id: string) {
    const { socket } = this;
    try {
      const user: User = await USER_MODEL.findById(id).lean();

      if (user) this.current_user = user;

      console.log(`\x1b[32m%s\x1b[0m`, `\n✅ [Socket] User ${user.username} connected`);
    } catch (err: any) {
      console.log(`\x1b[31m%s\x1b[0m`, `\n❌ [Socket] Error: ${err.message}`);
      socket.emit('Error-Message', err.message);
    }
  }
  //= User DisConnected Event
  async userDisconnected() {

  }
  //= Action On Disconnect
  async disconnect() {
    const { socket } = this;
    try {
      this.userDisconnected();
    } catch (err: any) {
      console.log(`\x1b[31m%s\x1b[0m`, `\n❌ [Socket] Error: ${err.message}`);
      socket.emit('Error-Message', err.message);
    }
  }
}

export default ChatSockets;
