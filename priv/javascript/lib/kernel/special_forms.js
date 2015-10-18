import BitString from '../bit_string';
import Tuple from '../tuple';
import Enum from '../enum';
import * as Patterns from '../patterns/patterns';
import JS from '../js';

let SpecialForms = {

  __DIR__: function(){
    if(__dirname){
      return __dirname;
    }

    if(document.currentScript){
      return document.currentScript.src;
    }

    return null;
  },

  atom: function(_value) {
    return Symbol.for(_value);
  },

  list: function(...args){
    return Object.freeze(args);
  },

  bitstring: function(...args){
    return new BitString(...args);
  },

  bound: function(_var){
    return Patterns.bound(_var);
  },

  _case: function(condition, clauses){
    return Patterns.defmatch(...clauses)(condition);
  },

  cond: function(clauses){
    for(let clause of clauses){
      if(clause[0]){
        return clause[1]();
      }
    }

    throw new Error();
  },

  fn: function(clauses){
    return Patterns.defmatch(clauses);
  },

  map: function(obj){
    return Object.freeze(obj);
  },

  map_update: function(map, values){
    let obj = Object.assign({}, map);
    return Object.freeze(Object.assign(obj, values));
  },

  _for: function* (collections, fun, filter = () => true, into = [], previousValues = []){
    let pattern = collections[0][0];
    let collection = collections[0][1];

    if(collections.length === 1){

      for(let elem of collection){
        let r = Patterns.match_no_throw(pattern, elem);
        let args = previousValues.concat(r);

        let filter_result = yield* JS.run(filter, args, this);

        if(r && filter_result){
          let fun_result = yield* JS.run(fun, args, this);

          into = yield* Enum.into([fun_result], into);
        }
      }

      return yield into;
    }else{
      let _into = []

      for(let elem of collection){
        let r = Patterns.match_no_throw(pattern, elem);
        if(r){
          let for_result = yield* JS.run(this._for, [collections.slice(1), fun, filter, _into, previousValues.concat(r)], this)
          _into = yield* Enum.into(for_result, into);
        }
      }

      return yield _into;
    }
  },

  tuple: function(...args){
    return new Tuple(...args);
  },

  _try: function* (do_fun, rescue_function, catch_fun, else_function, after_function){
    let result = null;

    try{
      result = yield* JS.run(do_fun, []);
    }catch(e){
      let ex_result = null;

      if(rescue_function){
        try{
          ex_result = yield* JS.run(rescue_function, [e]);
          return yield ex_result;
        }catch(ex){
          if(ex instanceof Patterns.MatchError){
            throw ex;
          }
        }
      }

      if(catch_fun){
        try{
          ex_result = yield* JS.run(catch_fun, [e]);
          return yield ex_result;             
        }catch(ex){
          if(ex instanceof Patterns.MatchError){
            throw ex;
          }
        }
      }

      throw e;

    }finally{
      if(after_function){
        yield* JS.run(after_function, []);
      }
    }

    if(else_function){
      try{  
        return yield* JS.run(else_function, [result]);
      }catch(ex){
          if(ex instanceof Patterns.MatchError){
            throw new Error("No Match Found in Else");
          }

        throw ex;
      }
    }else{
      return yield result;
    }
  }

};

export default SpecialForms;
