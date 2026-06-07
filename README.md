# Caltrops

This repo contains content for the Caltrops TTRPG ruleset.

# Character sheet

The character sheets is available as a webapp. The working directory is [char-sheet](./char-sheet/).

This is build using React and DaisyUI.

Next steps are listed in [issues](https://github.com/Lambosaurus/caltrops/issues). Feel free to contribute to these.

## Develop

Run `npm start` to debug the app.

Run `npm run build` for a production compilation.

## Deployment

On push to the `deploy/char-sheet` branch, the app within `char-sheet` will be published to [caltrops.tlembedded.com](https://caltrops.tlembedded.com).

1. The app is synced to a [S3 bucket](http://caltrops-bucket.s3-website-ap-southeast-2.amazonaws.com/)
2. The bucket is delivered via [cloudfront distribution](https://d1k7birsgcogal.cloudfront.net)


# FVTT module

This is a module for the Foundry Virtual Table Top system. The working directory is [fvtt](./fvtt/).

The readme for this component is in [/fvtt/README.md](./fvtt/README.md)


# Server

This component provides functionality to store documents.

The document information is stored in DynamoDB, and served by a lambda function.

The server url is `https://caltrops.tlembedded.com/api/v2/`

Documentation to the API can be found [in bruno format here](./server/bruno/caltrops-documentation.html)

## Deployment

On push to the `deploy/server` branch, the server will be built and published to the lambda.

It can also be published manually with the `npm run deploy` script.
