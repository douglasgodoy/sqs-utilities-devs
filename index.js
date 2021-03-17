require("dotenv").config();
const sqs = require("./app/lib/sqsController");
const questions = require("./app/lib/promptController");
/*setInterval(() => {
    sqs.receive();
}, process.env.INTERVAL_WORKER);
*/
const finish = () => {
    console.log("bye");
    return false;
};

(async () => {
    const returnPrompt = (await questions.initial()).value || false;
    if (returnPrompt === "C") {
        sqs.connect();
        return await questions.configured().value;
    }
    const confSQS = await questions.manual();
    sqs.connect(confSQS);
    //sqs.receive()
    console.log(confSQS);
})();
