const Koa = require('koa');
const Router = require('koa-router');
const KoaStaticCache = require('koa-static-cache');
const KoaSwig = require('koa-swig');
const Co = require('co');
const KoaBodyParser = require('koa-bodyparser');
const KoaSession = require('koa-session');
// const multer = require('koa-multer');
const {UserModel} = require('./models');
const Token = require('./utils/token.js');
const configs = require('./config/config.json');


//v2
const userv2router = require('./routers/main/user.v2.js');
const indexv2router = require('./routers/main/index.v2.js');
const oav2router = require('./routers/main/oauser.v2.js');

const app = new Koa();


//静态文件处理
app.use(KoaStaticCache(__dirname + '/static',{
    root:__dirname + '/static',//与上面的第一个参数效果一致
    dynamic: true,
    prefix:'/public',//如果当前请求的url是以 /public 开始 则作为静态资源请求
    // maxAge: 24 * 60 * 60
}));




//模板引擎
const render = KoaSwig({
    root:__dirname + '/views',
    autoescape:true,
    cache:false,
    ext:'html'
});

app.context.render = Co.wrap(render);
//body解析
app.use(KoaBodyParser());


app.use(async(ctx, next) => {
    let {url = ''} = ctx;
    if(url.indexOf('/api/oa/user') > -1){

        let header = ctx.request.header;
        let {xtoken} = header;

        if(xtoken){
            let uid = Token.verifyToken(xtoken);
            if(uid){
                ctx.state = {uid};
                await next();
            }else{
                return ctx.body = {
                    code : 1005,
                    message : '请先登录'
                };
            }
        }else{
            return ctx.body = {
                    code : 1005,
                    message : '请先登录'
                };
        }
    }else{
        await next();
    }

});

//路由配置
const router = new Router();
router.use('/api/user',userv2router.routes());
router.use('/api/index',indexv2router.routes());
router.use('/api/oa/user',oav2router.routes());
router.get('/',async (ctx) =>{
    ctx.body =  await ctx.render('./index.html');
})

app.use(router.routes());

const env = process.env.NODE_ENV || 'development'
const config = configs[env];
app.listen(config.web.port);