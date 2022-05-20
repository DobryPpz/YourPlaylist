# README #

## Your Playlist ##
Your Playlist is an online application that makes playlist creation and editing more communal by allowing all users to contribute. The application's main objective is to create a system of rooms that, in turn, allow you to build a playlist. The playlist's contents can then be broadcast to all users in the room.

### Motivation ###
Many services now enable you to stream music of your choice. However, these services are often restricted to their domains. Furthermore, there is no assurance that a piece of music available on one service will be available on another. The following app seeks to alleviate this problem by integrating songs from several music streaming sites, such as [Spotify](https://www.spotify.com/) and [SoundCloud](https://soundcloud.com/).

### Who is it aimed for? ###
The following application's primary target demographic is young people, who frequently link music with social activities. It may, however, be employed in any context that promotes music as an important aspect of the event.

### Functionalities ###
* The ability to register for and log in to Spotify and SoundCloud accounts.
* Songs from many streaming providers can be added to a single playlist.
* Customizable user profile.
* Friends list.
* Creation of rooms, generation of an access code.
* Ability to join friends' rooms with an access code.
* The next song to be played can be decided by vote.
* Saving the current playlist to your list.
* Playlist sharing.

### The Team ###
* Aleksander Modzelewski - Team Leader, Backend Developer
* Konrad Iwan - Frontend Developer
* Anhelina Piatrovich - Graphic Designer
* Szymon Werema - Tester
* Piotr Lenarczyk - DevOps, Documentation

### Technologies ###
* [JavaScript](https://en.wikipedia.org/wiki/JavaScript) - primary scripting language. Dominant in any client-server use due to its event-driven paradigm. It was chosen because of the abundance of client- and server-side libraries and frameworks.
* [NodeJS](https://nodejs.org/en/about/) – a backend framework for JavaScript. It is a <i>de-facto</i> tool for real-time web applications due to its usage of asynchronous, event-driven input/output mode of operations.
* [MongoDB](https://www.mongodb.com/) – the following application does not need to store significant amounts of data because the majority of it is given by the streaming services' databases. MongoDB is a lightweight database that employs the BSON format, which is easily converted to JSON and reduces the need for normalization.
* [Figma](https://www.figma.com/) – a web-based graphics editor. Used for prototyping application UI components.
* [StarUML](https://staruml.io/) - an open-source modeling software. Used in the process of initial project development and its documentation.
* [React.js](https://reactjs.org/) – a JavaScript frontend library that is used to prototype UI components. It was chosen for its versatility, scalability, and performance.
* [Postman](https://www.postman.com/) - a tool used for testing the application's backend. It was chosen because of its user-friendly design, which allows concentrating on the testing procedure itself.
* [Heroku](https://www.heroku.com/) - a Platform as a Service [(PaaS)](https://en.wikipedia.org/wiki/Platform_as_a_service) utilized as a production environment. It eliminates the need to focus on managing any servers or other infrastructure because it is fully managed. Furthermore, its CLI provides greater control over the program.
* <i>(optional)</i> [Flutter](https://flutter.dev/) – a framework used for the mobile version of the following application.

### Possible Extensions ###
* Allow sending friend requests to other users of the room
* Mobile app</br></br>
Note that the above functionalities are optional, they may or may not be implemented.

### Project status ###
Because the aforementioned project is still in development, any information in this README file is subject to change.

## Changelog ##
* <i>Ongoing</i> - Song search, playlist creation procedure.
* 26.04.2022 - Room creation and joining procedure.
* 29.03.2022 - Login and registration to [Spotify](https://www.spotify.com/), [SoundCloud](https://soundcloud.com/), and the app itself have been added.