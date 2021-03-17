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

    if (returnPrompt === "C") sqs.connect();
    else sqs.connect(await questions.manual());

    const selectedType = await questions.configured();
    console.log(selectedType);
    if (selectedType.value) await sqs[selectedType.value]();
    //if (selectedType.value) sqs[selectedType.value]();

    //sqs.receive()
    finish();
})();
