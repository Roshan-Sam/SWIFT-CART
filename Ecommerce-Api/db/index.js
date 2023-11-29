import mongoose from "mongoose";

mongoose.connect('mongodb://127.0.0.1:27017/ecomDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('DB CONNECTED ..!')
}).catch(e => console.log(e.message))

export default mongoose