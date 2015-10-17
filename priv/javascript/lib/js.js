
function* call_property(item, property){
  if(item[property] instanceof Function){
    return yield* item[property]();
  }else{
    return yield item[property];
  }
}

function* run(fun, args, context = null){
  if(fun.constructor.name === "GeneratorFunction"){
    return yield* fun.apply(context, args);
  }

  return yield fun.apply(context, args);
}

function to_function(genFunc, context = null) {

    return function(...args){
      let genObj = genFunc.apply(context, args);

      function run(...args) {
        let item = genObj.next(args[0]);
        if (!item.done) {
            return run(item);
        }

        return item;
      }

      return run();

    }
}

export default {
  call_property, run, to_function
};
