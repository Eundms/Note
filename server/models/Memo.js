const mongoose = require('mongoose')
/*
    Memo
 */
const memoSchema = mongoose.Schema({
    id: {/* _id 자동으로 만들어져서*/
        type: Number,
        unique: true,
    },
    title: {/* 제목 */
        type: String,
        required: true,
        trim: true /*공백제거*/
    },
    text: {/* 내용 */
        type: String,
        default: ""
    }
}, { timestamps: true })
memoSchema.pre('save', function (next) {
    console.log('pre!', this)
    next()
})
const Memo = mongoose.model('Memo', memoSchema)

module.exports = { Memo }