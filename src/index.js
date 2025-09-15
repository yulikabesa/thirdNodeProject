const express = require('express');
require('./db/mongoose');
const memberRouter = require('./routers/member');
const teamRouter = require('./routers/team');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/members', memberRouter);
app.use('/teams', teamRouter);

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});