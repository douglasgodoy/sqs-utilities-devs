const AWS = require("../aws");
let sqs;
const Services = {
    queue_url: process.env.QUEUE_URL,

    connect: (obj = false) => {
        AWS.configs(obj);
        sqs = new AWS.AWS.SQS();
        if (obj) Services.queue_url = obj.queueUrl;
    },

    getDeleteObject: (key, id) => {
        return {
            Id: id.toString(),
            ReceiptHandle: key,
        };
    },

    deleteQueues: (deleteObjects) => {
        const sanitizeData = deleteObjects.map(({ ReceiptHandle }, key) =>
            getDeleteObject(ReceiptHandle, key)
        );

        let requestParams = {
            QueueUrl: Services.queue_url,
            Entries: sanitizeData,
        };

        sqs.deleteMessageBatch(requestParams, function (err, data) {
            if (err) console.log(err);
            return;
        });
    },

    receive: () => {
        let params = {
            QueueUrl: Services.queue_url,
            MaxNumberOfMessages: 10,
            VisibilityTimeout: 60,
            WaitTimeSeconds: 20,
            MessageAttributeNames: ["All"],
        };
        sqs.receiveMessage(params, (err, data) => {
            if (err) {
                console.log(err, err.stack);
                return false;
            }
            const { Messages: queues } = data;
            deleteQueues(queues);
        });
    },
};

module.exports = Services;
