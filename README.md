# iif-cb

At the 0th sight, this is how to install:

```
npm i iif-cb
```

And this is how to include it in your NodeJS code:

```
const iif = require('iif-cb');
```

#  Why?

What about a dirty example?

Say you want your users to be able to modify their profiles. It may or may not include changing their email addresses. If your user wants to change their email address, you obviously have to check if the email address belongs to someone else on the database and, if it does, prevent the user from doing any change.

If we were using a simple non-callback-based language such as PHP, the logic behind it would be pretty easy:

```
if ($_POST['email'] != '') {
    if (check_if_email_exists_on_the_database($_POST['email])) {
        echo "You can't do it";
        exit;
    } else {
        change_user_email($user_id, $_POST['email']);
    }
}

// continue updating other profile details ONLY IF everything is OK about the email
update_name($user_id, $_POST['name']);
update_something_else($user_id, $_POST['something_else]);
```

However if we try to convert the above code to NodeJS with all its callbacks and promises, we would fall in trouble. Let's try.

```
if (req.body.email != '') {
    checkIfEmailExistsOnTheDatabase(req.body.email, function(result) {
        if(result) {
            res.send("You can't do it")
        } else {
            changeUserEmail(user_id, req.body.email)
        }
    })
}

// continue updating other profile details ONLY IF everything is OK about the email
// oh wait
// since the above runs inside a callback, this code would run anyway...
update_name(user_id, req.body.name)
update_something_else(user_id, req.body.something_else)
```

We could try:

```
if (req.body.email != '') {
    checkIfEmailExistsOnTheDatabase(req.body.email, function(result) {
        if(result) {
            res.send("You can't do it")
        } else {
            changeUserEmail(user_id, req.body.email)
            // continue updating
            update_name(user_id, req.body.name)
            update_something_else(user_id, req.body.something_else)
        }
    })
}
```

However there is a problem: if the user does not want to update the email address and leave it blank, then "name" and "something_else" would not get updated as well.

Also, if we move the other updating calls above:

```
update_name(user_id, req.body.name)
update_something_else(user_id, req.body.something_else)

if (req.body.email != '') {
    checkIfEmailExistsOnTheDatabase(req.body.email, function(result) {
        if(result) {
            res.send("You can't do it")
        } else {
            changeUserEmail(user_id, req.body.email)
        }
    })
}
```

It would not work as well, since we aren't able to know, before, if the email change faced problems and our briefing says:

> check if the email address belongs to someone else on the database and, if it does, prevent the user from doing any change

So we could just put an else and duplicate the code, why not?

```
if (req.body.email != '') {
    checkIfEmailExistsOnTheDatabase(req.body.email, function(result) {
        if(result) {
            res.send("You can't do it")
        } else {
            changeUserEmail(user_id, req.body.email)
            // continue updating
            update_name(user_id, req.body.name)
            update_something_else(user_id, req.body.something_else)
        }
    })
} else {
    // continue updating
    update_name(user_id, req.body.name)
    update_something_else(user_id, req.body.something_else)
}
```

Yeah that would do the trick. However duplicating code is far of being a good idea. Also if we have lots of inputs to update, this would be a total mess.

What if we put the process continuation inside a function and call it?

```
var continue_updating = function() {
    // continue updating
    update_name(user_id, req.body.name)
    update_something_else(user_id, req.body.something_else)
}

if (req.body.email != '') {
    checkIfEmailExistsOnTheDatabase(req.body.email, function(result) {
        if(result) {
            res.send("You can't do it")
        } else {
            changeUserEmail(user_id, req.body.email)
            continue_updating();
        }
    })
} else {
    continue_updating();
}
```

Not that beautiful, but it works.

However, look at that: the code for `continue_updating()` is written before the email check, however it runs after the email check. It works well, but it's really confusing.

Ok, we could create a true function instead of a callable object. This way:

```
if (req.body.email != '') {
    checkIfEmailExistsOnTheDatabase(req.body.email, function(result) {
        if(result) {
            res.send("You can't do it")
        } else {
            changeUserEmail(user_id, req.body.email)
            continue_updating();
        }
    })
} else {
    continue_updating();
}

function continue_updating() {
    // continue updating
    update_name(user_id, req.body.name)
    update_something_else(user_id, req.body.something_else)
}
```

Since Javascript parses each `function` declaration before actually running the code, that would work as well.

But... what are we doing with our scope? Will we need to pollute our scope every time we face this problem, creating functions and functions that are only going to be rellevant on a specified portion of our code?

## The Solution

With `iif-cb`, this could be easier and more friendly and readable, using anonymous functions only:

```
const iif = require('iif-cb');

iif ([ condition ], [ callback_if_true(cb) ], [ callback_on_end ])
```

`[condition]` can be any function call, variable or expression that can be converted to a boolean value. If it's a function call, it must return a value immediately (no callbacks inside it).

If `[condition]` is true, then the library calls `callback_if_true`, which receives one argument (usually named `cb`) that points to `callback_on_end` (you have to call it if you want to continue).

If `[condition]` is false, then the library calls `callback_on_end` directly.

Some examples:

```
const iif = require('iif-cb');

iif (1==1, function(cb) {
    console.log("Hello")
    cb() // you have to call this if you want to continue
}, function() {
    console.log("World")
}); // returns "Hello World"

iif (1==1, function(cb) {
    console.log("Hello")
    // we will not call cb() on this example
}, function() {
    console.log("World")
}) // returns "Hello"

iif (1==0, function(cb) { // false condition
    console.log("Hello") // this is not going
    cb();               //  to be called
}, function() {
    console.log("World")
}) // returns "World"
```

Our example could be written as:

```
iif (req.body.email != '', function(cb) {
    checkIfEmailExistsOnTheDatabase(req.body.email, function(result) {
        if(result) {
            res.send("You can't do it")
        } else {
            changeUserEmail(user_id, req.body.email)
            cb(); // cb is the "callback_on_end" function
        }
    })
}, function() {
    // continue updating
    update_name(user_id, req.body.name)
    update_something_else(user_id, req.body.something_else)
})
```

## What about promises?

They are supported as well.

```
const iifp = require('iif-cb/p');
```

The format is:

```
iifp(condition).then( [callback_if_true], [callback_if_false] ).then( [callback_on_end] );
```

Examples:

```
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
```

Our dirty example would be so:

```
iif (req.body.email != '').then(function(cb) {
    checkIfEmailExistsOnTheDatabase(req.body.email, function(result) {
        if(result) {
            res.send("You can't do it")
            return Promise.reject();
        }
    })
}, () => {}).then(function() {
    // continue updating, email check ok or user does not want to change email
    update_name(user_id, req.body.name)
    update_something_else(user_id, req.body.something_else)
}).catch(function() {
    // do nothing, email check failed
})
```