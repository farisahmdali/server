var express = require('express');
var router = express.Router();
var db = require('../config/connection')
var bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

router.post('/reg', async (req, res, next) => {
  console.log(req.body);
  let succes = false;
  let {
    email,
    password,
    name,
  } = req.body.reg;
  try{
  email = email.toLowerCase()
  password = await bcrypt.hash(password, 10)
  let user = await db.get().collection('users').findOne({ email })
  console.log(user);
  if (!user) {
    await db.get().collection('users').insert({ email, password, name }).then(res => {
      console.log(res);
      succes = true;
    })


  }
  }catch(err){
    console.log(err);
  }
  res.send(succes)
});

router.get('/signin', async (req, res) => {
  let {
    email,
    password
  } = req.query
  email = email?.toLowerCase()


  let pass = false;
  let user
  try {
    user = await db.get().collection('users').findOne({ email })
    console.log(user);
    if (user) {
      pass = await bcrypt.compare(password, user?.password);
    }
  } catch (err) {
    console.log(err);
  }
  console.log(pass);
  res.send({ pass, userDetails: { name: user?.name, email: user?.email } })

})

router.post('/msg', (req, res) => {
  console.log('hello');
  db.get().collection('msgs').updateOne({ _id: 'publicMsg' }, {
    $push: {
      msg: req.body.msg
    }
  })
})

router.get('/mssg', async (req, res) => {
  let message = await db.get().collection('msgs').findOne({ _id: 'publicMsg' })
  console.log(message);
  res.send(message);
})

router.post('/updateUser', async (req, res) => {
  let {
    email,
    _id,
    name,
    Admin
  } = req.body
  console.log(_id);
  try {
  email = email.toLowerCase()

    db.get().collection('users').updateOne({ _id: ObjectId(_id) }, {
      $set: {
        email: email,
        name: name,
        Admin
      }
    }).then((res) => {
      console.log(res);
    })
  } catch (err) {
    console.log(err);
  }

})

router.get('/data', async (req, res) => {
  try {

    let data = await db.get().collection('users').find({}).toArray();
    res.send(data)
   
  } catch (err) {
    console.log(err+'hello');
  }
})

router.get('/admin', async (req, res) => {
  let {
    email,
    password
  } = req.query
  let pass = false;
  console.log('hello');
  try {
  email = email.toLowerCase()

    let user = await db.get().collection('users').findOne({ Admin: true, email })
    console.log(user);
    if(user){
    pass = await bcrypt.compare(password, user.password);
    }
    if (pass === true) {
      let data = await db.get().collection('users').find({}).toArray();
      res.send(data)
    } else {
      res.send(true)
    }
  } catch (err) {
    console.log(err);
  }


})

router.post('/deleteUser', async (req, res) => {
  let { _id } = req.body

  try {
    await db.get().collection('users').deleteOne({ _id: ObjectId(_id), Admin: { $ne: 'true' } })
    let data = await db.get().collection('users').find({}).toArray();
    res.send(data)
  } catch (err) {
    console.log(err);
  }
})

module.exports = router;
