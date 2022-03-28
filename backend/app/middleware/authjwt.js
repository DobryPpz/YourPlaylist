const jwt = require("jsonwebtoken");
const config = require("../config/authconfig");
const db = require("../models/index");
const User = db.user;
const Role = db.role;

verifyToken = (req,res,next) => {
    let token = req.headers["x-access-token"];
    if(!token) return res.status(403).send({message: "No token!"});
    jwt.verify(token,config.secret,(err,decoded) => {
        if(err) return res.status(401).send({message: "Unauthorized!"});
        req.userId = decoded.id;
        next();
    });
}

isAdmin = (req,res,next) => {
    User.findById(req.userId)
    .then(user => {
        for(let role of user.roles){
            if(role.name == "admin"){
                next();
                return;
            }
        }
        res.status(403).send({message: "Admin role required!"});
        return;
    })
    .catch(err => {
        res.status(500).send({message: err});
    });
}

isModerator = (req,res,next) => {
    User.findById(req.userId)
    .then(user => {
        for(let role of user.roles){
            if(role.name == "moderator"){
                next();
                return;
            }
        }
        res.status(403).send({message: "Moderator role required!"});
        return;
    })
    .catch(err => {
        res.status(500).send({message: err});
    });
}

module.exports = {
    verifyToken,
    isAdmin,
    isModerator
};














