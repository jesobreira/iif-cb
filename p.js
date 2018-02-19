module.exports = function(condition) {
    return new Promise(function(resolve, reject) {
        if (condition)
            return resolve();
        else
            return reject();
    })
}