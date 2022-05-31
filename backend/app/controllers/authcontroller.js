const config = require("../config/authconfig");
const db = require("../models/index");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const express = require("express");
const path = require("path");
const User = db.user;
const Role = db.role;
const Avatar = db.avatar;
const ROLES = db.ROLES;

signup = async (req,res) => {

  try{
    const u = await User.findOne({username: req.body.username});
    if(u != null){
      return res.status(400).send({message: "Failed! Username is already in use!"}).end();
    }
  }
  catch(err){
    return res.status(500).send({message: err}).end();
  }

  try{
    const u = await User.findOne({email: req.body.email});
    if(u != null){
      return res.status(400).send({message: "Failed! Email is already in use!"}).end();
    }
  }
  catch(err){
    return res.status(500).send({message: err}).end();
  }

  if(req.body.roles){
    for(let role of req.body.roles){
      if(!ROLES.includes(role)){
        return res.status(400).send({message: `Failed! Role ${role} does not exist!`}).end();
      }
    }
  }

    console.log("tworzymy użytkownika");
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password,8),
      avatar: "default.png",
      isInRoom: false
    });

    // const av = new Avatar({name: "default", src: `default.png`});
    // await av.save(err => {
    //             if(err) console.log("Error: ",err);
    //             console.log("Added default avatar to Avatar database");
    //         });

    user.save((err,user) => {
        if(err){
              return res.status(500).send({message: err}).end();
        }
        if(req.body.roles){
            Role.find(
                {
                  name: { $in: req.body.roles }
                },
                (err, roles) => {
                  if (err) {
                      return res.status(500).send({ message: err });
                  }
                  user.roles = roles.map(role => role._id);
                  user.save(err => {
                    if (err) {
                        return res.status(500).send({ message: err }).end();
                    }
                      return res.send({ message: "User was registered successfully!" }).end();
                  });
                }
            ).catch(err => {
                return res.status(500).send({message: err}).end();
            });
        }
        else{
            Role.findOne({ name: "user" }, (err, role) => {
                if (err) {
                    return res.status(500).send({ message: err }).end();
                }
                user.roles = [role._id];
            });
        }
        user.save().then(u => {
          return res.send({message: "user was registered succesfully"}).end();
        });
      //   Avatar.findOne({ name: "default" }, (err, avatar) => {
      //     if (err) {
      //         return res.status(500).send({ message: err });
      //     }
      //     user.avatarPictures = [avatar._id];
      //     user.save().then(u => {
      //       res.send({message: "User was registered succesfully!"});
      //     });
      // });
    });
}

// .populate("roles", "-__v")

signin = (req,res) => {
    User.findOne({
        username: req.body.username
      })
        .exec((err, user) => {
          if (err) {
            res.status(500).send({ message: err }).end();
            console.log(err);
            return;
          }
          if (!user) {
            return res.status(404).send({ message: "User Not found." }).end();
          }
          var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
          );
          if (!passwordIsValid) {
            return res.status(401).send({
              accessToken: null,
              message: "Invalid Password!"
            }).end();
          }
          var token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // 24 hours
          });
          // var authorities = [];
          // for (let i = 0; i < user.roles.length; i++) {
          //   authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
          // }
          res.status(200).send({
            id: user._id,
            username: user.username,
            email: user.email,
            accessToken: token
          });
        });
}

module.exports = {
    signup,
    signin
};