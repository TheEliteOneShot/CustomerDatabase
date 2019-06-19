
var async = require("async");
const mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: 'masterchief0',
    database: 'coding_challenge',
    debug: false
})

function buildConditions(req) {
    var conditions = [];
    var values = [];
    var conditionsStr;

    if (req.params.data.id) {
        conditions.push("id LIKE '%" + req.params.data.id + "%'");
    }

    if (req.params.data.user_email) {
        conditions.push("email LIKE '%" + req.params.data.user_email + "%'");
    }

    if (req.params.data.first_name) {
        conditions.push("first_name LIKE '%" + req.params.data.first_name + "%'");
    }

    if (req.params.data.last_name) {
        conditions.push("last_name LIKE '%" + req.params.data.last_name + "%'");
    }

    if (req.params.data.ip) {
        conditions.push("ip LIKE '%" + req.params.data.ip + "%'");
    }

    if (req.params.data.latitude) {
        conditions.push("latitude LIKE '%" + req.params.data.latitude + "%'");
    }

    if (req.params.data.longitude) {
        conditions.push("longitude LIKE '%" + req.params.data.longitude + "%'");
    }

    if (req.params.data.created_at) {
        conditions.push("created_at LIKE '%" + req.params.data.created_at + "%'");

    }

    return {
        where: conditions.length ? conditions.join(' AND ') : '1', values: values
    };
}

module.exports.handle_database = function (req, type, callback) {
    async.waterfall([
        function (callback) {
            pool.getConnection(function (err, connection) {
                if (err) {
                    console.log("There was an error getting a connection from the pool.");
                    callback(true);
                } else {
                    callback(null, connection);
                }
            });
        },
        function (connection, callback) {
            var SQLquery;
            switch (type) {
                case "login":
                    SQLquery = "SELECT * from user_login WHERE user_email='" + req.body.user_email + "' AND `user_password`='" + req.body.user_password + "'";
                    break;
                case "checkEmail":
                    SQLquery = "SELECT * from user_login WHERE user_email='" + req.body.user_email + "'";
                    break;
                case "register":
                    SQLquery = "INSERT into user_login(user_email,user_password,user_name) VALUES ('" + req.body.user_email + "','" + req.body.user_password + "','" + req.body.user_name + "')";
                    break;
                case "update_customer":
                    SQLquery = "UPDATE customers SET `email` = '" + req.params.data.user_email + "',`first_name` = '" + req.params.data.first_name + "', `last_name` = '" + req.params.data.last_name + "', `ip` = '" + req.params.data.ip + "', `latitude` = '" + req.params.data.latitude + "', `longitude` = '" + req.params.data.longitude + "' WHERE `customers`.`id` = '" + req.params.data.id + "'";
                    break;
                case "get_customer_edit":
                    SQLquery = "SELECT * FROM customers WHERE id = '" + req.params.id + "' ";
                    break;
                case "add_customer":
                    SQLquery = "INSERT into customers(email,first_name,last_name,ip,latitude,longitude) VALUES ('" + req.params.data.user_email + "','" + req.params.data.first_name + "','" + req.params.data.last_name + "','" + req.params.data.ip + "','" + req.params.data.latitude + "','" + req.params.data.longitude + "')";
                    break;
                case "delete_customer":
                    SQLquery = "DELETE FROM customers WHERE id = '" + req.params.data.id + "'";
                    break;
                case "total_count_customers":
                    SQLquery = "SELECT COUNT(id) as totalCount FROM customers";
                    break;
                case "search_query_count":
                    SQLquery = "SELECT COUNT(*) as totalCount FROM customers WHERE " + buildConditions(req).where;
                    break;
                case "page_search_query_count":
                    SQLquery = "SELECT COUNT(*) as totalCount " + req.session.lastCountQuery;
                    break;
                case "paginate":
                    SQLquery = "SELECT * FROM customers ORDER BY id ASC LIMIT " + req.params.perPage + " OFFSET " + req.params.offset;
                    break;
                case "execute_search_query":
 
                    SQLquery = "FROM customers WHERE " + buildConditions(req).where;

                    req.session.lastCountQuery = SQLquery;

                    SQLquery = "SELECT * " + SQLquery;

                    req.session.lastSearchQuery = SQLquery;

                    SQLquery = SQLquery + " LIMIT " + req.params.perPage + " OFFSET " + req.params.offset;
                    console.log("Executing search query: " + SQLquery);
                    break;
                case "execute_page_query":
                    SQLquery = req.session.lastSearchQuery + " LIMIT " + req.params.perPage + ' OFFSET ' + req.params.offset;
                    console.log("Executing page query: " + SQLquery);
                    break;
                default:
                    break;
            };
            callback(null, connection, SQLquery);
        },
        function (connection, SQLquery, callback) {
            connection.query(SQLquery, function (err, rows) {
                connection.release();
                console.log("Query: " + SQLquery);
                if (!err) {
                    if (type === "login") {
                        callback(rows.length === 0 ? null : rows[0]);
                    } else if (type === "checkEmail") {
                        callback(rows.length === 0 ? "The email being registered does not exist." : null);
                    } else if (type === "total_count_customers") {
                        callback(rows.length === 0 ? "There was an error retrieving total count from customers." : rows[0]);
                    } else if (type === "get_customer_edit") {
                            callback(rows.length === 0 ? "There was an error retrieving the edit page for this customer." : rows[0]);
                    } else if (type === "paginate") {
                        callback(rows.length === 0 ? "There was an error with paginate." : rows);
                    } else if (type === "execute_search_query" || type === "execute_page_query") {
                        console.log("Returning search or page query: " + rows);
                        callback(rows.length === 0 ? "Error retrieving the query results." : rows);
                    } else if (type === "search_query_count" || type === "page_search_query_count") {
                        callback(rows.length === 0 ? "Error retrieving the amount of search results." : rows[0]);
                    } else if (type === "update_customer") {
                        callback(rows.length === 0 ? "Error updating the customer." : null);
                    } else if (type === "add_customer") {
                        callback(rows.length === 0 ? "Error adding the customer." : null);
                    } else if (type === "delete_customer") {
                        callback(rows.length === 0 ? "Error deleting the customer." : null);
                    } else {
                        callback("User has been added successfully.");
                    };

                } else {
                    console.log("There was an error querying the SQL database." + err);
                    callback(true);
                }
            });
        }],

        function (result) {
            if (typeof (result) === "boolean" && result === true) {
                //console.log("Error in handle_database.");
                callback(null);
            } else {
                callback(result);
            }
        });
};