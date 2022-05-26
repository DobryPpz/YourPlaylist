const authJwt = require("../middleware/authjwt");
const controller = require("../controllers/usercontroller");

module.exports = app => {
    app.use(function(req,res,next){
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    app.get("/api/test/all",controller.allAccess);
    app.get("/api/test/user",[authJwt.verifyToken],controller.userBoard);
    app.get("/api/test/profile",[authJwt.verifyToken],controller.profileBoard);
    app.post("/api/test/changeavatar",[authJwt.verifyToken],controller.changeAvatar);
    app.post("/api/test/changenick",[authJwt.verifyToken],controller.changeNick);
    app.post("/api/test/createplaylist",[authJwt.verifyToken],controller.createPlaylist);
    app.get("/api/test/getplaylist",[authJwt.verifyToken],controller.getPlaylist);
    app.post("/api/test/createroom",[authJwt.verifyToken],controller.createRoom);
    app.post("/api/test/joinroom",[authJwt.verifyToken],controller.joinRoom);
    app.post("/api/test/leaveroom",[authJwt.verifyToken],controller.leaveRoom);
    app.post("/api/test/updateroom",[authJwt.verifyToken],controller.updateRoom);
    app.post("/api/test/searchusers",[authJwt.verifyToken],controller.searchUsers);
    app.get("/api/test/showfriends",[authJwt.verifyToken],controller.showFriends);
    app.post("/api/test/addfriend",[authJwt.verifyToken],controller.addFriend);
    app.post("api/test/invitetoroom",[authJwt.verifyToken],controller.inviteToRoom);
    app.get(
        "/api/test/mod",
        [authJwt.verifyToken,authJwt.isModerator],
        controller.moderatorBoard
    );
    app.get(
        "/api/test/admin",
        [authJwt.verifyToken,authJwt.isAdmin],
        controller.adminBoard
    );
}