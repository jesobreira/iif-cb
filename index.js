module.exports = function(condition, ifTrue, cb) {
    if (condition) return ifTrue(cb);
    return cb();
}