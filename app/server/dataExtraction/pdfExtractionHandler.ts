import { S3Event } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import {
  TextractClient,
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand,
} from "@aws-sdk/client-textract";
import { v4 as uuidv4 } from "uuid";

const dynamoClient = new DynamoDBClient({});
const textractClient = new TextractClient({});

export async function main(event: S3Event) {
  console.log("Received event:", JSON.stringify(event, null, 2));

  try {
    // Process each record (in case of batch)
    for (const record of event.Records) {
      const s3Key = decodeURIComponent(
        record.s3.object.key.replace(/\+/g, " ")
      );
      console.log(`Processing file: ${s3Key}`);

      // Start Textract job
      const startJobResponse = await textractClient.send(
        new StartDocumentTextDetectionCommand({
          DocumentLocation: {
            S3Object: {
              Bucket: record.s3.bucket.name,
              Name: s3Key,
            },
          },
          ClientRequestToken: uuidv4(),
          JobTag: "pdf-text-extraction",
        })
      );

      if (!startJobResponse.JobId) {
        throw new Error("No job ID returned from Textract");
      }

      const jobId = startJobResponse.JobId;
      console.log(`Textract job started. Job ID: ${jobId}`);

      // Update DynamoDB with initial status
      await dynamoClient.send(
        new PutItemCommand({
          TableName: process.env.EXTRACTION_TABLE,
          Item: {
            pk: { S: `FILE#${s3Key}` },
            sk: { S: `METADATA#${jobId}` },
            status: { S: "IN_PROGRESS" },
            createdAt: { S: new Date().toISOString() },
          },
        })
      );

      // Poll for job completion
      let jobStatus = "IN_PROGRESS";
      const pages: string[] = [];

      while (jobStatus === "IN_PROGRESS") {
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds between polls

        const getJobResponse = await textractClient.send(
          new GetDocumentTextDetectionCommand({
            JobId: jobId,
          })
        );

        jobStatus = getJobResponse.JobStatus || "FAILED";
        console.log(`Job Status: ${jobStatus}`);

        if (jobStatus === "SUCCEEDED") {
          const blocks = getJobResponse.Blocks || [];
          for (const block of blocks) {
            if (block.BlockType === "LINE" && block.Text) {
              pages.push(block.Text);
            }
          }

          // Update DynamoDB with results
          await dynamoClient.send(
            new PutItemCommand({
              TableName: process.env.EXTRACTION_TABLE,
              Item: {
                pk: { S: `FILE#${s3Key}` },
                sk: { S: `METADATA#${jobId}` },
                status: { S: "COMPLETED" },
                textContent: { S: pages.join("\n") },
                createdAt: { S: new Date().toISOString() },
              },
            })
          );
        } else if (jobStatus === "FAILED") {
          // Update DynamoDB with failure status
          await dynamoClient.send(
            new PutItemCommand({
              TableName: process.env.EXTRACTION_TABLE,
              Item: {
                pk: { S: `FILE#${s3Key}` },
                sk: { S: `METADATA#${jobId}` },
                status: { S: "FAILED" },
                createdAt: { S: new Date().toISOString() },
              },
            })
          );
          throw new Error("Textract job failed");
        }
      }
    }

    return { statusCode: 200, body: "OK" };
  } catch (error) {
    console.error("Error in PDF extraction handler:", error);
    throw error;
  }
}
