const AWS = require("aws-sdk");
const configs = (confs = false) => {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || confs.accessKeyId;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || confs.secretAccessKey;
    const region = process.env.AWS_REGION || confs.region;
    
    AWS.config.update({
        accessKeyId,
        secretAccessKey,
        region,
    });
};

module.exports = {AWS,configs};
