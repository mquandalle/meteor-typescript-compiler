var fs = Npm.require('fs');
var ts = Npm.require('ts-compiler');
var Future = Npm.require('fibers/future');
var Storage = Npm.require('node-persist');

Storage.initSync({
	dir: 'typescript-cache'
//  logging: true
});

// Keep track of mod times for files that have been parsed
// Holds filename->Date
var fileTimestampCache = {};

// Keep track of files in a cache
// holds "filename|jsVersion" -> compiled src
Storage.setItem('cache', {});

// Used to check the filename extension
function endsWith(str, ends) {
	if (str == null) return false;
	return str.length >= ends.length && str.slice(str.length - ends.length) === ends;
};

// Check whether a given key has a new modification time
function wasModified(filename, stats) {
	var e = fileTimestampCache[filename];
	if (!e)
		return false;

	console.log("current is " + stats.mtime.getTime() + ", stored is " + e.getTime());

	var e = e.getTime() != stats.mtime.getTime();
	return e;
}

function getKey(compileStep, filename) {
	var jsVersion = "ES5";
	if (compileStep.arch.indexOf("web.") == 0)
		jsVersion = "ES3";
	return filename + "|" + jsVersion;
}

function compileCheck(compileStep) {

	var future = new Future;
	fs.stat(compileStep.inputPath, function(err, stats) {
		if (err) return false;
		var filename = compileStep.inputPath;
		var isDefinitionFile = endsWith(filename, ".d.ts");

		if (isDefinitionFile) {

			future.return(true);

		} else if (wasModified(filename, stats)) {

			fileTimestampCache[filename] = stats.mtime;
			compile(compileStep, future);

		} else {

			console.log("compile from cache");
			compileFromCache(compileStep, future);

		}
	});

	return future;
}

function compileFromCache(compileStep, future) {

	console.log("compiled from cache");

	var filename = compileStep.inputPath;
	var key = getKey(compileStep, filename);

	// Read Cache
	var src = Storage.getItem('cache')[key];
	if (src && src.length) {
		compileStep.addJavaScript({
			path: filename + ".js",
			sourcePath: filename,
			data: src,
			bare: compileStep.fileOptions.bare
		});
	}
	future.return(true);
}

function compile(compileStep, future) {

	var filename = compileStep.inputPath;

	var jsVersion = "ES5";
	if (compileStep.arch.indexOf("web.") == 0)
		jsVersion = "ES3";
	console.log("Compiling " + jsVersion + ' ' + filename);

	ts.compile(
		[filename],
		{'skipWrite': true, 'target': jsVersion, 'removeComments': true},
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
							var key = getKey(compileStep, filename);

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
