const Busboy = require('busboy');
const { logger, pipelineAsync } = require('./util');
const { join } = require('path');
const { createWriteStream } = require('fs');

class UploadHandler {
  #io;
  #socketId;

  constructor({ io, socketId }) {
    this.#io = io;
    this.#socketId = socketId;
  }

  async #onFile(fieldName, file, filename) {
    const saveFileTo = join(__dirname, '..', 'downloads', filename);
    logger.info('Uploading: ' + saveFileTo);

    await pipelineAsync(
      file,
      this.#handleFileBytes.apply(this, [ filename ]),
      createWriteStream(saveFileTo)
    )

    logger.info(`File [${filename}] finished!`)
  }

  #handleFileBytes(fileName) {
    async function * handleData(data) {
      for await(const item of data) {
        yield item;
      }
    }

    return handleData.bind(this);
  }

  registerEvents(headers, onFinish) {
    const busboy = new Busboy({ headers });

    busboy.on('file', this.#onFile.bind(this));

    busboy.on('finish', onFinish);

    return busboy;
  }
}

module.exports = UploadHandler;