import Kernel from './kernel';

function start(mod, args){
  let pid = self.post_office.spawn();
  let [ok, state] = mod.init.apply(null, args);

  self.post_office.put(pid, "state", state);
  self.post_office.put(pid, "mod", mod);

  return Kernel.SpecialForms.tuple(
    Kernel.SpecialForms.atom("ok"), 
    pid
  );
}

function call(server, request){
  let mod = self.post_office.get(server, "mod");

  let [reply, response, new_state] = mod.handle_call(request, server, self.post_office.get(server, "state"));
  self.post_office.put(server, "state", new_state);

  return response;
}

function cast(server, request){
  let mod = self.post_office.get(server, "mod");

  let [reply, response, new_state] = mod.handle_cast(request, self.post_office.get(server, "state"));
  self.post_office.put(server, "state", new_state);

  return Kernel.SpecialForms.atom("ok"); 
}

function stop(server){
  self.post_office.exit(server);
}

export default { start, call, cast, stop };