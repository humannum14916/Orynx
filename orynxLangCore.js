//Orynx language core
const LangEnv = function(){
  //parser
  function parse(code,env){
    let error = e=>{env.error(e);};
    let parsed = parseCode(preP(code,error),error);
    return parsed[0];
  }
  function preP(codeE,error){
    //code preprocesser
    //removes comments and whitespace
    //and errors on unclosed strings / block
    //comments
    let code = codeE.slice();
    let out = "";
    let inString = false;
    let blockComment = false;
    let escaped = false;
    while(code.length>0){
      if(escaped === true) escaped = false;
      if(escaped == 1) escaped = true;
      if(!blockComment){
        if(!inString){
          if(code[0]=="\""){
            // ", string
            inString = true;
            out += code[0];
          } else if(code[0]=="/"&&code[1]=="*"&&!inString){
            // /*, block comment
            blockComment = true;
          }else if(code.slice(0,2)=="//"&&!inString){
            // //, line comment
            let end = code.indexOf("\n");
            code = code.slice(end);
          } else if(!/\s/.test(code[0])){
            //normal code
            out += code[0];
          }
        } else {
          if(code[0]=="\""&&(!escaped)){
            //end of string
            inString = false;
          }
          out += code[0];
          if(code[0] == "\\" && (!escaped)) escaped = 1;
        }
      } else {
        if(code[0]=="*"&&code[1]=="/"){
          //end of block comment
          blockComment = false;
          code = code.slice(1);
        }
      }
      code = code.slice(1);
    }
    if(inString) error("ParseError: String left unclosed");
    if(blockComment) error("ParseError: Block comment left unclosed");
    return out;
  }
  function parseCode(code,error){
    //codeblock parser
    let out = [];
    while(code.length>0&&code[0]!="}"){
      let line = {};
      [line.t,code] = parseExp(code,error,"=;");
      if(code[0]==";"){
        //bare function call
        out.push({t:[{type:"access",val:[
          {type:"constant",val:{type:"string",val:"_"}}
        ]}],f:line.t});
        code = code.slice(1);
        continue;
      }
      code = code.slice(1);
      [line.f,code] = parseExp(code,error,";");
      code = code.slice(1);
      out.push(line);
    }
    return [out,code];
  }
  function parseExp(code,error,expectedEnd){
    //expression parser
    let out = [];
    while("=:;],)>".indexOf(code[0])==-1){
      let c;
      [c,code] = parseExpComp(code,error);
      out.push(c);
      if(code.length == 0) error("ParseError: End of input without end of expression");
    }
    if(expectedEnd){
      if(expectedEnd.indexOf(code[0])==-1){
        console.log(code);
        error("ParseError: Expression ended with \""+code[0]+"\", expected one of \""+expectedEnd.split().join(",")+"\"");
      }
    }
    return [out,code];
  }
  function parseExpComp(code,error){
    //expression component parser
    if(/\d/.test(code[0])&&code.search(/\D/)==code.search(/["{<>()\[\].,=:;]/)){
      //number
      let end = code.search(/\D/);
      if(end == -1) end = code.length;
      let num = code.slice(0,end);
      code = code.slice(end);
      
      return [{type:"constant",val:{
          type:"number",val:num
        }},code];
    } else if(code[0]=="\""){
      //string
      code = code.slice(1);
      let string = "";
      let escaped = false;
      while(code[0]!="\""||escaped){
        escaped = false;
        if(code[0] == "\\" && (!escaped)){
          escaped = true;
        } else {
          string += code[0];
        }
        code = code.slice(1);
      }
      code = code.slice(1);
      if(code.search(/["{<>()\[\].,=:;]/)!=0) error("ParseError: String closed before expression component");
      return [{type:"constant",val:{
          type:"string",val:string
        }},code];
    } else if(code[0]=="{"){
      //code
      code = code.slice(1);
      let block;
      [block,code] = parseCode(code,error);
      if(code[0]!="}") error("ParseError: End of input without closing code block");
      code = code.slice(1);
      return [{type:"constant",val:{
          type:"function",val:block
        }},code];
    } else if(code[0]=="<"){
      //object
      let valO = [];
      code = code.slice(1);
      while(code[0]!=">"){
        let key,val;
        [key,code] = parseExp(code,error,":");
        code = code.slice(1);
        [val,code] = parseExp(code,error,",>");
        if(code[0] == ",") code = code.slice(1);
        valO.push({k:key,v:val});
        if(code.length==0) error("ParseError: End of input without closing object definition");
      }
      code = code.slice(1);
      return [{type:"constant",
        val:{type:"object",val:valO}},code];
    } else if(code[0]=="("){
      //apply
      let params = [];
      code = code.slice(1);
      while(code[0]!=")"){
        let param;
        [param,code] = parseExp(code,error,",)");
        params.push(param);
        if(code[0] == ",") code = code.slice(1);
        if(code.length==0) error("ParseError: End of input without closing apply parenthesis");
      }
      code = code.slice(1);
      return [{type:"apply",val:params},code]
    } else {
      //access
      if(code[0]!="["){
        //bare access and special values
        if(code[0]==".") code = code.slice(1);
        let end = code.search(/["{<>()\[\].,=:;]/);
        if(end == -1) error("ParseError: Bare access name has no termination");
        let name = code.slice(0,end);
        if(name == "") error("ParseError: Length-zero bare access name");
        code = code.slice(end);
        let type = /^\d+$/.test(name);
        if(name=="true"||name=="false"){
          //bool definitions
          return [{type:"constant",val:{
            type:"bool",val:name
          }},code];
        }
        if(name=="null"){
          //null definition
          return [{type:"constant",val:{
            type:"null",val:"null"
          }},code];
        }
        return [{type:"access",val:[
          {type:"constant",val:{type:type?"number":"string",val:name}}
        ]},code];
      } else {
        code = code.slice(1);
        let exp;
        [exp,code] = parseExp(code,error);
        code = code.slice(1);
        return [{type:"access",val:exp},code]
      }
    }
  }

  //interpreter
  class SFunc {
    //dummy object with LangVal - like properties
    //for build-in functions
    constructor(func,name,env){
      this.type = "function";
      this.value = [name];
      this.env = env;
      this.id = env.id();
      this.callF = func;
      this.name = name;

      this.env.functions["string,\""+name+"\""] = this;
    }
    access(){this.env.error("Cannot access properties of a non-object value");}
    getString(){
      return "Built-in function "+this.name;
    }
    getStringS(){
      return "Built-in function "+this.name;
    }
  }

  class LangEnv{
    //language environment
    //acts as both a container for the program
    //and an interface to run code through
    constructor(readFile,output){
      //platform test
      this.platform = "node";
      try{
        alert;
        this.platform = "webpage";
      }catch(e){}

      //given file reading function
      this.readFile = readFile;

      //given output handler
      this.output = output;

      //id number
      this.nextId = 0;

      //threads
      this.threads = [];
      this.threadIndex = 0;
      this.allFrozen = false;

      //extention variables
      this.extentions = Object.create(null);

      //built-in functions (and values)
      this.functions = {
        "string,\"platform\"":new LangVal(
          "string",this.platform,this)
      };
      new SFunc(async ([param])=>{
        this.output({type:"Log",val:await param.getString()});
        return new LangVal("null","null",this);
      },"log",this);
      new SFunc(async ([param])=>{
        this.error(await param.getString());
        return new LangVal("null","null",this);
      },"error",this);
      new SFunc(([param],originScope)=>{
        if(param.type=="object"){
          return new LangVal("ojbect",
            Object.assign(Object.create(null),param.value),this,originScope,true);
        } else if(param.type=="function"){
          return new LangVal("function",param.value,this,originScope);
        } else return param;
      },"copy",this);
      new SFunc(([param],originScope)=>{
        if(param.type=="object"){
          let val = Object.create(null);
          let out = new LangVal("object",val,this,originScope,true);
          for(let k of Object.keys(param.value)){
            val[k] = this.functions["string,\"deepCopy\""].callF(
              [param.value[k]],out
            );
          }
          return out;
        } else if(param.type=="function"){
          return new LangVal("function",param.value,this,originScope);
        } else {
          return param;
        }
      },"deepCopy",this);
      new SFunc(async params=>{
        return new LangVal("bool",
          (await params[0].getString())==(await params[1].getString()),
          this);
      },"equals",this);
      new SFunc(params=>{
        return new LangVal("bool",
          params[0].id==params[1].id,
          this);
      },"deepEquals",this);
      new SFunc(([a,b])=>{
        if(a.type=="number"&&b.type=="number"){
          return this.check(new LangVal("number",(a.value*1)+(b.value*1),this),a,b,"+");
        } else if(a.type=="string"&&b.type=="string"){
          return new LangVal("string",a.value+b.value,this);
        }this.error("Cannot add non-numbers or non-strings");
      },"+",this);
      new SFunc(([a,b])=>{
        if(a.type=="number"&&b.type=="number"){
          return this.check(new LangVal("number",(a.value*1)-(b.value*1),this),a,b,"-");
        } else this.error("Cannot subtract non-numbers");
      },"-",this);
      new SFunc(([a,b])=>{
        if(a.type=="number"&&b.type=="number"){
          return this.check(new LangVal("number",(a.value*1)*(b.value*1),this),a,b,"*");
        } else this.error("Cannot multiply non-numbers");
      },"*",this);
      new SFunc(([a,b])=>{
        if(a.type=="number"&&b.type=="number"){
          return this.check(new LangVal("number",(a.value*1)/(b.value*1),this),a,b,"/");
        } else this.error("Cannot divide non-numbers");
      },"/",this);
      new SFunc(([param],originScope)=>{
        if(param.type!="object") this.error("Cannot get keys of a non-object");
        let keys = Object.keys(param.value);
        let out = Object.assign(Object.create(null),
          {"string,\"length\"":new LangVal("number",keys.length,this)}
        );
        for(let i=0;i<keys.length;i++){
          out["number,\""+i+"\""] = new LangVal("string",keys[i],this);
        }
        return new LangVal("object",out,this,originScope,true);
      },"keys",this);
      new SFunc(async ([param],originScope)=>{
        if(param.type!="string") this.error("Module name must be a string");
        let moduleO = new LangVal("object",Object.assign(Object.create(null),{
            "string,\"return\"":new LangVal("null","null",this)
          }),this,originScope,true);
        let attempt = await this.readFile(param.value);
        if(!attempt) this.error("Module file does not exist");
        let moduleF = new LangVal("function",
          parse(attempt,this),
          this,moduleO);
        let ret = moduleF.callF([],moduleO);
        return await ret;
      },"import",this);
      new SFunc(async ([param],originScope)=>{
        if(param.type!="string") this.error("Extention file name must be a string");
        let attempt = await this.readFile(param.value);
        if(!attempt) this.error("Extention file does not exist");
        let file = attempt.split("\n\n");
        eval(file.shift())();
        for(let i of file){
          eval("new SFunc("+i+",this);");
        }
      },"extend",this);
      new SFunc(async ([v,t],originScope)=>{
        if(t.type != "string") this.error("Type name must be a string");
        //custom convert
        if(v.type=="object"&&v.value["string,\"customConvert\""]){
          let r = v.value["string,\"customConvert\""].callF([t],originScope);
          if(r.type!=t.type) this.error("customConvert returned wrong type");
          return r;
        }
        //basics
        if(t.value == "string"){
          if(v.type=="object") return new LangVal("string",await v.getString(),this);
          if(v.type=="function") return new LangVal("string","Function #"+await v.getString(),this);
          if(!v.type) return new LangVal("string",await v.getString(),this);
          return new LangVal("string",v.value,this);
        }
        if(t.value == "number" && v.type=="string" && /^\d+$/.test(v.value)){
          return new LangVal("number",v.value,this);
        }
        if(t.value == "bool"){
          if(v.type=="number"){
            return new LangVal("bool",(v.value==0)?"false":"true",this);
          }
          if(v.type=="string"){
            return new LangVal("bool",(v.value=="true")?"true":"false",this);
          }
        }
        //else
        this.error("Cannot convert to that type");
      },"convert",this);
      new SFunc(([a,b])=>{
        if(a.type=="bool"&&b.type=="bool"){
          return new LangVal("bool",(a.value+""=="true")&&(b.value+""=="true"),this);
        } else this.error("Cannot and non-bools");
      },"and",this);
      new SFunc(([a,b])=>{
        if(a.type=="bool"&&b.type=="bool"){
          return new LangVal("bool",(a.value+""=="true")||(b.value+""=="true"),this);
        } else this.error("Cannot or non-bools");
      },"or",this);
      new SFunc(([a])=>{
        if(a.type=="bool"){
          return new LangVal("bool",a.value+""!="true",this);
        } else this.error("Cannot not a non-bool");
      },"not",this);
      new SFunc(([s,a,b])=>{
        if(s.type!="bool") this.error("? must take a bool as first input");
        return (s.value+""=="true")?a:b;
      },"?",this);
      new SFunc(async ([time])=>{
        if(time.type!="number") this.error("Milliseconds to wait must be a number");
        await new Promise(r=>{setTimeout(r,time.value)});
        return new LangVal("null","null",this);
      },"wait",this);
      new SFunc(([a,b])=>{
        if(a.type=="number"&&b.type=="number"){
          return new LangVal("bool",(a.value*1)>(b.value*1),this);
        } else this.error("Cannot compare non-numbers");
      },"greater",this);
      new SFunc(([a,b])=>{
        if(a.type=="number"&&b.type=="number"){
          return new LangVal("bool",(a.value*1)<(b.value*1),this);
        } else this.error("Cannot compare non-numbers");
      },"less",this);
      new SFunc(([func,params],originScope)=>{
        this.newThread(func,[params],originScope);
        return new LangVal("null","null",this);
      },"async",this);
      new SFunc(async ([obj,prop])=>{
        if(obj.type=="object"){
          return new LangVal("bool",obj.value[await prop.getString()]!=undefined,this);
        }
      },"has",this);
      new SFunc(async ([fileName])=>{
        if(fileName.type=="string"){
          let f = await this.readFile(fileName.value);
          if(f) return new LangVal("string",f,this);
          return new LangVal("null","null",this);
        } else this.error("File name must be a string");
      },"readFile",this);
      new SFunc(([string],originScope)=>{
        if(string.type!="string") this.error("Function body must be a string");
        return new LangVal("function",
          parse(string.value,this),
          this,originScope);
      },"function",this);
      new SFunc(([a])=>{
        return new LangVal("bool",a.type=="object",this);
      },"isObject",this);

      //create global scope
      this.top = new LangVal("object",[],this,{
        access:(key)=>{
          if(this.functions[key]){
            return this.functions[key];
          } else {
            this.error("Value \"" + key + "\" not defined");
          }
        }
      });
    }
    //basic interface
    async run(code,params=[]){
      //parses and runs the given code
      let f = new LangVal("function",
        parse(code,this),this,this.top);
      let ret = this.newThread(f,params.map(p=>{
          return new LangVal("string",p,this);
        }),this.top,true
      );
      if(this.threads.length==1) this.nextThread();
      this.output({type:"Return",
        val:await(await ret).getString()
      });
    }
    //id generator
    id(){
      this.nextId++;
      return this.nextId;
    }
    //error reporter
    error(error){
      this.output({type:"Error",val:error});
      process.exit(1);
    }
    //number checker
    check(number,a,b,o){
      //check if the given number LangVal has a
      //value of NaN or similar result
      let n = number.value*1;
      if(!Number.isSafeInteger(n)){
        this.error("Mathematical operation \""+o+"\" yielded an invalid result from "+a.getStringS()+" and "+b.getStringS());
      }
      return number;
    }
    //thread handling
    async wait(newThread) {
      //disable/reset current thread
      //and wait for reactivation
      let thread = this.threads.filter(t=>{return t.active})[0];
      if(thread){
        thread.active = false;
        thread.wait = new Promise(r=>{
          thread.tick = r;
        });
      }
      if(!newThread) this.nextThread();
      if(thread) await thread.wait;
    }
    freezeThread() {
      //freeze and return the current thread
      let thread = this.threads.filter(t=>{return t.active})[0];
      if(thread){
        thread.active = false;
        thread.wait = new Promise(r=>{
          thread.tick = r;
        });
        thread.frozen = true;
      }
      //check if all threads are frozen
      if(this.threads.filter(t=>{return !t.frozen}).length==0){
        this.allFrozen = true;
      }
      //continue with other threads
      if(!this.allFrozen) this.nextThread();
      return thread;
    }
    async waitThaw(thread) {
      //thaw a frozen thread and wait for activation
      let callNext = false;
      if(this.allFrozen){
        this.allFrozen = false;
        callNext = true;
      }
      thread.frozen = false;
      if(callNext) this.nextThread();
      await thread.wait;
    }
    async nextThread() {
      //activate the next thread
      if(this.threads.length == 0){
        //no threads, program ended
        this.output({type:"Status",
          val:"Program Terminated: No active threads"
        });
        return;
      }
      //check if all threads are frozen
      if(this.threads.filter(t=>{return !t.frozen}).length==0){
        this.allFrozen = true;
        return;
      }
      //find next thread
      this.threadIndex++;
      while(
        this.threadIndex>=this.threads.length||
        this.threads[this.threadIndex].frozen
      ){
        if(this.threadIndex>=this.threads.length){
          this.threadIndex = 0
        } else if(
          this.threads[this.threadIndex].frozen
        ){
          this.threadIndex += 1;
        }
      }
      //activate
      this.threads[this.threadIndex].active = true;
      this.threads[this.threadIndex].tick();
    }
    newThread(func,params,originScope,newThread){
      //create a new thread
      //returns a promise that resolves to the
      //called function's return value
      let res;
      let wait = new Promise(r=>{res=r;});
      this.threads.push({
        active:this.threads.length==0,
        wait:wait,
        tick:res,
        frozen:false
      });
      return func.callF(params,originScope,newThread,true);
    }
    //input handling
    input(inputValue){
      //pass an input value to
      //the program's handler function
      //and return a promise that resolves
      //to the handler's return value
      let input = inputValue;
      if(!inputValue.type){
        input = new LangVal("string",inputValue,this);
      }
      let handler = this.top.value["string,\"onInput\""];
      let ret;
      if(handler){
        ret = this.newThread(handler,[input],this.top,true);
        if(this.threads.length==1) this.nextThread();
      }
      return ret;
    }
  }

  class LangVal{
    //A value in the language
    constructor(type,value,env,parent,override){
      //setup
      this.type = type;
      this.value = value;
      this.env = env;
      this.parent = parent;
      //assign id if needed
      if(this.type=="object"||this.type=="function"){
        this.id = env.id();
      } else {
        //data value, make sure stored
        //value is a string
        this.value = this.value + "";
      }
      //object value from input code
      if(this.type=="object"&&(!override)){
        this.value = Object.create(null);
        for(let p of value){
          this.value[this.evalExpS(new LangVal("object",Object.create(null),this.env,this,true),p.k).getStringS()] = 
            this.evalExpS(new LangVal("object",Object.create(null),this.env,this,true),p.v);
        }
      }
    }
    access(key,newVal,override){
      if(this.type=="string"){
        if(key == "string,\"length\"") return new LangVal("number",this.value.length+"",this.env);
        if(key.slice(0,key.indexOf("\"")-1)!="number") this.env.error("String index must be a number");
        let i = key.slice(key.indexOf("\"")+1,key.length-1);
        if(i>=this.value.length) this.env.error("String index out of range");
        return new LangVal("string",this.value[i],this.env);
      }else if(this.type!="object"){
        this.env.error("Cannot access properties of a non-object or string value");
      }else {
        //attempt to get value
        let val = this.value[key];
        if(!val){
          //value not assigned
          if(override){
            //override, define
            this.value[key] = newVal;
            return;
          } else {
            //look at parent scope
            val = this.parent.access(key,newVal,override);
          }
        }
        if(newVal){
          this.value[key] = newVal;
        }
        //return value
        return val;
      }
    }
    async evalExp(local,exp){
      //expression evaluator (only called on object values)
      //evaluates the given expression on this value
      let val = this;
      for(let t of exp){
        if(t.type=="constant"){
          //constant, set value
          val = new LangVal(t.val.type,t.val.val,this.env,this);
        }
        if(t.type=="access"){
          //access, get key and set value
          let temp = await (await this.evalExp(local,t.val)).getString();
          if(temp == "string,\"this\"") {
            val = this;
          } else if(temp == "string,\"local\""){
            val = local;
            continue;
          } else {
            val = val.access(temp);
          }
        }
        if(t.type=="apply"){
          //function call, evaluate parameters and call function
          let params = [];
          for(let p of t.val){
            params.push(await this.evalExp(local,p));
          }
          val = await val.callF(params,this);
        }
      }
      return val;
    }
    evalExpS(local,exp){
      //a synchonous version of evalExp
      let val = this;
      for(let t of exp){
        if(t.type=="constant"){
          val = new LangVal(t.val.type,t.val.val,this.env,this);
        }
        if(t.type=="access"){
          let temp = this.evalExpS(local,t.val).getStringS();
          if(temp == "string,\"this\"") {
            val = this;
          } else if(temp == "string,\"local\""){
            val = local;
            continue;
          } else {
            val = val.access(temp);
          }
        }
        if(t.type=="apply"){
          let params = [];
          for(let p of t.val){
            params.push(this.evalExpS(local,p));
          }
          val = val.callF(params,this);
        }
      }
      return val;
    }
    async callF(params=[],originScope=undefined,newThread=false,threadStart=false){
      //function call handler
      if(this.type=="object"){
        //when called, objects will pass the call
        //to their "onCall" function
        return this.access("string,\"onCall\"").callF(params,originScope);
      } else if(this.type=="function"){
        //actual function
        //create local variable object
        let local = new LangVal("object",Object.create(null),this.env,this.parent,true);
        //create parameters object
        let paramF = Object.create(null);
        paramF["string,\"length\""] = new LangVal("number",params.length,this.env);
        for(let i=0;i<params.length;i++){
          paramF["number,\""+i+"\""] = params[i];
        }
        //add to parent object
        this.parent.access("string,\"parameters\"",
          new LangVal("object",paramF,this.env,this.parent,true),
          true
        );
        //loop over function lines
        for(let l of this.value){
          //pause thread and wait for next turn
          await this.env.wait(newThread);
          //reset newThread flag
          newThread = false;
          //get final access
          let destP = l.t[l.t.length-1];
          if(destP.type!="access") {
            this.env.error("Destination expression must result in an object property");
          }
          //evaluate source and destination values
          destP = await this.parent.evalExp(local,destP.val);
          let val = await this.parent.evalExp(local,l.f);
          let dest = await this.parent.evalExp(local,l.t.slice(0,l.t.length-1));
          //update source
          dest.access(await destP.getString(),val,true);
        }
        if(threadStart){
          //this was the start of new thread,
          //remove it from the thread list
          this.env.threads.splice(this.env.threadIndex,1);
          this.env.theadIndex--;
          this.env.nextThread();
        }
        return this.parent.value["string,\"return\""]||new LangVal("null","null",this.env);
      } else {
        this.env.error("Cannot call a non-function or object value");
      }
    }
    async getString(){
      //get a string representation of a LangVal
      //used both for outputing values and
      //shallow comparison
      if(this.type == "object"){
        //object
        if(this.value["string,\"customConvert\""]){
          //has a custom conversion function,
          //call it
          return await (
            await this.value["string,\"customConvert\""].callF(
              [new LangVal("string","string",this.env,this)],this
            )
          ).getString();
        }
        //loop over properties and get their strings
        let keys = Object.keys(this.value);
        let objIDs = [this.id];
        let out = "";
        for(let k of keys){
          if(objIDs.indexOf(this.value[k].id)!=-1){
            out += ";" + k + ":[Circular]";
          } else {
           out += ";" + k + ":" + await this.value[k].getString();
           if(this.value[k].id) objIDs.push(this.value[k].id);
          }
        }
        out = out.slice(1);
        return "object,{"+out+"}";
      } else if(this.type == "function"){
        //function, just return the id
        return "function,"+this.id;
      } else {
        //else, return the type and value
        return this.type + ",\"" + this.value + "\"";
      }
    }
    getStringS(){
      //a synchonous version of getString
      if(this.type == "object"){
        let keys = Object.keys(this.value);
        let objIDs = [this.id];
        let out = "";
        for(let k of keys){
          if(objIDs.indexOf(this.value[k].id)!=-1){
            out += ";" + k + ":[Circular]";
          } else {
            out += ";" + k + ":" + this.value[k].getStringS();
            if(this.value[k].id) objIDs.push(this.value[k].id);
          }
        }
        out = out.slice(1);
        return "object,{"+out+"}";
      } else if(this.type == "function"){
        return "function,"+this.id;
      } else {
        return this.type + ",\"" + this.value + "\"";
      }
    }
  }
  
  return LangEnv;
}();

//attempt export
try{
  exports.LangEnv = LangEnv;
}catch{}
