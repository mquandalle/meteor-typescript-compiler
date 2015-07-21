var fs = Npm.require('fs');
var Future = Npm.require('fibers/future');

// used for sync io
var Fiber = Npm.require('fibers');
// used to launch tsc execuable
var exec = Npm.require('child_process').exec;
// provides file pattern match
var glob = Npm.require('glob');
var path = Npm.require('path');
// provides temp folder access
var temp = Npm.require('temp');
// provides rm -rf
var rimraf = Npm.require('rimraf');
// html5 localStorage for node
var storage = Npm.require('node-persist');

var fsStat = Future.wrap(fs.stat);

// create the code cache
storage.initSync({
	dir: 'typescript-cache'
});

this.archs = this.archs || {};
function initArch(archName) {
	var arch = archs[archName] = {name: archName};
	arch.modTimes = {};
	arch.cachedErrorReplays = [];
	resetCompilationScopedArch(arch);
}

// regex to parse errors
var TS_ERROR_REGEX = /(.*[.]ts)\((\d+),(\d)+\): (.+)/;

// filename used to trigger the missing meteor batch compilation
var PLACEHOLDER_FILENAME = "zzz.ts-compiler.ts";

var CORDOVA_PLATFORMS_FILENAME = ".meteor/cordova-platforms";

// find the TSC path
var tscPath = function() {
	var bins = glob.sync("~/.meteor/packages/*:tsc/*/plugin.compileTsc.os/npm/compileTsc/node_modules/typescript/bin/tsc").concat(
		glob.sync("packages/*:tsc/.npm/plugin/compileTsc/node_modules/typescript/bin/tsc"),
		glob.sync("C:/Program Files (x86)/Microsoft SDKs/TypeScript/**/tsc.exe"),
		glob.sync("/usr/local/bin/tsc"),
    glob.sync(process.env.PWD + "/**/node_modules/typescript/bin/tsc", {dot:true})
    );
	if (bins.length === 0) {
		console.error("Could not find tsc binary, defaulting to 'tsc'.")
		return "tsc";
	} else {
		return bins[0];
	}
}();

// create place holder file
checkForPlaceholderFile();

// that's the plugin code itself
Plugin.registerSourceHandler("ts", function(compileStep) {
	if (typeof(archs[compileStep.arch]) === 'undefined') {
		if (compileStep.arch === 'web.cordova' && !fs.existsSync(CORDOVA_PLATFORMS_FILENAME)) {
			// Don't bother compiling for cordova if the 'cordova-platforms' file does not exist
			return;
		}

		initArch(compileStep.arch);
	}

	handleSourceFile(compileStep);

	if (compileStep.inputPath !== PLACEHOLDER_FILENAME) {
		// Note that we compile the placeholder as well so tsc uses its dirname as the base for all relative paths it produces
		return;
	}

	// Typically, Meteor hands us all of the files pertaining to an arch in clumps (i.e. all files for browser, then all files for os), so most compiles are only two phases (client and server).
	for (var archName in archs) {
		var arch = archs[archName];
		if (arch.compileSteps.length === 0)
			continue;

		var hadMod = checkAgainstModTime(arch);
		compile(arch, compileStep, hadMod);
		resetCompilationScopedArch(arch);
	}
});

// Save the file input path, and return back to Meteor
function handleSourceFile(compileStep) {
	var arch = archs[compileStep.arch];

	checkForPlaceholderFile(compileStep);

	if (arch.fullInputPaths.indexOf(compileStep.fullInputPath) != -1) {
		return;
	}

	arch.fullInputPaths.push(compileStep.fullInputPath);
	arch.compileSteps.push(compileStep);
	arch.fullPathToCompileSteps[compileStep._fullInputPath] = compileStep;
}

function checkAgainstModTime(arch) {
	var hadModifications = false;
	arch.fullInputPaths.forEach(function(path) {
		var stats = fsStat(path).wait();
		if (typeof(arch.modTimes[path]) === 'undefined' || arch.modTimes[path].toString() !== stats.mtime.toString()) {
			hadModifications = true;
		}

		arch.modTimes[path] = stats.mtime;
	});

	return hadModifications;
}

function compile(arch, placeholderCompileStep, hadModifications) {
	if (!hadModifications) {
		// Short-circuit via cache
		addJavaScriptFromCacheInOrder(arch);

		// Replay errors
		arch.cachedErrorReplays.forEach(function(errReplay) {
			recordError(errReplay.err, placeholderCompileStep, errReplay.errorNumber, arch, true);
		});

		return;
	}

	// Typically just the arch name, unless a local package uses TypeScript in which case it will be appended
	var variantName = arch.name;
	if (placeholderCompileStep.rootOutputPath != '/') {
		variantName += " (" + placeholderCompileStep.rootOutputPath.substr(1) + ")";
	}
	console.log("\nCompiling TypeScript " + variantName + " files...");

	// Clear cached errors since we're about to re-compile
	arch.cachedErrorReplays = [];
	var errorCount = 0;
	var compileOptions = {
		'target': (arch.name === 'browser' ? 'ES3' : 'ES5'),
		'skipWrite': true
	};

	// This is synchronous (and our callback will get called multiple times if there are errors)
	tscCompile(arch.fullInputPaths, path.dirname(placeholderCompileStep.fullInputPath), compileOptions, function(err, results) {
		if (err) {
			recordError(err, placeholderCompileStep, ++errorCount, arch, false);
			if (typeof(results) === 'undefined') {
				return;
			}
		}

		results.forEach(function(result) {

			// result.name is the theoretically-generated js filename
			var tsFullPath = result.name.substr(0, result.name.length - 2) + "ts";
			var compileStep = arch.fullPathToCompileSteps[tsFullPath];
			if (compileStep) {
				var src = processGenSource(result.src || "");
				var map = result.map || "";
				// store in file cache
				storage.setItem(b64encode(compileStep.fullInputPath), [src, map]);
			}
		});
	});

	//console.log("\nDone");
	addJavaScriptFromCacheInOrder(arch);
}

