//Dokumentacja API Your Playlist


////////////////////////////////////////////////////////////////

POST /api/auth/signup //post request do rejestracji

//potrzebne dane:
let postData = {
    "username": "someuser",
    "email": "someemail@example.com",
    "password": "somepassword",
    "roles": ["user"]
}
//parametr roles jest opcjonalny i jeśli nie zostanie podany to przy rejestracji automatycznie dodana zostanie rola user

//zwracane dane:
let ret = {
    "message": "user was registered succesfully"
}


////////////////////////////////////////////////////////////////

POST /api/auth/signin //post request do logowania

//potrzebne dane:
postData = {
    "username": "some",
    "password": "somepassword"
}

//zwracane dane:
ret = {
    "id": "623a4d4ec7b23aab221f39b7",
    "username": "some",
    "email": "some@example.com",
    "roles": [
        "ROLE_USER"
    ],
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyM2E0ZDRlYzdiMjNhYWIyMjFmMzliNyIsImlhdCI6MTY0ODIzMDYyNiwiZXhwIjoxNjQ4MzE3MDI2fQ.fMmDAonn9qaYQXcHJlqIU9DVdl82EejYrRKZKE-cyJA"
}
//accessToken to token jwt który musi być przechowywany po stronie klienta i jest potrzebny do używania feature'ów
// które wymagają bycia zalogowanym(czyli w sumie wszystkich)

////////////////////////////////////////////////////////////////

GET /api/test/user //get do wyświetlenia strony głównej użytkownika

//potrzebne dane:
let headers = {//trzeba do headerów requesta dodać następujący. zawartość tokena otrzymana po zalogowaniu
    "x-access-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyM2E0ZDRlYzdiMjNhYWIyMjFmMzliNyIsImlhdCI6MTY0ODIzMDYyNiwiZXhwIjoxNjQ4MzE3MDI2fQ.fMmDAonn9qaYQXcHJlqIU9DVdl82EejYrRKZKE-cyJA"
}

//zwracane dane:
ret = {
    "picture": "./app/pictures/default.png",
    "username": "some",
    "playlists": [/*lista nazw stworzonych playlist. dodane w przyszłości*/],
    "rooms": [/*lista nazw stworzonych roomów. dodane w przyszłości*/]
}

////////////////////////////////////////////////////////////////

GET /api/test/profile //get do wyświetlenia opcji profilu jak na przykład zmiany awatara

//potrzebne dane:
headers = {//trzeba do headerów requesta dodać następujący. zawartość tokena otrzymana po zalogowaniu
    "x-access-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyM2E0ZDRlYzdiMjNhYWIyMjFmMzliNyIsImlhdCI6MTY0ODIzMDYyNiwiZXhwIjoxNjQ4MzE3MDI2fQ.fMmDAonn9qaYQXcHJlqIU9DVdl82EejYrRKZKE-cyJA"
}

//zwracane dane:
ret = {
    "picture": "./app/pictures/default.png",
    "username": "some"
}

////////////////////////////////////////////////////////////////

POST /api/test/changeavatar //post do zmiany awatara

//potrzebne dane: plik graficzny z formularza gdzie element formularza z plikiem powinien się nazywać "avatar"

headers = {//trzeba do headerów requesta dodać następujący. zawartość tokena otrzymana po zalogowaniu
    "x-access-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyM2E0ZDRlYzdiMjNhYWIyMjFmMzliNyIsImlhdCI6MTY0ODIzMDYyNiwiZXhwIjoxNjQ4MzE3MDI2fQ.fMmDAonn9qaYQXcHJlqIU9DVdl82EejYrRKZKE-cyJA"
}

//zwracane dane: 
ret = {message: "avatar changed!"}


////////////////////////////////////////////////////////////////


POST /api/test/changenick //post do zmiany username

//potrzebne dane:
postData = {
    "newusername": "newUserName"
}
headers = {//trzeba do headerów requesta dodać następujący. zawartość tokena otrzymana po zalogowaniu
    "x-access-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyM2E0ZDRlYzdiMjNhYWIyMjFmMzliNyIsImlhdCI6MTY0ODIzMDYyNiwiZXhwIjoxNjQ4MzE3MDI2fQ.fMmDAonn9qaYQXcHJlqIU9DVdl82EejYrRKZKE-cyJA"
}

//zwracane dane: 
ret = {message: "username changed!"}