require('../db')
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Blog = mongoose.model('Blog');
var Comment = mongoose.model('Comment');
var crypto = require('crypto');

/* GET home page. */
router.get('/', function(req, res) {
	res.locals.username = req.session.name ;
	res.locals.authenticated = req.session.logined;
	Blog.find(function(err, blogs, count){
		res.render('index', {
			title: 'Blog',
			blogs: blogs
		});
	});
});

router.get('/reg', function(req, res){
	if (req.session.logined){
		res.redirect('/');
		return
	}
	res.render('reg', {
		title: 'Register', });
});

router.get('/remove/:id', function(req, res){
	Blog.remove({_id: req.params.id}, function(err){
		if (err){
			console.log('fail to remove article');
			return res.redirect('/')
		}
		console.log('Article deleted')
			res.redirect('/');
	});
});


router.post('/apis/login', function(req, res){
	var name = req.body.name
	var password = req.body.password
	var password_re = req.body['password-repeat'];
	if (password_re != password){
		req.flash('error', '兩次密碼不同!')
		return res.redirect('/reg');
	}
	var md5 = crypto.createHash('md5')
	var password = md5.update(req.body.password).digest('hex');
	var newUser = new User({
		Username 	: req.body.name,
		password 	: password,
		CreateDate	: Date.now()
	});
	User.findOne({'Username': name }, function(err, user){
		if (user){
			req.flash('error', '用戶已存在!');
			return res.redirect('/reg');
		}
	newUser.save(function(err){
		if (err){
			console.log('Fail to save to DB');
			return;
		};
		console.log('Save to DB');
		req.session.name = req.body.name;
		req.session.password = req.body.password;
		req.session.logined = true;
		res.redirect('/');
		});
	});
});

router.get('/login', function(req, res){
	if (req.session.logined){
		res.redirect('/');
		return;
	}
	res.render('login',{
		title: 'Login',
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
})

router.post('/login',function(req, res){
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');

	User.findOne({'Username': req.body.name}, function(err, user){
		if (!user){
			req.flash('error','用戶不存在');
			return res.redirect('/login');
		}
		if (user.password != password){
			req.flash('error', '密碼錯誤!');
			return res.redirect('/login');
		}
		// req.session.user= user;
		req.session.name = req.body.name;
		req.session.password = req.body.password;
		req.session.logined = true;
		req.flash('success', '登錄成功!');
		res.redirect('/')
	});
});

router.get('/add_article', function(req, res){
	if ((!req.session.name) || (!req.session.logined)){
		res.redirect('/');
			return
	}
	res.locals.username = req.session.name;
	res.locals.authenticated = req.session.logined;
	res.render('add_article');
})

router.post('/add', function(req, res){
	if (!req.session.name){
		res.redirect('/');
		return;
	}
	new Blog({
		Username: 	req.session.name,
		Article : 	req.body.Content,
		Createdate: Date.now()
	}).save(function(err){
		if (err){
			console.log('Fail to save to DB.');
			return;
		}
		console.log('Save to DB');
	});
	res.redirect('/');
});

router.get('/logout', function(req, res){
	req.session.logined = false;
	res.redirect('/');
	res.end();
});

router.get('/userlist', function(req, res){
	res.render('userlist');
});

router.get('/userlists' ,function(req,res){
	User.find(function(err, users, count){
		res.json(users)
	});
});

router.get('/delete/:id', function(req, res){
	User.remove({_id: req.params.id}, function(err){
		if (err){
			console.log('fail to remove user');
			return res.redirect('/userlist')
		}
		console.log('user deleted')
			res.redirect('/userlist');
	});
});
router.get('/edit')

module.exports = router;
