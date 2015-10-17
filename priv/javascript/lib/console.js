import JS from "./js";

function log(...args){
  return console.log(...args);
}

function debug(...args){
  return console.debug(...args);
}

function error(...args){
  return console.error(...args);
}

function info(...args){
  return console.info(...args);
}

function warn(...args){
  return console.info(...args);
}


export default {
  log,
  debug,
  error,
  info,
  warn
}