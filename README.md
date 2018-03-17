# hapi-darwin

A Hapi plugin for image storage

[![Dependency Status](https://david-dm.org/ecmascriptforever/hapi-darwin.svg)](https://david-dm.org/ecmascriptforever/hapi-darwin)
[![devDependency Status](https://david-dm.org/ecmascriptforever/hapi-darwin.svg?theme=shields.io)](https://david-dm.org/ecmascriptforever/hapi-darwin?type=dev)
[![Build Status](https://travis-ci.org/ecmascriptforever/hapi-darwin.svg?branch=master)](https://travis-ci.org/ecmascriptforever/hapi-darwin)

## Install

```bash
$ npm install @esforever/hapi-darwin
```

## Register

```js
await server.register({
    plugin: require('@esforever/hapi-darwin'),
    options: {
        // Any uploader method options
        dest: './path/to/destination',
        formats: ['jpeg', 'png']
    }
});
```

## Usage

```js
'use strict';

const uploader = server.plugins['hapi-darwin'].uploader;

server.route({
    method: 'POST',
    path: '/path/to/endpoint',
    options: {
        payload: {
            allow: 'multipart/form-data',
            output: 'stream'
        }
    },
    handler: async ({ payload }, h) => {

        try {
            return await uploader(payload.avatar, { names: 'avatar' });
        } catch (err) {
            // ...
        }
    }
})
```

## API

### uploader(files, [options])

Returns a Promise for `object` or `object[]` or `object[][]` with:

- `filename` (string) - corrected filename
- `path` (string) - absolute path of uploaded version

#### files

Type: `Readable` `Readable[]`

#### options

Type: `object`

##### dest

Type: `string`

Default: `./images`

Destination directory.

##### names

Type: `string` `string[]`

Default: `files.hapi.filename`.

Name(s) of input files to be used.

##### safeName

Type: `boolean`

Default: `true`

Whether replace new file with older exist or generate a unique filename.

##### formats

Type: `string[]`

Default: `['jpeg', 'png', 'gif', 'webp']`

File types that are allowed (it don't check extension).

##### maxFiles

Type: `number`

Default: `1`

Maximum input files can be uploaded.

##### minPixels

Type: `number`

Default: `1e2`

Minimum pixels can be manipulated.

##### maxPixels

Type: `number`

Default: `1e6`

Maximum pixels can be manipulated.

##### versions

Type: `object[]`

Default: `[]`

Define `array` of version `object` with:

- `width` (number) - pixels width the version image should be. Use `null` or `undefined` to auto-scale the width to match the height.
- `height` (number) - pixels height the version image should be. Use `null` or `undefined` to auto-scale the height to match the width.
- `enlargement` (boolean) - enlarge the output image if the input image width or height are already less than the required dimensions; default is false.
- `suffix` (string) - suffix of version filename.

Example:

```js
versions: [
    { width: 128, height: 128 },
    { width: 64, suffix: 'thumbnail' }
]
```

##### addOriginal

Type: `boolean`

Default: `false`

Whether adding the original input file to the destination directory or not.

## License

MIT
