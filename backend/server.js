const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const dbconfig = require("./app/config/dbconfig");
const db = require("./app/models/index");
const authJwt = require("./app/middleware/authjwt");
const controller = require("./app/controllers/usercontroller");
const User = require("./app/models/usermodel");
const Role = db.role;
const Avatar = db.avatar;
const Room = db.Room;
const io = require("socket.io")(5050,{
    cors: {
        origin: "http://localhost:3000"
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "app/pictures/")));

require("./app/routes/authroutes")(app);
require("./app/routes/userroutes")(app);

//funkcje
function initial(){
    Role.estimatedDocumentCount((err,count) => {
        if(!err && count == 0){
            new Role({name: "user"})
            .save(err => {
                if(err) console.log("Error: ",err);
                console.log(`Added "user" to Roles collection`);
            });
            new Role({name: "moderator"})
            .save(err => {
                if(err) console.log("Error: ",err);
                console.log(`Added "moderator" to Roles collection`);
            });
            new Role({name:"admin"})
            .save(err => {
                if(err) console.log("Error: ",err);
                console.log(`Added "admin" to Roles collection`);
            });
        }
    });
    Avatar.estimatedDocumentCount((err,count) => {
        if(!err && count == 0){
            new Avatar({name: "default", src: path.join(__dirname, `app/pictures/default.png`)})
            .save(err => {
                if(err) console.log("Error: ",err);
                console.log("Added default avatar to Avatar database");
            });
        }
    });
}

//setup bazy
db.mongoose
.connect(`mongodb://${dbconfig.HOST}:${dbconfig.PORT}/${dbconfig.DB}`,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Succesfully connected to mongodb");
    initial();
})
.catch(err => {
    console.log("Error: ",err);
});

//sockety
io.on("connection",socket => {
    console.log("someone connected");
    socket.on("join-room",data => {
        socket.join(data);
        io.to(data).emit("updateroom");
    });
    socket.on("leave-room",data => {
        socket.leave(data);
        io.to(data).emit("updateroom");
    });
});

//requesty
app.get("/",(req,res) => {
    res.send(JSON.stringify({message:"Welcome to Your Playlist"}));
});

//start
app.listen(3000,() => {
    console.log(`Server is running on port 3000`);
});