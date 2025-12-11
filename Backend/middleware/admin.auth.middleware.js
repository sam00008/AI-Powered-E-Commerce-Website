import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
    const token = req.cookies.adminToken;  // FIXED ✔️

    if (!token) {
        return res.status(401).json({
            status: 401,
            message: "Admin not authenticated",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({
                status: 403,
                message: "Access denied",
            });
        }

        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            status: 401,
            message: "Invalid or expired admin token",
        });
    }
};
