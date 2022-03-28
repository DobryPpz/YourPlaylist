const verifySignUp = require("../middleware/verifysignup");
const controller = require("../controllers/authcontroller");

module.exports = app => {
    app.use(function(req,res,next){
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    //było app.post
    app.post(
        "/api/auth/signup",
        controller.signup
    );
    app.post(
        "/api/auth/signin",
        controller.signin
    );
    
}

// [
//     verifySignUp.checkDuplicateUsernameOrEmail,
//     verifySignUp.checkRolesExist
// ],