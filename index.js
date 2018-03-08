'use strict';

const uploader = require('./lib/uploader');

const register = (server, options) => {

    options = {
        dest: `${__dirname}/images`,
        name: undefined,
        safeName: true,
        formats: ['jpeg', 'png', 'gif', 'webp'],
        maxFiles: 1,
        minPixels: 1e2,
        maxPixels: 1e6,
        versions: [],
        addOriginal: false,
        ...options
    };

    server.expose({
        uploader: (file, opts = {}) => uploader(file, { ...options, ...opts })
    });
};

module.exports = {
    register,
    pkg: require('./package.json'),
    name: 'hapi-darwin'
};
