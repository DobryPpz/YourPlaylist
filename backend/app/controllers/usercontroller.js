const db = require("../models/index");
const path = require("path");
const Role = db.role;
const Avatar = db.avatar;
const User = db.user;
const multer = require("multer");

let sourceAv;

const storage = multer.diskStorage({
    destination: "../pictures/",
    filename: (req,file,cb) => {
        const fileName = file.originalname;
        sourceAv = `${fileName}`;
        console.log(file.originalname);
        cb(null,fileName);
    }
});

console.log(storage);

const uploadImage = multer({storage}).single("avatar");

allAccess = (req,res) => {
    res.status(200).send("Public content");
}

userBoard = async (req,res) => {
    //tutaj wysyłamy wszystkie informacje które są na stronie głównej po zalogowaniu
    try{
        const u = await User.findById(req.userId);
        //console.log(u);
        const av = await Avatar.findById(u.avatarPictures[0]);
        //console.log(av);
        return res.send(JSON.stringify({
            picture: av.src,
            username: u.username,
            playlists: undefined,
            rooms: undefined
        }));
    }
    catch(err){
        return res.send({message:err});
    }
}

profileBoard = async (req,res) => {
    //wyświetla się lista możliwych ustawień wyświetlanych elementów profilu
    try{
        const u = await User.findById(req.userId);
        const av = await Avatar.findById(u.avatarPictures[0]);
        return res.send(JSON.stringify({
            picture: av.src,
            username: u.username
        }));
    }
    catch(err){
        return res.send({message:err});
    }
}

changeAvatar = async (req,res) => {
    //tutaj jest obsługa zmieniania i zapisywania zapostowanego awatara
    try{
        const u = await User.findById(req.userId);
        const av = new Avatar({name: req.userId, src: sourceAv});
        console.log(av);
        await av.save();
        u.avatarPictures[0] = av._id;
        await u.save();
        return res.send({message: "avatar changed!"});
    }
    catch(err){
        return res.send({message:err});
    }
}

changeNick = async (req,res) => {
    //tutaj jest obsługa zmieniania username'a
    try{
        const u = await User.findById(req.userId);
        u.username = req.body.newusername;
        await u.save();
        return res.send({message: "username changed!"});
    }
    catch(err){
        return res.send({message:err});
    }
}

adminBoard = (req,res) => {
    res.status(200).send("Admin content");
}

moderatorBoard = (req,res) => {
    res.status(200).send("Moderator content");
}

module.exports = {
    allAccess,
    userBoard,
    adminBoard,
    moderatorBoard,
    uploadImage,
    profileBoard,
    changeAvatar,
    changeNick
};