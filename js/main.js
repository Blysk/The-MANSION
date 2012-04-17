#export main

//imported modules
#import bar

(function main(@modules) {    
	
	window.addEventListener('load', function(){
		bar.checkMe();
	});	

})(@modules);