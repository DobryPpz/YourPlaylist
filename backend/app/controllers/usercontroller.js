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
        console.log(room);
        await room.save();
        const u = await User.findById(req.userId);
        u.rooms.push(room);
        await u.save();
        console.log(u);
        return res.send({message: "Room created", code: code});
    }
    catch(err){
        return res.send(err);
    }
}

joinRoom = async (req,res) => {
    const u = await User.findById(req.userId);
    const r = await Room.findOne({accessCode: req.body.code});
    if(r){
        r.members.push(u);
        if(!u.rooms.includes(r)) u.rooms.push(r);
        await r.save();
        await u.save();
        const ret = {};
        ret["name"] = r.name;
        ret["members"] = [];
        ret["playlist"] = {};
        for(let m of r.members){
            let user = await User.findById(m);
            let av = await Avatar.findById(user.avatarPictures[0]);
            ret["members"].push({
                "username": user.username,
                "avatar": av.src
            });
        }
        return res.send(ret);
    }
    else{
        return res.send({message: "Room does not exist"});
    }
}

leaveRoom = async (req,res) => {
    const u = await User.findById(req.userId);
    const r = await Room.findOne({accessCode: req.body.code});
    if(r){
        r.members.splice(r.members.indexOf(u),1);
        await r.save();
        return res.send({message: "succesfully left the room"});
    }
    else{
        return res.send({message: "Room does not exist"});
    }
}

updateRoom = async (req,res) => {
    const r = await Room.findOne({accessCode: req.body.code});
    if(r){
        const ret = {};
        ret["name"] = r.name;
        ret["members"] = [];
        ret["playlist"] = {};
        for(let m of r.members){
            let user = await User.findById(m);
            let av = await Avatar.findById(user.avatarPictures[0]);
            ret["members"].push({
                "username": user.username,
                "avatar": av.src
            });
        }
        return res.send(ret);
    }
    else{
        return res.send({message: "Room does not exist"});
    }
}

searchUsers = async (req,res) => {
    const results = await User.find({username: {$regex: req.body.searchterm,$options: "i"}});
    if(results){
        let ret = [];
        for(let r of results){
            const av = await Avatar.findById(r.avatarPictures[0]);
            if(av){
                ret.push({
                    username: r.username,
                    avatar: av.src
                });
            }
        }
        return res.send(ret);
    }
    else{
        return res.send({message: "no results"});
    }
}

showFriends = async (req,res) => {
    const u = await User.findById(req.userId);
    if(u.friends.length > 0){
        let ret = [];
        for(let f of u.friends){
            const friend = User.findById(f);
            const av = Avatar.findById(friend.avatarPictures[0]);
            if(av){
                ret.push({
                    username: friend.username,
                    avatar: av.src
                });
            }
        }
        return res.send(ret);
    }
    else{
        return res.send({message: "No friends yet"});
    }
}

addFriend = async (req,res) => {
    const u = await User.findById(req.userId);
    const friend = await User.findOne({username: req.body.friendname});
    u.friends.push(friend);
    friend.friends.push(u);
    await u.save();
    await friend.save();
    return res.send({message: "friend added"});
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
    joinRoom,
    leaveRoom,
    updateRoom,
    searchUsers,
    showFriends,
    addFriend
};