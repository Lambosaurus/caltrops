
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, ScanCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({});
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = "caltrops-sheets"


async function sendEmail(recipient, subject, body) {
  await ses.send(new SendEmailCommand({
      Destination: {
          ToAddresses: [recipient],
      },
      Message: {
          Body: {
              Text: {
                  Data: body,
              },
          },
          Subject: {
              Data: subject,
          },
      },
      Source: "noreply@tlembedded.com",
  }))
}

async function readDocument(id) {
  const response = await db.send( new GetCommand({
      TableName: TABLE_NAME,
      Key: {
          id: id,
      },
  }))
  return response.Item ?? null
}

async function listDocuments(user) {
  user = "tlamborn@gmail.com"
  const response = await db.send( new QueryCommand({
      TableName: TABLE_NAME, 
      IndexName: "owner-index", 
      ScanIndexForward: false, 
      KeyConditionExpression: "#o = :o", 
      ExpressionAttributeValues: { 
          ":o": user
      }, 
      ExpressionAttributeNames: { 
          "#o": "owner" 
      }, 
      Select: "ALL_PROJECTED_ATTRIBUTES" 
  }))
  return response.Items
}

async function listUsers() {
  const response = await db.send( new ScanCommand({
      TableName: TABLE_NAME,
      IndexName: "owner-index",
      ProjectionExpression: "#o", 
      ExpressionAttributeNames: { 
          "#o": "owner" 
      }
  }))
  return [...new Set(response.Items.map(i => i.owner))]
}

exports.sendEmail = sendEmail
exports.readDocument = readDocument
exports.listUsers = listUsers
exports.listDocuments = listDocuments