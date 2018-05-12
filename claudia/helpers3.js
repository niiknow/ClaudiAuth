const AWS = require('aws-sdk');
const uuidv5 = require('uuid/v5');
const mime = require('mime');

AWS.config.region = process.env.region;

class HelperS3 {
  constructor(bucket, baseFolder = '') {
    this._bucket = bucket;
    baseFolder = baseFolder ? baseFolder : '';

    // always prefix with forward slash, remember to trim later
    if (!baseFolder.endsWith('/')) {
      baseFolder += '/';
    }

    this._baseFolder = baseFolder;
    this._s3 = new AWS.S3();
  },
  getParams(path = '', asPrefix = false) {
    const params = {
      Bucket: this._bucket
    };
    const key = (this._baseFolder + path).replace(/^\/*/, '');

    if (asPrefix) {
      params.Prefix = key;
    } else {
      params.Key = key;
      try {
        mimetype = mime.lookup(params.Key) || 'application/octet-stream';
        params.ContentType = mimetype;
      } catch (e) {
        console.log(e);
      }
    }

    return params;
  },
  list(path, continueToken) {
    const params = this.getParams(path, true);

    if (continueToken) {
      params.ContinuationToken = continueToken;
    }

    return this._s3.listObjectsV2(params).promise();
  },
  listAll(list, path, continueToken) {
    const $this = this;
    const deferred = Promise.defer();

    $this.list(path, continueToken).then(data => {
      list.push.apply(data.Contents);
      if (data.IsTruncated && data.NextContinuationToken) {
        $this.listAll(list, path, data.NextContinuationToken).then(data => {
          deferred.resolve();
        });
      } else {
        deferred.resolve();
      }
    }).catch(err => {
      return deferred.reject(err);
    });

    return deferred;
  },
  deleteObject(path) {
    const params = this.getParams(path);
    return this._s3.deleteObject(params).promise();
  }
  getObject(path) {
    const params = this.getParams(path);
    return this._s3.getObject(params).promise();
  }
  saveObject(path, data) {
    const params = this.getParams(path);
    params.Body = data;
    this._s3.putObject(params).promise();
  }
}

export default HelperS3;
