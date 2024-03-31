"use client"
import Image from "next/image";
import styles from "./page.module.css";
import SelectImages from "./components/SelectImages";
import DisplayImages from "./components/DisplayImages";
import LoadingSpinner from './components/LoadingSpinner';
import Message from './components/Message';
import { useState, useEffect } from 'react'

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<any>([]);
  const [name, setName] = useState<any>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("Hello");

  function validateForm() {
    if (!name) {
      alert('Please enter your name')
      return false
    }

    if (!selectedFiles.length) {
      alert('Please select at least one file')
      return false
    }

    return true
  }

  const handleUpload = async (event: any) => {
    event.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const formData = new FormData();
      selectedFiles.forEach((file: string | Blob, index: any) => {
        formData.append(`file`, file);
      });

      formData.append('name', name);

      // Send the files to the server

      const response = await fetch('./api/upload', {
        method: 'POST',
        body: formData
      });

      console.log('Files uploaded successfully:', await response.json());
      setMessage('Files uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading files:', error);
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  };
  return (
    <main className={styles.main}>
      { loading && <LoadingSpinner /> }
      { message && <Message params={{ textMessage: message }}/> }
      <h1>@Xodus media archiver</h1>
      <form action="" onSubmit={(event) => handleUpload(event)} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">What is your name?</label>
          <input type="text" placeholder="John Doe" onChange={(e) => setName(e.target.value)}/>
        </div>
        <hr />
        <div className={styles.formGroup}>
          <SelectImages params={{ selectedFiles, setSelectedFiles}} />
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
