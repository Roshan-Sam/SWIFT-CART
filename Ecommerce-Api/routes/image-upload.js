import express from 'express'
import multer from 'multer';

const router = express.Router();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({ storage: storage })

router.post('/upload', upload.single('image'), (req, res) => {
    res.json({ imageURL: `http://localhost:8000/uploads/${req.file.filename}` })
    console.log(req.file)
})

export default router;