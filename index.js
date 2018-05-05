'use strict';

const uploader = require('./lib/uploader');

const register = (server, options, next) => {

    options = {
        dest: `./images`,
        names: undefined,
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
        uploader: (files, opts = {}) => uploader(files, { ...options, ...opts })
    });

    next && next();
};

register.attributes = {
    once: true,
    pkg: require('./package.json'),
    name: 'hapi-darwin'
};

module.exports = {
    register,
    ...register.attributes
};
