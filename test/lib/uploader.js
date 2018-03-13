'use strict';

const { createReadStream } = require('fs');
const { join, basename, resolve } = require('path');
const { expect } = require('code');
const { describe, it, beforeEach, after } = exports.lab = require('lab').script();
const del = require('del');
const sharp = require('sharp');

const uploader = require('../../lib/uploader');

describe('Uploader', async () => {

    const path = join(__dirname, `../image.webp`);
    const metadata = await sharp(path).metadata();

    const createImageStream = () => {

        const stream = createReadStream(path);
        stream.hapi = { filename: basename(path) };
        stream.metadata = metadata;

        return stream;
    };

    const dest = resolve('./darwin-images');
    const options = {
        dest,
        safeName: false,
        formats: ['webp'],
        maxFiles: 1,
        minPixels: 1e2,
        maxPixels: 1e6,
        versions: [],
        addOriginal: false
    };

    const fixture = del.sync.bind(del, dest, { force: true });

    beforeEach(fixture);

    after(fixture);

    it('should throw an error when files count is greater than the specified `options.maxFiles`', async () => {

        const { maxFiles } = options;
        const files = new Array(maxFiles + 1).fill(1);

        await expect(uploader(files, options)).to.rejects();
    });

    it('should throw an error when file type does not exist in `options.formats`', async () => {

        const { formats } = options;

        await expect(
            uploader(createImageStream(), {
                ...options,
                formats: formats.map(format => `q${format}`)
            })
        ).to.rejects();
    });

    it('should throw an error when input file pixels is out of the range', async () => {

        let file = createImageStream();

        await expect(uploader(file, {
            ...options,
            minPixels: (file.metadata.width * file.metadata.height) + 1
        })).to.rejects();

        file = createImageStream();

        await expect(uploader(file, {
            ...options,
            maxPixels: file.metadata.width
        })).to.rejects();
    });

    it('should generate unique filename when `options.safeName` is true', async () => {

        const files = new Array(3).fill(undefined).map(createImageStream);

        const filenames = [];

        for (const file of files) {
            filenames.push(
                (await uploader(file, { ...options, safeName: true, maxFiles: files.length })).filename
            );
        }

        expect(filenames.some((filename, index) => filenames.indexOf(filename) !== index)).to.be.false();
    });

    it('should replace new upload file with older when `options.safeName` is false', async () => {

        const files = new Array(2).fill(undefined).map(createImageStream);

        const filenames = [];

        for (const file of files) {
            filenames.push(
                (await uploader(file, { ...options, maxFiles: files.length })).filename
            );
        }

        expect(filenames.some((filename, index) => filenames.indexOf(filename) !== index)).to.be.true();
    });

    it('should return version details when one file passed with no version', async () => {

        const file = createImageStream();

        const upload = await uploader(file, options);

        expect(upload).to.be.an.object();
    });

    it('should return version details array when one file passed with multiple versions', async () => {

        const file = createImageStream();
        const versions = [{ width: 50, height: 50 }, { width: 100, height: 100 }];

        const uploads = await uploader(file, { ...options, versions });

        expect(uploads).to.be.an.array();
        uploads.forEach(upload => expect(upload).to.be.an.object());
    });

    it('should return array of version details array when multiple files passed with multiple versions', async () => {

        const files = [createImageStream(), createImageStream()];
        const versions = [{ width: 50, height: 50 }, { width: 100, height: 100 }];

        const uploads = await uploader(files, {
            ...options,
            versions,
            maxFiles: files.length
        });

        expect(uploads).to.be.an.array();
        uploads.forEach(upload => expect(upload).to.be.an.array());
    });

    it('should add original file when no version specified', async () => {

        const file = createImageStream();

        const upload = await uploader(file, options);

        const { width, height } = await sharp(upload.path).metadata();

        expect(upload.filename).to.be.equal(file.hapi.filename);
        expect(upload.path).to.endsWith(file.hapi.filename);
        expect(file.metadata.width).to.be.equal(width);
        expect(file.metadata.height).to.be.equal(height);
    });

    it('should add original file when `options.addOriginal` is true', async () => {

        const file = createImageStream();
        const versions = [{ width: 100, height: 100 }];
        const addOriginal = true;

        const [upload] = await uploader(file, { ...options, versions, addOriginal });

        const { width, height } = await sharp(upload.path).metadata();

        expect(upload.filename).to.be.equal(file.hapi.filename);
        expect(upload.path).to.endsWith(file.hapi.filename);
        expect(file.metadata.width).to.be.equal(width);
        expect(file.metadata.height).to.be.equal(height);
    });
});
