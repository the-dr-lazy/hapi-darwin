'use strict';

const uploader = require('./lib/uploader');

const register = (server, options) => {

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
};

module.exports = {
    register,
    once: true,
    pkg: require('./package.json'),
    name: '@esforever/hapi-darwin'
};
