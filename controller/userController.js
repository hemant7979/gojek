const bcrypt = require('bcrypt');
const saltRounds = 10;
const responseConstant = require("../constant/responseConstant.js");
const dbConnection = require("../config/database");
const response = require("../utility/common");

const userLogin = (req, res, next) => {
   
    const reqBody = req.body;
    const password = reqBody.password;
    
    let sqlQuery = 'SELECT id, name, user_type AS userType, email, password, post_permission, created_at FROM users WHERE email=' + `'${reqBody.email}'`;
    dbConnection.query(sqlQuery, async (err, results) => {
        if(err) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
        if( results.length < 1 ) {
            return response.responseHandler(res, false, responseConstant.USER_NOT_FOUND, "");
        } 

        const match = await bcrypt.compare(password, results[0].password);
        if(!match) {
            return response.responseHandler(res, false, responseConstant.INVALID_CREDENTIAL, "");
        }
        response.responseHandler(res, true, responseConstant.LOGIN_SUCCESS, results[0]);
        
    });
}

const userDetailById = (req, res, next) => {
    let sqlQuery = "SELECT id, user_type AS userType, email, created_at FROM users WHERE id=" + req.params.id;
      
    dbConnection.query(sqlQuery, (err, result) => {
      if(err) response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
      return response.responseHandler(res, true, responseConstant.USER_DETAIL, result);
    });
}

const updateUser = async (req, res, next) => {
    const reqBody = req.body;
    let sqlQuery = "SELECT id, user_type AS userType, email, created_at FROM users WHERE id=" + req.params.id;
      
    dbConnection.query(sqlQuery, async (err, result) => {
      if(err) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");

      if( result.length < 1 ) {
        return response.responseHandler(res, false, responseConstant.USER_NOT_FOUND, "");
      }

      const hashPassword = await bcrypt.hash(reqBody.password, saltRounds);
      let updateQuery = "UPDATE users SET password='"+hashPassword+"' WHERE id="+req.params.id;
  
      dbConnection.query(updateQuery, (error, results) => {
        if(error) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
        return response.responseHandler(res, true, responseConstant.USER_UPDATED_SUCCESS, "");
      });
      
    });
}

const deleteById = (req, res, next) => {
    let selectQuery = "SELECT id, user_type AS userType, email, created_at FROM users WHERE id=" + req.params.id;
    dbConnection.query(selectQuery, async (err, result) => {
        if(err) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
  
        if( result.length < 1 ) {
          return response.responseHandler(res, false, responseConstant.USER_NOT_FOUND, "");
        }
        let sqlPostQuery = "DELETE FROM posts WHERE user_id="+req.params.id+"";
        dbConnection.query(sqlPostQuery, (err, data) => {
            if(err) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
            let sqlQuery = "DELETE FROM users WHERE id="+req.params.id+"";
            dbConnection.query(sqlQuery, (err, results) => {
            if(err) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
                return response.responseHandler(res, true, responseConstant.USER_DELETED_SUCCESS, "");
            });
        });
    });
}

module.exports = {
    userLogin,
    userDetailById,
    updateUser,
    deleteById
}