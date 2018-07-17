

'use strict';

if (process.env.NODE_ENV === 'dev') {
    exports.config = {
        PORT : 8002,
        dbURI : 'mongodb://leila:cKFpCAuZa6D5QXkh@35.162.13.243/leila_dev'
    }
} else if (process.env.NODE_ENV === 'client') {
    exports.config = {
        PORT : 8005,
        dbURI : 'mongodb://leila:cKFpCAuZa6D5QXkh@35.162.13.243/leila_dev'
    }
} else if (process.env.NODE_ENV === 'live') {
    exports.config = {
        PORT : 3002,
        dbURI : ''
    }
}
else {
    exports.config = {
        PORT : 8006 ,
        dbURI : 'mongodb://localhost/leila'
    };
}
