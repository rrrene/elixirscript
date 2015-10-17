import Kernel from './kernel';
import Keyword from './keyword';

let Agent = {};

Agent.start = function(fun, options = []){
  const name = Keyword.has_key__qm__(options, Kernel.SpecialForms.atom("name")) ? Keyword.get(options, Kernel.SpecialForms.atom("name")) : null;
  
  let pid = self.post_office.spawn();
  self.post_office.put(pid, "state", fun());


  if(name){
    self.post_office.register(name, pid);
    return Kernel.SpecialForms.tuple(Kernel.SpecialForms.atom("ok"), name);
  }

  return Kernel.SpecialForms.tuple(Kernel.SpecialForms.atom("ok"), pid);
}

Agent.stop = function(agent, timeout = 5000){
  self.post_office.exit(agent);
  return Kernel.SpecialForms.atom("ok");
}

Agent.update = function(agent, fun, timeout = 5000){

  const current_state = self.post_office.get(agent, "state");
  self.post_office.put(agent, "state", fun(current_state));

  return Kernel.SpecialForms.atom("ok");
}

Agent.get = function(agent, fun, timeout = 5000){
  return fun(self.post_office.get(agent, "state"));
}

Agent.get_and_update = function(agent, fun, timeout = 5000){

  const get_and_update_tuple = fun(self.post_office.get(agent, "state"));
  self.post_office.put(agent, "state", Kernel.elem(get_and_update_tuple, 1));

  return Kernel.elem(get_and_update_tuple, 0);
}

export default Agent;