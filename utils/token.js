const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

let Token = {
	generateToken(data){
	    let created = Math.floor(Date.now() / 1000);
	    let cert = fs.readFileSync(path.join(__dirname, '../config/pri.pem'));//私钥
	    let token = jwt.sign({
	        data,
	        exp: created + 3600 * 24 * 30
	    }, cert, {algorithm: 'RS256'});
	    return token;
	},
	verifyToken(token){
	    let cert = fs.readFileSync(path.join(__dirname, '../config/pub.pem')),res = {};//公钥

	    try{
	        let result = jwt.verify(token, cert, {algorithms: ['RS256']}) || {};
	        // console.log(result);
	        let {exp = 0} = result,current = Math.floor(Date.now()/1000);
	        if(current <= exp){
	            res = result.data || {};
	        }
	    }catch(e){
	    
	    }
	    return res;
	    
	}

}

module.exports = Token;


