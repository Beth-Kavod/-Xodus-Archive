"use client"
import { Dropbox } from 'dropbox';
import { refreshDropboxToken } from './refreshDropboxToken';
// import fetch from 'node-fetch'
import dotenv from 'dotenv';
dotenv.config();

// Initialize Dropbox config
let dropboxConfig = null; // Variable to store the Dropbox configuration

const initializeDropbox = async () => {
  // Check if configuration is already initialized
  if (dropboxConfig) {
    return dropboxConfig; // Return the stored configuration
  }

  const refreshedToken = await refreshDropboxToken();
  
  // Create the configuration object
  dropboxConfig = {
    fetch,
    clientId: process.env.DROPBOX_APP_KEY,
    clientSecret: process.env.DROPBOX_APP_SECRET,
    accessToken: refreshedToken.access_token
  };

  return dropboxConfig; // Return the configuration
};

// I have to make this pseudo API function because of weird edge server stuff
export async function uploadFiles(formData) {
  try {
    const config = await initializeDropbox()
    console.log(config)
    console.log(process.env.DROPBOX_REFRESH_TOKEN)
    const getAllFormDataValues = (formData, key) => {
      const values = [];
      for (const [formDataKey, formDataValue] of formData.entries()) {
        if (formDataKey === key) {
          values.push(formDataValue);
        }
      }
      return values;
    };

    const files = getAllFormDataValues(formData, 'file');

    const newFolderName = formData.get('email')
    const personalFolder = await createNewDropboxFolder(newFolderName, config)

    // Upload each file in parallel
    const uploadPromises = files.map(async file => {
      return uploadFileToDropbox(file, personalFolder, config);
    });

    // Check if every promise is resolved or rejected
    const results = await Promise.allSettled(uploadPromises);

    return {
      success: true,
      message: "Files uploaded successfully",
      results,
      status: 200
    }
  } catch (error) {
    console.error("Failed to upload files:", error);
    return {
      success: false,
      message: "Failed to upload files",
      error: error,
      status: 500
    }
  }
}

// Upload a single file to Dropbox
export async function uploadFileToDropbox(file, path = '/', config) {
  const dbx = new Dropbox(config);
  dbx.usersGetCurrentAccount()
  .catch(function(error) {
    console.error(error);
  });

  const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;

  if (file.size < UPLOAD_FILE_SIZE_LIMIT) {
    dbx.filesUpload({ path: `${path}/${file.name}`,  contents: file })
      .catch(function(error) {
        console.error(error.error || error);
      });
  } else {
    const maxBlob = 12 * 1024 * 1024; // 8MB - Dropbox JavaScript API suggested chunk size
    let workItems = [];
    let offset = 0;

    while (offset < file.size) {
      let chunkSize = Math.min(maxBlob, file.size - offset);
      workItems.push(file.slice(offset, offset + chunkSize));
      offset += chunkSize;
    } 

    const task = workItems.reduce((acc, blob, idx, items) => {
      if (idx == 0) {
        // Starting multipart upload of file
        return acc.then(function() {
          return dbx.filesUploadSessionStart({ close: false, contents: blob})
            .then(response => response.result.session_id)
        });          
      } else if (idx < items.length-1) {  
        // Append part to the upload session
        return acc.then(function(sessionId) {
         let cursor = { session_id: sessionId, offset: idx * maxBlob };
         return dbx.filesUploadSessionAppendV2({ cursor: cursor, close: false, contents: blob }).then(() => sessionId); 
        });
      } else {
        // Last chunk of data, close session
        return acc.then(function(sessionId) {
          let cursor = { session_id: sessionId, offset: file.size - blob.size };
          let commit = { path: `/${file.name}`, mode: 'add', autorename: true, mute: false };              
          return dbx.filesUploadSessionFinish({ cursor: cursor, commit: commit, contents: blob });           
        });
      }          
    }, Promise.resolve());

    task.then(function(result) {
      console.log(result);
    }).catch(function(error) {
      console.error(error);
    });

  }

  return false
}

export async function createNewDropboxFolder(folderName, config) {
  // Format the date so it doesn't have slashes
  function formatDate(dateString) {
    const parts = dateString.split("/");
    return parts.join("-");
  }

  async function checkIfFolderExists(path) {
    try {
      const response = await dbx.filesGetMetadata({ path: path, include_media_info: false })
      return response
    } catch (error) {
      if (error.status === 409) {
        return false;
      }
      console.error('Error checking folder:', error);
      // return false;
    }
  }

  const dbx = new Dropbox(config);

  const today = new Date()
  const folderPath = `/${folderName} - ${formatDate(today.toLocaleDateString())}`;


  const folderExists = await checkIfFolderExists(folderPath)
  // If the folder exists, return the path, otherwise try to create it
  if (folderExists) return folderExists.result.path_lower
  
  const createNewFolder = await dbx.filesCreateFolderV2({ path: folderPath })
  .then(function(response) {
    // Return the path to the new folder
    return response.result.metadata.path_lower
  })
  .catch(function(error) {
    console.error(error);
  });

  return createNewFolder
}