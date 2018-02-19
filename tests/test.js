const iif = require('../');
const iifp = require('../p');

iif(1 == 1, function(cb) {
        console.log("Hello")
        cb() // you have to call this if you want to continue
    }, function() {
        console.log("World")
    }) // returns "Hello\nWorld"

iif(1 == 1, function(cb) {
        console.log("Hello")
        setTimeout(cb, 1000); // calling after 1 sec
    }, function() {
        console.log("World")
    }) // returns "Hello[1 sec delay]\nWorld"

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


// test with promises

iifp(1 == 1).then(function() {
        console.log("Hello")
    }, function() {
        // this will not be run
        console.log("The expression is false");
    }).then(function() {
        console.log("World")
    }) // returns "Hello\nWorld"

iifp(1 == 0).then(function() {
        console.log("Hello"); // this will not run
    }, () => {}).then(function() { // no "else" (reject) function
        console.log("World");
    }) // returns "World"

iifp(1 == 1).then(function() {
        console.log("Hello");
        return new Promise((resolve, reject) => setTimeout(resolve, 1000)) // calling after 1 sec
    }, function() {
        // this will not be run
        console.log("The expression is false");
    }).then(function() {
        console.log("World");
    }) // returns "Hello[1 sec delay]\nWorld"

iifp(1 == 0).then(function() { // false condition
        console.log("Hello") // this is not going to be called
    }, function() {
        console.log("World")
    }) // returns "World"

iifp(1 == 1).then(function() {
        console.log("Hello");
        if (1 == 0) {
            console.log("Will not run")
        } else {
            return Promise.reject();
        }
    }).then(function() {
        console.log("Will not run either")
    }).catch(function() {
        console.log("World")
    }) // returns "Hello\nWorld"

iifp(1 == 0).then(function() { // false condition
        console.log("Hello"); // will not run
    }).then(function() {
        console.log("Will not run either")
    }).catch(function() {
        console.log("World")
    }) // returns "World"