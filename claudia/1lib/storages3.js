const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');
const HelperS3 = require('./helpers3');

AWS.config.region = process.env.region;

class StorageS3 {
  constructor(bucket, baseFolder = '') {
    this._s3 = new HelperS3(bucket, baseFolder);
  }

  isValidId(id) {
    const isValid = (typeof id !== 'undefined');

    if (isValid) {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/gi.test(id);
    }

    return isValid;
  }

  list() {
    return this.s3.list();
  }

  create(item) {
    const id = uuidv4();
    item.id = id;
    this.update(id, item);
  }

  retrieve(id) {
    const $this = this;
    return new Promise((resolve, reject) => {
      if (!$this.isValidId(id)) {
        return reject(new Error('Invalid item id.'));
      }

      return $this._s3
        .getObject(`${id}.json`)
        .then(resolve)
        .catch(reject);
    });
  }

  update(item) {
    const $this = this;
    return new Promise((resolve, reject) => {
      if (!$this.isValidId(item.id)) {
        return reject(new Error('Invalid item id.'));
      }

      return $this._s3.saveObject(`${item.id}.json`, JSON.stringify(item))
        .then(resolve)
        .catch(reject);
    });
  }

  delete(id) {
    const $this = this;
    return new Promise((resolve, reject) => {
      if (!$this.isValidId(id)) {
        return reject(new Error('Invalid item id.'));
      }

      return $this._s3
        .deleteObject(`${id}.json`)
        .then(resolve)
        .catch(reject);
    });
  }
}

module.exports = StorageS3;
