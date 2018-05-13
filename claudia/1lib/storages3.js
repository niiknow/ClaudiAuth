const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');
const HelperS3 = require('./helpers3');

AWS.config.region = process.env.region;
const specialChar = '*';

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

  isValidName(name) {
    const isValid = (typeof name !== 'undefined');

    if (isValid) {
      return /^[a-zA-Z0-9 ]{3,100}$/gi.test(name);
    }

    return isValid;
  }

  isValid(item) {
    return this.isValidId(item.id) && this.isValidName(item.name);
  }

  exists(item) {
    const $this = this;
    const path = `${specialChar}${item.id}.`;
    const params = this._s3.getParams(path, true);

    return this._s3.listObjectsV2(params).promise().then(rst => {
      if (rst.Contents) {
        return {
          success: true,
          value: $this._s3.parseContents(rst.Contents)
        };
      }
    }).catch(err => {
      console.log('exists error', path, err);
      return {
        success: false,
        error: err
      };
    });
  }

  list() {
    const $this = this;

    return $this._s3.list(specialChar).then(rst => {
      return $this._s3.parseContents(rst.Contents, true);
    });
  }

  save(item) {
    const $this = this;
    let isExisting = true;

    if (!item.id) {
      item.id = uuidv4();
      isExisting = false;
    }

    if (!$this.isValid(item.id)) {
      return new Promise((resolve, reject) => {
        reject(new Error('Invalid item id or name'));
      });
    }

    let payload = JSON.stringify(item);

    if (isExisting) {
      return $this.retrieve(item.id).then(rst => {
        const existingItem = JSON.parse(rst.Body.toString());
        const newItem = Object.assign(existingItem, item);
        payload = JSON.stringify(newItem);

        // name changed, delete old item markers
        if (existingItem.name === newItem.name) {
          // add or update marker
          $this.saveObject(`${specialChar}${newItem.id}.${newItem.name}`, payload);
        } else {
          $this.list(`${specialChar}${item.id}.`).then(rst => {
            // add or update marker
            $this.saveObject(`${specialChar}${newItem.id}.${newItem.name}`, payload);

            // delete old item markers
            $this._s3.deleteContents(rst.Contents);
          });
        }

        return $this._s3.saveObject(`${item.id}/index.json`, payload);
      });
    }

    // create item marker for listing
    $this.saveObject(`${specialChar}${item.id}.${item.name}`, payload);
    return $this._s3.saveObject(`${item.id}/index.json`, payload);
  }

  retrieve(id) {
    const $this = this;
    if (!$this.isValidId(id)) {
      return new Promise((resolve, reject) => {
        reject(new Error('Invalid item id'));
      });
    }

    return $this._s3
      .getObject(`${id}/index.json`).then(rst => {
        return JSON.parse(rst.Body);
      });
  }

  delete(id) {
    const $this = this;
    if (!$this.isValidId(id)) {
      return new Promise((resolve, reject) => {
        reject(new Error('Invalid item id'));
      });
    }

    // delete old item markers
    $this.list(`${specialChar}${id}.`).then(rst => {
      $this._s3.deleteContents(rst.Contents);
    });

    return $this._s3
      .deleteObject(`${id}/index.json`);
  }

  specialAttr(id, name, value) {
    const $this = this;
    if (!$this.isValid({id: id, name: name}) || (name.toLowerCase() === 'index')) {
      return new Promise((resolve, reject) => {
        reject(new Error('Invalid item id or attribute name'));
      });
    }

    if (value) {
      return $this._s3
        .saveObject(`${id}/${name}.json`, JSON.stringify(value))
        .then(rst => {
          return JSON.parse(rst.Body.toString());
        });
    }

    return $this._s3.getObject(`${id}/${name}.json`)
      .then(rst => {
        return JSON.parse((rst.Body || '{}').toString());
      }).catch(() => {
        return {};
      });
  }
}

module.exports = StorageS3;
