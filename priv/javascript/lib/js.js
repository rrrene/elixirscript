import SpecialForms from "./kernel/special_forms";
import Tuple from "./tuple";


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

function resolve(value){
  if(Array.isArray(value)){
    return value.map((elem) => resolve(value));
  }

  if(value instanceof Tuple){
    let result = [];

    for(let elem of value){
      result.push(resolve(elem));
    }

    return SpecialForms.tuple(...result);
  }

  if(
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    typeof value === 'symbol' ||
    value === null ||
    typeof value === 'undefined' ||
    Object.prototype.toString.call(value) == '[object Function]'
  ){
    return value;
  }

  if(Object.prototype.toString.call(value) == '[object Generator]'){
    let result = value.next(undefined);

    while(!result.done){
      result = value.next(result.value);
    }

    return result.value;
  }

  return value;
}

function to_function(genFunc, context = null) {
  return function(...args){
    let genObj = genFunc.apply(context, args);

    function run(...args) {
      let item = genObj.next(args[0]);
      if (!item.done) {
          return run(item.value);
      }

      return item.value;
    }

    return run();

  }
}

export default {
  call_property, run, to_function, resolve
};
