const hdb = require('../functions/handle_database');
const Pagination = require('../classes/pagination');

const perPage = 25;

module.exports = {
    getSearchPage: (req, res) => {
        res.render('search.ejs', {
            message: "Search for customers",
            customers: null,
            pages: null,
            title: "Search",
            userEmail: req.session.key.user_email,
            totalCount: 0
        });
    },
    getFirstSearchResults: (req, res) => {

        let id = req.body.id;
        let user_email = req.body.user_email;
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let ip = req.body.ip;
        let latitude = req.body.latitude;
        let longitude = req.body.longitude;
        let created_at = req.body.created_at;

        req.params.data = {
            id, user_email, first_name, last_name, ip, latitude, longitude, created_at
        }

        page_id = parseInt(req.params.page);
        pageUri = '/search/';

        req.session.currentPage = 1;

        // Instantiate Pagination class

        hdb.handle_database(req, "search_query_count", function (response) {
            if (response === null) {
                console.log("There was an error during the search query.");
            } else {
                var totalCount = response.totalCount;


                var Paginate = new Pagination(totalCount, req.session.currentPage, pageUri, perPage);

                req.params.perPage = Paginate.perPage;
                req.params.offset = Paginate.offset;

                hdb.handle_database(req, "execute_search_query", function (response) {
                    if (response === null) {
                    } else {
                        console.log("Customers length " + response.length);

                        res.render('search.ejs', {
                            customers: response,
                            message: "Returned " + totalCount + " results.",
                            pages: Paginate.links(),
                            title: "Viewing Customer Database",
                            userEmail: req.session.key.user_email,
                            totalCount
                        });
                    };
                });
            }
        });
    },
    getPageSearchResults: (req, res) => {

        page_id = parseInt(req.params.page);
        pageUri = '/search/';

        if (typeof req.session.currentPage == 'undefined') {
            req.session.currentPage = 1;
        } else {
            req.session.currentPage = page_id > 0 ? page_id : req.session.currentPage;
        };

        // Instantiate Pagination class

        hdb.handle_database(req, "page_search_query_count", function (response) {
            if (response === null) {
                console.log("There was an error during the search query.");
            } else {
                var totalCount = response.totalCount;


                var Paginate = new Pagination(totalCount, req.session.currentPage, pageUri, perPage);

                req.params.perPage = Paginate.perPage;
                req.params.offset = Paginate.offset;


                hdb.handle_database(req, "execute_page_query", function (response) {
                    if (response === null) {
                    } else {
                        console.log("Customers length " + response.length);

                        res.render('search.ejs', {
                            customers: response,
                            message: "Returned " + totalCount + " results.",
                            pages: Paginate.links(),
                            title: "Viewing Customer Database",
                            userEmail: req.session.key.user_email,
                            totalCount
                        });
                    };
                });
            }
        });
    },
    getEntireCustomerDatabase: (req, res) => {
        let id = "";
        let user_email = "";
        let first_name = "";
        let last_name = "";
        let ip = "";
        let latitude = "";
        let longitude = "";
        let created_at = "";

        req.params.data = {
            id, user_email, first_name, last_name, ip, latitude, longitude, created_at
        }

        page_id = parseInt(req.params.page);
        pageUri = '/search/';

        req.session.currentPage = 1;

        // Instantiate Pagination class

        hdb.handle_database(req, "search_query_count", function (response) {
            if (response === null) {
                console.log("There was an error during the search query.");
            } else {
                var totalCount = response.totalCount;


                var Paginate = new Pagination(totalCount, req.session.currentPage, pageUri, perPage);

                req.params.perPage = Paginate.perPage;
                req.params.offset = Paginate.offset;

                hdb.handle_database(req, "execute_search_query", function (response) {
                    if (response === null) {
                    } else {
                        console.log("Customers length " + response.length);

                        res.render('search.ejs', {
                            customers: response,
                            message: "Returned " + totalCount + " results.",
                            pages: Paginate.links(),
                            title: "Viewing Customer Database",
                            userEmail: req.session.key.user_email,
                            totalCount
                        });
                    };
                });
            }
        });
    }
};