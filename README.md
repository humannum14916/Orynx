# Orynx

## Overview
Orynx is a very Javascript-like language (not suprising considering it was inspired by and written in Javascript). While it shares many similarites, there are a few differences that make it (at least in my opinion) a more useful language.

First of all, Orynx does not automatically convert types like Javascript does, and checks to make sure that you aren't doing things like `5 + "7"`.

Second, instead of having to declare a function as asynchonous like in Javascript, any function can be called asynchronously.

Aside from that, Orynx is very similar to JS, and even shares the ability to be run in NodeJS and on webpages.

## Downloading and setting up Orynx
While the Orynx language can be used anywhere Javascript is available, this version of the language is designed to be used from a command line. If you want to use Orynx in another environment, see the next section "Orynx and Javascript".

To set up Orynx, you first need to download or clone this repository. Once you have a local copy, rename the downloaded `Orynx` folder to `orynxCore`. At this point, you can run Orynx using `node ~/path/to/orynxCore/orynx.js /absolute/path/to/orynxCore`. However, this is not very easy to use, and there is an easy way to fix it. By creating a shell script that runs the command automatically, you can create a custom command for Orynx.

For Linux:
Create a file named `orynx` and put the following inside
```bash
#!/bin/bash

#bash command wrapper for the Orynx language

#run the Oryx JS program and pass it the command line parameters
#orynxCore absolue path included as first argument
node ~/bin/orynxCore/orynx.js /home/[yourUsername]/bin/orynxCore $1 $2
```
This file and the `orynxCore` folder should be put under `~/bin` (create a `bin` folder if you don't have one).
Next, you need to set the permissions of the `orynx` file so that you can execute it. Run `chmod 755 ~/bin/orynx` to give yourself permission to execute the file.

For Mac:
Turn on "Show all filename extentions" in Finder -> Preferences -> Advanced.
Open TextEdit and create a new file. Select Format -> Make Plain Text, then put the following inside
```bash
#!/bin/bash

#bash command wrapper for the Orynx language

#run the Orynx JS program and pass it the command line parameters
#orynxCore absolute path included as first argument
node /usr/local/bin/orynxCore/orynx.js /usr/local/bin/orynxCore $1 $2
```
Save the file, then open Finder and rename the file to `orynx` with no file extention.
Enable the display of hidden files in Finder using command-shift-period. Go to Go -> Computer, then to `Macintosh HD/usr/local/bin`. Put `orynx` and `orynxCore` there. You will need to enter an admin password.
Next, you need to set the permissions of the `orynx` file so that you can execute it. Run `chmod 755 /usr/local/bin/orynx` to give yourself permission to execute the file.

At this point, you can test that the `orynx` command is working by opening the terminal and running `orynx test`. For an overview of how to use the `orynx` command, run `orynx help`.

To update to the latest version of Orynx, use the terminal to navigate into the `orynxCore` folder, then run `git pull`.

## Basics
Code in Orynx is broken into statements, which can either consist of two expressions separated by an equals sign, or a single expression. Statements also must end with a semicolon.
```javascript
foo();
a = 5;
```
Here, the first line calls the function `foo`, and the second sets `a` to `5`. Just as in JS, a pair of parenthesis after a function name will call the function, with the option of including parameters.
```javascript
foo(a,b,300);
```
Variables do not need to be declared, simply setting the value of a variable creates it. However, attempting to read a variable without giving it a value will result in an error.
```javascript
//this is the start of the program, a has never
//been given a value

log(a); //this will crash

a = 0; //this will not
```
Comments work the exact same as in JS. `//` comments out the rest of the line (until the next newline, this is the only time whitespace matters), and `/*` and `*/` start and end block comments respectively.

Another important part of Orynx is functions. Again, just like JS, functions are values just like everything else.
```javascript
foo = {
  //an absolutely useless function
  log("foo!");
};
```
Writing a function is as easy as putting the code between curly braces. However, that just creates the function, and it still needs to be written to a variable.

This example also introduced another one of Orynx's basic types: strings. Like most languages, a string is just a pair of quotes with whatever you want inside (however, you cannot put a double quote in a string, as escape characters currently do not exist).
```javascript
line1 = "Strings are fun!";
```
Now for another of the basic types: objects. An object is defined like this:
```javascript
anObject = <
  "first":10,
  "second":4
  3:24
>;
```
You can even do things like this:
```javascript
a = 3;

//produces the same object, just harder to read
fancyKeyNames = <
  "first":*(5,2),
  +("sec","ond"):4,
  a:24
>;
```
And yes, arithmatic is done using functions, and that is probably the worst thing about the entire language.

Because both the property name and value are expressions, you can do things a little more compactly. If you want an object with a property name based off a variable, it can just be defined that way
```javascript
propName = "better?";

anObject = <
  propName:true
>;
```
while in JS you have to write
```javascript
propName = "better?";

let anObject = {};
anObject[propName] = false;
```
And I forgot to mention, booleans are a thing. Simply write `true` or `false`. Additionally, writing `null` will give the null value, which is the default return value for functions.

At this point, I've show how to define an object, but not how to access it's values. As always, it is similar to JS:
```javascript
anObject = <
  "one":1,
  "two":2,
  3:"three"
>;

anObject.one = 5;
anObject.3 = 7;

two = anObject.two;

log(anObject[3]);
```
A `.` followed by a property name will access a property of an object. A pair of square brackets are used to use an expression as the property name. Note that `anObject.3` accesses the property `3` and not `"3"`.

So far I have shown how to pass parameters to functions, but how do you access them in the function? The parameters the function was called with are automatically provided in the `parameters` object.
```javascript
logParams = {
  log(parameters);
  return = "Parameters logged!";
};

logParams("hello!",5);

/*
This will log <0:"hello",1:5,length:2>
*/
```
The `parameters` object has a `length` property that shows the number of parameters. It is a good idea to store the contents of the `parameters` variable in another variable if you will be passing it to other functions. The `parameters` variable is changed quite a lot, so it's a good idea to have a safe copy of it.

Returning a value is done by setting the `return` variable. The default return value is `null`.

Throughout this section, functions like `log()` and `*()` have popped up. These are built-in functions, and they are the core operations of the Orynx language. For now I'll just go over a few, but there is a full list of built-in functions later.
+ `log`: A simple output command. Logs the given
value to the console.
+ `+`: Addition function. Adds two numbers or
concatenates two strings.
+ `-`: Subtraction function. Subtracts two numbers.
+ `*`: Multiplication function. Multiplies two
numbers.
+ `/`: Division function. Divides two numbers.

## The twist
Orynx has some "differences" when it comes to variable scope. For example:
```javascript
scopeTest = {
  log(x);
  x = 2;
  log(x);
};

x = 1;
log(x);

scopeTest();
log(x);
```
This does exactly what you expect, and logs
```
1
1
2
2
```
But what if x wasn't defined?
```javascript
scopeTest = {
  x = 2;
  log(x);
};

scopeTest();
log(x);
```
This is where things get interesting. This code would log
```
2
2
```
Normally, you would expect this to log `2` and then crash, because `x` isn't defined in the global scope. However, this works, because x is actually defined in the global scope. In Orynx, functions don't get their own scope by default, which can be quite useful. To give a function it's own scope, you can use an object.
```javascript
testWrapper = <
  "scopeTest":{
    x = 2;
    log(X);
  }
>;

testWrapper.scopeTest();
log(x);
```
```
2
Crashes, x not defined
```
By having the function be a property of an object, all the sudden it has it's own scope. Things get even more interesting if you look at the object afterward.
```javascript
testWrapper = <
  "scopeTest":{
    x = 2;
    log(X);
  }
>;

testWrapper.scopeTest();
log(testWrapper);
```
```
2
<"scopeTest":function,"x":2,>
```
When the function defines `x`, it sets the `x` property of it's parent object, instead of creating a variable. In Orynx, any variables defined by a function are just set as properties of it's parent object. In fact, the global scope is not a scope at all, but an object, with the variables you define as it's properties. This is one of the core features of Orynx.

## Some more advanced and interesting features
In the last section, I showed how wrapping a function with an object gives it a scope. But having to write `object.function()` is not ideal. To help with this, when you attempt to "call" an object like you would a function, the object will check if it has an `onCall` property, and pass the call to that. This means you can have an object that you can call like a function.
```javascript
scopeTest = {
  "onCall":{
    x = 2;
    log(X);
  }
};

scopeTest();
log(scopeTest);
```
This works exactly the same as the previous example, only without having to directly call the function.

Here's another useful trick:
```javascript
varName = "aVariable";

[varName] = 3;
```
Using square brackets, you can access a variable using another variable as the name. This also works with parenthesis, allowing you to call a function's parent object from inside the function.
```javascript
recursion = <
  "onCall":{
    log("Recursion!!!");
    ();
  }
>;

recursion();
```
If you just need the parent object, the `this` variable will give the parent object.
```javascript
whatAmI = <
  "onCall":{
    log(this);
  }
>;

whatAmI();
```

While you can return a value from a function using the `return` variable, you can also return a value from the main thread as well. When the main thread finishes running, the value of the `return` variable will go to the program output.

If you try to use the `convert` function to convert an object, if the object has a `customConvert` property it will be run and passed the destination type. The return value is returned by `convert`.

Both objects and functions are passed by reference in Orynx. A function's parent object is where it was created, and it will always use that object to store variables, even it the function itself has been moved.
```javascript
objectA = <
  "myFunction":{log(myNumber);},
  "myNumber":10
>;

objectB = <
  "myNumber":20
>;

objectA.myFunction(); //will log 10
objectB.MYfunctionNow = objectA.myFunction;
objectB.MyfunctionNow(); //will still log 10
```
Similarly, objects can be changed from multiple
places.
```javascript
anObject = <"number":1>;

log(anObject.number); //will log 1

sameObject = anObject;
sameObject.number = 5;

log(anObject.number) //will log 5
```

One of the differences between JS and Orynx is asynchronous functions. To call a function asynchronously, simply use the `async` function. Any functions called asynchronously will run beside the current code, and they can interact like in JS. However, unlike JS, execution switches between async functions and the main thread every line, so an async function can go into a loop without freezing the rest of the threads.
```javascript
asyncF = {
  log(1);
  log(2);
  log(3);
  log(4);
  log(5);
  log(6);
  log(7);
  log(8);
  log(9);
};

async(asycnF);
async(asycnF);
```
This will result in both functions running at the same time. The need to run an asynchronous function synchonously is rare, but when you need to do it, it is often incredibly hard to find a way around it. I actually ran into this problem while making Orynx's async function system, and the result is several functions with synchronous duplicates.

## Built-in function guide
A complete list of Orynx's 22 built-in functions
+ `platform`: Not actually a function, but a string that hold the name of the platform the language is running on. `"node"` for NodeJS, and `"webpage"` for a website.
+ `log`: A simple output command. Logs the given value to the console.
+ `error`: Throws an error with the given value. Errors cannot be caught, so be careful.
+ `copy`: Creates a copy of an input value. Will not create copies of an object's properties.
+ `deepCopy`: Creates a deep copy of the input value. Will copy object properites recursivly.
+ `equals`: Checks if the two inputs have the same value. If two objects have the same properties, this will return true.
+ `deepEquals`: Same as equals, but checks that any input objects are the same objects, and don't just have the same value.
+ `+`: Addition function. Adds two numbers or concatenates two strings.
+ `-`: Subtraction function. Subtracts two numbers.
+ `*`: Multiplication function. Multiplies two numbers.
+ `/`: Division function. Divides two numbers.
+ `keys`: Returns the property names of an object in the same format as `parameters`.
+ `import`: Imports a module. Takes the module's file path as an input string, then runs the module's code and returns it's output.
+ `extend`: Loads a language extention. Takes the extention's file path as an input string.
+ `convert`: The only way to change the type of a value. Takes the value as the first input and the name of the destination type as the second.
+ `and`: Returns the logical AND of two bools.
+ `or`: Returns the logical OR of two bools.
+ `not`: Returns the logical NOT of two bools.
+ `?`: Selection operator. Takes a bool as the first input and two values as the second and third. Returns the first value if the input is true and the second if it is false.
+ `wait`: Waits the given number of milliseconds before continuing.
+ `greater`: Takes two numbers and returns true if the first is greater than the second.
+ `less`: Takes two numbers and returns true if the first is less than the second.
+ `async`: Takes a function and a value. Calls the given function asynchonously with the given value.
+ `has`: Takes an object and a property name. Returns true if the object has a property with the given name.
+ `readFile`: Takes a file path as a string and return's the file's contents as a string. If the read fails, `null` is returned.
+ `function`: Takes a string for the function body and returns a the function.
+ `isObject`: Returns true if the given value is an object.

## The standard library
Using the `import` function, you can import the standard library (which is written entirely in Orynx), and gain access to several different features like arrays and, of all things, if statements. Here is a complete list of the features it provides.
+ `if`: Takes a bool and two functions. If the bool is true it runs the first function, otherwise it runs the second.
+ `while`: A basic while loop. Takes a condition function and a body function. Runs the body function until the condition function returns false.
+ `Array`: A decently powerful array system. Arrays have (just like JS) a length property, zero-index values, and a number of manipulation functions. Arrays have a customConvert to strings. Arrays also have a `type` property of `"array"`
  + Calling `Array` will create an array from an object like `parameters`.
  + `Array.from` does the same thing.
  + `Array.array` is the array class.
    + Calling `Array.array` returns a blank array.
    + `Array.array.prototype` is the blank array template.
  + Array manipulation functions:
    + `push`: Add the given value to the end of the array. Returns the new length.
    + `pop`: Removes and returns the last item in the array.
    + `top`: Returs the last item in the array without removing it.
    + `forEach`: Calls the given function on each item in the array.
    + `concat`: Adds the given array to the end of the array.
    + `slice`: Returns a section of the array from first index (inclusive) to last index (exclusive).
+ `le`: Takes two numbers and returns true if the first is less than or equal to the second.
+ `ge`: Takes two numbers and returns true if the first is greater than or equal to the second.
+ `default`: Takes an object, a property name, and a default value. If the object does not have a property under that name, it creates it and gives it the default value. Returns the object.
+ `Promise`: A JS-like promise system. Created Promise objects have a `type` property of `"Promise"`, and a `completed` property. This will be false until the Promise is resolved.
  + Calling `Promise` will run the Promise constructor. It takes an async function, an optional parameter for it, and an optional array of other functions to call on completion.
  + `Promise.prototype`: The Promise template object
  + Promise functions:
    + `onComplete`: Adds another function to be called on Promise resolution. If the Promise has already resolved, the function is called immediately.
  + Usage:
  When the promise is created, it calls the given function asynchonously with the given parameter. When that functions sets the `asyncReturn` variable to something other than `null`, the Promise is resolved. All functions scheduled to be called are called and passed the value of `asyncReturn`.

## The Networking Extention
Currently, Orynx has only two extentions, both for networking. The first, `networking-node` is, of course, for networking while running on NodeJS. The second, `networking-webpage`, is the equivalent for webpages.

`networking-node`:
+ `initServer`: Creates an HTTP server. Takes a function for the request handler and an optional port number.
+ `request`: Makes an HTTP request. Takes a path, method name, header object, and body.

`networking-webpage`:
+ `request`: Identical to the `networking-node` `request` function.

## Orynx and Javascript
The entire Orynx language core is in the `orynxLangCore.js` file. This file runs both on webpages and NodeJS. When run on Node, it exports the `LangEnv` class. When run on a webpage, it defines the `LangEnv` class. The `LangEnv` class takes two functions. The first is used by the Orynx environment to read files, and the second is used for output. Example:
```javascript
//import the Orynx language
const {LangEnv} = require("./orynxLangCore.js");
//import the file reader
const {readFileSync} = require("fs");

//create the environment
let env = new LangEnv(n=>{
  //file reader
  try{
    return readFileSync(n,"utf8");
  }catch{return null};
},o=>{
  //output
  console.log(o);
  console.log();
});
```
Once the environment is created, code can be run in it using the `run` function.
```javascript
//run the code
env.run(readFileSync("code.txt","utf8"));
```
The `run` function has an optional second parameter for an array of input values. These are given to the program as strings, in the same format as `parameters`. These input values are stored in the `parameters` variable.

The `run` function is asynchronous, and the program's return value is given to the `output` function provided when the environment was created.

If you want to interact with code while it is running, you can use the environment's `input` function. The `input` function takes an input value and calls the program's `onInput` function (if it is defined) and passes it the input value as a string. The `input` function returns the value returned by `onInput`. If the `onInput` function is not defined, `input` returns `undefined`.
