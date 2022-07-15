const express = require("express");
require("./db/mongoose");
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;


//For the Site maintanance

// app.use((req, res, next) => {

//     res.status(500).send('Site is under maintanance');
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log("Server is running in port", port);
});


