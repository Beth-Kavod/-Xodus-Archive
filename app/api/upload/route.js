import { NextResponse } from 'next/server'
import { uploadFileToDropbox, createNewDropboxFolder } from '@/utils/routeMethods'
import dotenv from 'dotenv'
dotenv.config()

export const POST = async (request) => {
  try {
    // Get a new dropbox token from the Dropbox API
    const getAllFormDataValues = (formData, key) => {
      const values = [];
      for (const [formDataKey, formDataValue] of formData.entries()) {
        if (formDataKey === key) {
          values.push(formDataValue);
        }
      }
      return values;
    };
  
    const formData = await request.formData()
    console.log(formData.getAll('file'))
    
    const files = getAllFormDataValues(formData, 'file');

    const newFolderName = formData.get('email')
    const personalFolder = await createNewDropboxFolder(newFolderName)

    // Upload each file in parallel
    const uploadPromises = files.map(async file => {
      return uploadFileToDropbox(file, personalFolder);
    });

    // Check if every promise is resolved or rejected
    const results = await Promise.allSettled(uploadPromises);

    return NextResponse.json({
      success: true,
      message: 'Files uploaded successfully',
      fileCount: formData.getAll('file').length,
      results
    }, {
      status: 200
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ 
      success: false,
      errorMessage: `Error uploading files: ${error.message}`,
      error: error,
    }, {
      status: 500 
    })
  }
}
