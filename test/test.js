const axios = require("axios");

class User {
    constructor(email, password, token) {
        this.email = email;
        this.password = password;
        this.token = token;
    }
}

class Post {
    constructor(title, description, _id = "", creationTime = "") {
        this.title = title;
        this.description = description;
        this._id = _id;
        this.creationTime = creationTime;
    }
}

module.exports = { User, Post };