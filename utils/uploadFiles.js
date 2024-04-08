import { Dropbox } from 'dropbox';
import getRefreshDropboxToken from './getRefreshDropboxToken';
import dotenv from 'dotenv';
dotenv.config();

// Prevent the createNewDropBoxFolder function from being called more than once
let cachedFolder = {
  result: {
    path_lower: "/"
  }
}


// Initialize Dropbox config
const initializeDropbox = async () => {
  let dropboxConfig = null; // Variable to store the Dropbox configuration
  
  return async () => {
    if (dropboxConfig) {
      return dropboxConfig; // Return the stored configuration
    }

    const refreshedToken = await getRefreshDropboxToken();
    
    // Create the configuration object
    dropboxConfig = {
      clientId: process.env.DROPBOX_APP_KEY,
      clientSecret: process.env.DROPBOX_APP_SECRET,
      accessToken: refreshedToken
    }

    return dropboxConfig; // Return the configuration
  };
};

// Create a state that persists between function calls
const dropboxConfigInitializer = await initializeDropbox();
const dropboxConfig = await dropboxConfigInitializer();


// I have to make this pseudo API function because of weird edge server stuff
export default async function uploadFiles(formData, config=dropboxConfig) {
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

    const dbx = new Dropbox(config);

    const files = getAllFormDataValues(formData, 'file');

    const newFolderName = formData.get('email')
    const personalFolder = await createNewDropboxFolder(newFolderName, config)

    // Upload each file in parallel
    // TODO: Add error handling, make batch upload
    const uploadSession = dbx.filesUploadSessionStartBatch({
      close: false,
      contents: files.map(file => {
        return {
          contents: file,
          mode: {
            '.tag': 'add'
          },
          autorename: true,
          mute: false
        }
      })
    })

    console.log(uploadSession)
    const successfullyUploadedFiles = await uploadFilesToDropbox(files, personalFolder, uploadSession, dbx);
    
    dbx.filesUploadSessionFinish({
      cursor: { session_id: uploadSession.result.session_id, offset: files.size },
      commit: {
        path: `/${file.name}`,
        mode: { '.tag': 'add' },
        autorename: true,
        mute: false,
      },
    });
    // Check if every promise is resolved or rejected
    if (!successfullyUploadedFiles) throw new Error("Failed to upload files")

    return {
      success: true,
      message: "Files uploaded successfully",
      results,
      status: 200
    }
  } catch (error) {
    // This error is only thrown if the folder does'nt exist, which is fine
    if (error.status === (409 || 429)) return
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
// TODO: Add error handling, make batch upload
/* export async function uploadFilesToDropbox(file, path = '/', config) {
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
} */

// TODO: Add error handling, make batch upload
async function uploadFilesToDropbox(files, path = '/', uploadSession, dbx) {
  dbx.usersGetCurrentAccount()
    .catch(function(error) {
      console.error(error);
    });

  const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;

  // Iterate over each file in the array
  for (const file of files) {
    if (file.size < UPLOAD_FILE_SIZE_LIMIT) {
      // await dbx.filesUpload({ path: `${path}/${file.name}`, contents: file });
      await uploadSession.filesUploadSessionAppend({
        cursor: { session_id: uploadSession.result.session_id, offset: file.size },
        close: false,
        contents: file
      })
    } else {
      const maxChunkSize = 12 * 1024 * 1024; // 12MB - Dropbox API recommended maximum chunk size
      let offset = 0;

      while (offset < file.size) {
        const chunkSize = Math.min(maxChunkSize, file.size - offset);
        const chunk = file.slice(offset, offset + chunkSize);
        offset += chunkSize;

        const uploadSessionStartResult = await dbx.filesUploadSessionStart({
          close: false,
          contents: chunk,
        });

        const sessionId = uploadSessionStartResult.result.session_id;

        while (offset < file.size) {
          const nextChunkSize = Math.min(maxChunkSize, file.size - offset);
          const nextChunk = file.slice(offset, offset + nextChunkSize);
          offset += nextChunkSize;

          await dbx.filesUploadSessionAppendV2({
            cursor: { session_id: sessionId, offset },
            close: false,
            contents: nextChunk,
          });
        }

        await dbx.filesUploadSessionFinish({
          cursor: { session_id: sessionId, offset: file.size },
          commit: {
            path: `/${file.name}`,
            mode: 'add',
            autorename: true,
            mute: false,
          },
          contents: chunk,
        });
      }
    }
  }

  return false;
}



async function createNewDropboxFolder(folderName, config) {
  // Format the date so it doesn't have slashes
  /* function formatDate(dateString) {
    const parts = dateString.split("/");
    return parts.join("-");
  } */

  async function checkIfFolderExists(path) {
    // Prevent unnecessary api calls
    if (cachedFolder.result.path_lower === path) {
      return cachedFolder
    }
    
    try {
      const response = await dbx.filesGetMetadata({ path: path, include_media_info: false })
      cachedFolder = response
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

  // const today = new Date()
  const folderPath = `/${folderName}`;//This was removed, i don't need it - ${formatDate(today.toLocaleDateString())}


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