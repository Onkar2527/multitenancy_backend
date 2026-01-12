const express = require('express');
const jwt = require('jsonwebtoken');



exports.requireAuthentication = (req, res, next) => {


    try {
        const apikey = req.headers['apikey'];

        if (process.env.APIKEY == apikey) {
            console.log("checking apiKey", apikey);
            next()
        }
        else {
            console.log("apiKey not found");
            res.send({
                "code": 401,
                "message": "Unautherized User"
            })
        }
    } catch (error) {

        console.log(error)

    }
}

exports.checkToken = (req, res, next) => {

    console.log("checking token");
    try {

        if (req.headers['token']) {
            jwt.verify(req.headers['token'], process.env.SECRET, (error, authData) => {

                if (error) {
                    res.send({
                        "code": 403,
                        "message": "Wrong Token."
                    });
                } else {

                    req.authData = authData;
                    next();
                }
            });
        }
        else {

            res.send({
                "code": 403,
                "message": "No Token Provided."
            });
        }

    } catch (error) {
        console.log(error);
    }



}

