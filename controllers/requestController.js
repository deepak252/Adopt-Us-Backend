"use strict"

const {query} = require('../db');
const Request = require('../model/Request');
const { successMessage, errorMessage } = require('../utils/responseUtils');

//make a adoption request of a pet
module.exports.adoptRequest = async(req, res) => {
    try {
        const createReqTableQuery = `
        CREATE TABLE IF NOT EXISTS requests(
            requestId int(11) PRIMARY KEY AUTO_INCREMENT,
            adoptReqById int(11),
            FOREIGN KEY (adoptReqById) REFERENCES users(userId) ON DELETE CASCADE,
            petId int(11),
            FOREIGN KEY (petId) REFERENCES pets(petId) ON  DELETE CASCADE,
            status varchar(10),
            requestedAt varchar(100)
        );
        `
        const newRequest = new Request(req.userId, req.params.petId, "pending", new Date());
        const insertRequestQuery = `
         INSERT INTO requests VALUES (NULL, ${newRequest.toString()});
        `
        await query(createReqTableQuery);
        const result = await query(insertRequestQuery);
       return res.json(successMessage(result))
    } catch (error) {
        return res.status(400).json(errorMessage(error.message))
    }
}
//get All users who requested for adoption of a pet
module.exports.getPetAdoptRequests = async(req, res) => {
    try {
        const petId = req.params.petId;
        const getRequestsQuery = `
        SELECT * FROM requests where petId=${petId}
        `
        const result = await query(getRequestsQuery);
        if(result.length==0){
            return res.status(404).json(
                errorMessage("Requests is empty!")
            );
        }
        return res.json(successMessage(result));
    } catch (error) {
        return res.status(400).json(
            errorMessage(error.message)
        );
    }
}


//get All requests of adoption of pets by a user
module.exports.getAllRequestsByUser = async(req, res) => {
    try {
        const allRequestUserQuery = `
        select * from requests where adoptReqById=${req.params.userId};
        `
        const result = await query(allRequestUserQuery);
        if(result.length==0){
            return res.status(404).json(
                errorMessage("Requests is empty!")
            );
        }
        return res.json(successMessage(result));
    } catch (error) {
        return res.status(400).json(
            errorMessage(error.message)
        );
    }
} 

//delete adoption request
module.exports.deleteAdoptionRequest = async(req, res) => {
    try {
        const deleteQuery =  `
        delete from requests where requestId="${req.params.requestId}";
        `
        const result = await query(deleteQuery);
        return res.json(successMessage(result));
    } catch (error) {
        return res.status(400).json(
            errorMessage(error.message)
        );
    }
}

//accepted and reject request controller
module.exports.updateStatusRequest = async(req, res) => {
    try {
        const {status} = req.body;
        const getReqQuery = `
        select adoptReqById, petId from requests where  requestId="${req.params.requestId}";
        `
        const [responseId] = await query(getReqQuery);
        const userQuery = `
        select adoptPetsId from users where userId="${responseId.adoptReqById}";
        `
        if(status === 'Approved'){
            const [userRes] = await query(userQuery);
            const petIds = userRes.adoptPetsId ?  [userRes.adoptPetsId,responseId.adoptReqById] : [responseId.adoptReqById];
            const updateUserQuery = `
            update users set adoptPetsId="${petIds}"
            `
            const updatePetQuery = `
            update pets set petStatus = "adopted";
            `
            await query(updateUserQuery);
            await query(updatePetQuery);
        }
        const updateStatusQuery = `
        update requests set status="${status}" where requestId="${req.params.requestId}";
        `
        const result = await query(updateStatusQuery);
        return res.json(successMessage(result));
        //adoptPetsId
    } catch (error) {
        return res.status(400).json(
            errorMessage(error.message)
        );
    }
}