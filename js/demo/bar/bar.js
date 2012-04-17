#export bar

//imported modules
#import foo

(function bar(@modules) {    
        
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
})(@modules);