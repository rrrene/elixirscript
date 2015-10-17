import Kernel from './kernel';

function start(options = []){
  const name = Keyword.has_key__qm__(options, Kernel.SpecialForms.atom("name")) ? Keyword.get(options, Kernel.SpecialForms.atom("name")) : null;
  
  let pid = self.post_office.spawn();
  self.post_office.put(pid, "handlers", new Map());

  if(name){
    self.post_office.register(name, pid);
    return Kernel.SpecialForms.tuple(Kernel.SpecialForms.atom("ok"), name);
  }

  return Kernel.SpecialForms.tuple(Kernel.SpecialForms.atom("ok"), pid);
}

function add_handler(manager, handler, args){
  let [status, state] = handler.init.apply(null, args);

  self.post_office.get(manager, "handlers").put(handler, state);
  return Kernel.SpecialForms.atom("ok");
}

function notify(manager, event){
  let handler_map = self.post_office.get(manager, "handlers");

  for([handler, state] of handler_map){
    let [state, new_state] = handler.handle_event(event, state);
    handler_map.set(handler, new_state);
  }

  return Kernel.SpecialForms.atom("ok");
}

function call(manager, handler, request, timeout = 5000){
  let handler_map = self.post_office.get(manager, "handlers");

  let [status, reply, new_state] = handler.handle_call(request, handler_map.get(handler));
  handler_map.set(handler, new_state);

  return reply;
}

function remove_handler(manager, handler, args){
  let handler_map = self.post_office.get(manager, "handlers");
  handler.terminate(Kernel.SpecialForms.atom("remove_handler"), handler_map.get(handler));
  return Kernel.SpecialForms.atom("ok");
}

function stop(manager){
  let handler_map = self.post_office.get(manager, "handlers");

  for([handler, state] of handler_map){
    handler.terminate(Kernel.SpecialForms.atom("stop"), state);
  }

  self.post_office.exit(manager);
}

export default { start, add_handler, notify, call, remove_handler, stop };