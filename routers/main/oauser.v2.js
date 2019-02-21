const Router = require('koa-router');
const {UserModel,UserProfileModel,cookbookModel} = require('../../models');
const md5 = require('md5');
const Token = require('../../utils/token.js');
const upload = require('../../utils/upload.js');

const router = new Router();

router.get('/info',async (ctx)=>{

	const {uid} = ctx.state;
	// console.log(uid);
	let user = await UserModel.findOne({
		where:{
			id : uid
		}
	});
	let userInfo = {
		id:user.get('id'),
		username:user.get('username'),
		avatar : user.get('avatar')
	}
	ctx.body = {
		code : 0,
		userInfo
	}
});

/*
    用户头像上传
*/
router.post('/avatar',upload.single('avatar'),async (ctx) =>{
    // if(ctx.session.id){
    //     //avatar存储的是上传成功后的信息
    	const {uid} = ctx.state;
        let avatar = ctx.req.file;
        let avatarUrl = avatar.filename;

        let user = await UserModel.findById(uid);
        user.set('avatar',avatarUrl);
        await user.save();

        ctx.body = {
        	code : 0,
        	avatarUrl
        }
})

/*
    获取个人信息
*/
router.get('/getUserInfo',async (ctx) =>{
    let {uid} = ctx.state;

    let user = await UserProfileModel.findOne({
    	where:{
    		userId : uid
    	}
    });

    ctx.body = {
    	code : 0,
    	user
    }
});

/*
	修改个人信息
*/
router.post('/editUserInfo',async (ctx)=>{
	let {uid} = ctx.state;
	let body = ctx.request.body;
	let nickname =  body.nickname;
	let mobile =  body.mobile;
	let email =  body.email;
	let realname =  body.realname;
	let gender =  body.gender;

	let user = await UserProfileModel.findOne({
    	where:{
    		userId : uid
    	}
    });

	let usernickname =  user.get('nickname');
	let usermobile =  user.get('mobile');
	let useremail =  user.get('email');
	let userrealname =  user.get('realname');
	let usergender =  user.get('gender');

	/*
		更新数据库
	*/
	if(nickname && nickname !== usernickname) user.set('nickname',nickname);
	if(mobile && mobile !== usermobile) user.set('mobile',mobile);
	if(email && email !== useremail) user.set('email',email);
	if(realname && realname !== userrealname) user.set('realname',realname);

	await user.save();

	ctx.body = {
		code : 0,
		user
	}
})

/*
    cookbook图片上传
*/
router.post('/cover',upload.single('cover'),async (ctx) =>{
    // if(ctx.session.id){
    //     //avatar存储的是上传成功后的信息
        let cover = ctx.req.file;
        let coverUrl = cover.filename;

        // let user = await UserModel.findById(uid);
        // user.set('avatar',avatarUrl);
        // await user.save();

        ctx.body = {
        	code : 0,
        	coverUrl
        }
});

/*
	发布新菜谱
*/
router.post('/publish',async (ctx)=>{
	let {uid} = ctx.state;
	let body = ctx.request.body;
	let name = body.name || '';
    let categoryId =  body.categoryId || 0;
    let covers = body.covers || [];
    let description = body.description || '';
    let craft = body.craft || '';
    let level = body.level || '';
    let taste = body.taste || '';
    let needTime = body.needTime || '';
    let cookers = body.cookers || [];
    let ingredients = body.ingredients || {m:[],s:[]};
    let steps= body.steps || [];
    let tips = body.tips || '';

    if(name == ''){
            return ctx.body = {
                code : 1,
                message : '菜谱名称不能为空'
            }
        };

    let cookbook = cookbookModel.build({
        name,
        userId: uid,
        categoryId,
        covers:JSON.stringify(covers),
        description,
        craft,
        level,
        taste,
        needTime,
        cookers:JSON.stringify(cookers),
        ingredients:JSON.stringify(ingredients),
        steps:JSON.stringify(steps),
        tips,
        createdAt:new Date(),
        updatedAt:new Date()
    });

    await cookbook.save();

    ctx.body = {
        code : 0,
        data : cookbook
    }
})




module.exports = router;