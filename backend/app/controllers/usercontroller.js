const db = require("../models/index");
const path = require("path");
const Role = db.role;
const Avatar = db.avatar;
const User = db.user;
const Room = db.room;
const formidable = require("formidable");
const uniqid = require("uniqid");

let sourceAv;

allAccess = (req,res) => {
    res.status(200).send("Public content");
}

userBoard = async (req,res) => {
    //tutaj wysyłamy wszystkie informacje które są na stronie głównej po zalogowaniu
    try{
        const u = await User.findById(req.userId);
        const av = await Avatar.findById(u.avatarPictures[0]);
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
        let form = new formidable.IncomingForm();
        console.log(path.join(__dirname,"..","pictures"));
        form.multiples = true;
        form.uploadDir = path.join(__dirname,"..","pictures");

        form.parse(req,(err,fields,files) => {
            console.log(fields);
            console.log(files);
        });

        const u = await User.findById(req.userId);
        const av = new Avatar({name: req.userId, src: sourceAv});
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

createRoom = async (req,res) => {
    const code = uniqid();
    try{
        const room = new Room({
            name: req.body.name,
            accessCode: code
        });
        await room.save();
        const u = await User.findById(req.userId);
        u.rooms.push(room);
        await u.save();
    }
    catch(err){
        return res.send(err);
    }
}

joinRoom = async (req,res) => {

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
    profileBoard,
    changeAvatar,
    changeNick,
    createRoom,
    joinRoom
};