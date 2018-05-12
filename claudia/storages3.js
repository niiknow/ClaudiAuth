const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');
const HelperS3 = require('./helpers3');
const validGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

AWS.config.region = process.env.region;

class StorageS3 {
  constructor(bucket, baseFolder = '') {
    this._s3 = new HelperS3(bucket, baseFolder);
  },
  isValidId(id) {
    let isValid = !!obj.id;

    if (isValid) {
      return validGuid.test(obj.id);
    }

    return isValid;
  }
  list() {
    return this.s3.listAll();
  },
  create(item) {
    const id = uuidv4();
    item.id = id;
    this.update(id, item);
  },
  retrieve(id) {
    const $this = this;
    return new Promise((resolve, reject) => {
      if (!$this.isValidId(id)) {
        return reject('Invalid item id.');
      }

      return $this._s3
        .getObject(`${id}.json`)
        .then(resolve)
        .catch(reject);
    });
  },
  update(item) {
    const $this = this;
    return new Promise((resolve, reject) => {
      if (!$this.isValidId(item.id)) {
        return reject('Invalid item id.');
      }

      return $this._s3.saveObject(`${item.id}.json`, JSON.stringify(item))
        .then(resolve)
        .catch(reject);
    });
  },
  delete(id) {
    const $this = this;
    return new Promise((resolve, reject) => {
      if (!$this.isValidId(id)) {
        return reject('Invalid item id.');
      }

      return $this._s3
        .deleteObject(`${id}.json`)
        .then(resolve)
        .catch(reject);
    });
  }
};

export default StorageS3;
