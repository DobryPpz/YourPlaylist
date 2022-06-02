const db = require("../models/index");
const path = require("path");
const Role = db.role;
const Avatar = db.avatar;
const User = db.user;
const Room = db.room;
const Playlist = db.playlist;
const formidable = require("formidable");
const uniqid = require("uniqid");
const fs = require("fs");
const io = require("./socketserver").io;
const sockets = require("./socketserver").sockets;

currentInvites = {};

allAccess = (req,res) => {
    res.status(200).send("Public content");
}

registerSocket = async (req,res) => {
    const u = await User.findById(req.userId);
    for(let s in sockets){
        if(sockets[s]["user"] == u["username"]){
            console.log("aa");
            return res.status(200).end();
        }
    }
    if(req.body.socketid in sockets){
        console.log("bb");
        sockets[req.body.socketid]["user"] = u["username"];
    }
    else{
        console.log("cc");
        sockets[""+req.body.socketid] = {
            "user": u["username"]
        };
    }
    console.log("register socket",sockets);
    return res.status(200).send({message: "socket registered"}).end();
}

userBoard = async (req,res) => {
    //tutaj wysyłamy wszystkie informacje które są na stronie głównej po zalogowaniu
    try{
        const u = await User.findById(req.userId);
        const rooms = [];
        const playlists = [];
        for(let r of u.rooms){
            const room = await Room.findById(r);
            rooms.push(room);
        }
        for(let p of u.playlists){
            const playlist = await Playlist.findById(p);
            playlist.push(playlist);
        }
        return res.send({
            picture: u.avatar,
            username: u.username,
            playlists: playlists,
            rooms: rooms
        });
    }
    catch(err){
        return res.send({message:err}).end();
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
        }).end();
    }
    catch(err){
        return res.send({message:err}).end();
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
            return res.send({message: "avatar changed!"}).end();
        });
        
    }
    catch(err){
        return res.send({message:err}).end();
    }
}

changeNick = async (req,res) => {
    //tutaj jest obsługa zmieniania username'a
    try{
        const u = await User.findById(req.userId);
        const someUser = await User.findOne({username: req.body.newusername});
        if(someUser){
            return res.send({message: "There is already a user with that name"}).end();
        }
        u.username = req.body.newusername;
        await u.save();
        return res.send({message: "username changed!"}).end();
    }
    catch(err){
        return res.send({message:err}).end();
    }
}

createRoom = async (req,res) => {
    console.log("someone wants to create room");
    const code = uniqid();
    try{
        const room = new Room({
            name: req.body.name,
            accessCode: code
        });
        if(req.body.playlistid){
            const playlist = await Playlist.findById(req.body.playlistid);
            room.playQueue.playlist = playlist;
        }
        await room.save();
        const u = await User.findById(req.userId);
        u.rooms.push(room);
        await u.save();
        return res.send({message: "Room created", code: code}).end();
    }
    catch(err){
        return res.send(err).end();
    }
}

joinRoom = async (req,res) => {
    console.log("someone wants to join the room - request");
    const u = await User.findById(req.userId);
    const r = await Room.findOne({accessCode: req.body.code});
    if(r && !u.isInRoom){
        console.log("==========");
        console.log(sockets);
        console.log("==========");

        for(let s in sockets){
            if(sockets[s]["user"] == u["username"]){
                if(sockets[s]["room"]){
                    const oldRoom = await Room.findById(sockets[s]["room"]);
                    oldRoom.members.splice(oldRoom.members.indexOf(u._id),1);
                    await oldRoom.save();
                    io.to(oldRoom["accessCode"]).emit("updateroom");
                }
                sockets[s]["room"] = r._id;
                break;
            }
        }
        console.log("join room socket",req.body);
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
        if(r.playQueue && r.playQueue.playlist){
            ret["playlist"] = await Playlist.findById(r.playQueue.playlist);
        }
        return res.status(200).send(ret).end();
    }
    else{
        return res.status(400).send({message: "Room does not exist"}).end();
    }
}

leaveRoom = async (req,res) => {
    const u = await User.findById(req.userId);
    console.log("leave room request");
    if(u.isInRoom){
        const r = await Room.findOne({accessCode: req.body.code});
        console.log(r);
        if(r){
            r.members.splice(r.members.indexOf(u._id),1);
            u.isInRoom = false;
            console.log(r);
            await r.save();
            await u.save();
            return res.send({message: "succesfully left the room"}).end();
        }
        else{
            return res.send({message: "Room does not exist"}).end();
        }
    }
    else{
        return res.send({message: "You are not in any room currently"}).end();
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
        if(r.playQueue && r.playQueue.playlist){
            ret["playlist"] = await Playlist.findById(r.playQueue.playlist);
        }
        return res.send(ret).end();
    }
    else{
        return res.send({message: "Room does not exist"}).end();
    }
}

createPlaylist = async (req,res) => {
    try{
        const u = await User.findById(req.userId);
        for(let p of u.playlists){
            if(p["name"] == req.body.name) 
            return res.status(400).send({message: "You already have a playlist with that name"}).end();
        }
        const playlist = new Playlist({
            name: req.body.name
        });
        u.playlists.push(playlist);
        if(req.body.assignedto){
            const room = await Room.findOne({accessCode: req.body.assignedTo});
            playlist.assignedTo = room;
            room.playQueue.playlist = playlist;
            await room.save();
        }
        await u.save();
        await playlist.save();
        return res.status(200).send({message: "A new playlist created"}).end();
    }
    catch(err){
        return res.status(400).send({message: err}).end();
    }
}

getPlaylist = async (req,res) => {
    try{
        const u = await User.findById(req.userId);
        for(let p of u.playlists){
            if(p["name"] == req.body.name){
                const playlist = await Playlist.findById(p._id);
                return res.status(200).send({
                    playlistId: playlist._id,
                    playlist: playlist
                }).end();
            }
        }
    }
    catch(err){
        return res.status(400).send({message: err}).end();
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
        return res.send(ret).end();
    }
    else{
        return res.send({message: "no results"}).end();
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
        return res.send(ret).end();
    }
    else{
        return res.send({message: "No friends yet"}).end();
    }
}

addFriend = async (req,res) => {
    const u = await User.findById(req.userId);
    const friend = await User.findOne({username: req.body.friendname});
    if(!friend){
        return res.send({message: "No user with that name"}).end();
    }
    if(u.username != req.body.friendname){
        u.friends.push(friend._id);
        friend.friends.push(u._id);
        await u.save();
        await friend.save();
        return res.send({message: "friend added"}).end();
    }
    else{
        return res.send({message: "can't friend yourself"}).end();
    }
}

inviteToRoom = async (req,res) => {
    console.log("invitetoroom",sockets);
    try{
        const u = await User.findOne({username: req.body.friendname});
        if(u == null){
            return res.status(400).send({message: "There is no user with that name"}).end();
        }
        for(let s in sockets){
            if(sockets[s]["user"] == req.body.friendname){
                console.log("xxx");
                console.log(s);
                io.to(s).emit("invite-ready",{
                    name: req.body.roomname,
                    code: req.body.code
                });
                return res.status(200).end();
            }
        }
    } 
    catch(err){
        return res.status(400).send({message: err}).end();
    }
}

adminBoard = (req,res) => {
    res.status(200).end("Admin content");
}

moderatorBoard = (req,res) => {
    res.status(200).end("Moderator content");
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
    addFriend,
    createPlaylist,
    getPlaylist,
    inviteToRoom,
    registerSocket
};