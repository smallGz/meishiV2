const Router = require('koa-router');
const {UserModel,UserProfileModel,cookbookModel,CategoryModel} = require('../../models');
const md5 = require('md5');
const Token = require('../../utils/token.js');
const upload = require('../../utils/upload.js');

const router = new Router();


/**
    method : post
    url : /api/user/register
    用户注册提交
*/
router.post('/register',async (ctx) =>{
    let body = ctx.request.body;
    let username = body.username || '';
    let password = body.password || '';
    let repassword = body.repassword || '';

	//验证
    if(username.trim() === '' || password.trim() === ''){
       return ctx.body = {
            code : 1,
            message : '用户名或密码不能为空'
        }
    }
    if(password !== repassword){
       return ctx.body = {
            code : 2,
            message : '两次输入的密码不一致'
        }
    }

    //查询数据库，是否存在该用户
    let registerUser = await UserModel.findOne({
        where : {
            username
        }
    });
    if(registerUser){
       return ctx.body = {
            code : 3,
            message : '该用户名已经存在'
        }
    };
    registerUser = UserModel.build({
        username,
        password:md5(password),
        //一旦注册，该ip永远不会改变
        createdIpAt:ctx.ip,
        //每次登录都会更新
        updatedIpAt:ctx.ip,
        createdAt:new Date(),
        updatedAt:new Date()

    });
    await registerUser.save();
    ctx.body = {
        code : 0,
        user : {
        	username:registerUser.get('username')
        },
        message : '注册成功'
    }

    

});

/**
    method : post
    url : /api/user/login
    用户登录提交
*/

router.post('/login',async (ctx) =>{
    let body = ctx.request.body;
    let username = body.username || '';
    let password = body.password || '';
    let rememberPass = body.rememberPass;

    //验证
    if(username.trim() === '' || password.trim() === ''){
       return ctx.body = {
            code : 1,
            message : '用户名或密码不能为空'
        }
    };

    //查询数据库 是否存在该用户
    let loginUser = await UserModel.findOne({
        where : {
            username
        }
    });
    let loginId = loginUser.get('id');
    if(!loginUser || md5(password) !== loginUser.get('password')){
        console.log('用户不存在');
        return ctx.body = {
            code : 2,
            message : '用户名不存在或密码错误'
        }
    };

    //该用户存在，验证是否被禁用
    if(loginUser.get('disabled')){
        return ctx.body = {
            code : 3,
            message : '该用户名已被禁用'
        }
    };

   let token = Token.generateToken(loginId); 
   ctx.body = {
        code : 0,
        message : '登录成功',
        token          
    }
});

/*
    logout
*/

router.post('/logout',async (ctx) =>{
    ctx.state = null;
    ctx.body = {
        code : 0,
        message : 'ok'
    }
})







module.exports = router;