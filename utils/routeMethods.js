import { Dropbox } from 'dropbox';
import dotenv from 'dotenv';
dotenv.config();

// Dropbox config
const config = {
  fetch,
  clientId: process.env.DROPBOX_APP_KEY,
  clientSecret: process.env.DROPBOX_APP_SECRET,
  accessToken: process.env.DROPBOX_ACCESS_TOKEN 
}

// Upload a single file to Dropbox
export function uploadFileToDropbox(file, path = '/') {
  const dbx = new Dropbox(config);
  dbx.usersGetCurrentAccount()
  .catch(function(error) {
    console.error(error);
  });

  const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;

  if (file.size < UPLOAD_FILE_SIZE_LIMIT) {
    dbx.filesUpload({ path: `${path}/${file.name}`,  contents: file })
      .then((response) => {
        console.log(response);
      })
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

export async function createNewDropboxFolder(folderName) {
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
  console.log("FOLDER EXISTS: ", folderExists)
  // If the folder exists, return the path, otherwise try to create it
  if (folderExists) return folderExists.result.path_lower
  
  const createNewFolder = await dbx.filesCreateFolderV2({ path: folderPath })
  .then(function(response) {
    // Return the path to the new folder
    console.log(response)
    return response.result.metadata.path_lower
  })
  .catch(function(error) {
    console.error(error);
  });

  return createNewFolder
}