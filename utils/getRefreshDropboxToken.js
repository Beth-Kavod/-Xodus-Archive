import dotenv from 'dotenv'
dotenv.config()

export default async function getRefreshDropboxToken() {
  console.log(process.env.DROPBOX_REFRESH_TOKEN)
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Authorization", 'Basic ' + btoa(process.env.DROPBOX_APP_KEY + ':' + process.env.DROPBOX_APP_SECRET));

  const urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "refresh_token");
  urlencoded.append("refresh_token", process.env.DROPBOX_REFRESH_TOKEN);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  };

  console.log(urlencoded)

  async function fetchToken() {
    try {
      const response = await fetch("https://api.dropboxapi.com/oauth2/token", requestOptions)
      .then(response => response.json())
        
      return response
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const refreshRequest = await fetchToken() 

  return await refreshRequest.access_token
}