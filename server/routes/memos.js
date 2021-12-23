/* base URL
  : /api/notes
*/
const express = require('express');
const { Memo } = require('../models/Memo');
const router = express.Router();
const moment = require('moment');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
/*
  메모 저장
  Response : 정상적으로 저장된 메모 정보
*/
router.post('/', (req, res) => {
  const memo = new Memo(req.body)
  memo.save((err, doc) => {
    if (err) return res.status(400).json({ error: err })//Client오류
    res.status(201).json({memo: memo })//201: Created 요청 성공&동시에 새로운 리소스 생성
  })
})
/*
  메모 수정
  수정하고 결과를 리턴한다.
  memoId : Memo._id
*/
router.put('/:memoId', (req, res) => {
  const memoId = req.params.memoId
  Memo.findOneAndUpdate({ _id: memoId }, { $set: req.body }, { new: true }, (err, doc) => {
    if (err) return res.status(404).json({ error: err });
    return res.status(201).json({//201: Created 요청 성공&동시에 새로운 리소스 생성
      memo: doc
    })
  })
})
/*
  메모 삭제
  기존에 있던 메모를 삭제한다.
  memoId : Memo._id
*/
router.delete('/:memoId', (req, res) => {
  const memoId = req.params.memoId
  //memoId가 undefined라면? => 400 에러 발생

  //not found(404)
  Memo.deleteOne({ _id: memoId }, (err, doc) => {
    if (err) return res.status(404).json({error: err });
    return res.status(200).json({
      success: true
    })
  })
})
/*
  날짜별 간단 메모정보 검색
  : /memos?date={date} &page={page}
 */
router.get('/', async (req, res) => {
  const date = req.query.date
  const page = req.query.page === undefined ? 1 : req.query.page
  //date, page가 이상하다면, 400 Error
  try {
    const start = moment(new Date(date)).startOf('day')//시작
    const end = moment(new Date(date)).endOf('day')//끝

    const memos = await Memo.aggregate([
      {
        $match: {
          "createdAt": { $gte: new Date(start), $lte: new Date(end) }
        }
      },

      {
        $sort: {
          'createdAt': -1
        }
      },
      {
        $addFields: {
          createdAt: {
            $dateToString: {
              date: '$createdAt',
              format: '%Y-%m-%d %H:%M:%S',
              timezone: 'Asia/Seoul'
            }
          },
          updatedAt: {
            $dateToString: {
              date: '$updatedAt',
              format: '%Y-%m-%d %H:%M:%S',
              timezone: 'Asia/Seoul'
            }
          }
        }
      },
      {
        $skip: (page - 1) * 5
      },
      {
        $limit: 5
      }
    ])

    const result = { memos: memos }
    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ error: err });
  }


})
/*
  메모 상세정보 검색 API
  memoId : Memo._id
 */
router.get('/:memoId', async (req, res) => {
  const memoId = req.params.memoId
  //memoId가 이상하다면, 400Error
  try {
    const memo = await Memo.aggregate([
      {
        $match: {
          "_id": ObjectId(memoId)
        }
      },
      {
        $addFields: {
          createdAt: {
            $dateToString: {
              date: '$createdAt',
              format: '%Y-%m-%d %H:%M:%S',
              timezone: 'Asia/Seoul'
            }
          },
          updatedAt: {
            $dateToString: {
              date: '$updatedAt',
              format: '%Y-%m-%d %H:%M:%S',
              timezone: 'Asia/Seoul'
            }
          }
        }
      }
    ])
    if (memo.length === 0) {
      throw "해당하는 메모가 없습니다"
    }
    const result = { memo: memo[0] }
    res.status(200).json(result)
  } catch (err) {
    res.status(404).json({ error: err });
  }

})

module.exports = router;
