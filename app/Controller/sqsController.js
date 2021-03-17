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
        const objects = deleteObjects || [];
        const sanitizeData = objects.map(({ ReceiptHandle }, key) =>
            Services.getDeleteObject(ReceiptHandle, key)
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

    receive: async () => {
        let params = {
            QueueUrl: Services.queue_url,
            MaxNumberOfMessages: 10,
            MessageAttributeNames: ["All"],
        };

        try {
            const res = await sqs.receiveMessage(params).promise();
            return res.Messages;
        } catch (error) {
            return new Error(error);
        }
    },

    onlyReceive: async () => {
        try {
            const response = await Services.receive();
            if(!response) return console.log('nothing in queue');
            const sanitizeData = response.map(obj => obj.Body);
            console.log(sanitizeData);
            console.log(`receive ${sanitizeData.length} messages`);
            await Services.onlyReceive()
            return response;
        } catch (error) {
            return error;
        }
    },

    receiveAndDelete: async (receive = true) => {
        receive = false;
        const queues = receive
            ? await Services.onlyReceive()
            : await Services.receive();

        if (!queues) return console.log('nothing to delete');
        Services.deleteQueues(queues);
        Services.receiveAndDelete()
    },

    sendMessageBatch:async () => {
        const messageObj = JSON.parse(process.env.ENTRIES) || 0;
        if (!messageObj.length) {
            console.log("empty entries");
            return false;
        }

        const entries = messageObj.map((entry, key) =>
            Services.getEntry(entry, key)
        );

        let requestParams = {
            QueueUrl: Services.queue_url,
            Entries: entries,
        };
        try {
            const resultSend = await sqs.sendMessageBatch(requestParams).promise()
            console.log(`send sucess ${resultSend.Successful.length} messages!`);
        } catch (error) {
            console.log(error);
        }
    },

    getEntry(messageBody, key) {
        let entry = {
            Id: key.toString(),
            MessageBody: JSON.stringify(messageBody),
            MessageAttributes: {},
        };

        Array.from(messageBody).forEach((value, key) => {
            entry.MessageAttributes[key] = {
                StringValue: value,
                DataType: "String",
            };
        });

        return entry;
    },
};

module.exports = Services;
