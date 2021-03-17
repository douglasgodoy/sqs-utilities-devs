require("dotenv").config();
const sqs = require("./app/Controller/sqsController");
const questions = require("./app/Controller/promptController");
/*setInterval(() => {
    sqs.receive();
}, process.env.INTERVAL_WORKER);
*/
const finish = () => {
    console.log("bye");
    return false;
};

const flow = async () => {
    const returnPrompt = (await questions.initial()).value || false;

    if (returnPrompt === "C") sqs.connect();
    else sqs.connect(await questions.manual());

    const selectedType = await questions.configured();
    if (selectedType.value.length) await sqs[selectedType.value]();
    
    const more = await questions.more();
    if (more.value) await flow();
};

(async () => {
    await flow();
    finish();
})();
