//frontend for the Orynx language

//import the Orynx language core
const {LangEnv} = require("./orynxLangCore.js");

//import the needed filesystem functions
const {readFileSync,readdirSync} = require("fs");

//import the node REPL
const repl = require("repl");

//import the OS module
const os = require("os");

//orynxCore folder path
const corePath = os.homedir()+"/bin/Orynx";

//file reading function
function getFile(n,strict=false){
  //file reading function
  try{
    //check if it is a library file
    if(readdirSync(corePath+"/lib").indexOf(n)!=-1){
      //library file
      return readFileSync(corePath+"/lib/"+n,"utf8");
    } else {
      //other file
      return readFileSync(n,"utf8");
    }
  }catch(e){
    if(strict){
      console.log("File \""+n+"\" not found");
      process.exit(0);
    }
    return null;
  };
}

//basic output function
function printOutput(o){
  console.log(o.type+": "+o.val);
}

//define a basic run function
function run(filename,params=[]){
  //create the environment
  let env = new LangEnv(getFile,printOutput);
  //read and run the code
  env.run(getFile(filename,true),params);
}

//check if a file argument is given
if(process.argv[2]){
  //file given, run the code
  let i = process.argv[3];
  if(i) i = [i];
  run(process.argv[2],i);
} else {
  //no file, enter REPL

  //environment
  let env;

  //environment reset
  function resetEnv(){
    env = new LangEnv(getFile,printOutput);
  }

  //setup environment
  resetEnv();

  //start REPL
  const r = repl.start({prompt:">",eval:async (input,ctx,fn,ret)=>{
    //send the input to the environment
    await env.run(input);

    //return value not used
    ret(null);
  },ingnoreUndefined:true});

  //add the reset command
  r.defineCommand("reset",_=>{resetEnv();console.log("Environment reset"); console.log()});
}
