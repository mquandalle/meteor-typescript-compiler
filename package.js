Package.describe({
	summary: "Typescript-compiler support for Meteor"
});

Package.on_test(function(api) {
	api.add_files(['typescript_tests.ts',
				   'typescript_tests.js'], ['client', 'server']);
});

Npm.depends({"typescript.api": "0.6.1"});

var typescript_handler = function(bundle, source_path, serve_path, where) {

	serve_path = serve_path + '.js';

	var Future = Npm.require('fibers/future');
	var typescript = Npm.require('typescript.api');

	// show diagnostic errors.
	function getDiagnostics(units) {

		var err = "";
		for (var n in units) {

			for (var m in units[n].diagnostics) {

				err = err + units[n].diagnostics[m].toString() + '\n\r';
			}
		}
		return err;
	}

	function compile(source_path) {

		var future = new Future;

		typescript.reset();

		typescript.resolve([source_path], function(resolved) {

			if (!typescript.check(resolved)) {

				return future.return(bundle.error(getDiagnostics(resolved)));
			}
			else {

				typescript.compile(resolved, function(compiled) {

					if (!typescript.check(compiled))
						return future.return(bundle.error(getDiagnostics(compiled)));

					else {

						for (var i = 0 ; i < compiled.length ; i++) {

							// Some ts files (especially .d.ts files) may compile to an empty string
							var content = compiled[i].content;
							if (content && content.length > 0) {

								var contents = new Buffer(content);

								bundle.add_resource({
									type: "js",
									path: serve_path,
									data: contents,
									where: where
								});
							}
						}

						return future.return(true);
					}
				});
			}
		});

		return future;
	}

	var result = compile(source_path).wait();
	if (result !== true)
		return result;
};

Package.register_extension("ts", typescript_handler);
