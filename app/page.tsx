"use client"
import Image from "next/image";
import styles from "./page.module.css";
import UploadImages from "./components/UploadImages";
import { useState, useEffect } from 'react'

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<any>([]);

  const handleUpload = async (event: any) => {
    event.preventDefault()
    try {
      const formData = new FormData();
      selectedFiles.forEach((file: string | Blob, index: any) => {
        formData.append(`file`, file);
      });

      // Send the files to the server
      const response = await fetch('./api/upload', {
        method: 'POST',
        body: formData
      });

      console.log('Files uploaded successfully:', await response.json());
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };
  return (
    <main className={styles.main}>
      <form action="" onSubmit={(event) =>  handleUpload(event)}>
        <div className={styles.formGroup}>
          <label htmlFor="name">What is your name?</label>
          <input type="text" placeholder="John Doe"/>
        </div>
        <UploadImages params={{ selectedFiles, setSelectedFiles}} />
        <button>Submit</button>
      </form>
    </main>
  );
}
