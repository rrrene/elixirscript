import Kernel from './kernel';
import JS from './js';

let Enum = {

  all__qmark__: function* (collection, fun = (x) => x){
    for(let elem of collection){
      let the_result = yield* JS.run(fun, [elem]);

      if(!the_result){
        return yield false;
      }
    }

    return yield true;
  },

  any__qmark__: function* (collection, fun = (x) => x){
    for(let elem of collection){
      let the_result = yield* JS.run(fun, [elem]);

      if(!the_result){
        return yield true;
      }
    }

    return yield false;
  },

  at: function(collection, n, the_default = null){
    if(n > this.count(collection) || n < 0){
      return the_default;
    }

    return collection[n];
  },

  concat: function(...enumables){
    return enumables[0].concat(enumables[1]);
  },

  count: function* (collection, fun = null){
    if(fun == null){
      yield collection.length;
    } else {
      let result = 0;

      for(let elem of collection){
        let the_result = yield* JS.run(fun, [elem]);
        if(the_result){
          result++;
        }
      }

      return yield result;
    }
  },

  drop: function(collection, count){
    return collection.slice(count);
  },

  drop_while: function* (collection, fun){
    let count = 0;

    for(let elem of collection){
      let the_result = yield* JS.run(fun, [elem]);

      if(the_result){
        count = count + 1;
      }else{
        break;
      }
    }

    return yield collection.slice(count);
  },

  each: function* (collection, fun){
    for(let elem of collection){
      yield* JS.run(fun, [elem]);
    }
  },

  empty__qmark__: function(collection){
    return collection.length === 0;
  },

  fetch: function(collection, n){
    if(Kernel.is_list(collection)){
      if(n < this.count(collection) && n >= 0){
        return Kernel.SpecialForms.tuple(Kernel.SpecialForms.atom("ok"), collection[n]);
      }else{
        return Kernel.SpecialForms.atom("error");
      }
    }

    throw new Error("collection is not an Enumerable");
  },

  fetch__emark__: function(collection, n){
    if(Kernel.is_list(collection)){
      if(n < this.count(collection) && n >= 0){
        return collection[n];
      }else{
        throw new Error("out of bounds error");
      }
    }

    throw new Error("collection is not an Enumerable");
  },

  filter: function* (collection, fun){
    let result = [];

    for(let elem of collection){
      let the_result = yield* JS.run(fun, [elem]);

      if(the_result){
        result.push(elem);
      }
    }

    return yield result;
  },

  filter_map: function* (collection, filter, mapper){
    return Enum.map(Enum.filter(collection, filter), mapper);
  },

  find: function* (collection, if_none = null, fun){
    for(let elem of collection){
      if(yield* JS.run(fun, [elem])){
        return yield elem;
      }
    }

    return yield if_none;
  },

  into: function* (collection, list){
    return yield list.concat(collection);
  },

  map: function*(collection, fun){
    let result = [];

    for(let elem of collection){
      let the_result = yield* JS.run(fun, [elem]);
      result.push(the_result);
    }

    return yield result;
  },

  map_reduce: function* (collection, acc, fun){
    let mapped = Kernel.SpecialForms.list();
    let the_acc = acc;

    for (var i = 0; i < this.count(collection); i++) {
      let tuple = yield* JS.run(fun, [collection[i], the_acc]);

      the_acc = Kernel.elem(tuple, 1);
      mapped = Kernel.SpecialForms.list(...mapped.concat([Kernel.elem(tuple, 0)]));
    }

    return yield Kernel.SpecialForms.tuple(mapped, the_acc);
  },

  member: function(collection, value){
    return collection.includes(value);
  },

  reduce: function* (collection, acc, fun){
    let the_acc = acc;

    for (var i = 0; i < this.count(collection); i++) {
      let tuple = yield* JS.run(fun, [collection[i], the_acc]);

      the_acc = Kernel.elem(tuple, 1);
    }

    return yield the_acc;
  },

  take: function(collection, count){
    return collection.slice(0, count);
  },

  take_every: function(collection, nth){
    let result = [];
    let index = 0;

    for(let elem of collection){
      if(index % nth === 0){
        result.push(elem);
      }
    }

    return Kernel.SpecialForms.list(...result);
  },

  take_while: function* (collection, fun){
    let count = 0;

    for(let elem of collection){
      if(yield* JS.run(fun, [elem])){
        count = count + 1;
      }else{
        break;
      }
    }

    return yield collection.slice(0, count);
  },

  to_list: function(collection){
    return collection;
  }
};

export default Enum;
