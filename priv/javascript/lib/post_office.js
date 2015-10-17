/* @flow */
import Patterns from './patterns/patterns';

function update(map: Map, key: Symbol, value: any): Map {
  let m = new Map(map);
  m.set(key, value);
  return m;
}

function remove(map: Map, key: Symbol): Map {
  let m = new Map(map);
  m.delete(key);
  return m;
}

let process_counter = -1;

class PID {
  constructor(){
    process_counter = process_counter + 1;
    this.id = process_counter;
  }

  toString(){
    return "PID#<0." + this.id + ".0>";
  }
}

class Mailbox{
  messages: Array<any>

  constructor(){
    this.messages = [];
  }

  deliver(message: any){
    this.messages.push(message);
    return message;
  }

  get(){
    return this.messages;
  }

  isEmpty(){
    return this.messages.length === 0;
  }

  removeAt(index){
    this.messages.splice(index, 1);
  }
}

class Process {
  pid: PID;
  mailbox: Mailbox;
  dictionary: Map;

  constructor(pid: PID, mailbox: Mailbox){
    this.pid = pid;
    this.mailbox = mailbox;
    this.dictionary = new Map();
  }

  put(key, value){
    this.dictionary = update(this.dictionary, key, value);
  }

  get(key){
    return this.dictionary.get(key);
  }

  erase(key){
    return this.dictionary = remove(this.dictionary, key);
  }

  get_keys(){
    return this.dictionary.keys();
  }
}


class PostOffice {
  processes: Map;
  mailboxes: Map;
  names: Map;

  constructor(){
    this.processes = new Map();
    this.mailboxes = new Map();
    this.names = new Map();
  }

  spawn(){
    let pid = new PID();
    let mailbox = new Mailbox();

    this.processes = update(this.processes, pid, new Process(pid, mailbox));
    this.mailboxes = update(this.mailboxes, pid, new Mailbox());

    return pid;
  }

  exit(receiver: any){
    let pid = this.pidof(receiver);
    this.unregister(pid);

    this.processes = remove(this.processes, pid);
    this.mailboxes = remove(this.mailboxes, pid);    
  }

  register(name, pid){
    if(!this.names.has(name)){
      this.names = update(this.names, name, new Set());      
    }

    this.names.get(name).add(pid);
  }

  registered(name){
    if(this.names.has(name)){
      return this.names.get(name).values();
    }

    return [];
  }

  unregister(pid){
    for(let name of this.names.keys()){
      if(this.names.has(name) && this.names.get(name).has(pid)){
        this.names.get(name).delete(pid);
      }
    }
  }

  pidof(){
    if (id instanceof PID) {
       return this.processes.has(id) ? id : null;
    } else if (id instanceof Process) {
       return id.pid;
    } else {
       let pid = this.registered(id);
       if (pid === null)
          throw("Process name not registered: " + id + " (" + typeof(id) + ")");
       return pid;
    }
  }

  send(receiver: any, message: any): void {
    let pid = this.pidof(receiver);
    this.mailboxes.get(pid).deliver(message);
  }

  receive(receiver: any, fun: Function): any {
    for(let msg of this.mailboxes.get(pid).get()){
      try{
        return fun(msg);
      }catch(e){
        if(!e instanceof Patterns.MatchError){
          throw e;
        }
      }
    }

    return null;
  }

  put(pid, key, value){
    this.processes.get(this.pidof(pid)).put(key, value);
  }

  get(pid, key){
    return this.processes.get(this.pidof(pid)).get(key);
  }

  erase(pid, key){
    return this.processes.get(this.pidof(pid)).erase(key);
  }

  get_keys(pid){
    return this.processes.get(this.pidof(pid)).get_keys();
  }
}

export default PostOffice