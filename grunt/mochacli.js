'use strict';
module.exports = function(grunt) {
    return {
        options: {
            files: 'test/integration/*.js'
        },
        spec: {
            options: {
                files: 'test/integration/*.js',
                reporter: 'spec',
                timeout: 10000
            }
        }
    };
};
