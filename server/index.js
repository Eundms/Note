//backend 시작점
const express = require('express')
const app = express()
const path = require('path');
const cors = require('cors')

const bodyParser = require('body-Parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true })); //express [stackoverflow-25471856]
app.use(bodyParser.json()); //express
app.use(cookieParser());

app.get('/', (req, res) => res.send('Hello World!'))

app.use('/api/memos', require('./routes/memos'));

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`port ${port}에서 작동중`))
module.exports =app;