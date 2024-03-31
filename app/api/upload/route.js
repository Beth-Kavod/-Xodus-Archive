import { NextResponse } from 'next/server'


export const POST = async (request) => {
  try {
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

    const files = getAllFormDataValues(formData, 'file');


    // Send the files to the server
    




    return NextResponse.json({
      success: true,
      message: 'Files uploaded successfully',
      fileCount: formData.getAll('file').length,
      allFilesNames: files
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
