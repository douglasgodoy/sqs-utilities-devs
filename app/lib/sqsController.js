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
            console.log(response);
            return response;
        } catch (error) {
            return error;
        }
    },

    receiveAndDelete: async (receive = true) => {
        const queues = receive
            ? await Services.onlyReceive()
            : await Services.receive();

        console.log("deleting data...");
        Services.deleteQueues(queues);
    },

    sendMessageBatch() {
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

        sqs.sendMessageBatch(requestParams, (err, data) => {
            if (err) {
                console.log(err.message);
            }
            console.log(data);
        });
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
