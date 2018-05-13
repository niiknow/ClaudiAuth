const AWS = require('aws-sdk');

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
  }

  parseContents(items, forListing = false) {
    /*
    data = {
     Contents: [
      {
         ETag: "\\"70ee1738b6b21e2c8a43f3a5ab0eee71\\"",
         Key: "example1.jpg",
         LastModified: <Date Representation>,
         Owner: {
          DisplayName: "myname",
          ID: "12345example25102679df27bb0ae12b3f85be6f290b936c4393484be31bebcc"
         },
         Size: 11,
         StorageClass: "STANDARD"
      },
      {...}
    */
    const rst = [];

    items.forEach(item => {
      if (forListing) {
        const kvals = item.Key.replace(/[+]*/gi, ' ').trim().split('.');
        rst.push({
          id: kvals[0],
          name: decodeURIComponent(kvals[1]),
          _key: item.Key,
          _size: item.Size,
          _timestamp: item.LastModified,
          _etag: item.ETag
        });
      } else {
        rst.push({
          _key: item.Key,
          _size: item.Size,
          _timestamp: item.LastModified,
          _etag: item.ETag
        });
      }
    });

    return rst;
  }

  deleteContents(contents) {
    if (contents) {
      contents.forEach(itm => {
        const params = {
          Bucket: this._bucket,
          Key: itm.Key
        };
        this._s3.deleteObject(params);
      });
    }
  }

  getParams(path = '', asPrefix = false) {
    const params = {
      Bucket: this._bucket
    };
    const key = (this._baseFolder + path).replace(/^\/*/, '');

    if (asPrefix) {
      params.Prefix = key;
    } else {
      params.Key = key;
    }

    return params;
  }

  list(path, continueToken) {
    const params = this.getParams(path, true);

    if (continueToken) {
      params.ContinuationToken = continueToken;
    }

    return this._s3.listObjectsV2(params).promise();
  }

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
    params.ContentType = 'application/json';
    this._s3.putObject(params).promise();
  }
}

module.exports = HelperS3;
