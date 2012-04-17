#export foo

(function foo(@modules) {    
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
})(@modules);