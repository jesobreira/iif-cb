const iif = require('../');

iif(1 == 1, function(cb) {
    console.log("Hello")
    cb() // you have to call this if you want to continue
}, function() {
    console.log("World")
}); // returns "Hello\nWorld"

iif(1 == 1, function(cb) {
        console.log("Hello")
            // we will not call cb() on this example
    }, function() {
        console.log("World")
    }) // returns "Hello"

iif(1 == 0, function(cb) { // false condition
        console.log("Hello") // this is not going
        cb(); //  to be called
    }, function() {
        console.log("World")
    }) // returns "World"