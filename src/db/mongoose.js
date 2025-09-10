const mongoose = require('mongoose');

mongoose.connect('mongodb://yulikabesa17_db_user:Y6irfy0GviRrx0ll@ac-1zzwrwg-shard-00-00.rbtvsv3.mongodb.net:27017,ac-1zzwrwg-shard-00-01.rbtvsv3.mongodb.net:27017,ac-1zzwrwg-shard-00-02.rbtvsv3.mongodb.net:27017/artech-manager-api?ssl=true&replicaSet=atlas-jm3cyt-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0/artech-manager-api', {
    useUnifiedTopology: true,
    useNewUrlParser: true
});
