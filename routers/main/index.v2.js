const Router = require('koa-router');
const {CategoryModel,cookbookModel,UserModel,CommentModel,UserProfileModel} = require('../../models');
const Tree = require('../../libs/Tree');

const router = new Router();

/*
    method:get
    api : /
    备注：提取分类
*/
router.get('/category',async (ctx) =>{
    let categories =  await CategoryModel.findAll();
    

    //提取分类
    let data = categories.map(category =>{
        return {
            id:category.get('id'),
            name:category.get('name'),
            pid:category.get('pid')
        }
    });

    // data = (new Tree(data)).getTree(0);

    //关联数据表
    cookbookModel.belongsTo(UserModel,{
        //关联字段(外键)
        foreignKey : 'userId'
    });
    //提取菜谱
    let coobooks = await cookbookModel.findAll({
        include:[UserModel]
    });

    let cookbookData = coobooks.map((cookbook)=>{
        return {
            id: cookbook.get('id'),
            name : cookbook.get('name'),
            userId : cookbook.get('userId'),
            cover : cookbook.get('covers') == '' ? '' : JSON.parse(cookbook.get('covers'))[0],
            username : cookbook.get('UserModel').get('username')

        }
    });
    ctx.body =  {
        user : ctx.state.user,
        categories : data,
        cookbookData
        
    };
});

// router.get('/cookbookindex',async ctx=>{
//     //关联数据表
//     cookbookModel.belongsTo(UserModel,{
//         //关联字段(外键)
//         foreignKey : 'userId'
//     });
//     //提取菜谱
//     let coobooks = await cookbookModel.findAll({
//         include:[UserModel]
//     });

//     let cookbookData = coobooks.map((cookbook)=>{
//         return {
//             id: cookbook.get('id'),
//             name : cookbook.get('name'),
//             userId : cookbook.get('userId'),
//             cover : cookbook.get('covers') == '' ? '' : JSON.parse(cookbook.get('covers'))[0],
//             username : cookbook.get('UserModel').get('username')

//         }
//     });

//     ctx.body =  {
//         code:0,
//         cookbook:cookbookData
        
//     };

// })

router.get('/cookbookindex',async ctx=>{
    //关联数据表
    cookbookModel.belongsTo(UserModel,{
        //关联字段(外键)
        foreignKey : 'userId'
    });
    //提取菜谱
    let coobooks = await cookbookModel.findAll({
        include:[UserModel]
    });

    let cookbookData = coobooks.map((cookbook)=>{
        return {
            id: cookbook.get('id'),
            name : cookbook.get('name'),
            userId : cookbook.get('userId'),
            cover : cookbook.get('covers') == '' ? '' : JSON.parse(cookbook.get('covers'))[0],
            username : cookbook.get('UserModel').get('username')

        }
    });

    ctx.body =  {
        code:0,
        cookbook:cookbookData
        
    };

})

/*
    method:get
    api : /list:categoryId
    备注：美食详情

    ctx.params.id 拿到该值
*/

router.get('/list',async (ctx )=>{

    let page = Number(ctx.request.query.page) || 1;
    let limit = 2;
    let offset = (page - 1) * limit ; 
    let cookbooks;

    let queryCategoryId = ctx.request.query.categoryId;

    let categories =  await CategoryModel.findAll();

    let categoryCurrent = categories.filter(category => {
        return category.get('id') == queryCategoryId
    });

    //关联数据表
    cookbookModel.belongsTo(UserModel,{
        //关联字段(外键)
        foreignKey : 'userId'
    });
    
    if(queryCategoryId){
        cookbooks = await cookbookModel.findAll({
            include:[UserModel],
            limit,
            offset,
            where:{
                categoryId : queryCategoryId
            }
        });
    }else{
        cookbooks = await cookbookModel.findAll({
            include:[UserModel],
            limit,
            offset
        });
    }
    

    let cookbooksData = cookbooks.map(cookbook=>{
        return {
            id:cookbook.get('id'),
            name : cookbook.get('name'),
            description : cookbook.get('description'),
            favoriteCount : cookbook.get('favoriteCount'),
            commentCount : cookbook.get('commentCount'),
            cover : cookbook.get('covers') == '' ? '' : JSON.parse(cookbook.get('covers'))[0],
            username : cookbook.get('UserModel').get('username'),
            userId : cookbook.get('userId'),
            ingredients : cookbook.get('ingredients') ? JSON.parse(cookbook.get('ingredients')) : {m:[],s:[]}

        }
    })


    ctx.body = {
        code : 0,
        cookbooks : cookbooksData,
        currentCategory : categoryCurrent[0]
    }
})