// Generally matches the signature of the previous ts.compile
function tscCompile(fullInputPaths, placeholderDirPath, compileOptions, cb) {
	var out = temp.mkdirSync('tsc-out');
	var args = '"' + [tscPath, '--sourceMap', '--removeComments', '--outDir', out, '--target', compileOptions.target || 'ES5'].concat(fullInputPaths).join('" "') + '"';

	var fiber = Fiber.current;
	var execErr, execStdout, execStderr;
	exec(args, function(err, stdout, stderr) {
		execErr = err;
		execStdout = stdout;
		execStderr = stderr;
		fiber.run();
	});
	Fiber.yield();

	if (execStderr) {
		cb("\n" + execStderr);
		return;
	}

	if (execStdout) {
		cb("\n" + execStdout);
		return;
	}

	var res = glob.sync(path.join(out, '**', '*.js')).map(function(f) {

		return {
			name: path.join(placeholderDirPath, f.substr(out.length + 1)),
			src: fs.readFileSync(f, {encoding: 'utf8'}),
			map: fs.readFileSync(f + ".map", {encoding: 'utf8'})
		};
	});

	rimraf.sync(out);
	cb(undefined, res);
}

function processGenSource(src) {
	var lines = src.split("\n");
	for (var i = 0 ; i < lines.length ; i++) {
		var line = lines[i];
		var p = i + 1;
		if (line.toLowerCase().trim() == "//tsc export" && p < lines.length) {
			// Removes "var" for var, function and class definitions
			lines[p] = lines[p].replace(/\s?var\s/, "     ");
			// Replaces the original "var xyz;" (before the above line executed) with a "if (typeof xyz == 'undefined') { xyz = {}; }" for modules
			lines[p] = lines[p].replace(/^\s*([$A-Z_][0-9A-Z_$]*);$/i, "if (typeof $1 == 'undefined') { $1 = {}; }");
			i++;
		}
	}

	return lines.join("\n");
}

function addJavaScriptFromCacheInOrder(arch) {
	arch.compileSteps.forEach(function(compileStep) {

		var item = storage.getItem(b64encode(compileStep.fullInputPath));
		if(item) {

			compileStep.addJavaScript({
				path: compileStep.inputPath + ".js",
				sourcePath: compileStep.inputPath,
				data: item[0] || "",
				sourceMap: item[1] || ""
			})
		}
	});
}

function recordError(err, placeholderCompileStep, errorNumber, arch, isFromCache) {
	if (!isFromCache)
		arch.cachedErrorReplays.push({err: err, errNumber: errorNumber});

	var match = TS_ERROR_REGEX.exec(err.toString());
	if (match) {
		var compileStep = arch.fullPathToCompileSteps[match[1]];
		if (compileStep) {
			compileStep.error({
				message: match[4],
				sourcePath: match[1],
				line: match[2],
				column: match[3]
			});
			return;
		}
	}

	placeholderCompileStep.error({
		message: err.toString(),
		sourcePath: placeholderCompileStep.fullInputPath,
		line: errorNumber,
		column: 1
	});
}

function resetCompilationScopedArch(arch) {
	arch.fullInputPaths = [];
	arch.compileSteps = [];
	arch.fullPathToCompileSteps = {};
}

// ensures the place holder file is in place
function checkForPlaceholderFile(compileStep) {
	// Either curPath should be e.g. zzz.ts-compiler.ts or packages/myPkg/zzz.ts-compiler.ts
	var curPath = (!compileStep || compileStep.rootOutputPath == '/') ? PLACEHOLDER_FILENAME : compileStep.rootOutputPath.substr(1) + "/" + PLACEHOLDER_FILENAME;

	// Check and see if we are trying to create the placeholder file in the root directory, if we are, then switch over to the fullInputPath that we
	// receive from the compileStep object.
	if (compileStep && curPath === '/zzz.ts-compiler.ts') curPath = compileStep.fullInputPath;

	if (!fs.existsSync(curPath)) {
		fs.writeFileSync(curPath, "// please add this file to .gitignore - it is used internally by typescript-compiler and must be the last file to compile\n// This needs some real logic so that tsc will use this dir as the starting path for all produced output\nif (true) {}\n");
		var errorMsg = "typescript-compiler:The file \"" + curPath + "\" has been created to help batch compilation of typescript assets. Please ignore it from your source control.";
		if (typeof(compileStep) !== 'undefined') {
			compileStep.error({message: errorMsg});
		} else {
			console.error(errorMsg);
		}
	}
}

function b64encode(s) {
	return new Buffer(s).toString('base64');
}
