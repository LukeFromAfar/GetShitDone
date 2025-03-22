const jwt = require("jsonwebtoken");
require("dotenv").config();

async function createJWT(name, email, role) {
    const jwtToken = jwt.sign(
        { name, email, role },
        process.env.SECRET_KEY
    );
    console.log(jwtToken);
    return jwtToken;
}

module.exports = createJWT;