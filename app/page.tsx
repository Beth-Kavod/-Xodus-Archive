"use client"
import Image from "next/image";
import styles from "./page.module.css";
import SelectImages from "./components/SelectImages";
import DisplayImages from "./components/DisplayImages";
import LoadingSpinner from './components/LoadingSpinner';
import Message from './components/Message';
import { useState, useRef } from 'react'
import uploadFiles from '../utils/uploadFiles'

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<any>([]);
  const [email, setEmail] = useState<any>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState({ message: "", success: false });
  const imageRef = useRef();

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  }

  function validateForm() {
    const emailRegex = /^[\w-]+(\.[\w-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$/

    if (!email) {
      setMessage({ message: 'Please enter your email', success: false })
      scrollToTop()
      return false
    } else if (!emailRegex.test(email)) {
      setMessage({ message: 'Email must follow proper email format', success: false })
      scrollToTop()
      return false
    }

    if (!selectedFiles.length) {
      setMessage({ message: 'Please select at least one file', success: false })
      scrollToTop()
      return false
    } else if (selectedFiles.length > 50) {
      setMessage({ message: 'Please select no more than 50 files at a time', success: false })
      scrollToTop()
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
      /* const batchSize = 10;  Set the batch size as per your preference
      const totalFiles = selectedFiles.length; */
      let failedUploads: Array<String> = []
  
      // Loop through the selected files in batches to upload them
      // for (let currentIndex = 0; currentIndex <= totalFiles; currentIndex += batchSize) {
          // const currentBatch = selectedFiles.slice(currentIndex, currentIndex + batchSize);
  
          // Create an array to store promises for the current batch uploads
          const formData = new FormData();
          selectedFiles.map(async (file: any) => {
            formData.append('file', file);
          });
            
            // Add the folder name to the FormData
            formData.append('email', email);

            const response = await uploadFiles(formData)
          // Wait for all upload promises in the current batch to resolve
  
          // Check if any upload in the batch failed
          // failedUploads.concat(hasFailed)
          if (/* !response?.success */ true) {
              setMessage({ message: `Some files in the batch failed to upload: ${failedUploads.join(', ')}`, success: false});
              scrollToTop()
              // Handle error or retry logic if needed
          } else {
              // All files in the batch uploaded successfully
              setMessage({ message: 'Files in the batch uploaded successfully', success: true });
              scrollToTop()
          }
      // }

      if (failedUploads.length) throw new Error('Error uploading files');

      setMessage({ message: 'All files uploaded successfully', success: true });
    } catch (error) {
        console.error('Error uploading files:', error);
        setMessage({ message: 'Error uploading files', success: false });
    } finally {
        setLoading(false);
        resetForm();
    }  
  }
  
  return (
    <main className={styles.main}>
      { loading && <LoadingSpinner /> }
      { message.message && <Message params={{ textMessage: message.message, success: message.success }}/> }
      <h1>𐤀Xodus media archiver</h1>
      <p style={{ textAlign: 'center' }}>Upload files to your folder with email, and we&apos;ll archive them</p>
      <form encType="multipart/form-data" onSubmit={(event) => handleUpload(event)} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input style={{ width: '200px'}} type="text" placeholder="Example123@gmail.com" onChange={(e) => setEmail(e.target.value)}/>
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
        <button style={{ height: 26, padding: 5 }}><b>Submit files for upload</b></button>
      </form>
      <h3>Media archive viewer coming soon!</h3>
    </main>
  );
}
