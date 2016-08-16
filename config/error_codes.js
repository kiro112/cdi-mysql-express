'use strict';

module.exports = {
    INV_SLEN: 'String is too short or too long',
    INV_CHAR: 'String contains invalid character',
    INV_ROLE: 'User can\'t take on the specified role',
    INC_DATA: 'Incomplete request data',
    NO_RECORD_CREATED: 'No record was created',
    NO_RECORD_UPDATED: 'No record was updated',
    NO_RECORD_DELETED: 'No record was deleted',
    ZERO_RES: 'Database returned no result',
    UNAUTH: {
        code: 403,
        message: 'Unauthorized access'
    },
    LOG_FAIL: 'Log-In failed',
    INV_USER: 'Invalid username',
    INV_PASS: 'Invalid password',
    INV_FLD:  'Invalid data received',
    DUP_ENTRY:'Duplicate insert entry'
};