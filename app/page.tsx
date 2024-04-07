"use client"
import Image from "next/image";
import styles from "./page.module.css";
import SelectImages from "./components/SelectImages";
import DisplayImages from "./components/DisplayImages";
import LoadingSpinner from './components/LoadingSpinner';
import Message from './components/Message';
import { useState, useRef } from 'react'
import { uploadFiles } from '../utils/routeMethods'

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<any>([]);
  const [email, setEmail] = useState<any>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const imageRef = useRef();

  function validateForm() {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$/

    if (!email) {
      setMessage('Please enter your email')
      return false
    } else if (!emailRegex.test(email)) {
      setMessage('Email must follow proper email format')
      return false
    }

    if (!selectedFiles.length) {
      setMessage('Please select at least one file')
      return false
    } else if (selectedFiles.length > 50) {
      setMessage('Please select no more than 50 files at a time')
      return false
    }

    return true
  }

  function resetForm() {
    setSelectedFiles([])
    /* if (imageRef.current) { 
      imageRef.current.value = ""
    } */
  }

  const handleUpload = async (event: any) => {
    event.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const batchSize = 3; // Set the batch size as per your preference
      const totalFiles = selectedFiles.length;
      let failedUploads: Array<String> = []
  
      // Loop through the selected files in batches to upload them
      for (let currentIndex = 0; currentIndex <= totalFiles; currentIndex += batchSize) {
          const currentBatch = selectedFiles.slice(currentIndex, currentIndex + batchSize);
  
          // Create an array to store promises for the current batch uploads
          const uploadPromises = currentBatch.map(async (file: any) => {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('email', email);
  
              // Send the file to the client side API server
              // I cant use an API because of Vercel having problems with absolute paths
              const response = await uploadFiles(formData)
  
              return response
          });
  
          // Wait for all upload promises in the current batch to resolve
          const results = await Promise.all(uploadPromises);
  
          // Check if any upload in the batch failed
          const hasFailed = results.some(result => !result.success);
          // failedUploads.concat(hasFailed)
          if (hasFailed) {
              setMessage(`Some files in the batch failed to upload: ${failedUploads.join(', ')}`);
              // Handle error or retry logic if needed
          } else {
              // All files in the batch uploaded successfully
              setMessage('Files in the batch uploaded successfully');
          }
      }
  
      setMessage('All files uploaded successfully');
    } catch (error) {
        console.error('Error uploading files:', error);
        setMessage('Error uploading files');
    } finally {
        setLoading(false);
        resetForm();
    }  
  }
  
  return (
    <main className={styles.main}>
      { loading && <LoadingSpinner /> }
      { message && <Message params={{ textMessage: message }}/> }
      <h1>𐤀Xodus media archiver</h1>
      <p>Upload files to your account, and we'll archive them</p>
      <form action="" encType="multipart/form-data" onSubmit={(event) => handleUpload(event)} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email">What is your email?</label>
          <input type="text" placeholder="Example123@gmail.com" onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <hr />
        <div className={styles.formGroup}>
          <SelectImages params={{ selectedFiles, setSelectedFiles, imageRef }} />
        </div>
        <hr />
        <div className={styles.formGroup}>
          <DisplayImages params={{ selectedFiles, setSelectedFiles }} />
        </div>
        <hr />
        <button>Submit</button>
      </form>
    </main>
  );
}
