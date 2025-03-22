require("dotenv").config();

async function createCookie(res, jwtToken) {
  res.cookie("jwt", jwtToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 5,
  });
}

module.exports = createCookie;