/*
    method:get
    api : /view/:id
    备注：美食详情

    ctx.params.id 拿到该值
*/
router.get('/view',async (ctx)=>{

    let queryCookbookId = ctx.request.query.cookbookId;

    // let categories =  await CategoryModel.findAll();
    //关联数据表
    cookbookModel.belongsTo(UserModel,{
        //关联字段(外键)
        foreignKey : 'userId'
    }); 
    cookbookModel.belongsTo(CategoryModel,{
        //关联字段(外键)
        foreignKey : 'categoryId'
    });  

    let cookbookData = await cookbookModel.findById(queryCookbookId,{
         include:[UserModel,CategoryModel]
    });

    // console.log(cookbooksBase);
    //判断是非数字
    if(isNaN(queryCookbookId)){
        return ctx.body = '错误页面'
    }

    // //转成对象形式
    cookbookData = Object.assign(cookbookData,{
        covers : cookbookData.get('covers') ? JSON.parse(cookbookData.get('covers')) : [],
        ingredients : cookbookData.get('ingredients') ? JSON.parse(cookbookData.get('ingredients')) : {m:[],s:[]},
        steps : cookbookData.get('steps') ? JSON.parse(cookbookData.get('steps')) : [],
        cookers : cookbookData.get('cookers') ? JSON.parse(cookbookData.get('cookers')) : [],
        username : cookbookData.get('UserModel').username,
        avatar : cookbookData.get('UserModel').avatar ? cookbookData.get('UserModel').avatar : 'avatar.jpg',
        categoryname : cookbookData.get('CategoryModel').name

    });

    let filtercookbook = {
        id : cookbookData.get('id'),
        name : cookbookData.get('name'),
        userId : cookbookData.get('userId'),
        categoryId : cookbookData.get('categoryId'),
        covers : cookbookData.get('covers'),
        description : cookbookData.get('description'),
        craft : cookbookData.get('craft'),
        level : cookbookData.get('level'),
        taste : cookbookData.get('taste'),
        needTime : cookbookData.get('needTime'),
        cookers : cookbookData.get('cookers'),
        ingredients : cookbookData.get('ingredients'),
        steps : cookbookData.get('steps'),
        tips : cookbookData.get('tips'),
        favoriteCount : cookbookData.get('favoriteCount'),
        commentCount : cookbookData.get('commentCount'),
        createdAt : cookbookData.get('createdAt'),
        updatedAt : cookbookData.get('updatedAt')

    };
    let filteruser = {
        id : cookbookData.get('UserModel').get('id'),
        username:cookbookData.get('UserModel').get('username'),
        avatar:cookbookData.get('UserModel').get('avatar')
    };
    let currentcategory = {
        id:cookbookData.get('CategoryModel').get('id'),
        name:cookbookData.get('CategoryModel').get('name')
    }

    
     ctx.body = {
        code:0,
        cookbook : filtercookbook,
        user : filteruser,
        currentcategory
     };
})

/*
    method:get
    api : /comment
    评论

*/
router.get('/comment',async (ctx) =>{
    let queryCookbookId = ctx.request.query.cookbookId;

    let page = Number(ctx.request.query.page) || 1;
    let limit = 2;
    let offset = (page - 1) * limit ;

    if (!queryCookbookId){
        return ctx.body = {
            code : 1,
            message:'请求失败'
        }
    };
    //关联数据表
    CommentModel.belongsTo(UserModel,{
        //关联字段(外键)
        foreignKey : 'userId'
    });
    let comments = await CommentModel.findAll({
        where:{
            cookbookId : queryCookbookId
        },
        include:[UserModel],
        limit,
        offset
    });

    // console.log(comments);
    let commentsData = comments.map((comment) => {

        return {
            id : comment.get('id'),
            userId :comment.get('userId'),
            cookbookId :comment.get('cookbookId'),
            title:comment.get('title'),
            content :comment.get('content'),
            createdIpAt :comment.get('createdIpAt'),
            createdAt : comment.get('createdAt'),
            updatedAt :comment.get('updatedAt'),
            username : comment.get('UserModel').get('username'),
            avatar : comment.get('UserModel').get('avatar')
        }
    })

   
    ctx.body = {
        code:0,
        cookbookId:queryCookbookId,
        message:'请求成功',
        comments:commentsData
    }
})

/*
    method:post
    api : /comment/add
    评论

*/
router.post('/comment/add',async (ctx)=>{
    let body = ctx.request.body;
    let data = {
        userId : body.userId,
        cookbookId : body.cookbookId,
        content : body.content,
        //一旦注册，该ip永远不会改变
        createdIpAt:ctx.ip,
        createdAt:new Date(),
        updatedAt:new Date()
    }

    let newComment = CommentModel.build({
        userId : data.userId,
        cookbookId : data.cookbookId,
        content : data.content,
        //一旦注册，该ip永远不会改变
        createdIpAt:ctx.ip,
        createdAt:new Date(),
        updatedAt:new Date()

    });
    await newComment.save();

    ctx.body = {
        code : 0,
        comment:newComment,
        message:'成功'
    }
})

/*
    method:get
    api : /spaceuser
    获取某个用户信息

*/
router.get('/spaceuser',async (ctx) =>{
    let queryUserId = ctx.request.query.userId;

    let userInfo = await UserProfileModel.findOne({
        where:{
            userId : queryUserId
        }
    });

    // console.log(userInfo);
    ctx.body = {
        code : 0,
        data : userInfo
    }
    
})

/*
    method:get
    api : /spaceuser
    获取某个用户下所有菜谱

*/
router.get('/spacecookbook',async (ctx) =>{
    let queryUserId = ctx.request.query.userId;
    // console.log(queryUserId);
    let cookbooks = await cookbookModel.findAll({
        where:{
            userId : queryUserId
        }
    });

    let cookbooksData = cookbooks.map(cookbook=>{
        return{
            id : cookbook.get('id'),
            name : cookbook.get('name')
        }
    });

    ctx.body = {
        code : 0,
        cookbooks : cookbooksData
    }
})

module.exports = router;