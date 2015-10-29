'use strict';

Plugin.registerCompiler({
  extensions: ['ts','tsx'],
}, () => new TsCachingCompiler());
