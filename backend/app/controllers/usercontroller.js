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
const puppeteer = require("puppeteer");
let browser;
let isBrowserRan = false;
const jsdom = require("jsdom");

currentInvites = {};

runBrowser = async () => {
    browser = await puppeteer.launch();
    isBrowserRan = true;
}  

allAccess = (req,res) => {
    res.status(200).send("Public content");
}

registerSocket = async (req,res) => {
    const u = await User.findById(req.userId);
    for(let s in sockets){
        if(sockets[s]["user"] == u["username"]){
            console.log("aa");
            sockets[req.body.socketid] = {
                "user": sockets[s]["user"],
                "room": sockets[s]["room"] != null ? sockets[s]["room"].toString() : null
            }
            return res.status(200).end();
        }
    }
    console.log("register socket",sockets);
    console.log(req.body);
    sockets[req.body.socketid] = {
        "user": u["username"],
        "room": sockets[req.body.socketid] && sockets[req.body.socketid]["room"] ? sockets[req.body.socketid]["room"].toString() : null
    };
    for(let s in sockets){
        if(s != req.body.socketid && sockets[req.body.socketid]["user"] == sockets[s]["user"]){
            delete sockets[s];
        }
    }
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
            playlists.push(playlist);
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
    console.log("join room sockets",sockets);
    for(let s in sockets){
        if(sockets[s]["user"] == u["username"]){
            sockets[s]["room"] = r._id;
            break;
        }
    }
    if(r && !u.isInRoom){
        console.log("==========");
        console.log(sockets);
        console.log("==========");

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
        console.log(ret.members);
        console.log(r);
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
        console.log(req.body);
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
            ret["playlist"].tracks.sort((a,b) => b.voteSum - a.voteSum);
            if(r.playQueue.playlist.tracks.length > 0){
                r.currentTrack = ret["playlist"].tracks[0].url;
                ret["currenttrack"] = r.currentTrack;
                await r.save();
            }
            await ret["playlist"].save();
        }
        return res.send(ret);
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
            name: req.body.name,
            owner: req.userId,
            tracks: []
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
            }
        }
        return res.status(200).end();
    } 
    catch(err){
        return res.status(400).send({message: err}).end();
    }
}

searchSoundCloud = async (req,res) => {
    if(!isBrowserRan){
        await runBrowser();
    }
    let page = await browser.newPage();
    let songs;
    try {
        await page.goto(`https://soundcloud.com/search/sounds?q=${req.body.searchterm}`);
        await page.waitForSelector("li.searchList__item");
    } catch (error) {
        return { error: error.message };
    }

    songs = await page.evaluate(() => {
        let songElements = Array.from(document.body.querySelectorAll("li.searchList__item"));
        songElements = songElements.map(e => e.innerHTML);
        return songElements;
    });
    songs = songs.map(s => {
        const songElement = new jsdom.JSDOM(s);
        const ret = {};
        ret["url"] = "https://soundcloud.com" + songElement.window.document.getElementsByClassName("sound__coverArt")[0].href;
        ret["title"] = songElement.window.document.getElementsByClassName("soundTitle__title")[0].firstElementChild.innerHTML;
        ret["cover"] = songElement.window.document.querySelector("span.sc-artwork").style["background-image"].slice(4, -1);
        return ret;
    });

    page.close();
    res.send(songs);
}

getSoundcloudSongCover = async (req,res) => {
    if(!isBrowserRan){
        await runBrowser();
    }
    const page = await browser.newPage();

    await page.goto(req.body.url);

    const cover = await page.evaluate(() => {
        return document.body.querySelector("#content > div > div.l-listen-hero > div > div.fullHero__foreground.fullListenHero__foreground.sc-p-4x > div.fullHero__artwork > div > div > div > span").
        style["background-image"].slice(5,-2);
    });

    page.close();
    res.send(cover);
}

searchYoutube = async (req,res) => {
    if(!isBrowserRan){
        await runBrowser();
    }
    let page = await browser.newPage();
    let songs;

    await page.goto(`https://youtube.com/search?q=${req.body.searchterm}`);

    songs = await page.evaluate(() => {
        let els = Array.from(document.body.querySelectorAll("#dismissible"));
        els = els.map(e => e.innerHTML);
        return els;
    });

    songs = songs.map(n => {
        const p = new jsdom.JSDOM(n);
        const ret = {};
        ret["url"] = "https://youtube.com" + p.window.document.getElementById("thumbnail").href;
        ret["title"] = p.window.document.getElementById("video-title").lastElementChild.innerHTML;
        ret["artist"] = p.window.document.getElementById("channel-info").lastElementChild.firstElementChild.
        firstElementChild.firstElementChild.firstElementChild.innerHTML;

        return ret;
    });

    page.close();
    res.send(songs);
}

addSong = async (req,res) => {
    const p = await Playlist.findById(req.playlistId);
    p.tracks.push({
        url: req.body.url,
        voteSum: 0,
        title: req.body.title,
        artist: req.body.artist,
        albumCover: req.body.cover
    });
    await p.save();
    if(req.body.code){
        io.to(req.body.code).emit("updateroom");
    }
    return res.end("song added");
}

deleteSong = async (req,res) => {
    try{
        const p = await Playlist.findById(req.body.playlistId);
        if(p.owner.toString() == req.userId.toString()){
            for(let i=0;i<p.tracks.length;i++){
                if(p.tracks[i].url == req.body.url){
                    p.tracks.splice(i,1);
                    await p.save();
                    if(req.body.code){
                        io.to(req.body.code).emit("updateroom");
                    }
                    return res.end("track deleted");
                }
            }
        }
        else{
            return res.end("You can't delete songs because you don't own the playlist");
        }
    }
    catch(err){
        return res.end(err);
    }
}

voteSongUp = async (req,res) => {
    try{
        const p = await Playlist.findById(req.body.playlistId);
        for(let i=0;i<p.tracks.length;i++){
            if(p.tracks[i].url == req.body.url){
                p.tracks[i].voteSum++;
                await p.save();
                if(req.body.code){
                    io.to(req.body.code).emit("updateroom");
                }
                return res.end("song voted up");
            }
        }
    }
    catch(err){
        return res.end(err);
    }
}

voteSongDown = async (req,res) => {
    try{
        const p = await Playlist.findById(req.body.playlistId);
        for(let i=0;i<p.tracks.length;i++){
            if(p.tracks[i].url == req.body.url){
                p.tracks[i].voteSum--;
                await p.save();
                if(req.body.code){
                    io.to(req.body.code).emit("updateroom");
                }
                return res.end("song voted up");
            }
        }
    }
    catch(err){
        return res.end(err);
    }
}

voteSongSkip = async (req,res) => {

}

play = async (req,res) => {
    try{
        const r = await Room.findOne({accessCode: req.body.code});
        const p = await Room.findById(req.body.playlistId);
        for(let i=0;i<p.tracks.length;i++){
            if(p.tracks[i].url == r.currentTrack){
                p.tracks[i].voteSum = 0;
                io.to(r.accessCode).emit("playsong");
                setTimeout(() => {
                    io.to(r.accessCode).emit("updateroom");
                    io.to(r.accessCode).emit("nextsong");
                },+req.body.duration);
                await p.save();
                return res.end("playing...");
            }
        }
    }
    catch(err){
        return res.end(err);
    }
}

pause = async (req,res) => {

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
    registerSocket,
    searchSoundCloud,
    searchYoutube,
    getSoundcloudSongCover,
    addSong,
    deleteSong,
    voteSongUp,
    voteSongDown,
    voteSongSkip,
    play,
    pause
};