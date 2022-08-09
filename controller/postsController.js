const responseConstant = require("../constant/responseConstant.js");
const dbConnection = require("../config/database");
const response = require("../utility/common");

const addPost = (req, res) => {
    const reqBody = req.body;
    const postObj = {
        "created_by_user": reqBody.user_id,
        "post": reqBody.post
    }

    let sqlQuery = 'SELECT * FROM users WHERE id=' + `'${reqBody.user_id}'`;
    dbConnection.query(sqlQuery, async (err, results) => {
        if(err) return res.json({code: 500, message: responseConstant.SOMETHING_WENT_WRONG});;

        if( results.length < 1 ) {
            return res.json({code: 404, message: responseConstant.USER_NOT_FOUND});
        } 

        let insertQuery = "INSERT INTO posts SET ?";
        dbConnection.query(insertQuery, postObj,(error, result) => {
            if(error) return res.json({code: 500, message: responseConstant.SOMETHING_WENT_WRONG});
            return res.json({code: 200, message: responseConstant.POST_ADDED});
        });

    })
}

const getPostList = (req, res) => {
    const params = req.query;
  
    let sqlQuery = 'SELECT id, post_permission FROM users WHERE id=' + `'${params.user_id}'`;
    dbConnection.query(sqlQuery, async (error, result) => {
        if(error) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
        let found = "";
        let permissionArr;
        if(result[0].post_permission != null) {
            permissionArr = result[0].post_permission.split(',');
            found = permissionArr.find(element => element == "read");
        }
        let sqlQuery = 'SELECT id, created_by_user, updated_by_user, updated_by_other, post, created_at, updated_at_user, update_at_other FROM posts WHERE created_by_user=' + `'${params.user_id}'`;
        
        if(found == 'read' ) {
            sqlQuery = 'SELECT id,  created_by_user, updated_by_user, updated_by_other, post, created_at, updated_at_user, update_at_other FROM posts';
        } 

        dbConnection.query(sqlQuery, async (err, results) => {
            if(err) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
            return response.responseHandler(res, true, responseConstant.USER_LIST, results);
        })
    })
}

const updatePost = (req, res) => {
    const reqBody = req.body;

    let sqlQuery = 'SELECT id, post_permission FROM users WHERE id=' + `'${reqBody.user_id}'`;
    dbConnection.query(sqlQuery, async (error, result) => {
        if(error) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");

        if( result.length < 1 ) {
            return response.responseHandler(res, false, responseConstant.USER_NOT_FOUND, "");
        }

        let permissionArr = result[0].post_permission ? result[0].post_permission.split(','): 0;
        let found = permissionArr.length ? permissionArr.find(element => element == "update") : "";
        
        let updateQuery = "UPDATE posts SET post='"+reqBody.post+"', updated_by_user="+reqBody.user_id+", updated_at_user=NOW() WHERE id="+reqBody.post_id; 
        
        if( reqBody.updated_by_other != "" && reqBody.updated_by_other != undefined) {
            if( found == 'update') {
                updateQuery = "UPDATE posts SET post='"+reqBody.post+"', updated_by_other='"+reqBody.updated_by_other+"', update_at_other=NOW() WHERE id="+reqBody.post_id;
                dbConnection.query(updateQuery, (error, results) => {
                    if(error) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
                    return response.responseHandler(res, true, responseConstant.POST_UPDATED, "");
                })
            } else {
                return response.responseHandler(res, false, responseConstant.PERMISSION_NOT_ALLOW_UPDATE_POST, "");
            }
        } 
        if( reqBody.user_id != "" && reqBody.user_id != undefined) {
            let sqlQuery = 'SELECT id, post FROM posts WHERE id=' + `'${reqBody.post_id}'`+"AND created_by_user="+reqBody.user_id;
            dbConnection.query(sqlQuery, async (error, result) => {
                if(error) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
                if( result.length > 0 ) {
                    dbConnection.query(updateQuery, (error, results) => {
                        if(error) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
                        return response.responseHandler(res, true, responseConstant.POST_UPDATED, "");
                    })
                } else {
                    return response.responseHandler(res, false, responseConstant.PERMISSION_NOT_ALLOW_UPDATE_POST, "");
                } 
            })
        }
    })
}

const deletePost = (req, res) => {
    const reqBody = req.body;

    let sqlQuery = 'SELECT id, post_permission FROM users WHERE id=' + `'${reqBody.user_id}'`;
    dbConnection.query(sqlQuery, async (error, result) => {
        if(error) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");

        if( result.length < 1 ) {
            return response.responseHandler(res, false, responseConstant.USER_NOT_FOUND, "");
        }

        let permissionArr = result[0].post_permission ? result[0].post_permission.split(','): 0;
        let found = permissionArr.length ? permissionArr.find(element => element == "delete") : "";
        let sqlQuery = 'SELECT id, created_by_user FROM posts WHERE id=' + `'${reqBody.post_id}'`;
        dbConnection.query(sqlQuery, async (error, results) => {
            if(error) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
            let deleteQuery = "DELETE FROM posts WHERE id="+reqBody.post_id+"";
            if( results[0].created_by_user == reqBody.user_id ) {
                
                dbConnection.query(deleteQuery, (err, data) => {
                    if(err) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
                    return response.responseHandler(res, true, responseConstant.POST_DELETED, "");
                })
            } else {
                if( found == 'delete') {
                    dbConnection.query(deleteQuery, (err, data) => {
                        if(err) return response.responseHandler(res, false, responseConstant.SOMETHING_WENT_WRONG, "");
                        return response.responseHandler(res, true, responseConstant.POST_DELETED, "");
                    })
                } else {
                    return response.responseHandler(res, false, responseConstant.PERMISSION_NOT_ALLOW_UPDATE_POST, "");
                }
            }
        })

    })
}

module.exports = {
    addPost,
    getPostList,
    updatePost,
    deletePost
}