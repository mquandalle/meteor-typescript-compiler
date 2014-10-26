var fs = Npm.require('fs');
var ts = Npm.require('ts-compiler');
var Future = Npm.require('fibers/future');
var Storage = Npm.require('node-persist');

Storage.initSync({
  dir: 'typescript-cache'
//  logging: true
});

// Keep track of mod times for files that have been parsed
// Holds key->Date
var Mtimes = {};

// Keep track of files in a cache
Storage.setItem('cache', {});

// Used to check the filename extension
var endsWith = function(str, ends) {
  if (str == null) return false;
  return str.length >= ends.length && str.slice(str.length - ends.length) === ends;
};

// Check whether a given key has a new modification time
var wasModified = function(key, stats) {
  //  !Options.useCache ||
  var e=Mtimes[key];
  if(!e) return false;

  var e= e.getTime() != stats.mtime.getTime();
  return e;
}

function compileCheck(compileStep) {
  
  var future = new Future;
  fs.stat(compileStep.inputPath, function(err, stats) {
    if (err) return false;
    var filename = compileStep.inputPath;
    var key = filename + "|" + compileStep.arch;
    var isDefinitionFile = endsWith(filename, ".d.ts");
    
    if (Mtimes[key])
      console.log("current is " + new Date(stats.mtime).getTime() + ", stored is " + new Date(Mtimes[key]).getTime());
    else
     console.log("stored is undef");
    
    if (isDefinitionFile) {
      // TODO: don't use cache when a .d.ts file changes
//      if (wasModified(key, stats)) {
//        if (!!Mtimes[key])
//          Options.useCache = false;
//        Mtimes[key] = stats.mtime;
//      }
      future.return(true);
      
    } else if (wasModified(key, stats)) {
      
      Mtimes[key] = stats.mtime;
      compile(compileStep, future); 
      
    } else {

      console.log("compile from cache "+key);
      compileFromCache(compileStep, future);
      
    }
  });
  
  return future;  
}

function compileFromCache(compileStep, future) {

  console.log("compiled from cache");
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
  if ( compileStep.arch.indexOf("web.") == 0 )
    jsVersion = "ES3";

  var filename = compileStep.inputPath;
  var key = filename + "|" + compileStep.arch;

  console.log("Compiling " + jsVersion + ' ' + key);

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

              // Store compiled source in cache
              var cache = Storage.getItem('cache');

              //cache[compileStep.inputPath] = src;
              cache[key] = src;
              Storage.setItem('cache', cache);

              // Add generated source to compiler output pipeline
              compileStep.addJavaScript({
                path: filename + ".js",
                sourcePath: filename,
                data: src,
				bare: compileStep.fileOptions.bare
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
