var FileAdapter = require('parse-server-fs-adapter');
var S3Adapter = require('parse-server-s3-adapter');
var GCSAdapter = require('parse-server-gcs-adapter');

module.exports = {
  applicationId: "l7F9xkTQrSxhf0RuXVlZ7MpC1rM96aeQrN8D3lGd",
  masterKey: "VuOyNjUL4o4w02o9iif8KP9GzWtyIJwhRYFFtWjG",
  mongoURL: "mongodb://mmarshak:Wolf2625@ds029236-a0.mlab.com:29236,ds029236-a1.mlab.com:29236/gopapayaparsemongodb?replicaSet=rs-ds029236",
  serverURL: "https://cf6b06b5.ngrok.io/pserver",
  filesToTransfer: 'parseOnly',
  renameFiles: true,
  renameInDatabase: true,
  transferTo: 's3',

  // For filesystem configuration
  //filesystemPath: './downloaded_files',

  // For S3 configuration
  aws_accessKeyId: "AKIAJJBIJ4AYFYEB2ZWA",
  aws_secretAccessKey: "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",
  aws_bucket: "gopapayaimages",
  aws_bucketPrefix: "",
/*
  // For GCS configuration
  gcs_projectId: "GCS_PROJECT_ID",
  gcs_keyFilename: "credentials.json",
  gcs_bucket: "BUCKET_NAME",

  // For Azure configuration
  azure_account: "STORAGE_ACCOUNT_NAME",
  azure_container: "BLOB_CONTAINER",
  azure_accessKey: "ACCESS_KEY",
*/
  // Or set filesAdapter to a Parse Server file adapter
  // filesAdapter: new FileAdapter({
  //  filesSubDirectory: './downloaded_files'
  // }),
  // filesAdapter: new S3Adapter({
  //   accessKey: 'ACCESS_KEY_ID',
  //   secretKey: 'SECRET_ACCESS_KEY',
  //   bucket: 'BUCKET_NAME'
  // }),
  // filesAdapter: new GCSAdapter({
  //   projectId: "GCS_PROJECT_ID",
  //   keyFilename: "credentials.json",
  //   bucket: "BUCKET_NAME",
  // }),
};
