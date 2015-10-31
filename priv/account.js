var escodegen = require('escodegen');
var log = require("node_erlastic").log;
var Bert = require('node_erlastic/bert');

Bert.convention = Bert.ELIXIR;
Bert.all_binaries_as_string = true;
Bert.map_key_as_atom = false;
Bert.decode_undefined_values = true;

require('node_erlastic').server(function(term, from, state, done){
  if (term == "compile"){
    var g = escodegen.generate(state);
    return done("reply", g);
  }else if(term[0] == "code"){
    return done("noreply", term[1]);  
  }

  throw new Error("unexpected request");
});