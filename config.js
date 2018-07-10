"use strict";
exports.DATABASE_URL =
 process.env.DATABASE_URL || 'mongodb://localhost/healthtarget-app';
 exports.TEST_DATABASE_URL = 
 process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-healthtarget-app';
 exports.PORT = process.env.PORT || 8080;