"use client"
import dotenv from 'dotenv'
dotenv.config()

export async function refreshDropboxToken() {
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

  const refreshRequest = await fetch("https://api.dropboxapi.com/oauth2/token", requestOptions)

  return await refreshRequest.json()
}