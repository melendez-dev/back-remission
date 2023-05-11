const connectionDB = {
    host: "190.8.176.74",
    user: "legacyte_root",
    password: "LegacyTech6x3!",
    database: "legacyte_remission",
    port: 3306 
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