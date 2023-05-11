const connectionDB = {
    host: process.env.DB_HOST,
    user: process.env.DB_HOST_USER,
    password: process.env.DB_HOST_PASSWORD,
    database: process.env.DB_NAME ,
    port: process.env.DB_HOST_PORT
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