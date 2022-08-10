const bcrypt = require('bcrypt');
const saltRounds = 10;

const responseConstant = require("../constant/responseConstant");
const dbConnection = require("../config/database");
const response = require("../utility/common");

const adminLogin = (req, res, next) => {
    const reqBody = req.body;
    const password = reqBody.password;
    
    let sqlQuery = 'SELECT id, name, user_type AS userType, email, password, post_permission, created_at FROM users WHERE email=' + `'${reqBody.email}'` + "AND user_type= 1";
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

const userSignUP = async (req, res, next) => {
    const reqBody = req.body;
    const password = reqBody.password;
    let userObj = {
        name: reqBody.name,
        email: reqBody.email,
        password: password,
        user_type: 7
    }
    const hashPassword = await bcrypt.hash(password, saltRounds);
    userObj.password = hashPassword;

    let sqlQuery = 'SELECT * FROM users WHERE email=' + `'${reqBody.email}'`;
    dbConnection.query(sqlQuery, async (err, results) => {

        if(err) response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
        if( results.length > 0 ) {
            return response.responseHandler(res, false, responseConstant.USER_ALREADY_REGISTERED, "");        } 

        let insertQuery = "INSERT INTO users SET ?";
        dbConnection.query(insertQuery, userObj,(error, result) => {
            if(error) response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
            return response.responseHandler(res, true, responseConstant.USER_REGISTERED_SUCCESS, "");
        });
    });
}

const getAllUsers = async (req, res, next) => {
    let sqlQuery = 'SELECT id, name,user_type AS userType, email, post_permission, created_at FROM users WHERE user_type= 7';
    dbConnection.query(sqlQuery, async (err, results) => {
        if(err) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
        return response.responseHandler(res, true, responseConstant.USER_LIST, results);
    })
}

const userDetailById = (req, res, next) => {
    let sqlQuery = "SELECT id, name, user_type AS userType, email, post_permission, created_at FROM users WHERE id=" + req.params.id;
      
    dbConnection.query(sqlQuery, (err, result) => {
      if(err) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
      return response.responseHandler(res, true, responseConstant.USER_DETAIL, result);
    });
}

const updateUser = async (req, res, next) => {
    const reqBody = req.body;
    let sqlQuery = "SELECT id, user_type AS userType, email, post_permission, created_at FROM users WHERE id=" + reqBody.id;
      
    dbConnection.query(sqlQuery, async (err, result) => {
      if(err) response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");

      if( result.length < 1 ) {
        return response.responseHandler(res, false, responseConstant.USER_NOT_FOUND, "");
      }
      let sqlQuery = "SELECT email FROM users WHERE email=" + `'${reqBody.email}'`;
        dbConnection.query(sqlQuery, async (err, results) => {
            if(err) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
            
              let updateQuery = "UPDATE users SET email='"+reqBody.email+"', name='"+reqBody.name+"' WHERE id="+reqBody.id;
        
              dbConnection.query(updateQuery, (error, results) => {
                if(error) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
                return response.responseHandler(res, true, responseConstant.USER_UPDATED_SUCCESS, "");
              });
        })
      
    });
}

const deleteUserById = (req, res, next) => {
    let selectQuery = "SELECT id, user_type AS userType, email, created_at FROM users WHERE id=" + req.params.id;
    dbConnection.query(selectQuery, async (err, result) => {
        if(err) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
  
        if( result.length < 1 ) {
          return response.responseHandler(res, false, responseConstant.USER_NOT_FOUND, "");
        }

        let sqlQuery = "DELETE FROM users WHERE id="+req.params.id+"";
        dbConnection.query(sqlQuery, (err, results) => {
        if(err) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
            return response.responseHandler(res, true, responseConstant.USER_DELETED_SUCCESS, "");
        });
    })
}

const updateUserPermission = (req, res, next) => {
    const reqBody = req.body; //"read, update, delete"
    let sqlQuery = "SELECT id, user_type AS userType, post_permission AS permission FROM users WHERE id=" + req.params.id;
      
    dbConnection.query(sqlQuery, async (err, result) => {
      if(err) response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");

      if( result.length < 1 ) {
        return response.responseHandler(res, false, responseConstant.USER_NOT_FOUND, "");
      }
      let updateQuery = "UPDATE users SET post_permission='"+reqBody.userPermission.toLowerCase()+"' WHERE id="+req.params.id;
      dbConnection.query(updateQuery, (error, results) => {
        if(error) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
        dbConnection.query(sqlQuery, async (err, data) => {
            if(err) response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
            return response.responseHandler(res, true, responseConstant.UPDATE_USER_PERMISSION, data);
        })
      });
    })
}

module.exports = {
    adminLogin,
    userSignUP,
    getAllUsers,
    userDetailById,
    updateUser,
    deleteUserById,
    updateUserPermission
}
