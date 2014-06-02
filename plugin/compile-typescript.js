var fs = Npm.require('fs');
var ts = Npm.require('ts-compiler');
var Future = Npm.require('fibers/future');
var Storage = Npm.require('node-persist');

Storage.initSync({
  dir: 'typescript-cache'
//  logging: true
});

// Keep track of mod times for files that have been parsed
var Mtimes = Storage.getItem('mtimes'); // in-memory cache
if (typeof Mtimes !== 'object') {
//  console.log('NO MTIMES');
  Mtimes = {};
  Storage.setItem('mtimes', Mtimes);
}

// Keep track of files in a cache
if (typeof Storage.getItem('cache') !== 'object')
  Storage.setItem('cache', {});

// Used to check the filename extension
var endsWith = function(str, ends) {
  if (str == null) return false;
  return str.length >= ends.length && str.slice(str.length - ends.length) === ends;
};

// Check whether a given key has a new modification time
var wasModified = function(key, stats) {
  //  !Options.useCache ||
  return !Mtimes[key] || new Date(Mtimes[key]).getTime() != new Date(stats.mtime).getTime();
}

function compileCheck(compileStep) {
  
  var future = new Future;
  fs.stat(compileStep.inputPath, function(err, stats) {
    if (err) return false;
    var filename = compileStep.inputPath;
    var key = filename + "|" + compileStep.arch;
    var isDefinitionFile = endsWith(filename, ".d.ts");
    
//    if (Mtimes[key])
//      console.log("current is " + new Date(stats.mtime).getTime() + ", stored is " + new Date(Mtimes[key]).getTime());
//    else
//      console.log("stored is undef");
    
    if (isDefinitionFile) {
      
      if (wasModified(key, stats)) {
        if (!!Mtimes[key])
          Options.useCache = false;
        Mtimes[key] = stats.mtime;
        Storage.setItem('mtimes', Mtimes);
      }
      future.return(true);
      
    } else if (wasModified(key, stats)) {
      
      Mtimes[key] = stats.mtime;
      Storage.setItem('mtimes', Mtimes);
      compile(compileStep, future); 
      
    } else {
      
      compileFromCache(compileStep, future);
      
    }
  });
  
  return future;  
}

function compileFromCache(compileStep, future) {
  
  var filename = compileStep.inputPath;
  var src = Storage.getItem('cache')[filename];
  if (src && src.length) {
    compileStep.addJavaScript({
      path: filename + ".js",
      sourcePath: filename,
      data: src
    });
  }
  future.return(true);
  
}

function compile(compileStep, future) {

  var jsVersion = "ES5";
  if (compileStep.archMatches("browser")) jsVersion = "ES3";

  var filename = compileStep.inputPath;
  console.log("Compiling " + jsVersion + ' ' + filename);

  ts.compile(
    [filename],
    { 'skipWrite': true, 'target': jsVersion, 'removeComments': true },
    function(err, results) {

      if (err) {
        
        console.log('\x1b[36m%s\x1b[0m', err);
        return err;
        
      } else {
        
        if (results) {
          var generatedItem = results[0];

          // Some ts files (especially .d.ts files) may compile to an empty string
          if (generatedItem) {
            var src = generatedItem.text;
            
            if (src.length > 0) {
              var cache = Storage.getItem('cache');
              cache[compileStep.inputPath] = src;
              Storage.setItem('cache', cache);
              
              compileStep.addJavaScript({
                path: filename + ".js",
                sourcePath: filename,
                data: src
              });
            }
          }
          return future.return(true);
          
        } else {
          
          return future.return(false);
          
        }
      }
    }
  );

  return future;
}

var handler = function(compileStep) {

  compileCheck(compileStep).wait();

};

Plugin.registerSourceHandler("ts", handler);
