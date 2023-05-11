const middlewareHeaders = (req, res, next) => {
  const { headers, url } = req;
  // allow requests for static assets
  if (url.includes("images")) {
    return next();
  }

  // normal middleware
  if (headers["x-access-api-key"] === "qwerty123") {
    next();
  } else {
    res
      .status(405)
      .json({ message: "ACCESS DENIED", headers: "x-access-api-key" });
  }
};

module.exports = middlewareHeaders;
