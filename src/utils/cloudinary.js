import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
   
// configure cloudinary
cloudinary.config({ 
  cloud_name: 'dbev8xskj', 
  api_key: '333644433138718', 
  api_secret: 'GJrUyJO0TknEOeeEgA8LeeL-kNI' 
});
 
// cloudinaryFileUpload
const cloudinaryFileUpload = async (localFilePath) => {

  try {
    if(!localFilePath) return null
    // upload file to cloudinary
    const uploadFile = await cloudinary.uploader.upload(localFilePath,{
      resource_type: "auto",
    });

    // file upload was successful
    fs.unlinkSync(localFilePath)

    return uploadFile

  } catch (error) {
    // file upload was unsuccessful
    console.log(error?.message)
    // delete file from database
    fs.unlinkSync(localFilePath)
  }
}


export {cloudinaryFileUpload}
