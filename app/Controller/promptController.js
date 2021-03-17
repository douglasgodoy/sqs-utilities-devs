const prompts = require("prompts");

const QUESTIONS = {
    initial: async () => {
        const arrayQuestions = [
            {
                type: "select",
                name: "value",
                message: "select the option:",
                choices: [
                    {
                        title: "configured",
                        description: "configured dotenv",
                        value: "C",
                    },
                    {
                        title: "Manual",
                        description: "I will configure now",
                        value: "M",
                    },
                ],
            },
        ];
      
        const onCancel = (prompt) => {
            console.log("Never stop prompting!");
            return false;
        };
        return await prompts(arrayQuestions, { onCancel });
    },

    configured: async () => {
        const arrayQuestions = [
            {
                type: "multiselect",
                name: "value",
                message: `select`,
                choices: [
                    { title: "receive", value: "onlyReceive" },
                    { title: "delete", value: "receiveAndDelete" },
                    { title: "sendBatch", value: "sendMessageBatch" }
                ],
                hint: "- Space to select. Return to submit",
                max: 2,
            }
        ];

        return await prompts(arrayQuestions);
    },

    manual: async () => {
        const arrayQuestions = [
            {
                type: "text",
                name: "accessKeyId",
                message: `AWS accessKeyId:`,
            },
            {
                type: "password",
                name: "secretAccessKey",
                message: `AWS secretAccessKey:`,
            },
            {
                type: "text",
                name: "region",
                message: `AWS region:`,
            },
            {
                type: "text",
                name: "queueUrl",
                message: `AWS queue_url:`,
            },
        ];

        return await prompts(arrayQuestions);
    },

    more:async () => {
        
        const question = {
            type:'confirm',
            message:'continue ?',
            name:'value'
        }
        
        return await prompts(question);
    }
};

module.exports = QUESTIONS;
