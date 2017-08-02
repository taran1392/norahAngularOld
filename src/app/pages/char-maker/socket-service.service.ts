import { Injectable } from '@angular/core';
import {Socket} from 'ng2-socket-io';
@Injectable()
export class SocketService extends Socket {

  constructor() { 
    super({url:"http://54.254.224.168:8080",options:{}})

    
  }




}
