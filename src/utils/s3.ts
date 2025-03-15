import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'your-bucket-name';

/**
 * Uploads a file to S3 with private access
 * @param file The file to upload
 * @param prefix Optional folder path/prefix to add to the filename
 * @returns The S3 key (path) of the uploaded file
 */
export async function uploadFileToS3(
  file: File,
  prefix: string = 'uploads'
): Promise<string> {
  try {
    // Generate a unique filename to prevent collisions
    const fileExtension = getFileExtension(file.name || 'file');
    const uniqueFileName = `${uuidv4()}${fileExtension ? `.${fileExtension}` : ''}`;
    
    // Create the S3 key (path)
    const key = `${prefix}/${uniqueFileName}`;
    
    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to S3 with private ACL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'private' // This makes the file private
    });
    
    await s3Client.send(command);
    
    // Return the S3 key for database storage
    return key;
  } catch (error) {
    console.error('S3 파일 업로드 중 오류:', error);
    throw new Error('파일 업로드에 실패했습니다.');
  }
}

/**
 * Generates a temporary signed URL to access a private S3 file
 * @param fileKey The S3 key of the file
 * @param expiresIn Expiration time in seconds (default: 1 hour)
 * @returns A temporary signed URL to access the file
 */
export async function getSignedFileUrl(
  fileKey: string, 
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('S3 서명된 URL 생성 중 오류:', error);
    throw new Error('파일 URL 생성에 실패했습니다.');
  }
}

/**
 * Extracts file extension from filename
 */
function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() || '' : '';
}