const db = require("../models/index");
const path = require("path");
const Role = db.role;
const Avatar = db.avatar;
const User = db.user;
const Room = db.room;
const formidable = require("formidable");
const uniqid = require("uniqid");
const fs = require("fs");

allAccess = (req,res) => {
    res.status(200).send("Public content");
}

userBoard = async (req,res) => {
    //tutaj wysyłamy wszystkie informacje które są na stronie głównej po zalogowaniu
    try{
        const u = await User.findById(req.userId);
        const rooms = [];
        for(let r of u.rooms){
            const room = await Room.findById(r);
            rooms.push(room);
        }
        return res.send({
            picture: u.avatar,
            username: u.username,
            playlists: undefined,
            rooms: rooms
        });
    }
    catch(err){
        return res.send({message:err});
    }
}

profileBoard = async (req,res) => {
    //wyświetla się lista możliwych ustawień wyświetlanych elementów profilu
    try{
        const u = await User.findById(req.userId);
        console.log(u);
        return res.send({
            username: u.username,
            avatar: u.avatar
        });
    }
    catch(err){
        return res.send({message:err});
    }
}

changeAvatar = async (req,res) => {
    //tutaj jest obsługa zmieniania i zapisywania zapostowanego awatara
    try{
        let form = new formidable.IncomingForm();
        console.log(form);
        form.uploadDir = path.join(__dirname,"..","pictures");
        const u = await User.findById(req.userId);

        form.parse(req,async (err,fields,files) => {
            if(err) return res.status(400);
            const avatarName = `${uniqid()}.png`;
            fs.renameSync(files.avatar.filepath,path.join(__dirname,"..","pictures",avatarName));
            u.avatar = avatarName;
            await u.save();
            return res.send({message: "avatar changed!"});
        });
        
    }
    catch(err){
        return res.send({message:err});
    }
}

changeNick = async (req,res) => {
    //tutaj jest obsługa zmieniania username'a
    try{
        const u = await User.findById(req.userId);
        const someUser = await User.findOne({username: req.body.newusername});
        if(someUser){
            return res.send({message: "There is already a user with that name"});
        }
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
    if(!u.isInRoom){
        if(r){
            r.members.push(u._id);
            if(!u.rooms.includes(r._id)) u.rooms.push(r._id);
            u.isInRoom = true;
            await r.save();
            await u.save();
            const ret = {};
            ret["name"] = r.name;
            ret["members"] = [];
            ret["playlist"] = {};
            for(let m of r.members){
                let user = await User.findById(m);
                ret["members"].push({
                    "username": user.username,
                    "avatar": user.avatar
                });
            }
            return res.send(ret);
        }
        else{
            return res.send({message: "Room does not exist"});
        }
    }
    else{
        return res.send({message: "You are already in a room"});
    }
}

leaveRoom = async (req,res) => {
    const u = await User.findById(req.userId);
    console.log(u.username);
    if(u.isInRoom){
        const r = await Room.findOne({accessCode: req.body.code});
        if(r){
            r.members.splice(r.members.indexOf(u._id),1);
            u.isInRoom = false;
            await r.save();
            await u.save();
            return res.send({message: "succesfully left the room"});
        }
        else{
            return res.send({message: "Room does not exist"});
        }
    }
    else{
        return res.send({message: "You are not in any room currently"});
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
            ret["members"].push({
                "username": user.username,
                "avatar": user.avatar
            });
        }
        return res.send(ret);
    }
    else{
        return res.send({message: "Room does not exist"});
    }
}

searchUsers = async (req,res) => {
    console.log(req.body.searchterm);
    const u = await User.findById(req.userId);
    let results = await User.find({username: {$regex: String(req.body.searchterm),$options: "i"}});
    console.log(u.username);
    if(results){
        let ret = [];
        results = results.filter(a => !u.friends.includes(a._id));
        for(let r of results){
            if(r.username != u.username){
                ret.push({
                    username: r.username,
                    avatar: r.avatar
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
            const friend = await User.findById(f);
            ret.push({
                username: friend.username,
                avatar: friend.avatar
            });
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
    if(!friend){
        return res.send({message: "No user with that name"});
    }
    if(u.username != req.body.friendname){
        u.friends.push(friend._id);
        friend.friends.push(u._id);
        await u.save();
        await friend.save();
        return res.send({message: "friend added"});
    }
    else{
        return res.send({message: "can't friend yourself"});
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