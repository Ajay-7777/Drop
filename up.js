// Import required AWS SDK clients and commands for Node.js.
import * as dotenv from 'dotenv'
dotenv.config()
import './models/database.js'
import { PutObjectCommand, CreateBucketCommand,ListObjectsCommand ,S3Client,DeleteObjectCommand } from "@aws-sdk/client-s3";

const credentials={
secretAccessKey:process.env.ACCESS_SECRET,
accessKeyId:process.env.ACCESS_KEY
}
const s3Client=new S3Client({
    region:process.env.REGION,
    credentials:credentials
})
// Set the parameters

  
export const uploadObject=async (name,data,token)=>{
  const params = {
    Bucket: process.env.BUCKET , // The name of the bucket. For example, 'sample-bucket-101'.
    Key: name, // The name of the object. For example, 'sample_upload.txt'.
    Body: data, // The content of the object. For example, 'Hello world!".
    ACL:"public-read",
    
  };
  
  
        const results =  s3Client.send(new PutObjectCommand(params));
        console.log(
            "Successfully uploaded " +
            params.Key +
            " and uploaded it to " +
            params.Bucket +
            "/" +
            params.Key
        );
        return results; // For unit tests.
}


export const deleteObject = async (params) =>{
  // Create an Amazon S3 bucket.
//   try {
//     const data = await s3Client.send(
//         new CreateBucketCommand({ Bucket: params.Bucket })
//     );
//     console.log(data);
//     console.log("Successfully created a bucket called ", data.Location);
//     return data; // For unit tests.
//   } catch (err) {
//     console.log("Error", err);
//   }
  // Create an object and upload it to the Amazon S3 bucket.
  try {
    const results = await s3Client.send(new DeleteObjectCommand(params));
    console.log(
        "Successfully deleted " +
        params.Key +
        " and deleted it from " +
        params.Bucket +
        "/" +
        params.Key
    );
    return results; // For unit tests.
  } catch (err) {
    console.log("Error", err);
  }
};

export const listObjects = async () => {
  const params={
    Bucket:process.env.BUCKET,
    
    ACL:"public-read"
  }
    // Create an object and upload it to the Amazon S3 bucket.
    try {
      const results = await s3Client.send(new ListObjectsCommand(params));
  
      let links=[];
      if(results.Contents!==null){
     for(let item of results.Contents){
         links.push("https://aws-bucketnode.s3.amazonaws.com/" + item.Key);
        //  console.log("https://aws-bucketnode.s3.amazonaws.com/" + item.Key)
     }
    }
     return links;
    
    } catch (err) {
      console.log("Error", err);
    }
  };
  