// ErrorService.js
module.exports = {

    check: function(res, err, next) {
        if (err) {
            console.log(err);
            return res.serverError(JSON.stringify(err));
        } else {
            return next();
        }
    }

};