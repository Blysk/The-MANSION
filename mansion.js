var MANSION = {};

MANSION.config = {
	debug 			: true,
	strictMode		: true,
	mainFile		: "main.js",
	mainModuleName	: 'main',
	cacheFile		: "build.cache",
	header			: "/**\n*\n* Built with THE MANSION\n* Part of the BLYSK project\n* http://bly.sk || http://github.com/blysk\n*\n**/\n",
	filesFolder		: "js/",
	destinationFile	: "output.js",
	templateFile	: "module.template",
	defaultSubfolder: true
}

//implementation of 'bind' function
//somehow it's not implemented in Rhino <(O.o)>
Function.prototype.bind = function(bind) {
	var self = this;
	return function(){
		var args = Array.prototype.slice.call(arguments);
		return self.apply(bind || null, args);
	};
};

MANSION.build = {
	
	files			: null,	
	startTime		: 0,
	content			: [],
	modules			: {},
	exportRegExp	: /#export (\S+)/,
	importRegExp	: /#import (\S+)/,
	modulesRegExp	: /(@modules)/,
	
	importModules	: function(list){
		var module, name, match, dependencies = [];
		list.forEach(function(file){
			dependencies = [];
			module = readFile(MANSION.config.filesFolder + file).split('\n');
			module.forEach(function(line, index) {
				
				//get the name of the module
				//and comment the line
				match = line.match(this.exportRegExp);
				if (match) {
					name = match[1];
					module[index] = "//" + module[index];
				}
				
				//what modules current module depend on?
				match = line.match(this.importRegExp);
				if (match) {
					dependencies.push(match[1]);
					module[index] = "//" + module[index];
				}
				
				//importing modules to the current module
				match = line.match(this.modulesRegExp);
				if (match) {
					if (!!~line.indexOf('function')) {
						module[index] = "var " + name + "Module = " + line.replace('@modules', dependencies.join(', '));
					} else {
						module[index] = line.replace('@modules', dependencies.map(function(m){ return m+"Module"; }).join(', '));
					}
				}
								
			}.bind(this));
			
			this.modules[name] = new MANSION.module(module, dependencies, file);			
			
		}.bind(this));
		
	},
	
	start: function() {
		print('Start...');
		this.startTime = +(new Date());
		
		print('Importing modules...');
		this.files = readFile(MANSION.config.cacheFile).split('\n');
		this.files.push(MANSION.config.mainFile);
		
		this.content.push(	
			MANSION.config.header, 
			"(function(){",
			MANSION.config.strictMode ? '"use strict"' : '',
			MANSION.config.debug ? 'try{' : ''		
		);	
		
		//first we import modules...
		this.importModules(this.files);
		
				
		//..and when all of them are imported, we can add dependencies...
		print('Resolving dependencies...');
		for (var module in this.modules) {
			this.modules[module].addDependencies();
		}
		
		//...and resolve them
		MANSION.resolver.resolve(this.modules[MANSION.config.mainModuleName]);
		
		print('creating the file...');
		var cacheOrder = []
		MANSION.resolver.resolved.forEach(function(module){
			cacheOrder.push(module.filename);
			this.content.push(module.content.join('\n'));			
		}.bind(this));
		
		//writing cache
		var file = new java.io.BufferedWriter(new java.io.FileWriter(MANSION.config.cacheFile));
		file.write(cacheOrder.join("\n"));
		file.close();
		
		
		//adding the footer
		this.content.push(
			MANSION.config.debug ? "} catch (e) { console.error(e); }" : '',
			"})();"
		);
		
		print("\nbuilding...");

		//full version
		file = new java.io.BufferedWriter(new java.io.FileWriter(MANSION.config.destinationFile));
		file.write(this.content.join("\n"));
		file.close();

		print("file created\nbuild time: "+(+(new Date())-this.startTime)/1000+"s");
	}
}

MANSION.module = function(content, dependencies, filename) {
	var edges = [],
		dependencies = dependencies;
	
	var addEdge = function(node) {
		edges.push(node);
	}
	
	var addDependencies = function(){
		dependencies.forEach(function(module){
			addEdge(MANSION.build.modules[module]);
		});
	}
	
	return {
		filename		:   filename,
		content			: 	content,
		addDependencies	: 	addDependencies,
		edges			: 	edges
	}
}

MANSION.resolver = {
	resolved: [],
	unresolved: [],
	
	resolve: function(node) {

		this.unresolved.push(node);

		for (var i=0, j=node.edges.length; i<j; i++) {
			var edge = node.edges[i];
			if (this.resolved.indexOf(edge) === -1) {
				if (this.unresolved.indexOf(edge) > -1) {
					throw new Error('Endless dependency loop. Conflict probably somewhere in ' + edge.filename + 'module!');
					break;
				}
				this.resolve(edge);
			}
		};
		this.resolved.push(node);
		
		//remove node from unresolved Array
		if (this.unresolved.indexOf(node)!==-1) {  
	       this.unresolved.splice(this.unresolved.indexOf(node), 1);   
	   	} 
	}
}

MANSION.generate = {
	fileName		: 	null,
	folder			:   '',
	moduleNameRegExp: 	/@moduleName/g,
	moduleFile		: 	null,
	
	generateModule  :   function(){
		
		new java.io.File(MANSION.config.filesFolder + this.folder).mkdirs();
		var file = new java.io.BufferedWriter(new java.io.FileWriter(MANSION.config.filesFolder + this.folder + this.fileName + ".js"));
		file.write(this.moduleFile);
		file.close();

		print("file created in: "+ MANSION.config.filesFolder + this.folder + this.fileName + ".js");

		var cache = readFile(MANSION.config.cacheFile);
		cache = cache.split('\n');
		cache.push(this.folder + this.fileName + ".js");
		cache = cache.join('\n');

		file = new java.io.BufferedWriter(new java.io.FileWriter(MANSION.config.cacheFile));
		file.write(cache);
		file.close();

		print("\n...and added to build Cache\n");
	},
	
	start		:  function(filename, moduleSubfolder){
		var path = filename ? filename.split('.') : '';
		
		print(path);
		
		if (path.length > 1) {	
			
			if (moduleSubfolder) {
				
				this.fileName = path[path.length-1];
				
			} else {
				
				this.fileName = path.pop();
				
			}	
				
			for (var i = 0, j=path.length; i<j; i++) {
				this.folder += path[i] + '/';
			}
					
		} else {		
				
			this.folder = this.fileName = path[0];			
			
		}
		
		this.moduleFile = readFile(MANSION.config.templateFile).replace(this.moduleNameRegExp, this.fileName);
		
		if (this.folder && this.fileName) {
			
			this.generateModule();
			
		} else {
			
			throw new Error("Wrong parameters!");
			
		}
	}
}

if (arguments[0] === 'build'){
	
	MANSION.build.start();
		
} else if (arguments[0] === 'generate') {
	
	MANSION.generate.start(arguments[1], MANSION.config.defaultSubfolder);	
}