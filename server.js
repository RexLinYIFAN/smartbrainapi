const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const bcrypt=require('bcrypt-nodejs');
const cors = require('cors');
const pg = require('knex');
const Clarifai = require('clarifai');

app.use(bodyParser.json())
app.use(cors())

const appC = new Clarifai.App({
 apiKey: 'e5e349b9530244b682e4827ba7bd312d'
});
const postgres=pg({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'love3773',
    database : 'postgres'
  }
});
app.post('/imageurl',(req,res)=>{
	appC.models.predict(
      Clarifai.FACE_DETECT_MODEL, 
      req.body.input)
	.then(data=>res.json(data))
})

app.get('/',(req,res)=>{
	res.send(database.users);
})
app.post('/signin',(req,res)=>{
	const {email,password}=req.body
	postgres.select('*').from('login').where('email','=',email)
	.then(user=>{
		var isValid=bcrypt.compareSync(password, user[0].hash)
		if(isValid){
		 	return postgres.select('*').from('users')
		 		   .where('email','=',email)
		 		   .then(user=>res.json(user[0]))
		 		   .catch(err=>res.status(400).json(err))
		}
		else{res.status(400).res.json("Error login")}
	})
	.catch(err=>res.status(400).json("err"))
})
app.post('/signup',(req,res)=>{
	const {email,password}=req.body;
	const hash=bcrypt.hashSync(password)
	
	postgres.transaction(trx=>{
		trx.insert({
			email:email,
			hash:hash
		})
		.into('login')
		.returning('email')
		.then(loginMail=>{
			return trx('users')
					.returning('*')
					.insert({
						email:loginMail[0],
						joined:new Date()
					})
					.then(user=>res.json(user[0]))
		})
		.then(trx.commit)
    	.catch(trx=>{
    		console.log(trx)
    		trx.rollback
    	});
	})

})
app.get('/profile/:id',(req,res)=>{
	const {id} =  req.params;
	postgres.select('*').from('users').where({
		id:id
	})
	.then(data=>{
		console.log(data)
		if(data.length>0){res.json(data[0])}
		else{res.status(400).json("Not found")}
	})

})
app.put('/image',(req,res)=>{
	const {id} =  req.body;
	postgres('users')
	.where('id', '=',id)
	.increment('entries',1)
	.returning('entries')
	.then(count=>{
		console.log(count[0])
		res.json(count[0])
	})
	.catch(err=>{
		res.status(400).json(err)
	})

})

app.listen(process.env.PORT || 3000,()=>{console.log("server is running")})