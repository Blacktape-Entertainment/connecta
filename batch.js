import PocketBase from "pocketbase";
import fs from "fs";
import csv from "csv-parser";

const pb = new PocketBase("https://api.worldofconnecta.com");
const BATCH_SIZE = 500; // Configurable batch size

async function batchCreate() {
  try {
    const batch = pb.createBatch();
    let processedRows = 0;
    
    const stream = fs.createReadStream("list.csv").pipe(csv());
    
    for await (const row of stream) {
      processedRows++;

      // Validate required fields
      if (!row.en_name || !row.ar_name || !row.sheet) {
        console.warn(`Skipping invalid row ${processedRows}: Missing required fields.`);
        continue;
      }

      // Process schools
      if (row.sheet === "schools") {
        batch.collection("schools").create({
          en_name: row.en_name.trim(),
          ar_name: row.ar_name.trim(),
        });
      }
      // Process universities
      else if (row.sheet === "universities") {
        batch.collection("universities").create({
          en_name: row.en_name.trim(),
          ar_name: row.ar_name.trim(),
        });
      }

      // Send batch if size limit reached
      if (batch.requests.length >= BATCH_SIZE) {
        await sendBatch(batch);
        batch.requests = []; // Clear requests after sending
      }
    }

    // Send any remaining records
    if (batch.requests.length > 0) {
      await sendBatch(batch);
    }

    console.log(`Batch processing completed. Total rows processed: ${processedRows}`);
  } catch (error) {
    console.error("Error in batchCreate:", error);
  }
}

async function sendBatch(batch) {
  try {
    const results = await batch.send();
    console.log(`Batch sent successfully: ${results.length} records inserted.`);
  } catch (error) {
    console.error("Error sending batch:", error);
    // Optionally, handle retries or partial failures here
  }
}

batchCreate();