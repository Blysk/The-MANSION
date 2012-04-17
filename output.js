/**
*
* Built with THE MANSION
* Part of the BLYSK project
* http://bly.sk || http://github.com/blysk
*
**/

(function(){
"use strict"
try{
//#export foo

var fooModule = (function foo() {    
    /*************************
    **       PRIVATE        **
    *************************/
    //constans
    var FOO = 0xFF;

    //variables
    var text = 'It\'s alive!';
        
    /*************************
    **       PUBLIC         **
    *************************/
	//logic of public functions in here
	var fuu = function foo_foo(){    	
		return text;
    }

	//and references here:
    return {
        fuu: fuu  
    }
})();
//#export bar

//imported modules
//#import foo

var barModule = (function bar(foo) {    
        
    /*************************
    **       PUBLIC         **
    *************************/
	//logic of public functions in here
	var checkMe = function bar_checkMe(){    	
		alert(foo.fuu());
    }

	//and references here:
    return {
        checkMe: checkMe  
    }
})(fooModule);
//#export main

//imported modules
//#import bar

var mainModule = (function main(bar) {    
	
	window.addEventListener('load', function(){
		bar.checkMe();
	}, false);	

})(barModule);
} catch (e) { console.error(e); }
})();