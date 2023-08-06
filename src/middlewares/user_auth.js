const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
exports.user_authenticate = async (req, res, next) => {
  try {
    // get token from cookie
    const token = req.cookies.jwt || req.headers["x-sh-auth"];
    console.log(token);
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized",
      });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    console.log(decoded);

    // check if user exists
    const user = await User.findById(decoded._id);
    if (!user || user.is_admin == true) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized ",
      });
    }

    // set user to req object
    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      code: 401,
      message: "Unauthorized",
    });
  }
};
