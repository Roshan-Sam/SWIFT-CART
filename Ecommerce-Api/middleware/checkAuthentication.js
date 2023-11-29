import jwt from 'jsonwebtoken'

const checkAuthentication = role => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization
            if (!token) {
                return res.status(401).json({ error: 'no access token' })
            }
            const decodedToken = jwt.verify(token.split(' ')[1], process.env.JWT_API_KEY);
            if (decodedToken.role != role) {
                return res.status(401).json({ error: "access denied" })
            }
            next()
            console.log(token)
            console.log('middleware worked');
        } catch (e) {
            console.log(e)
            return res.status(401).json({ error: 'invalid token' })
        }
    }
}

export default checkAuthentication

