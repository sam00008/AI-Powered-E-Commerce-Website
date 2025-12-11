 const verifyAdmin = (req, res, next) => {
  const adminToken = req.cookies?.adminToken;

  if (!adminToken) {
    return res.status(401).json({ message: "Admin not authenticated" });
  }

  if (adminToken !== process.env.ADMIN_TOKEN_SECRET) {
    return res.status(401).json({ message: "Invalid admin token" });
  }

  next();
};
export { verifyAdmin} ;