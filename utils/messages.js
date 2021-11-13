const moment = require('moment');


function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().utc(+07).format('h:mm a')
    };
}

module.exports = formatMessage;
