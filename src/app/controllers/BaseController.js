class BaseController {
    /**
     * Response success callback
     * @param {*} res 
     * @param {*} data 
     * @param {*} httpStatusCode 
     * @return mixed  
     */
    responseSuccess (res, data = [], httpStatusCode = 200) {
        return res.json(
            {
                'data': data,
                'status': httpStatusCode
            },
        );
    }

    /**
     * Response error callback
     * @param {*} res 
     * @param {*} error 
     * @param {*} httpStatusCode 
     * @return mixed 
     */
    responseError (res, error, httpStatusCode = 400) {
        return res.json(
            {
                'error': error,
                'status': httpStatusCode
            },
        );
    }
}

module.exports = new BaseController();
