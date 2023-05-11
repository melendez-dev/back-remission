const connectionDB = {
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'remission'
};

const sucessResponse = (res, data, message = "") => {
    if(!data?.length) {
        res.json({
            status: 'success',
            data: data || [],
            message 
        })
        return;
    }

    if (data?.length > 1) {
        res.json({
            status: 'success',
            data: data,
            message 
        })
        return;
    }else{
        res.json({
            status: 'success',
            data: data[0],
            message
        });
        return;
    }
}

const errorReponse = (res, codeStatus, message = "") => {
    res.status(codeStatus).json({
        message,
        data: [],
    })
}

module.exports = {
    connectionDB,
    sucessResponse,
    errorReponse,
}