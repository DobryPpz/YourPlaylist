const db = require("../models/index");
const ROLES = db.ROLES;
const User = db.user;

//tu jest kod przeniesiony do kontrolera. nic nie robi

checkDuplicateUsernameOrEmail = (req,res,next) => {
    User.findOne({username: req.body.username})
    .then(u => {
        if(u != null){
            console.log("===linijka 9 verifysignup===");
            res.status(400).send({message: "Failed! Username is already in use!"});
            return;
        }
    })
    .catch(err => {
        console.log("===linijka 14 verifysignup===");
        //res.status(500).send({message: err});
        return;
    });

    User.findOne({email: req.body.email})
    .then(u => {
        if(u != null){
            console.log("===linijka 21 verifysignup===");
            res.status(400).send({message: "Failed! Email is already in use!"});
            return;
        }
    }).catch(err => {
        console.log("===linijka 25 verifysignup===");
        res.status(500).send({message: err});
        return;
    });

    next();
}

checkRolesExist = (req,res,next) => {
    if(req.body.roles){
        for(let role of req.body.roles){
            if(!ROLES.includes(role)){
                console.log("===linijka 36 verifysignup===");
                //res.status(400).send({message: `Failed! Role ${role} does not exist!`});
            }
        }
    }
    next();
}

module.exports = {
    checkDuplicateUsernameOrEmail,
    checkRolesExist
};